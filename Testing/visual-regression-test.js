#!/usr/bin/env node

/**
 * Visual Regression Testing with Playwright
 * Automated visual testing and screenshot comparison
 */

const { chromium, firefox, webkit } = require('playwright');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

class VisualRegressionTester {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.resultsDir = path.join(__dirname, 'results');
    this.baselineDir = path.join(this.resultsDir, 'baseline');
    this.currentDir = path.join(this.resultsDir, 'current');
    this.diffDir = path.join(this.resultsDir, 'diff');
    this.testUrl = 'http://localhost:3000';
    this.browsers = ['chromium']; // Start with Chromium for reliability
    this.testScenarios = [
      {
        name: 'dashboard-home',
        url: '/',
        description: 'Main dashboard page',
        waitForSelector: '.dashboard-container, .main-content, body'
      },
      {
        name: 'tournament-view',
        url: '/tournament/year-4-championship',
        description: 'Tournament championship view',
        waitForSelector: '.tournament-header, .tournament-container, body'
      }
    ];
    this.viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];
  }

  async init() {
    await fs.ensureDir(this.resultsDir);
    await fs.ensureDir(this.baselineDir);
    await fs.ensureDir(this.currentDir);
    await fs.ensureDir(this.diffDir);
    console.log(chalk.blue('📸 Visual Regression Testing with Playwright\n'));
  }

  async checkServer() {
    try {
      const response = await fetch(this.testUrl);
      return response.ok;
    } catch {
      return false;
    }
  }

  async captureScreenshots(browser, page, scenario, viewport, isBaseline = false) {
    const targetDir = isBaseline ? this.baselineDir : this.currentDir;
    const timestamp = isBaseline ? '' : `-${new Date().toISOString().split('T')[0]}`;
    
    console.log(chalk.blue(`📷 Capturing ${scenario.name} at ${viewport.name}...`));
    
    // Set viewport
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    
    // Navigate to the test URL
    const fullUrl = this.testUrl + scenario.url;
    try {
      await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for content to load
      await page.waitForSelector(scenario.waitForSelector, { timeout: 10000 }).catch(() => {
        console.log(chalk.yellow(`  ⚠️ Selector ${scenario.waitForSelector} not found, continuing...`));
      });
      
      // Wait for animations/transitions to settle
      await page.waitForTimeout(2000);
      
      // Take screenshots
      const fullPagePath = path.join(targetDir, `${scenario.name}-${viewport.name}-full${timestamp}.png`);
      const viewportPath = path.join(targetDir, `${scenario.name}-${viewport.name}-viewport${timestamp}.png`);
      
      // Full page screenshot
      await page.screenshot({ 
        path: fullPagePath, 
        fullPage: true,
        animations: 'disabled' // Disable animations for consistent screenshots
      });
      
      // Viewport screenshot
      await page.screenshot({ 
        path: viewportPath, 
        fullPage: false,
        animations: 'disabled'
      });
      
      return {
        scenario: scenario.name,
        viewport: viewport.name,
        fullPagePath,
        viewportPath,
        url: fullUrl,
        dimensions: `${viewport.width}x${viewport.height}`,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error(chalk.red(`❌ Error capturing ${scenario.name} at ${viewport.name}:`), error.message);
      return {
        scenario: scenario.name,
        viewport: viewport.name,
        error: error.message,
        url: fullUrl,
        timestamp: new Date().toISOString()
      };
    }
  }

  async analyzeVisualMetrics(page, scenario) {
    console.log(chalk.blue(`📊 Analyzing visual metrics for ${scenario.name}...`));
    
    try {
      const metrics = await page.evaluate(() => {
        // Get layout metrics
        const body = document.body;
        const html = document.documentElement;
        
        // Count visible elements
        const allElements = document.querySelectorAll('*');
        const visibleElements = Array.from(allElements).filter(el => {
          const style = window.getComputedStyle(el);
          return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
        });
        
        // Check for common UI elements
        const uiElements = {
          buttons: document.querySelectorAll('button, .btn, [role="button"]').length,
          forms: document.querySelectorAll('form, input, textarea, select').length,
          images: document.querySelectorAll('img, picture, svg').length,
          links: document.querySelectorAll('a[href]').length,
          headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length
        };
        
        // Color analysis
        const computedStyles = Array.from(document.querySelectorAll('*')).map(el => {
          const style = window.getComputedStyle(el);
          return {
            backgroundColor: style.backgroundColor,
            color: style.color,
            borderColor: style.borderColor
          };
        });
        
        const colors = new Set();
        computedStyles.forEach(style => {
          if (style.backgroundColor !== 'rgba(0, 0, 0, 0)') colors.add(style.backgroundColor);
          if (style.color !== 'rgba(0, 0, 0, 0)') colors.add(style.color);
          if (style.borderColor !== 'rgba(0, 0, 0, 0)') colors.add(style.borderColor);
        });
        
        return {
          layout: {
            scrollWidth: Math.max(body.scrollWidth, html.scrollWidth),
            scrollHeight: Math.max(body.scrollHeight, html.scrollHeight),
            clientWidth: html.clientWidth,
            clientHeight: html.clientHeight
          },
          elements: {
            total: allElements.length,
            visible: visibleElements.length,
            hidden: allElements.length - visibleElements.length,
            ...uiElements
          },
          colors: {
            uniqueColors: colors.size,
            colorList: Array.from(colors).slice(0, 10) // First 10 colors
          }
        };
      });
      
      return metrics;
    } catch (error) {
      console.error(chalk.red(`❌ Error analyzing visual metrics:`), error.message);
      return null;
    }
  }

  async testAccessibility(page, scenario) {
    console.log(chalk.blue(`♿ Testing accessibility for ${scenario.name}...`));
    
    try {
      const accessibilityMetrics = await page.evaluate(() => {
        // Basic accessibility checks
        const checks = {
          hasTitle: !!document.title,
          hasLang: !!document.documentElement.lang,
          altTexts: {
            images: document.querySelectorAll('img').length,
            imagesWithAlt: document.querySelectorAll('img[alt]').length,
            imagesWithEmptyAlt: document.querySelectorAll('img[alt=""]').length
          },
          headingStructure: {
            h1: document.querySelectorAll('h1').length,
            h2: document.querySelectorAll('h2').length,
            h3: document.querySelectorAll('h3').length,
            h4: document.querySelectorAll('h4').length,
            h5: document.querySelectorAll('h5').length,
            h6: document.querySelectorAll('h6').length
          },
          aria: {
            ariaLabels: document.querySelectorAll('[aria-label]').length,
            ariaDescribedBy: document.querySelectorAll('[aria-describedby]').length,
            roles: document.querySelectorAll('[role]').length
          },
          forms: {
            inputs: document.querySelectorAll('input').length,
            inputsWithLabels: document.querySelectorAll('input[id]').length,
            labels: document.querySelectorAll('label[for]').length
          }
        };
        
        return checks;
      });
      
      // Calculate accessibility score
      let score = 0;
      let maxScore = 0;
      
      // Title and lang (10 points each)
      maxScore += 20;
      if (accessibilityMetrics.hasTitle) score += 10;
      if (accessibilityMetrics.hasLang) score += 10;
      
      // Alt texts (20 points)
      maxScore += 20;
      if (accessibilityMetrics.altTexts.images > 0) {
        const altRatio = accessibilityMetrics.altTexts.imagesWithAlt / accessibilityMetrics.altTexts.images;
        score += Math.round(altRatio * 20);
      } else {
        score += 20; // No images = perfect alt text score
      }
      
      // Heading structure (20 points)
      maxScore += 20;
      if (accessibilityMetrics.headingStructure.h1 > 0) score += 10;
      if (Object.values(accessibilityMetrics.headingStructure).some(count => count > 0)) score += 10;
      
      // ARIA attributes (15 points)
      maxScore += 15;
      if (accessibilityMetrics.aria.ariaLabels > 0) score += 5;
      if (accessibilityMetrics.aria.roles > 0) score += 5;
      if (accessibilityMetrics.aria.ariaDescribedBy > 0) score += 5;
      
      // Form accessibility (25 points)
      maxScore += 25;
      if (accessibilityMetrics.forms.inputs === 0) {
        score += 25; // No forms = perfect form score
      } else {
        const labelRatio = accessibilityMetrics.forms.labels / accessibilityMetrics.forms.inputs;
        score += Math.round(labelRatio * 25);
      }
      
      const accessibilityScore = Math.round((score / maxScore) * 100);
      
      return {
        ...accessibilityMetrics,
        score: accessibilityScore,
        grade: accessibilityScore >= 90 ? 'A' : accessibilityScore >= 80 ? 'B' : accessibilityScore >= 70 ? 'C' : accessibilityScore >= 60 ? 'D' : 'F'
      };
      
    } catch (error) {
      console.error(chalk.red(`❌ Error testing accessibility:`), error.message);
      return null;
    }
  }

  async runVisualTests(isBaseline = false) {
    const results = [];
    
    for (const browserType of this.browsers) {
      console.log(chalk.green(`\n🌐 Testing with ${browserType}...`));
      
      let browser, context, page;
      try {
        const browserEngines = { chromium, firefox, webkit };
        browser = await browserEngines[browserType].launch({ headless: true });
        context = await browser.newContext();
        page = await context.newPage();
        
        for (const scenario of this.testScenarios) {
          console.log(chalk.blue(`\n📋 Testing scenario: ${scenario.description}`));
          
          const scenarioResults = {
            browser: browserType,
            scenario: scenario.name,
            description: scenario.description,
            url: scenario.url,
            screenshots: [],
            visualMetrics: null,
            accessibility: null,
            timestamp: new Date().toISOString()
          };
          
          // Capture screenshots for each viewport
          for (const viewport of this.viewports) {
            const screenshot = await this.captureScreenshots(browser, page, scenario, viewport, isBaseline);
            scenarioResults.screenshots.push(screenshot);
          }
          
          // Analyze visual metrics and accessibility (only on desktop for consistency)
          await page.setViewportSize({ width: 1920, height: 1080 });
          const fullUrl = this.testUrl + scenario.url;
          await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 30000 });
          await page.waitForTimeout(2000);
          
          scenarioResults.visualMetrics = await this.analyzeVisualMetrics(page, scenario);
          scenarioResults.accessibility = await this.testAccessibility(page, scenario);
          
          results.push(scenarioResults);
        }
        
      } catch (error) {
        console.error(chalk.red(`❌ Error testing ${browserType}:`), error.message);
        results.push({
          browser: browserType,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      } finally {
        if (browser) await browser.close();
      }
    }
    
    return results;
  }

  async generateReport(results, isBaseline = false) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportType = isBaseline ? 'baseline' : 'visual-test';
    const reportPath = path.join(this.resultsDir, `${reportType}-${timestamp}.json`);
    
    const summary = {
      totalScenarios: this.testScenarios.length,
      totalViewports: this.viewports.length,
      totalScreenshots: results.reduce((sum, r) => sum + (r.screenshots?.length || 0), 0),
      successfulTests: results.filter(r => !r.error).length,
      failedTests: results.filter(r => r.error).length,
      averageAccessibilityScore: results.filter(r => r.accessibility?.score)
        .reduce((sum, r) => sum + r.accessibility.score, 0) / 
        results.filter(r => r.accessibility?.score).length || 0
    };
    
    const report = {
      timestamp: new Date().toISOString(),
      testUrl: this.testUrl,
      isBaseline,
      summary,
      results
    };
    
    await fs.writeJSON(reportPath, report, { spaces: 2 });
    return reportPath;
  }

  async run(createBaseline = false) {
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
      
      if (createBaseline) {
        console.log(chalk.blue('🏁 Creating baseline screenshots...'));
        const baselineResults = await this.runVisualTests(true);
        const baselineReportPath = await this.generateReport(baselineResults, true);
        
        console.log(chalk.green(`\n📋 BASELINE CREATION SUMMARY:`));
        baselineResults.forEach(result => {
          if (result.error) {
            console.log(chalk.red(`❌ ${result.scenario || result.browser}: ${result.error}`));
          } else {
            console.log(chalk.green(`✅ ${result.scenario}: ${result.screenshots.length} screenshots captured`));
            if (result.accessibility) {
              console.log(chalk.white(`   Accessibility: ${result.accessibility.score}% (${result.accessibility.grade})`));
            }
          }
        });
        
        console.log(chalk.green(`\n💾 Baseline report saved to: ${baselineReportPath}`));
        console.log(chalk.green(`📸 Baseline screenshots saved to: ${this.baselineDir}`));
        
      } else {
        console.log(chalk.blue('🔍 Running visual regression tests...'));
        const testResults = await this.runVisualTests(false);
        const reportPath = await this.generateReport(testResults, false);
        
        console.log(chalk.blue('\n📋 VISUAL REGRESSION TEST SUMMARY:'));
        testResults.forEach(result => {
          if (result.error) {
            console.log(chalk.red(`❌ ${result.scenario || result.browser}: ${result.error}`));
          } else {
            console.log(chalk.green(`✅ ${result.scenario}: Tests completed`));
            if (result.accessibility) {
              console.log(chalk.white(`   Accessibility: ${result.accessibility.score}% (${result.accessibility.grade})`));
            }
            if (result.visualMetrics) {
              console.log(chalk.white(`   Elements: ${result.visualMetrics.elements.visible}/${result.visualMetrics.elements.total} visible`));
              console.log(chalk.white(`   Colors: ${result.visualMetrics.colors.uniqueColors} unique colors`));
            }
          }
        });
        
        console.log(chalk.green(`\n💾 Test report saved to: ${reportPath}`));
        console.log(chalk.green(`📸 Screenshots saved to: ${this.currentDir}`));
      }
      
      console.log(chalk.green('✅ Visual regression testing complete!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Visual regression testing failed:'), error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const createBaseline = process.argv.includes('--baseline');
  const tester = new VisualRegressionTester();
  tester.run(createBaseline).catch(console.error);
}

module.exports = VisualRegressionTester;