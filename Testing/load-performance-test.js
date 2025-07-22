#!/usr/bin/env node

/**
 * Load Performance Testing with Playwright
 * Real browser load testing and performance monitoring
 */

const { chromium } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class LoadPerformanceTester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.resultsDir = path.join(__dirname, 'results');
    this.testUrl = 'http://localhost:3000';
    this.testScenarios = [
      {
        name: 'dashboard-cold',
        url: '/',
        description: 'Cold load of dashboard',
        cacheDisabled: true
      },
      {
        name: 'dashboard-warm',
        url: '/',
        description: 'Warm load of dashboard',
        cacheDisabled: false
      },
      {
        name: 'tournament-cold',
        url: '/tournament/year-4-championship',
        description: 'Cold load of tournament view',
        cacheDisabled: true
      },
      {
        name: 'tournament-warm',
        url: '/tournament/year-4-championship', 
        description: 'Warm load of tournament view',
        cacheDisabled: false
      }
    ];
    this.networkConditions = [
      {
        name: 'fast-3g',
        downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
        uploadThroughput: 750 * 1024 / 8, // 750 Kbps
        latency: 40
      },
      {
        name: 'slow-3g',
        downloadThroughput: 500 * 1024 / 8, // 500 Kbps
        uploadThroughput: 500 * 1024 / 8, // 500 Kbps
        latency: 400
      },
      {
        name: 'wifi',
        downloadThroughput: 30 * 1024 * 1024 / 8, // 30 Mbps
        uploadThroughput: 15 * 1024 * 1024 / 8, // 15 Mbps
        latency: 2
      }
    ];
  }

  async init() {
    await fs.ensureDir(this.resultsDir);
    console.log(chalk.blue('🚀 Load Performance Testing with Playwright\n'));
  }

  async checkServer() {
    try {
      const response = await fetch(this.testUrl);
      return response.ok;
    } catch {
      return false;
    }
  }

  async measureLoadPerformance(page, scenario, networkCondition) {
    console.log(chalk.blue(`📊 Testing ${scenario.name} on ${networkCondition.name}...`));
    
    const results = {
      scenario: scenario.name,
      network: networkCondition.name,
      url: scenario.url,
      measurements: [],
      average: {},
      timestamp: new Date().toISOString()
    };
    
    // Run multiple iterations for statistical validity
    const iterations = networkCondition.name === 'slow-3g' ? 3 : 5;
    
    for (let i = 0; i < iterations; i++) {
      console.log(chalk.gray(`  Run ${i + 1}/${iterations}...`));
      
      try {
        // Clear cache if cold load
        if (scenario.cacheDisabled) {
          await page.context().clearCookies();
          await page.evaluate(() => {
            if ('caches' in window) {
              caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => caches.delete(cacheName));
              });
            }
            localStorage.clear();
            sessionStorage.clear();
          });
        }
        
        // Start timing
        const startTime = Date.now();
        
        // Navigate and collect metrics
        const response = await page.goto(this.testUrl + scenario.url, { 
          waitUntil: 'networkidle',
          timeout: 60000 
        });
        
        const navigationEndTime = Date.now();
        
        // Wait for critical content to be visible
        await page.waitForSelector('main, .dashboard-container, .tournament-container, body', { 
          timeout: 30000 
        }).catch(() => {
          console.log(chalk.yellow(`    ⚠️ Content selector not found, using fallback timing`));
        });
        
        const contentVisibleTime = Date.now();
        
        // Get comprehensive performance metrics
        const metrics = await page.evaluate(() => {
          const perfData = performance.getEntriesByType('navigation')[0];
          const paintEntries = performance.getEntriesByType('paint');
          const resourceEntries = performance.getEntriesByType('resource');
          
          // Categorize resources
          const cssResources = resourceEntries.filter(r => r.name.includes('.css') || r.name.includes('css'));
          const jsResources = resourceEntries.filter(r => r.name.includes('.js') || r.name.includes('javascript'));
          const imageResources = resourceEntries.filter(r => /\.(png|jpg|jpeg|gif|svg|webp)/.test(r.name));
          const fontResources = resourceEntries.filter(r => r.name.includes('font') || /\.(woff|woff2|ttf|eot)/.test(r.name));
          
          // Calculate resource metrics
          const calculateResourceMetrics = (resources) => ({
            count: resources.length,
            totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
            totalDuration: resources.reduce((sum, r) => sum + r.duration, 0),
            maxDuration: resources.length > 0 ? Math.max(...resources.map(r => r.duration)) : 0
          });
          
          return {
            navigation: {
              domainLookup: perfData?.domainLookupEnd - perfData?.domainLookupStart || 0,
              connecting: perfData?.connectEnd - perfData?.connectStart || 0,
              tlsHandshake: perfData?.connectEnd - perfData?.secureConnectionStart || 0,
              requesting: perfData?.responseStart - perfData?.requestStart || 0,
              responding: perfData?.responseEnd - perfData?.responseStart || 0,
              domProcessing: perfData?.domContentLoadedEventStart - perfData?.responseEnd || 0,
              domContentLoaded: perfData?.domContentLoadedEventEnd || 0,
              loadComplete: perfData?.loadEventEnd || 0
            },
            paint: {
              firstPaint: paintEntries.find(p => p.name === 'first-paint')?.startTime || 0,
              firstContentfulPaint: paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0
            },
            resources: {
              total: resourceEntries.length,
              css: calculateResourceMetrics(cssResources),
              javascript: calculateResourceMetrics(jsResources),
              images: calculateResourceMetrics(imageResources),
              fonts: calculateResourceMetrics(fontResources)
            },
            memory: performance.memory ? {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
              jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            } : null
          };
        });
        
        // Get Core Web Vitals
        const webVitals = await page.evaluate(() => {
          return new Promise((resolve) => {
            const vitals = {};
            
            // Get FCP and LCP
            const paintEntries = performance.getEntriesByType('paint');
            vitals.fcp = paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
            
            // Try to get LCP
            if (window.PerformanceObserver) {
              try {
                const lcpObserver = new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  const lastEntry = entries[entries.length - 1];
                  vitals.lcp = lastEntry?.startTime || 0;
                });
                lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
                
                // Try to get CLS
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
              } catch (error) {
                console.log('Observer error:', error);
              }
            }
            
            setTimeout(() => resolve(vitals), 1000);
          });
        });
        
        const measurement = {
          iteration: i + 1,
          timing: {
            navigationStart: startTime,
            navigationEnd: navigationEndTime,
            contentVisible: contentVisibleTime,
            totalLoadTime: navigationEndTime - startTime,
            timeToContent: contentVisibleTime - startTime
          },
          performance: metrics,
          webVitals: webVitals,
          network: {
            condition: networkCondition.name,
            responseStatus: response.status(),
            responseSize: 0 // Will be calculated from resources
          }
        };
        
        // Calculate total response size
        measurement.network.responseSize = metrics.resources.css.totalSize + 
                                         metrics.resources.javascript.totalSize + 
                                         metrics.resources.images.totalSize + 
                                         metrics.resources.fonts.totalSize;
        
        results.measurements.push(measurement);
        
        // Brief pause between iterations
        await page.waitForTimeout(1000);
        
      } catch (error) {
        console.error(chalk.red(`  ❌ Error in iteration ${i + 1}:`), error.message);
        results.measurements.push({
          iteration: i + 1,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Calculate averages from successful measurements
    const successfulMeasurements = results.measurements.filter(m => !m.error);
    
    if (successfulMeasurements.length > 0) {
      results.average = {
        totalLoadTime: successfulMeasurements.reduce((sum, m) => sum + m.timing.totalLoadTime, 0) / successfulMeasurements.length,
        timeToContent: successfulMeasurements.reduce((sum, m) => sum + m.timing.timeToContent, 0) / successfulMeasurements.length,
        firstContentfulPaint: successfulMeasurements.reduce((sum, m) => sum + (m.webVitals.fcp || 0), 0) / successfulMeasurements.length,
        largestContentfulPaint: successfulMeasurements.reduce((sum, m) => sum + (m.webVitals.lcp || 0), 0) / successfulMeasurements.length,
        cumulativeLayoutShift: successfulMeasurements.reduce((sum, m) => sum + (m.webVitals.cls || 0), 0) / successfulMeasurements.length,
        responseSize: successfulMeasurements.reduce((sum, m) => sum + m.network.responseSize, 0) / successfulMeasurements.length,
        jsHeapUsed: successfulMeasurements.reduce((sum, m) => sum + (m.performance.memory?.usedJSHeapSize || 0), 0) / successfulMeasurements.length
      };
    }
    
    return results;
  }

  async runLoadTests() {
    const allResults = [];
    
    let browser, context, page;
    try {
      browser = await chromium.launch({ headless: true });
      
      for (const networkCondition of this.networkConditions) {
        console.log(chalk.green(`\n🌐 Testing with ${networkCondition.name} network conditions...`));
        
        // Create new context for each network condition
        context = await browser.newContext();
        page = await context.newPage();
        
        // Set network conditions
        await page.route('**/*', async route => {
          // Add artificial delay for network simulation
          if (networkCondition.latency > 0) {
            await new Promise(resolve => setTimeout(resolve, networkCondition.latency / 2));
          }
          await route.continue();
        });
        
        // Simulate bandwidth throttling (basic implementation)
        if (networkCondition.name !== 'wifi') {
          await page.setExtraHTTPHeaders({
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          });
        }
        
        // Test each scenario
        for (const scenario of this.testScenarios) {
          const result = await this.measureLoadPerformance(page, scenario, networkCondition);
          allResults.push(result);
        }
        
        await context.close();
      }
      
      return allResults;
      
    } catch (error) {
      console.error(chalk.red('❌ Error during load testing:'), error);
      throw error;
    } finally {
      if (browser) await browser.close();
    }
  }

  generatePerformanceScores(results) {
    return results.map(result => {
      if (!result.average) return { ...result, score: 0, grade: 'F' };
      
      let score = 0;
      const avg = result.average;
      
      // FCP scoring (30 points)
      if (avg.firstContentfulPaint < 1000) score += 30;
      else if (avg.firstContentfulPaint < 2000) score += 20;
      else if (avg.firstContentfulPaint < 3000) score += 10;
      
      // LCP scoring (30 points)
      if (avg.largestContentfulPaint < 2500) score += 30;
      else if (avg.largestContentfulPaint < 4000) score += 20;
      else if (avg.largestContentfulPaint < 6000) score += 10;
      
      // Total load time scoring (25 points)
      if (avg.totalLoadTime < 2000) score += 25;
      else if (avg.totalLoadTime < 4000) score += 20;
      else if (avg.totalLoadTime < 6000) score += 15;
      else if (avg.totalLoadTime < 8000) score += 10;
      else if (avg.totalLoadTime < 10000) score += 5;
      
      // CLS scoring (10 points)
      if (avg.cumulativeLayoutShift < 0.1) score += 10;
      else if (avg.cumulativeLayoutShift < 0.25) score += 5;
      
      // Response size scoring (5 points)
      if (avg.responseSize < 500000) score += 5; // < 500KB
      else if (avg.responseSize < 1000000) score += 3; // < 1MB
      else if (avg.responseSize < 2000000) score += 1; // < 2MB
      
      const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
      
      return { ...result, score, grade };
    });
  }

  async generateReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.resultsDir, `load-performance-${timestamp}.json`);
    
    const scoredResults = this.generatePerformanceScores(results);
    
    const summary = {
      totalTests: results.length,
      successfulTests: results.filter(r => r.average).length,
      failedTests: results.filter(r => !r.average).length,
      networkConditions: this.networkConditions.length,
      scenarios: this.testScenarios.length,
      averageScore: scoredResults.reduce((sum, r) => sum + r.score, 0) / scoredResults.length || 0,
      bestPerforming: scoredResults.reduce((best, current) => 
        current.score > (best.score || 0) ? current : best, {}),
      worstPerforming: scoredResults.reduce((worst, current) => 
        current.score < (worst.score || 100) ? current : worst, {})
    };
    
    const report = {
      timestamp: new Date().toISOString(),
      testUrl: this.testUrl,
      summary,
      results: scoredResults,
      networkConditions: this.networkConditions,
      testScenarios: this.testScenarios
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
      
      // Run load tests
      const results = await this.runLoadTests();
      
      // Generate report
      const reportPath = await this.generateReport(results);
      
      // Display summary
      console.log(chalk.blue('\n📋 LOAD PERFORMANCE TEST SUMMARY:'));
      
      const scoredResults = this.generatePerformanceScores(results);
      const successfulResults = scoredResults.filter(r => r.average);
      
      if (successfulResults.length > 0) {
        const avgScore = successfulResults.reduce((sum, r) => sum + r.score, 0) / successfulResults.length;
        const avgGrade = avgScore >= 90 ? 'A' : avgScore >= 80 ? 'B' : avgScore >= 70 ? 'C' : avgScore >= 60 ? 'D' : 'F';
        
        console.log(chalk.white(`Overall Performance Score: ${avgScore.toFixed(1)}/100 (${avgGrade})`));
        console.log();
        
        successfulResults.forEach(result => {
          const avg = result.average;
          console.log(chalk.green(`✅ ${result.scenario} (${result.network}):`));
          console.log(chalk.white(`   Score: ${result.score}/100 (${result.grade})`));
          console.log(chalk.white(`   Load Time: ${avg.totalLoadTime.toFixed(0)}ms`));
          console.log(chalk.white(`   FCP: ${avg.firstContentfulPaint.toFixed(0)}ms, LCP: ${avg.largestContentfulPaint.toFixed(0)}ms`));
          console.log(chalk.white(`   CLS: ${avg.cumulativeLayoutShift.toFixed(3)}`));
          console.log(chalk.white(`   Response Size: ${(avg.responseSize / 1024).toFixed(1)}KB`));
        });
        
        // Show failed tests
        const failedResults = scoredResults.filter(r => !r.average);
        failedResults.forEach(result => {
          console.log(chalk.red(`❌ ${result.scenario} (${result.network}): Failed`));
        });
      }
      
      console.log(chalk.green(`\n💾 Full report saved to: ${reportPath}`));
      console.log(chalk.green('✅ Load performance testing complete!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Load performance testing failed:'), error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const tester = new LoadPerformanceTester();
  tester.run().catch(console.error);
}

module.exports = LoadPerformanceTester;