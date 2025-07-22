#!/usr/bin/env node

/**
 * Simple CSS Performance Test
 * Basic performance analysis without complex dependencies
 */

const fs = require('fs-extra');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');
const chalk = require('chalk');

const gzip = promisify(zlib.gzip);
const brotli = promisify(zlib.brotliCompress);

class SimplePerformanceTest {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.resultsDir = path.join(__dirname, 'results');
  }

  async init() {
    await fs.ensureDir(this.resultsDir);
    console.log(chalk.blue('🧪 Simple CSS Performance Test\n'));
  }

  async findCSSFiles() {
    const files = [];
    const searchPaths = [
      path.join(this.projectRoot, 'src/styles'),
      path.join(this.projectRoot, 'styles')
    ];

    for (const searchPath of searchPaths) {
      if (await fs.pathExists(searchPath)) {
        const found = await this.scanDirectory(searchPath, '.css');
        files.push(...found);
      }
    }

    return files;
  }

  async scanDirectory(dir, ext) {
    const files = [];
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        const subFiles = await this.scanDirectory(fullPath, ext);
        files.push(...subFiles);
      } else if (path.extname(item) === ext) {
        files.push(fullPath);
      }
    }

    return files;
  }

  async analyzeFile(filePath) {
    const content = await fs.readFile(filePath, 'utf8');
    const filename = path.relative(this.projectRoot, filePath);

    const rawSize = Buffer.byteLength(content, 'utf8');
    const gzippedBuffer = await gzip(content);
    const brotliBuffer = await brotli(content);

    const analysis = {
      file: filename,
      rawSize,
      gzippedSize: gzippedBuffer.length,
      brotliSize: brotliBuffer.length,
      gzipRatio: ((rawSize - gzippedBuffer.length) / rawSize * 100).toFixed(1),
      brotliRatio: ((rawSize - brotliBuffer.length) / rawSize * 100).toFixed(1),
      lines: content.split('\n').length,
      selectors: (content.match(/\{/g) || []).length,
      mediaQueries: (content.match(/@media/g) || []).length,
      customProperties: (content.match(/--[\w-]+:/g) || []).length,
      comments: (content.match(/\/\*[\s\S]*?\*\//g) || []).length
    };

    return analysis;
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  async run() {
    try {
      await this.init();
      
      console.log(chalk.blue('🔍 Finding CSS files...'));
      const cssFiles = await this.findCSSFiles();
      
      if (cssFiles.length === 0) {
        console.log(chalk.red('❌ No CSS files found to analyze'));
        return;
      }

      console.log(chalk.green(`📁 Found ${cssFiles.length} CSS files`));
      console.log(chalk.blue('📊 Analyzing files...\n'));

      const results = [];
      for (const filePath of cssFiles) {
        const analysis = await this.analyzeFile(filePath);
        results.push(analysis);
        
        console.log(chalk.white(`📄 ${analysis.file}`));
        console.log(`   Size: ${this.formatSize(analysis.rawSize)} → ${this.formatSize(analysis.gzippedSize)} (${analysis.gzipRatio}% compression)`);
        console.log(`   Rules: ${analysis.selectors} selectors, ${analysis.mediaQueries} media queries, ${analysis.customProperties} CSS variables`);
        console.log();
      }

      // Generate summary
      const summary = results.reduce((acc, r) => ({
        totalRawSize: acc.totalRawSize + r.rawSize,
        totalGzippedSize: acc.totalGzippedSize + r.gzippedSize,
        totalBrotliSize: acc.totalBrotliSize + r.brotliSize,
        totalSelectors: acc.totalSelectors + r.selectors,
        totalMediaQueries: acc.totalMediaQueries + r.mediaQueries,
        totalCustomProperties: acc.totalCustomProperties + r.customProperties,
        fileCount: results.length
      }), {
        totalRawSize: 0,
        totalGzippedSize: 0,
        totalBrotliSize: 0,
        totalSelectors: 0,
        totalMediaQueries: 0,
        totalCustomProperties: 0,
        fileCount: 0
      });

      const avgGzipRatio = ((summary.totalRawSize - summary.totalGzippedSize) / summary.totalRawSize * 100).toFixed(1);
      const avgBrotliRatio = ((summary.totalRawSize - summary.totalBrotliSize) / summary.totalRawSize * 100).toFixed(1);

      console.log(chalk.blue('📋 SUMMARY:'));
      console.log(chalk.white(`Files Analyzed: ${summary.fileCount}`));
      console.log(chalk.white(`Total Raw Size: ${this.formatSize(summary.totalRawSize)}`));
      console.log(chalk.white(`Total Gzipped: ${this.formatSize(summary.totalGzippedSize)} (${avgGzipRatio}% compression)`));
      console.log(chalk.white(`Total Brotli: ${this.formatSize(summary.totalBrotliSize)} (${avgBrotliRatio}% compression)`));
      console.log(chalk.white(`Total CSS Rules: ${summary.totalSelectors}`));
      console.log(chalk.white(`Media Queries: ${summary.totalMediaQueries}`));
      console.log(chalk.white(`CSS Variables: ${summary.totalCustomProperties}`));

      // Performance assessment
      console.log(chalk.blue('\n🎯 PERFORMANCE ASSESSMENT:'));
      
      if (summary.totalRawSize < 100000) {
        console.log(chalk.green('✅ Bundle Size: Excellent (<100KB)'));
      } else if (summary.totalRawSize < 200000) {
        console.log(chalk.yellow('⚠️  Bundle Size: Good (<200KB)'));
      } else {
        console.log(chalk.red('❌ Bundle Size: Large (>200KB) - Consider optimization'));
      }

      if (parseFloat(avgGzipRatio) > 70) {
        console.log(chalk.green('✅ Compression: Excellent (>70%)'));
      } else if (parseFloat(avgGzipRatio) > 60) {
        console.log(chalk.yellow('⚠️  Compression: Good (>60%)'));
      } else {
        console.log(chalk.red('❌ Compression: Poor (<60%) - Consider minification'));
      }

      if (summary.totalSelectors < 1000) {
        console.log(chalk.green('✅ Complexity: Low (<1000 selectors)'));
      } else if (summary.totalSelectors < 2000) {
        console.log(chalk.yellow('⚠️  Complexity: Medium (<2000 selectors)'));
      } else {
        console.log(chalk.red('❌ Complexity: High (>2000 selectors) - May impact performance'));
      }

      // Save results
      const reportData = {
        timestamp: new Date().toISOString(),
        files: results,
        summary: {
          ...summary,
          avgGzipRatio: parseFloat(avgGzipRatio),
          avgBrotliRatio: parseFloat(avgBrotliRatio)
        },
        recommendations: this.generateRecommendations(results, summary)
      };

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const reportPath = path.join(this.resultsDir, `performance-test-${timestamp}.json`);
      await fs.writeJSON(reportPath, reportData, { spaces: 2 });

      console.log(chalk.green(`\n💾 Results saved to: ${reportPath}`));
      console.log(chalk.green('✅ Performance test complete!'));

    } catch (error) {
      console.error(chalk.red('❌ Performance test failed:'), error);
      throw error;
    }
  }

  generateRecommendations(results, summary) {
    const recommendations = [];

    // Large files
    const largeFiles = results.filter(r => r.rawSize > 50000);
    if (largeFiles.length > 0) {
      recommendations.push({
        type: 'size',
        priority: 'high',
        message: `${largeFiles.length} files are larger than 50KB`,
        files: largeFiles.map(f => f.file)
      });
    }

    // Poor compression
    const poorCompression = results.filter(r => parseFloat(r.gzipRatio) < 60);
    if (poorCompression.length > 0) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        message: `${poorCompression.length} files have poor compression ratios`,
        files: poorCompression.map(f => f.file)
      });
    }

    // Many selectors
    const complexFiles = results.filter(r => r.selectors > 500);
    if (complexFiles.length > 0) {
      recommendations.push({
        type: 'complexity',
        priority: 'medium',
        message: `${complexFiles.length} files have many selectors (>500)`,
        files: complexFiles.map(f => f.file)
      });
    }

    return recommendations;
  }
}

// Run if called directly
if (require.main === module) {
  const test = new SimplePerformanceTest();
  test.run().catch(console.error);
}

module.exports = SimplePerformanceTest;