#!/usr/bin/env node

/**
 * Browser Performance Testing with Playwright
 * Direct Playwright integration for CSS performance analysis
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class PlaywrightBrowserTester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.resultsDir = path.join(__dirname, 'results');
    this.screenshotsDir = path.join(this.resultsDir, 'screenshots');
    this.testUrl = 'http://localhost:3000';
    this.browsers = ['chromium', 'firefox', 'webkit'];
    this.viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];
  }

  async init() {
    await fs.ensureDir(this.resultsDir);
    await fs.ensureDir(this.screenshotsDir);
    console.log(chalk.blue('🎭 Browser Performance Testing with Playwright\n'));
  }

  async checkServer() {
    try {
      const response = await fetch(this.testUrl);
      return response.ok;
    } catch {
      return false;
    }
  }

  async testCSSPerformance(browser, page) {
    console.log(chalk.blue(`🚀 Testing CSS performance in ${browser.name}...`));
    
    // Navigate and measure performance
    await page.goto(this.testUrl, { waitUntil: 'networkidle' });
    
    // Get performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const perfEntries = performance.getEntriesByType('resource');
      const cssFiles = perfEntries.filter(entry => entry.name.includes('.css'));
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
        cssResources: cssFiles.map(css => ({
          name: css.name.split('/').pop(),
          duration: css.duration,
          transferSize: css.transferSize || 0,
          encodedBodySize: css.encodedBodySize || 0,
          startTime: css.startTime,
          responseEnd: css.responseEnd
        })),
        paintMetrics: paintEntries.map(paint => ({
          name: paint.name,
          startTime: paint.startTime
        })),
        domContentLoaded: performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd || 0,
        loadComplete: performance.getEntriesByType('navigation')[0]?.loadEventEnd || 0
      };
    });

    // Get Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {};
        
        // First Contentful Paint
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
          }
        });
        observer.observe({ type: 'paint', buffered: true });
        
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        
        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          vitals.cls = clsValue;
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => resolve(vitals), 1000);
      });
    });

    return {
      browser: browser.name,
      performance: performanceMetrics,
      webVitals,
      timestamp: new Date().toISOString()
    };
  }

  async testResponsiveDesign(browser, page) {
    console.log(chalk.blue(`📱 Testing responsive design in ${browser.name}...`));
    
    const responsiveResults = [];
    
    for (const viewport of this.viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(1000); // Allow layout to settle
      
      // Take screenshot
      const screenshotPath = path.join(
        this.screenshotsDir, 
        `${browser.name}-${viewport.name}-${viewport.width}x${viewport.height}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      // Check for layout issues
      const layoutMetrics = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        
        return {
          scrollWidth: Math.max(body.scrollWidth, html.scrollWidth),
          scrollHeight: Math.max(body.scrollHeight, html.scrollHeight),
          clientWidth: html.clientWidth,
          clientHeight: html.clientHeight,
          hasHorizontalScrollbar: body.scrollWidth > html.clientWidth,
          hasLayoutShift: document.querySelectorAll('[style*="transform"]').length > 0
        };
      });
      
      responsiveResults.push({
        viewport: viewport.name,
        dimensions: `${viewport.width}x${viewport.height}`,
        screenshot: screenshotPath,
        metrics: layoutMetrics
      });
    }
    
    return responsiveResults;
  }

  async testCSSCoverage(browser, page) {
    console.log(chalk.blue(`📊 Testing CSS coverage in ${browser.name}...`));
    
    // Start CSS coverage
    await page.coverage.startCSSCoverage();
    
    // Navigate through the application
    await page.goto(this.testUrl);
    await page.waitForTimeout(2000);
    
    // Test different routes if they exist
    const routes = ['/tournament/year-4-championship', '/dashboard'];
    for (const route of routes) {
      try {
        await page.goto(this.testUrl + route, { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        
        // Interact with components
        await page.click('.btn-filter', { timeout: 2000 }).catch(() => {});
        await page.click('.map-badge', { timeout: 2000 }).catch(() => {});
        await page.click('.tournament-nav-button', { timeout: 2000 }).catch(() => {});
      } catch (error) {
        console.log(chalk.yellow(`  Route ${route} not accessible: ${error.message}`));
      }
    }
    
    // Stop coverage and analyze
    const coverage = await page.coverage.stopCSSCoverage();
    
    const coverageAnalysis = coverage.map(entry => {
      const usedBytes = entry.ranges.reduce((total, range) => total + range.end - range.start, 0);
      const totalBytes = entry.text.length;
      const usagePercentage = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
      
      return {
        url: entry.url,
        filename: entry.url.split('/').pop(),
        totalBytes,
        usedBytes,
        unusedBytes: totalBytes - usedBytes,
        usagePercentage: usagePercentage.toFixed(2)
      };
    });
    
    const totalUsed = coverageAnalysis.reduce((sum, file) => sum + file.usedBytes, 0);
    const totalSize = coverageAnalysis.reduce((sum, file) => sum + file.totalBytes, 0);
    const overallUsage = totalSize > 0 ? (totalUsed / totalSize) * 100 : 0;
    
    return {
      files: coverageAnalysis,
      summary: {
        totalFiles: coverageAnalysis.length,
        totalSize,
        totalUsed,
        totalUnused: totalSize - totalUsed,
        overallUsage: overallUsage.toFixed(2)
      }
    };
  }

  async testWithBrowser(browserType) {
    console.log(chalk.green(`\n🌐 Testing with ${browserType}...`));
    
    let browser, context, page;
    try {
      // Launch browser
      const browserEngines = { chromium, firefox, webkit };
      browser = await browserEngines[browserType].launch({ headless: true });
      context = await browser.newContext();
      page = await context.newPage();
      
      // Run tests
      const performanceResults = await this.testCSSPerformance({ name: browserType }, page);
      const responsiveResults = await this.testResponsiveDesign({ name: browserType }, page);
      const coverageResults = await this.testCSSCoverage({ name: browserType }, page);
      
      return {
        browser: browserType,
        performance: performanceResults,
        responsive: responsiveResults,
        coverage: coverageResults,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(chalk.red(`❌ Error testing ${browserType}:`), error.message);
      return {
        browser: browserType,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      if (browser) await browser.close();
    }
  }

  async generateReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.resultsDir, `browser-performance-${timestamp}.json`);
    
    const report = {
      timestamp: new Date().toISOString(),
      testUrl: this.testUrl,
      browsers: results,
      summary: {
        totalBrowsers: results.length,
        successfulTests: results.filter(r => !r.error).length,
        failedTests: results.filter(r => r.error).length
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
      
      // Run tests across all browsers
      const results = [];
      for (const browserType of this.browsers) {
        const result = await this.testWithBrowser(browserType);
        results.push(result);
      }
      
      // Generate report
      const reportPath = await this.generateReport(results);
      
      console.log(chalk.blue('\n📋 BROWSER PERFORMANCE SUMMARY:'));
      results.forEach(result => {
        if (result.error) {
          console.log(chalk.red(`❌ ${result.browser}: ${result.error}`));
        } else {
          console.log(chalk.green(`✅ ${result.browser}: Tests completed`));
          if (result.performance && result.performance.webVitals) {
            const vitals = result.performance.webVitals;
            console.log(chalk.white(`   FCP: ${vitals.fcp?.toFixed(2) || 'N/A'}ms, LCP: ${vitals.lcp?.toFixed(2) || 'N/A'}ms`));
          }
          if (result.coverage && result.coverage.summary) {
            console.log(chalk.white(`   CSS Usage: ${result.coverage.summary.overallUsage}%`));
          }
        }
      });
      
      console.log(chalk.green(`\n💾 Full report saved to: ${reportPath}`));
      console.log(chalk.green(`📸 Screenshots saved to: ${this.screenshotsDir}`));
      console.log(chalk.green('✅ Browser performance testing complete!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Browser testing failed:'), error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new PlaywrightBrowserTester();
  tester.run().catch(console.error);
}

module.exports = PlaywrightBrowserTester;