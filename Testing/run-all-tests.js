#!/usr/bin/env node

/**
 * Test Runner - Executes all CSS performance tests
 * Orchestrates the complete testing suite and generates comprehensive reports
 */

const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');

const BundleAnalyzer = require('./bundle-analyzer');
const LoadPerformanceTester = require('./load-performance');
const BrowserPerformanceTester = require('./browser-perf-test');

class TestRunner {
  constructor() {
    this.resultsDir = path.join(__dirname, 'results');
    this.startTime = Date.now();
    this.results = {
      bundle: null,
      loadPerformance: null,
      browserPerformance: null,
      summary: null
    };
  }

  async init() {
    console.log(chalk.blue('🧪 ALGS CSS Performance Testing Suite'));
    console.log(chalk.blue('=====================================\n'));
    
    await fs.ensureDir(this.resultsDir);
    
    // Clean old results (keep last 10)
    await this.cleanOldResults();
  }

  async cleanOldResults() {
    try {
      const files = await fs.readdir(this.resultsDir);
      const resultFiles = files
        .filter(f => f.endsWith('.json'))
        .map(f => ({
          name: f,
          path: path.join(this.resultsDir, f),
          time: fs.statSync(path.join(this.resultsDir, f)).mtime
        }))
        .sort((a, b) => b.time - a.time);

      // Keep last 10 result files
      if (resultFiles.length > 10) {
        const filesToDelete = resultFiles.slice(10);
        for (const file of filesToDelete) {
          await fs.remove(file.path);
        }
        console.log(chalk.gray(`🧹 Cleaned ${filesToDelete.length} old result files`));
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  }

  async runBundleAnalysis() {
    const spinner = ora('Analyzing CSS bundle sizes...').start();
    
    try {
      const analyzer = new BundleAnalyzer();
      await analyzer.init();
      await analyzer.findCSSFiles();
      
      if (analyzer.cssFiles.length === 0) {
        spinner.warn('No CSS files found for bundle analysis');
        return null;
      }

      const results = await analyzer.analyzeBundles();
      const summary = analyzer.generateSummary(results);
      
      this.results.bundle = {
        files: results,
        summary,
        recommendations: analyzer.generateRecommendations(results, summary)
      };

      spinner.succeed(`Bundle analysis complete (${analyzer.cssFiles.length} files analyzed)`);
      return this.results.bundle;
      
    } catch (error) {
      spinner.fail(`Bundle analysis failed: ${error.message}`);
      console.error(chalk.red(error.stack));
      return null;
    }
  }

  async runLoadPerformanceTest() {
    const spinner = ora('Testing CSS load performance...').start();
    
    try {
      const tester = new LoadPerformanceTester();
      await tester.init();
      
      // Check if server is running
      const isServerRunning = await this.checkServerStatus();
      if (!isServerRunning) {
        spinner.text = 'Starting development server...';
        await tester.startTestServer();
      }

      spinner.text = 'Measuring load performance...';
      const results = await tester.runComparativeTests();
      
      this.results.loadPerformance = results;
      
      if (!isServerRunning) {
        await tester.cleanup();
      }

      spinner.succeed('Load performance testing complete');
      return results;
      
    } catch (error) {
      spinner.fail(`Load performance testing failed: ${error.message}`);
      console.error(chalk.red(error.stack));
      return null;
    }
  }

  async runBrowserPerformanceTest() {
    const spinner = ora('Testing cross-browser performance...').start();
    
    try {
      // Check if server is running
      const isServerRunning = await this.checkServerStatus();
      if (!isServerRunning) {
        spinner.fail('Development server is not running. Please start it first.');
        return null;
      }

      const tester = new BrowserPerformanceTester();
      await tester.init();
      
      spinner.text = 'Testing across browsers and devices...';
      const results = await tester.runAllTests();
      const report = tester.generatePerformanceReport(results);
      
      this.results.browserPerformance = report;
      
      spinner.succeed(`Browser performance testing complete (${results.length} tests)`);
      return report;
      
    } catch (error) {
      spinner.fail(`Browser performance testing failed: ${error.message}`);
      console.error(chalk.red(error.stack));
      return null;
    }
  }

  async checkServerStatus() {
    try {
      const response = await fetch('http://localhost:3000', { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  generateComprehensiveReport() {
    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      results: this.results,
      overallSummary: this.generateOverallSummary(),
      recommendations: this.generateComprehensiveRecommendations()
    };

    return report;
  }

  generateOverallSummary() {
    const summary = {
      testsRun: 0,
      testsPassed: 0,
      totalCSSSize: 0,
      totalGzippedSize: 0,
      performanceScore: 0
    };

    // Bundle analysis summary
    if (this.results.bundle) {
      summary.testsRun++;
      summary.testsPassed++;
      summary.totalCSSSize = this.results.bundle.summary.rawSize;
      summary.totalGzippedSize = this.results.bundle.summary.gzippedSize;
      summary.compressionRatio = this.results.bundle.summary.avgGzipRatio;
    }

    // Load performance summary
    if (this.results.loadPerformance?.currentCSS) {
      summary.testsRun++;
      summary.testsPassed++;
      summary.pageLoadTime = this.results.loadPerformance.currentCSS.totalPageLoadTime;
      summary.firstContentfulPaint = this.results.loadPerformance.currentCSS.paintMetrics.firstContentfulPaint;
    }

    // Browser performance summary
    if (this.results.browserPerformance) {
      summary.testsRun++;
      summary.testsPassed++;
      summary.crossBrowserTests = this.results.browserPerformance.summary.totalTests;
      summary.avgNavigationTime = this.results.browserPerformance.summary.averageMetrics.navigationTime;
      summary.avgLCP = this.results.browserPerformance.summary.averageMetrics.LCP;
    }

    // Calculate performance score (0-100)
    let score = 100;
    
    // Deduct points for issues
    if (summary.totalCSSSize > 200000) score -= 20; // Large bundle
    if (summary.pageLoadTime > 3000) score -= 20; // Slow load
    if (summary.avgLCP > 2500) score -= 20; // Poor LCP
    if (parseFloat(summary.compressionRatio) < 60) score -= 15; // Poor compression
    if (summary.avgNavigationTime > 2000) score -= 10; // Slow navigation

    summary.performanceScore = Math.max(0, score);

    return summary;
  }

  generateComprehensiveRecommendations() {
    const recommendations = [];

    // Collect all recommendations
    if (this.results.bundle?.recommendations) {
      recommendations.push(...this.results.bundle.recommendations);
    }
    
    if (this.results.browserPerformance?.recommendations) {
      recommendations.push(...this.results.browserPerformance.recommendations);
    }

    // Add overall recommendations
    const summary = this.generateOverallSummary();
    
    if (summary.performanceScore < 70) {
      recommendations.push({
        type: 'overall',
        priority: 'high',
        message: `Overall performance score is ${summary.performanceScore}/100. Consider implementing high-priority recommendations first.`
      });
    }

    if (summary.totalCSSSize > 150000 && summary.compressionRatio < 70) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        message: 'CSS bundle is large with poor compression. Consider advanced minification and dead code elimination.'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  displayComprehensiveResults() {
    console.log(chalk.blue('\n📊 COMPREHENSIVE PERFORMANCE REPORT'));
    console.log(chalk.blue('===================================\n'));

    const summary = this.generateOverallSummary();
    
    // Overall score
    const scoreColor = summary.performanceScore >= 80 ? chalk.green : 
                     summary.performanceScore >= 60 ? chalk.yellow : chalk.red;
    console.log(`${scoreColor('Performance Score:')} ${scoreColor(summary.performanceScore + '/100')}\n`);

    // Test results summary
    console.log(chalk.green('✅ Test Results:'));
    console.log(`  Tests Run: ${summary.testsRun}/${3}`);
    console.log(`  Tests Passed: ${summary.testsPassed}\n`);

    // Bundle metrics
    if (this.results.bundle) {
      console.log(chalk.blue('📦 Bundle Analysis:'));
      console.log(`  Total CSS Size: ${this.formatSize(summary.totalCSSSize)}`);
      console.log(`  Gzipped Size: ${this.formatSize(summary.totalGzippedSize)}`);
      console.log(`  Compression: ${summary.compressionRatio}%`);
      console.log(`  Files: ${this.results.bundle.summary.fileCount}\n`);
    }

    // Performance metrics
    if (summary.pageLoadTime) {
      console.log(chalk.blue('⚡ Load Performance:'));
      console.log(`  Page Load Time: ${summary.pageLoadTime}ms`);
      console.log(`  First Contentful Paint: ${Math.round(summary.firstContentfulPaint || 0)}ms\n`);
    }

    // Browser metrics
    if (summary.crossBrowserTests) {
      console.log(chalk.blue('🌐 Cross-Browser Performance:'));
      console.log(`  Tests Across: ${summary.crossBrowserTests} browser/device combinations`);
      console.log(`  Avg Navigation: ${summary.avgNavigationTime}ms`);
      console.log(`  Avg LCP: ${summary.avgLCP}ms\n`);
    }

    // Top recommendations
    const recommendations = this.generateComprehensiveRecommendations();
    if (recommendations.length > 0) {
      console.log(chalk.yellow('💡 Top Recommendations:'));
      recommendations.slice(0, 5).forEach((rec, index) => {
        const priority = rec.priority === 'high' ? chalk.red('HIGH') : 
                        rec.priority === 'medium' ? chalk.yellow('MED') : chalk.blue('LOW');
        console.log(`  ${index + 1}. ${priority}: ${rec.message}`);
      });
    }

    console.log(chalk.green(`\n✅ Testing completed in ${((Date.now() - this.startTime) / 1000).toFixed(1)}s`));
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  async saveComprehensiveReport(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.resultsDir, `comprehensive-report-${timestamp}.json`);

    await fs.writeJSON(reportPath, report, { spaces: 2 });
    console.log(chalk.green(`\n💾 Comprehensive report saved: ${reportPath}`));

    // Also create a summary HTML report
    const htmlReport = this.generateHTMLReport(report);
    const htmlPath = path.join(this.resultsDir, `report-${timestamp}.html`);
    await fs.writeFile(htmlPath, htmlReport);
    console.log(chalk.green(`📄 HTML report saved: ${htmlPath}`));

    return { json: reportPath, html: htmlPath };
  }

  generateHTMLReport(report) {
    const summary = report.overallSummary;
    const scoreColor = summary.performanceScore >= 80 ? '#4ade80' : 
                      summary.performanceScore >= 60 ? '#fbbf24' : '#ef4444';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ALGS CSS Performance Report</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #1e293b, #334155); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem; }
        .score { font-size: 3rem; font-weight: bold; color: ${scoreColor}; text-align: center; margin: 1rem 0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .card { background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric { display: flex; justify-content: space-between; margin: 0.5rem 0; }
        .metric strong { color: #1e293b; }
        .recommendations { background: #fef3c7; border-left: 4px solid #f59e0b; }
        .rec-item { margin: 0.5rem 0; padding: 0.5rem; background: rgba(245,158,11,0.1); border-radius: 4px; }
        .timestamp { text-align: center; color: #64748b; margin-top: 2rem; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 ALGS CSS Performance Report</h1>
            <div class="score">${summary.performanceScore}/100</div>
            <p>Performance analysis completed on ${new Date(report.timestamp).toLocaleString()}</p>
        </div>

        <div class="grid">
            ${summary.totalCSSSize ? `
            <div class="card">
                <h3>📦 Bundle Analysis</h3>
                <div class="metric"><span>Total Size:</span><strong>${this.formatSize(summary.totalCSSSize)}</strong></div>
                <div class="metric"><span>Gzipped:</span><strong>${this.formatSize(summary.totalGzippedSize)}</strong></div>
                <div class="metric"><span>Compression:</span><strong>${summary.compressionRatio}%</strong></div>
                <div class="metric"><span>Files:</span><strong>${report.results.bundle?.summary.fileCount || 0}</strong></div>
            </div>` : ''}

            ${summary.pageLoadTime ? `
            <div class="card">
                <h3>⚡ Load Performance</h3>
                <div class="metric"><span>Page Load:</span><strong>${summary.pageLoadTime}ms</strong></div>
                <div class="metric"><span>First Paint:</span><strong>${Math.round(summary.firstContentfulPaint || 0)}ms</strong></div>
                <div class="metric"><span>CSS Resources:</span><strong>${report.results.loadPerformance?.currentCSS?.resourceTimings.length || 0}</strong></div>
            </div>` : ''}

            ${summary.crossBrowserTests ? `
            <div class="card">
                <h3>🌐 Browser Performance</h3>
                <div class="metric"><span>Tests Run:</span><strong>${summary.crossBrowserTests}</strong></div>
                <div class="metric"><span>Avg Navigation:</span><strong>${summary.avgNavigationTime}ms</strong></div>
                <div class="metric"><span>Avg LCP:</span><strong>${summary.avgLCP}ms</strong></div>
            </div>` : ''}
        </div>

        ${report.recommendations.length > 0 ? `
        <div class="card recommendations" style="margin-top: 2rem;">
            <h3>💡 Recommendations</h3>
            ${report.recommendations.slice(0, 5).map((rec, i) => `
                <div class="rec-item">
                    <strong>${rec.priority.toUpperCase()}:</strong> ${rec.message}
                </div>
            `).join('')}
        </div>` : ''}

        <div class="timestamp">
            Generated on ${new Date().toLocaleString()} • Duration: ${(report.duration / 1000).toFixed(1)}s
        </div>
    </div>
</body>
</html>`;
  }

  async run() {
    try {
      await this.init();

      // Run all tests
      console.log(chalk.blue('Starting comprehensive CSS performance testing...\n'));

      await this.runBundleAnalysis();
      await this.runLoadPerformanceTest();
      await this.runBrowserPerformanceTest();

      // Generate and display results
      const comprehensiveReport = this.generateComprehensiveReport();
      this.displayComprehensiveResults();
      
      await this.saveComprehensiveReport(comprehensiveReport);

      console.log(chalk.green('\n🎉 All tests completed successfully!'));

    } catch (error) {
      console.error(chalk.red('\n❌ Testing suite failed:'), error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run().catch(console.error);
}

module.exports = TestRunner;