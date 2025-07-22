#!/usr/bin/env node

/**
 * CSS Load Performance Tester
 * Measures CSS loading, parsing, and rendering performance
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');

class LoadPerformanceTester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.resultsDir = path.join(__dirname, 'results');
    this.testServer = null;
  }

  async init() {
    await fs.ensureDir(this.resultsDir);
    console.log(chalk.blue('⚡ CSS Load Performance Tester\n'));
  }

  async startTestServer() {
    return new Promise((resolve, reject) => {
      console.log(chalk.blue('🚀 Starting test server...'));
      
      // Start Vite dev server for testing
      this.testServer = spawn('npm', ['run', 'dev'], {
        cwd: this.projectRoot,
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let serverReady = false;

      this.testServer.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('localhost:3000') || output.includes('Local:')) {
          if (!serverReady) {
            serverReady = true;
            console.log(chalk.green('✅ Test server started'));
            setTimeout(() => resolve(), 2000); // Give server time to fully start
          }
        }
      });

      this.testServer.stderr.on('data', (data) => {
        console.log(chalk.yellow(`Server: ${data}`));
      });

      setTimeout(() => {
        if (!serverReady) {
          reject(new Error('Test server failed to start within timeout'));
        }
      }, 30000);
    });
  }

  async measureLoadTimes() {
    console.log(chalk.blue('📊 Measuring CSS load performance...'));
    
    // Create a simple HTML test page that measures CSS load times
    const testHTML = this.generateTestHTML();
    const testPath = path.join(this.projectRoot, 'test-load-performance.html');
    await fs.writeFile(testPath, testHTML);

    try {
      // Run the performance test
      const results = await this.runPerformanceTest(testPath);
      await fs.remove(testPath); // Cleanup
      return results;
    } catch (error) {
      await fs.remove(testPath); // Cleanup on error
      throw error;
    }
  }

  generateTestHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CSS Load Performance Test</title>
    
    <script>
        // Performance measurement
        const perfData = {
            start: performance.now(),
            cssLoaded: {},
            firstPaint: null,
            firstContentfulPaint: null
        };

        // Measure CSS load times
        function measureCSSLoad(filename, element) {
            const startTime = performance.now();
            
            element.onload = () => {
                const loadTime = performance.now() - startTime;
                perfData.cssLoaded[filename] = {
                    loadTime: loadTime,
                    size: element.sheet ? element.sheet.cssRules.length : 0
                };
                console.log(\`CSS loaded: \${filename} (\${loadTime.toFixed(2)}ms)\`);
            };
            
            element.onerror = () => {
                console.error(\`Failed to load: \${filename}\`);
            };
        }

        // Observer for paint metrics
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-paint') {
                    perfData.firstPaint = entry.startTime;
                }
                if (entry.name === 'first-contentful-paint') {
                    perfData.firstContentfulPaint = entry.startTime;
                }
            }
        });
        observer.observe({ entryTypes: ['paint'] });

        // Export results after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                const totalTime = performance.now() - perfData.start;
                perfData.totalLoadTime = totalTime;
                
                // Save results to window for extraction
                window.performanceResults = perfData;
                
                console.log('Performance Results:', perfData);
            }, 100);
        });
    </script>

    <!-- Critical CSS (inline) -->
    <style>
        /* Inline critical CSS for testing */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-container { max-width: 800px; margin: 0 auto; }
        .metrics { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
    </style>

    <!-- External CSS files to test -->
    <link id="design-tokens" rel="stylesheet" href="styles/design-tokens.css">
    <link id="components" rel="stylesheet" href="styles/components.css">
    <link id="tailwind" rel="stylesheet" href="src/styles/tailwind.css">
    
    <script>
        // Measure each CSS file
        measureCSSLoad('design-tokens.css', document.getElementById('design-tokens'));
        measureCSSLoad('components.css', document.getElementById('components'));
        measureCSSLoad('tailwind.css', document.getElementById('tailwind'));
    </script>
</head>
<body>
    <div class="test-container">
        <h1>CSS Load Performance Test</h1>
        
        <div class="metrics">
            <h2>Test Components</h2>
            <div class="algs-header">Header Test</div>
            <div class="tournament-card">Tournament Card Test</div>
            <div class="btn btn-primary">Button Test</div>
            <div class="chart-container">Chart Container Test</div>
        </div>
        
        <div class="metrics">
            <h2>Performance Metrics</h2>
            <p>Check browser console for detailed timing results</p>
            <p>Results will be automatically captured and saved</p>
        </div>
        
        <!-- Test various components to trigger CSS rendering -->
        <div class="dashboard-container">
            <div class="tournament-header">
                <div class="tournament-nav-button">Nav Button</div>
                <div class="tournament-header-card">
                    <div class="info-icon-container">🏆</div>
                    <div class="info-content">
                        <div class="info-label">Test Event</div>
                        <div class="info-value">Performance Test</div>
                    </div>
                </div>
            </div>
            
            <div class="action-panel">
                <div class="panel-header">
                    <div class="panel-title">Test Panel</div>
                </div>
                <div class="filter-buttons-container">
                    <div class="btn-filter btn-active">Active Filter</div>
                    <div class="btn-filter">Inactive Filter</div>
                </div>
            </div>
            
            <div class="chart-container">
                <div class="team-entry">
                    <div class="ranking-number">1</div>
                    <div class="team-label">Test Team</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  async runPerformanceTest(testPath) {
    const { chromium } = require('playwright');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Enable performance monitoring
    await page.addInitScript(() => {
      window.performanceMeasurements = [];
    });

    try {
      // Navigate to test page
      const testUrl = `http://localhost:3000/${path.basename(testPath)}`;
      
      const startTime = Date.now();
      await page.goto(testUrl, { waitUntil: 'networkidle' });
      
      // Wait for performance measurements to complete
      await page.waitForTimeout(2000);
      
      // Extract performance results
      const results = await page.evaluate(() => {
        return window.performanceResults || {};
      });

      // Get additional metrics
      const paintMetrics = await page.evaluate(() => {
        const perfEntries = performance.getEntriesByType('paint');
        const measurements = {};
        
        perfEntries.forEach(entry => {
          measurements[entry.name] = entry.startTime;
        });
        
        return measurements;
      });

      // Get CSS resource timings
      const resourceTimings = await page.evaluate(() => {
        const resources = performance.getEntriesByType('resource');
        return resources
          .filter(resource => resource.name.includes('.css'))
          .map(resource => ({
            name: resource.name.split('/').pop(),
            startTime: resource.startTime,
            responseEnd: resource.responseEnd,
            duration: resource.duration,
            transferSize: resource.transferSize || 0,
            encodedBodySize: resource.encodedBodySize || 0
          }));
      });

      const totalTime = Date.now() - startTime;

      return {
        totalPageLoadTime: totalTime,
        cssLoadTimes: results.cssLoaded || {},
        paintMetrics: {
          ...paintMetrics,
          firstPaint: results.firstPaint,
          firstContentfulPaint: results.firstContentfulPaint
        },
        resourceTimings,
        timestamp: new Date().toISOString()
      };

    } finally {
      await browser.close();
    }
  }

  async runComparativeTests() {
    console.log(chalk.blue('🔄 Running comparative performance tests...'));
    
    const results = {
      currentCSS: null,
      withoutOptimizations: null,
      comparison: null
    };

    try {
      // Test 1: Current optimized CSS
      console.log(chalk.blue('📊 Testing current CSS performance...'));
      results.currentCSS = await this.measureLoadTimes();

      // Test 2: Create a test without optimizations (if possible)
      console.log(chalk.blue('📊 Testing unoptimized scenario...'));
      results.withoutOptimizations = await this.testWithoutOptimizations();

      // Generate comparison
      results.comparison = this.compareResults(results.currentCSS, results.withoutOptimizations);

    } catch (error) {
      console.error(chalk.red('❌ Error during comparative testing:'), error);
      throw error;
    }

    return results;
  }

  async testWithoutOptimizations() {
    // Create a test scenario with concatenated, unoptimized CSS
    const unoptimizedCSS = await this.createUnoptimizedBundle();
    const testHTML = this.generateUnoptimizedTestHTML();
    const testPath = path.join(this.projectRoot, 'test-unoptimized.html');
    
    await fs.writeFile(testPath, testHTML);
    
    try {
      const results = await this.runPerformanceTest(testPath);
      await fs.remove(testPath);
      return results;
    } catch (error) {
      await fs.remove(testPath);
      throw error;
    }
  }

  async createUnoptimizedBundle() {
    // Concatenate all CSS files into one large bundle for comparison
    const cssFiles = [
      path.join(this.projectRoot, 'styles/design-tokens.css'),
      path.join(this.projectRoot, 'styles/components.css'),
      path.join(this.projectRoot, 'src/styles/tailwind.css')
    ];

    let combinedCSS = '';
    for (const file of cssFiles) {
      if (await fs.pathExists(file)) {
        const content = await fs.readFile(file, 'utf8');
        combinedCSS += content + '\n';
      }
    }

    const unoptimizedPath = path.join(this.projectRoot, 'test-unoptimized.css');
    await fs.writeFile(unoptimizedPath, combinedCSS);
    
    return unoptimizedPath;
  }

  generateUnoptimizedTestHTML() {
    // Similar to test HTML but with single large CSS file
    return this.generateTestHTML().replace(
      /<!-- External CSS files to test -->[\s\S]*?<script>/,
      `<!-- Single unoptimized CSS bundle -->
      <link id="unoptimized" rel="stylesheet" href="test-unoptimized.css">
      
      <script>
          measureCSSLoad('test-unoptimized.css', document.getElementById('unoptimized'));`
    );
  }

  compareResults(optimized, unoptimized) {
    if (!optimized || !unoptimized) {
      return { error: 'Missing test results for comparison' };
    }

    const comparison = {
      pageLoadTime: {
        optimized: optimized.totalPageLoadTime,
        unoptimized: unoptimized.totalPageLoadTime,
        improvement: unoptimized.totalPageLoadTime - optimized.totalPageLoadTime,
        improvementPercent: ((unoptimized.totalPageLoadTime - optimized.totalPageLoadTime) / unoptimized.totalPageLoadTime * 100).toFixed(1)
      },
      firstContentfulPaint: {
        optimized: optimized.paintMetrics.firstContentfulPaint || 0,
        unoptimized: unoptimized.paintMetrics.firstContentfulPaint || 0,
        improvement: (unoptimized.paintMetrics.firstContentfulPaint || 0) - (optimized.paintMetrics.firstContentfulPaint || 0)
      },
      cssRequestCount: {
        optimized: optimized.resourceTimings.length,
        unoptimized: unoptimized.resourceTimings.length
      }
    };

    return comparison;
  }

  async saveResults(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.resultsDir, `load-performance-${timestamp}.json`);

    await fs.writeJSON(reportPath, results, { spaces: 2 });
    console.log(chalk.green(`💾 Results saved to: ${reportPath}`));

    return reportPath;
  }

  displayResults(results) {
    console.log(chalk.blue('\n📊 Load Performance Results:\n'));

    if (results.currentCSS) {
      console.log(chalk.green('Current CSS Performance:'));
      console.log(`  Page Load Time: ${results.currentCSS.totalPageLoadTime}ms`);
      console.log(`  First Contentful Paint: ${results.currentCSS.paintMetrics.firstContentfulPaint?.toFixed(2) || 'N/A'}ms`);
      console.log(`  CSS Resources: ${results.currentCSS.resourceTimings.length}`);
      
      if (Object.keys(results.currentCSS.cssLoadTimes).length > 0) {
        console.log('  Individual CSS Load Times:');
        Object.entries(results.currentCSS.cssLoadTimes).forEach(([file, data]) => {
          console.log(`    ${file}: ${data.loadTime.toFixed(2)}ms`);
        });
      }
    }

    if (results.comparison && !results.comparison.error) {
      console.log(chalk.blue('\n🔄 Performance Comparison:'));
      console.log(`  Load Time Improvement: ${results.comparison.pageLoadTime.improvement.toFixed(0)}ms (${results.comparison.pageLoadTime.improvementPercent}%)`);
      console.log(`  FCP Improvement: ${results.comparison.firstContentfulPaint.improvement.toFixed(0)}ms`);
      console.log(`  Request Reduction: ${results.comparison.cssRequestCount.unoptimized - results.comparison.cssRequestCount.optimized} fewer requests`);
    }
  }

  async cleanup() {
    if (this.testServer) {
      console.log(chalk.blue('🛑 Stopping test server...'));
      this.testServer.kill();
    }

    // Clean up any test files
    const testFiles = [
      path.join(this.projectRoot, 'test-load-performance.html'),
      path.join(this.projectRoot, 'test-unoptimized.html'),
      path.join(this.projectRoot, 'test-unoptimized.css')
    ];

    for (const file of testFiles) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }
  }

  async run() {
    try {
      await this.init();
      await this.startTestServer();

      const results = await this.runComparativeTests();
      await this.saveResults(results);
      this.displayResults(results);

      console.log(chalk.green('\n✅ Load performance testing complete!'));
    } catch (error) {
      console.error(chalk.red('❌ Error during performance testing:'), error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new LoadPerformanceTester();
  tester.run().catch(console.error);
}

module.exports = LoadPerformanceTester;