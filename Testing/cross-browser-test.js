#!/usr/bin/env node

/**
 * Comprehensive Cross-Browser Testing Suite
 * Complete browser compatibility and performance testing
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class CrossBrowserTester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.resultsDir = path.join(__dirname, 'results');
    this.testUrl = 'http://localhost:3000';
    this.browsers = [
      { name: 'chromium', engine: chromium, userAgent: 'Chrome' },
      { name: 'firefox', engine: firefox, userAgent: 'Firefox' },
      { name: 'webkit', engine: webkit, userAgent: 'Safari' }
    ];
    this.testPages = [
      {
        name: 'dashboard',
        url: '/',
        description: 'Main Dashboard',
        criticalSelectors: ['.dashboard-container', 'main', 'body']
      },
      {
        name: 'tournament',
        url: '/tournament/year-4-championship',
        description: 'Tournament View',
        criticalSelectors: ['.tournament-header', '.tournament-container', 'main', 'body']
      }
    ];
    this.deviceTypes = [
      {
        name: 'desktop',
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        name: 'tablet',
        viewport: { width: 768, height: 1024 },
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
      },
      {
        name: 'mobile',
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
      }
    ];
  }

  async init() {
    await fs.ensureDir(this.resultsDir);
    await fs.ensureDir(path.join(this.resultsDir, 'cross-browser-screenshots'));
    console.log(chalk.blue('🌐 Cross-Browser Testing Suite\n'));
  }

  async checkServer() {
    try {
      const response = await fetch(this.testUrl);
      return response.ok;
    } catch {
      return false;
    }
  }

  async testBrowserCompatibility(browserConfig, page, testPage, device) {
    console.log(chalk.blue(`🧪 Testing ${testPage.name} on ${browserConfig.name} (${device.name})...`));
    
    const result = {
      browser: browserConfig.name,
      page: testPage.name,
      device: device.name,
      url: testPage.url,
      timestamp: new Date().toISOString(),
      compatibility: {},
      performance: {},
      errors: []
    };
    
    try {
      // Set viewport and user agent
      await page.setViewportSize(device.viewport);
      
      // Navigate to page
      const navigationStart = Date.now();
      const response = await page.goto(this.testUrl + testPage.url, { 
        waitUntil: 'domcontentloaded',
        timeout: 30000 
      });
      const navigationTime = Date.now() - navigationStart;
      
      // Check if page loaded successfully
      result.compatibility.pageLoaded = response.status() < 400;
      result.compatibility.responseStatus = response.status();
      
      // Wait for critical content
      let contentLoaded = false;
      for (const selector of testPage.criticalSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          contentLoaded = true;
          break;
        } catch {
          // Try next selector
        }
      }
      result.compatibility.contentLoaded = contentLoaded;
      
      // Test CSS features
      const cssFeatures = await page.evaluate(() => {
        const testDiv = document.createElement('div');
        document.body.appendChild(testDiv);
        
        const features = {
          flexbox: CSS.supports('display', 'flex'),
          grid: CSS.supports('display', 'grid'),
          customProperties: CSS.supports('color', 'var(--test-color)'),
          transforms: CSS.supports('transform', 'translateX(1px)'),
          transitions: CSS.supports('transition', 'all 0.3s'),
          borderRadius: CSS.supports('border-radius', '5px'),
          boxShadow: CSS.supports('box-shadow', '0 0 5px rgba(0,0,0,0.5)'),
          gradients: CSS.supports('background', 'linear-gradient(to right, red, blue)'),
          mediaQueries: window.matchMedia('(min-width: 1px)').matches
        };
        
        document.body.removeChild(testDiv);
        return features;
      });
      
      result.compatibility.cssFeatures = cssFeatures;
      
      // Test JavaScript functionality
      const jsFeatures = await page.evaluate(() => {
        return {
          es6Classes: typeof class {} === 'function',
          arrowFunctions: (() => true)(),
          templateLiterals: `test` === 'test',
          destructuring: (() => { try { const [a] = [1]; return true; } catch { return false; } })(),
          spread: (() => { try { const arr = [...[1]]; return true; } catch { return false; } })(),
          asyncAwait: typeof (async () => {}) === 'function',
          fetch: typeof fetch === 'function',
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          history: typeof history.pushState === 'function'
        };
      });
      
      result.compatibility.jsFeatures = jsFeatures;
      
      // Capture performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const paintEntries = performance.getEntriesByType('paint');
        
        return {
          navigationTiming: perfData ? {
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart,
            loadComplete: perfData.loadEventEnd - perfData.fetchStart,
            firstPaint: paintEntries.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0
          } : null,
          resourceCount: performance.getEntriesByType('resource').length,
          memoryUsage: performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
            total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
          } : null
        };
      });
      
      result.performance = {
        navigationTime,
        ...performanceMetrics
      };
      
      // Take screenshot
      const screenshotPath = path.join(
        this.resultsDir, 
        'cross-browser-screenshots',
        `${testPage.name}-${browserConfig.name}-${device.name}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: false });
      result.screenshot = screenshotPath;
      
      // Test responsive design
      if (device.name !== 'desktop') {
        const responsiveMetrics = await page.evaluate(() => {
          return {
            hasHorizontalScrollbar: document.body.scrollWidth > window.innerWidth,
            hasVerticalScrollbar: document.body.scrollHeight > window.innerHeight,
            viewportMeta: !!document.querySelector('meta[name="viewport"]'),
            fontSize: parseFloat(getComputedStyle(document.body).fontSize),
            minTouchTargetSize: Math.min(
              ...Array.from(document.querySelectorAll('button, a, input')).map(el => {
                const rect = el.getBoundingClientRect();
                return Math.min(rect.width, rect.height);
              }).filter(size => size > 0)
            )
          };
        });
        
        result.compatibility.responsive = responsiveMetrics;
      }
      
      // Check for console errors
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      page.on('pageerror', error => {
        errors.push(error.message);
      });
      
      // Wait a bit to collect any runtime errors
      await page.waitForTimeout(2000);
      result.errors = errors;
      
    } catch (error) {
      result.errors.push(`Test error: ${error.message}`);
      result.compatibility.testFailed = true;
    }
    
    return result;
  }

  async runCompatibilityScore(result) {
    let score = 0;
    let maxScore = 0;
    
    // Page loading (20 points)
    maxScore += 20;
    if (result.compatibility.pageLoaded) score += 10;
    if (result.compatibility.contentLoaded) score += 10;
    
    // CSS features support (30 points)
    maxScore += 30;
    const cssFeatures = result.compatibility.cssFeatures || {};
    const supportedCssFeatures = Object.values(cssFeatures).filter(Boolean).length;
    const totalCssFeatures = Object.keys(cssFeatures).length;
    if (totalCssFeatures > 0) {
      score += Math.round((supportedCssFeatures / totalCssFeatures) * 30);
    }
    
    // JavaScript features support (30 points)
    maxScore += 30;
    const jsFeatures = result.compatibility.jsFeatures || {};
    const supportedJsFeatures = Object.values(jsFeatures).filter(Boolean).length;
    const totalJsFeatures = Object.keys(jsFeatures).length;
    if (totalJsFeatures > 0) {
      score += Math.round((supportedJsFeatures / totalJsFeatures) * 30);
    }
    
    // Performance (15 points)
    maxScore += 15;
    if (result.performance.navigationTime < 3000) score += 5;
    if (result.performance.navigationTiming?.firstContentfulPaint < 2000) score += 5;
    if (result.performance.navigationTiming?.domContentLoaded < 2000) score += 5;
    
    // Error-free execution (5 points)
    maxScore += 5;
    if (result.errors.length === 0) score += 5;
    
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
    
    return { score: percentage, grade, details: { score, maxScore } };
  }

  async runCrossBrowserTests() {
    const allResults = [];
    
    for (const browserConfig of this.browsers) {
      console.log(chalk.green(`\n🚀 Testing with ${browserConfig.name.toUpperCase()}...`));
      
      let browser, context;
      try {
        browser = await browserConfig.engine.launch({ headless: true });
        
        for (const device of this.deviceTypes) {
          context = await browser.newContext({
            userAgent: device.userAgent || browserConfig.userAgent
          });
          const page = await context.newPage();
          
          for (const testPage of this.testPages) {
            const result = await this.testBrowserCompatibility(browserConfig, page, testPage, device);
            const scores = await this.runCompatibilityScore(result);
            
            allResults.push({
              ...result,
              compatibilityScore: scores.score,
              grade: scores.grade,
              scoreDetails: scores.details
            });
          }
          
          await context.close();
        }
        
      } catch (error) {
        console.error(chalk.red(`❌ Error testing ${browserConfig.name}:`), error.message);
        allResults.push({
          browser: browserConfig.name,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } finally {
        if (browser) await browser.close();
      }
    }
    
    return allResults;
  }

  async generateReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.resultsDir, `cross-browser-${timestamp}.json`);
    
    const successfulResults = results.filter(r => !r.error && !r.compatibility?.testFailed);
    const failedResults = results.filter(r => r.error || r.compatibility?.testFailed);
    
    const summary = {
      totalTests: results.length,
      successfulTests: successfulResults.length,
      failedTests: failedResults.length,
      browsers: this.browsers.length,
      pages: this.testPages.length,
      devices: this.deviceTypes.length,
      averageScore: successfulResults.length > 0 ? 
        successfulResults.reduce((sum, r) => sum + r.compatibilityScore, 0) / successfulResults.length : 0,
      bestPerforming: successfulResults.reduce((best, current) => 
        current.compatibilityScore > (best.compatibilityScore || 0) ? current : best, {}),
      worstPerforming: successfulResults.reduce((worst, current) => 
        current.compatibilityScore < (worst.compatibilityScore || 100) ? current : worst, {})
    };
    
    // Browser compatibility matrix
    const compatibilityMatrix = {};
    this.browsers.forEach(browser => {
      compatibilityMatrix[browser.name] = {};
      this.testPages.forEach(page => {
        compatibilityMatrix[browser.name][page.name] = {};
        this.deviceTypes.forEach(device => {
          const result = successfulResults.find(r => 
            r.browser === browser.name && r.page === page.name && r.device === device.name
          );
          compatibilityMatrix[browser.name][page.name][device.name] = {
            score: result?.compatibilityScore || 0,
            grade: result?.grade || 'F',
            loaded: result?.compatibility?.pageLoaded || false
          };
        });
      });
    });
    
    const report = {
      timestamp: new Date().toISOString(),
      testUrl: this.testUrl,
      summary,
      compatibilityMatrix,
      results,
      testConfiguration: {
        browsers: this.browsers.map(b => ({ name: b.name, userAgent: b.userAgent })),
        pages: this.testPages,
        devices: this.deviceTypes
      }
    };
    
    await fs.writeJSON(reportPath, report, { spaces: 2 });
    return reportPath;
  }

  async run() {
    try {
      await this.init();
      
      // Check if server is running
      const isServerRunning = await this.checkServer();
      if (!isServerRunning) {
        console.log(chalk.red('❌ Development server is not running on http://localhost:3000'));
        console.log(chalk.yellow('💡 Please start the server with: npm run dev'));
        return;
      }
      
      console.log(chalk.green('✅ Development server is running\n'));
      
      // Run cross-browser tests
      const results = await this.runCrossBrowserTests();
      
      // Generate report
      const reportPath = await this.generateReport(results);
      
      // Display summary
      console.log(chalk.blue('\n📋 CROSS-BROWSER TEST SUMMARY:'));
      
      const successfulResults = results.filter(r => !r.error && !r.compatibility?.testFailed);
      
      if (successfulResults.length > 0) {
        const avgScore = successfulResults.reduce((sum, r) => sum + r.compatibilityScore, 0) / successfulResults.length;
        const avgGrade = avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : avgScore >= 60 ? 'D' : 'F';
        
        console.log(chalk.white(`Overall Compatibility Score: ${avgScore.toFixed(1)}/100 (${avgGrade})\n`));
        
        // Group results by browser
        const browserGroups = {};
        successfulResults.forEach(result => {
          if (!browserGroups[result.browser]) browserGroups[result.browser] = [];
          browserGroups[result.browser].push(result);
        });
        
        Object.entries(browserGroups).forEach(([browser, browserResults]) => {
          const browserAvg = browserResults.reduce((sum, r) => sum + r.compatibilityScore, 0) / browserResults.length;
          const browserGrade = browserAvg >= 90 ? 'A' : browserAvg >= 80 ? 'B' : browserAvg >= 70 ? 'C' : browserAvg >= 60 ? 'D' : 'F';
          
          console.log(chalk.green(`🌐 ${browser.toUpperCase()}: ${browserAvg.toFixed(1)}/100 (${browserGrade})`));
          
          browserResults.forEach(result => {
            const statusIcon = result.compatibilityScore >= 80 ? '✅' : result.compatibilityScore >= 60 ? '⚠️' : '❌';
            console.log(chalk.white(`   ${statusIcon} ${result.page}-${result.device}: ${result.compatibilityScore}/100 (${result.grade})`));
          });
        });
        
        // Show failed tests
        const failedResults = results.filter(r => r.error || r.compatibility?.testFailed);
        if (failedResults.length > 0) {
          console.log(chalk.red('\n❌ Failed Tests:'));
          failedResults.forEach(result => {
            const identifier = result.browser ? `${result.browser}-${result.page}-${result.device}` : result.browser;
            const reason = result.error || 'Test failed';
            console.log(chalk.red(`   ${identifier}: ${reason}`));
          });
        }
      }
      
      console.log(chalk.green(`\n💾 Full report saved to: ${reportPath}`));
      console.log(chalk.green(`📸 Screenshots saved to: ${path.join(this.resultsDir, 'cross-browser-screenshots')}`));
      console.log(chalk.green('✅ Cross-browser testing complete!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Cross-browser testing failed:'), error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new CrossBrowserTester();
  tester.run().catch(console.error);
}

module.exports = CrossBrowserTester;