#!/usr/bin/env node

/**
 * Browser Performance Tester
 * Tests CSS performance across different browsers and devices using Playwright
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class BrowserPerformanceTester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.resultsDir = path.join(__dirname, 'results');
    this.testUrl = 'http://localhost:3000';
    this.browsers = [
      { name: 'chromium', launcher: chromium },
      { name: 'firefox', launcher: firefox },
      { name: 'webkit', launcher: webkit }
    ];
    this.devices = [
      'Desktop Chrome',
      'iPad Pro',
      'iPhone 12',
      'Galaxy S21'
    ];
  }

  async init() {
    await fs.ensureDir(this.resultsDir);
    console.log(chalk.blue('🌐 Browser Performance Tester\n'));
  }

  async testBrowser(browserInfo, device = null) {
    console.log(chalk.blue(`Testing ${browserInfo.name}${device ? ` (${device})` : ''}...`));
    
    const browser = await browserInfo.launcher.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });

    try {
      const context = device 
        ? await browser.newContext({ ...require('playwright').devices[device] })
        : await browser.newContext();

      const page = await context.newPage();

      // Enable performance monitoring
      await page.addInitScript(() => {
        window.performanceMetrics = {
          cssParseTime: 0,
          renderTime: 0,
          layoutShifts: [],
          paintTimes: {}
        };

        // Monitor CSS parsing
        const originalCreateStyleSheet = document.createElement;
        document.createElement = function(tagName) {
          const element = originalCreateStyleSheet.call(this, tagName);
          if (tagName.toLowerCase() === 'style' || tagName.toLowerCase() === 'link') {
            const start = performance.now();
            element.addEventListener('load', () => {
              window.performanceMetrics.cssParseTime += performance.now() - start;
            });
          }
          return element;
        };

        // Monitor layout shifts
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.performanceMetrics.layoutShifts.push({
              value: entry.value,
              time: entry.startTime
            });
          }
        }).observe({ entryTypes: ['layout-shift'] });

        // Monitor paint times
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.performanceMetrics.paintTimes[entry.name] = entry.startTime;
          }
        }).observe({ entryTypes: ['paint'] });
      });

      // Navigate and collect metrics
      const startTime = Date.now();
      await page.goto(this.testUrl, { waitUntil: 'networkidle' });
      const navigationTime = Date.now() - startTime;

      // Wait for page to fully render
      await page.waitForTimeout(3000);

      // Get performance metrics
      const metrics = await page.evaluate(() => {
        const paintMetrics = performance.getEntriesByType('paint');
        const resourceMetrics = performance.getEntriesByType('resource')
          .filter(r => r.name.includes('.css'));

        return {
          navigation: performance.getEntriesByType('navigation')[0],
          paint: paintMetrics,
          resources: resourceMetrics,
          custom: window.performanceMetrics,
          memory: performance.memory ? {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          } : null
        };
      });

      // Get Core Web Vitals
      const webVitals = await this.getCoreWebVitals(page);

      // Take screenshot for visual verification
      const screenshotPath = path.join(
        this.resultsDir, 
        `screenshot-${browserInfo.name}-${device || 'desktop'}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: true });

      return {
        browser: browserInfo.name,
        device: device || 'desktop',
        navigationTime,
        metrics,
        webVitals,
        screenshot: screenshotPath,
        timestamp: new Date().toISOString()
      };

    } finally {
      await browser.close();
    }
  }

  async getCoreWebVitals(page) {
    return await page.evaluate(() => {
      return new Promise((resolve) => {
        const vitals = {
          LCP: null,
          FID: null,
          CLS: null,
          FCP: null,
          TTFB: null
        };

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.LCP = entries[entries.length - 1].startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.FID = entries[0].processingStart - entries[0].startTime;
        }).observe({ entryTypes: ['first-input'] });

        // Cumulative Layout Shift
        let clsScore = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          }
          vitals.CLS = clsScore;
        }).observe({ entryTypes: ['layout-shift'] });

        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          vitals.FCP = entries[0].startTime;
        }).observe({ entryTypes: ['paint'] });

        // Time to First Byte
        const navigationEntry = performance.getEntriesByType('navigation')[0];
        if (navigationEntry) {
          vitals.TTFB = navigationEntry.responseStart - navigationEntry.requestStart;
        }

        // Resolve after collecting metrics
        setTimeout(() => resolve(vitals), 2000);
      });
    });
  }

  async runAllTests() {
    console.log(chalk.blue('🚀 Starting cross-browser performance tests...'));
    
    const results = [];

    for (const browserInfo of this.browsers) {
      try {
        // Test desktop version
        const desktopResult = await this.testBrowser(browserInfo);
        results.push(desktopResult);

        // Test mobile devices
        for (const device of ['iPad Pro', 'iPhone 12']) {
          if (await this.isDeviceSupported(browserInfo.name, device)) {
            const mobileResult = await this.testBrowser(browserInfo, device);
            results.push(mobileResult);
          }
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Could not test ${browserInfo.name}: ${error.message}`));
      }
    }

    return results;
  }

  async isDeviceSupported(browserName, device) {
    // Safari/WebKit doesn't support mobile device emulation as well
    if (browserName === 'webkit' && device.includes('iPhone')) {
      return false;
    }
    return true;
  }

  generatePerformanceReport(results) {
    const report = {
      summary: this.generateSummary(results),
      details: results,
      recommendations: this.generateRecommendations(results),
      timestamp: new Date().toISOString()
    };

    return report;
  }

  generateSummary(results) {
    const summary = {
      totalTests: results.length,
      browsers: [...new Set(results.map(r => r.browser))],
      devices: [...new Set(results.map(r => r.device))],
      averageMetrics: {},
      performanceRankings: {}
    };

    // Calculate averages
    const avgNavTime = results.reduce((sum, r) => sum + r.navigationTime, 0) / results.length;
    const avgLCP = results.filter(r => r.webVitals.LCP).reduce((sum, r) => sum + r.webVitals.LCP, 0) / results.filter(r => r.webVitals.LCP).length || 0;
    const avgFCP = results.filter(r => r.webVitals.FCP).reduce((sum, r) => sum + r.webVitals.FCP, 0) / results.filter(r => r.webVitals.FCP).length || 0;
    const avgCLS = results.filter(r => r.webVitals.CLS).reduce((sum, r) => sum + r.webVitals.CLS, 0) / results.filter(r => r.webVitals.CLS).length || 0;

    summary.averageMetrics = {
      navigationTime: Math.round(avgNavTime),
      LCP: Math.round(avgLCP),
      FCP: Math.round(avgFCP),
      CLS: avgCLS.toFixed(3)
    };

    // Rank browsers by performance
    const browserPerf = {};
    results.forEach(result => {
      if (!browserPerf[result.browser]) {
        browserPerf[result.browser] = {
          navigationTimes: [],
          lcpTimes: []
        };
      }
      browserPerf[result.browser].navigationTimes.push(result.navigationTime);
      if (result.webVitals.LCP) {
        browserPerf[result.browser].lcpTimes.push(result.webVitals.LCP);
      }
    });

    Object.keys(browserPerf).forEach(browser => {
      const nav = browserPerf[browser].navigationTimes;
      const lcp = browserPerf[browser].lcpTimes;
      browserPerf[browser].avgNavigation = nav.reduce((a, b) => a + b, 0) / nav.length;
      browserPerf[browser].avgLCP = lcp.length > 0 ? lcp.reduce((a, b) => a + b, 0) / lcp.length : 0;
    });

    summary.performanceRankings = Object.entries(browserPerf)
      .sort(([,a], [,b]) => a.avgNavigation - b.avgNavigation)
      .map(([browser, data]) => ({
        browser,
        avgNavigationTime: Math.round(data.avgNavigation),
        avgLCP: Math.round(data.avgLCP)
      }));

    return summary;
  }

  generateRecommendations(results) {
    const recommendations = [];

    // Check for slow loading times
    const slowResults = results.filter(r => r.navigationTime > 3000);
    if (slowResults.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `${slowResults.length} tests showed slow loading times (>3s)`,
        details: slowResults.map(r => `${r.browser} ${r.device}: ${r.navigationTime}ms`)
      });
    }

    // Check for high Cumulative Layout Shift
    const highCLS = results.filter(r => r.webVitals.CLS > 0.1);
    if (highCLS.length > 0) {
      recommendations.push({
        type: 'layout-stability',
        priority: 'medium',
        message: `${highCLS.length} tests showed high layout shift (CLS > 0.1)`,
        details: highCLS.map(r => `${r.browser} ${r.device}: ${r.webVitals.CLS}`)
      });
    }

    // Check for poor LCP
    const slowLCP = results.filter(r => r.webVitals.LCP > 2500);
    if (slowLCP.length > 0) {
      recommendations.push({
        type: 'content-loading',
        priority: 'high',
        message: `${slowLCP.length} tests showed slow Largest Contentful Paint (>2.5s)`,
        details: slowLCP.map(r => `${r.browser} ${r.device}: ${Math.round(r.webVitals.LCP)}ms`)
      });
    }

    // Check for browser inconsistencies
    const navTimes = results.map(r => r.navigationTime);
    const maxTime = Math.max(...navTimes);
    const minTime = Math.min(...navTimes);
    if (maxTime - minTime > 2000) {
      recommendations.push({
        type: 'consistency',
        priority: 'medium',
        message: `Large performance variations between browsers (${maxTime - minTime}ms difference)`
      });
    }

    return recommendations;
  }

  displayResults(report) {
    console.log(chalk.blue('\n🌐 Browser Performance Results:\n'));

    // Summary
    console.log(chalk.green('📊 Summary:'));
    console.log(`  Tests Run: ${report.summary.totalTests}`);
    console.log(`  Browsers: ${report.summary.browsers.join(', ')}`);
    console.log(`  Devices: ${report.summary.devices.join(', ')}`);
    console.log(`  Avg Navigation Time: ${report.summary.averageMetrics.navigationTime}ms`);
    console.log(`  Avg LCP: ${report.summary.averageMetrics.LCP}ms`);
    console.log(`  Avg FCP: ${report.summary.averageMetrics.FCP}ms`);
    console.log(`  Avg CLS: ${report.summary.averageMetrics.CLS}`);

    // Browser rankings
    console.log(chalk.blue('\n🏆 Performance Rankings:'));
    report.summary.performanceRankings.forEach((browser, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
      console.log(`${medal} ${browser.browser}: ${browser.avgNavigationTime}ms nav, ${browser.avgLCP}ms LCP`);
    });

    // Recommendations
    if (report.recommendations.length > 0) {
      console.log(chalk.yellow('\n💡 Recommendations:'));
      report.recommendations.forEach(rec => {
        const priority = rec.priority === 'high' ? chalk.red('HIGH') : chalk.yellow('MEDIUM');
        console.log(`${priority}: ${rec.message}`);
        if (rec.details && rec.details.length <= 3) {
          rec.details.forEach(detail => console.log(`  - ${detail}`));
        }
      });
    }
  }

  async saveResults(report) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.resultsDir, `browser-performance-${timestamp}.json`);

    await fs.writeJSON(reportPath, report, { spaces: 2 });
    console.log(chalk.green(`💾 Results saved to: ${reportPath}`));

    return reportPath;
  }

  async run() {
    try {
      await this.init();
      
      const results = await this.runAllTests();
      const report = this.generatePerformanceReport(results);
      
      this.displayResults(report);
      await this.saveResults(report);

      console.log(chalk.green('\n✅ Browser performance testing complete!'));
    } catch (error) {
      console.error(chalk.red('❌ Error during browser testing:'), error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new BrowserPerformanceTester();
  tester.run().catch(console.error);
}

module.exports = BrowserPerformanceTester;