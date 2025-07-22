#!/usr/bin/env node

/**
 * MCP-Style Playwright Integration Test
 * Provides MCP-like functionality until MCP tools are available
 */

const { chromium } = require('playwright');
const chalk = require('chalk');

class MCPStylePlaywrightTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.testUrl = 'http://localhost:3000';
  }

  async mcp_playwright_launch(options = {}) {
    console.log(chalk.blue('🎭 mcp__playwright__launch'));
    this.browser = await chromium.launch({ 
      headless: options.headless !== false,
      devtools: options.devtools === true
    });
    const context = await this.browser.newContext();
    this.page = await context.newPage();
    console.log(chalk.green('✅ Browser launched successfully'));
    return { success: true, message: 'Browser launched' };
  }

  async mcp_playwright_navigate(url) {
    console.log(chalk.blue(`🎭 mcp__playwright__navigate(${url})`));
    if (!this.page) {
      await this.mcp_playwright_launch();
    }
    
    const fullUrl = url.startsWith('http') ? url : this.testUrl + url;
    const response = await this.page.goto(fullUrl, { waitUntil: 'networkidle' });
    
    console.log(chalk.green(`✅ Navigated to ${fullUrl} (${response.status()})`));
    return { 
      success: true, 
      url: fullUrl, 
      status: response.status(),
      title: await this.page.title()
    };
  }

  async mcp_playwright_screenshot(filename, options = {}) {
    console.log(chalk.blue(`🎭 mcp__playwright__screenshot(${filename})`));
    if (!this.page) {
      throw new Error('No page available. Call mcp_playwright_navigate first.');
    }

    const path = `Testing/results/mcp-screenshots/${filename}`;
    await this.page.screenshot({ 
      path,
      fullPage: options.fullPage !== false,
      ...options
    });
    
    console.log(chalk.green(`✅ Screenshot saved to ${path}`));
    return { success: true, path, filename };
  }

  async mcp_playwright_evaluate(script) {
    console.log(chalk.blue('🎭 mcp__playwright__evaluate'));
    if (!this.page) {
      throw new Error('No page available. Call mcp_playwright_navigate first.');
    }

    const result = await this.page.evaluate(script);
    console.log(chalk.green('✅ Script evaluated successfully'));
    return { success: true, result };
  }

  async mcp_playwright_click(selector) {
    console.log(chalk.blue(`🎭 mcp__playwright__click(${selector})`));
    if (!this.page) {
      throw new Error('No page available. Call mcp_playwright_navigate first.');
    }

    await this.page.click(selector);
    console.log(chalk.green(`✅ Clicked element: ${selector}`));
    return { success: true, selector };
  }

  async mcp_playwright_wait_for_selector(selector, timeout = 30000) {
    console.log(chalk.blue(`🎭 mcp__playwright__wait_for_selector(${selector})`));
    if (!this.page) {
      throw new Error('No page available. Call mcp_playwright_navigate first.');
    }

    await this.page.waitForSelector(selector, { timeout });
    console.log(chalk.green(`✅ Element found: ${selector}`));
    return { success: true, selector };
  }

  async mcp_playwright_get_performance_metrics() {
    console.log(chalk.blue('🎭 mcp__playwright__get_performance_metrics'));
    if (!this.page) {
      throw new Error('No page available. Call mcp_playwright_navigate first.');
    }

    const metrics = await this.page.evaluate(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      const paintEntries = performance.getEntriesByType('paint');
      const resourceEntries = performance.getEntriesByType('resource');
      
      return {
        navigation: {
          domContentLoaded: perfData?.domContentLoadedEventEnd || 0,
          loadComplete: perfData?.loadEventEnd || 0,
        },
        paint: {
          firstPaint: paintEntries.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paintEntries.find(p => p.name === 'first-contentful-paint')?.startTime || 0
        },
        resources: {
          total: resourceEntries.length,
          css: resourceEntries.filter(r => r.name.includes('.css')).length,
          js: resourceEntries.filter(r => r.name.includes('.js')).length
        }
      };
    });

    console.log(chalk.green('✅ Performance metrics collected'));
    return { success: true, metrics };
  }

  async mcp_playwright_close() {
    console.log(chalk.blue('🎭 mcp__playwright__close'));
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      console.log(chalk.green('✅ Browser closed'));
    }
    return { success: true, message: 'Browser closed' };
  }

  async runDemo() {
    console.log(chalk.blue('🚀 MCP-Style Playwright Demo\n'));
    
    try {
      // Launch browser
      await this.mcp_playwright_launch();
      
      // Navigate to dashboard
      await this.mcp_playwright_navigate('/');
      
      // Wait for content
      await this.mcp_playwright_wait_for_selector('body');
      
      // Take screenshot
      await this.mcp_playwright_screenshot('dashboard-demo.png');
      
      // Get performance metrics
      const perfResult = await this.mcp_playwright_get_performance_metrics();
      console.log(chalk.white('Performance Metrics:'));
      console.log(chalk.white(`  FCP: ${perfResult.metrics.paint.firstContentfulPaint.toFixed(2)}ms`));
      console.log(chalk.white(`  DOM Content Loaded: ${perfResult.metrics.navigation.domContentLoaded.toFixed(2)}ms`));
      console.log(chalk.white(`  Resources: ${perfResult.metrics.resources.total} total`));
      
      // Navigate to tournament page
      await this.mcp_playwright_navigate('/tournament/year-4-championship');
      await this.mcp_playwright_screenshot('tournament-demo.png');
      
      // Test JavaScript evaluation
      const jsResult = await this.mcp_playwright_evaluate(() => {
        return {
          title: document.title,
          url: window.location.href,
          elementCount: document.querySelectorAll('*').length
        };
      });
      
      console.log(chalk.white('\nPage Information:'));
      console.log(chalk.white(`  Title: ${jsResult.result.title}`));
      console.log(chalk.white(`  URL: ${jsResult.result.url}`));
      console.log(chalk.white(`  Elements: ${jsResult.result.elementCount}`));
      
      console.log(chalk.green('\n✅ MCP-Style Demo Complete!'));
      
    } catch (error) {
      console.error(chalk.red('❌ Demo failed:'), error.message);
    } finally {
      await this.mcp_playwright_close();
    }
  }
}

// Export for use in other scripts
module.exports = MCPStylePlaywrightTester;

// Run demo if called directly
if (require.main === module) {
  const demo = new MCPStylePlaywrightTester();
  demo.runDemo().catch(console.error);
}