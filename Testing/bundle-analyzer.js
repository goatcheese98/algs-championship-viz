#!/usr/bin/env node

/**
 * CSS Bundle Size Analyzer
 * Measures CSS file sizes, compression ratios, and optimization effectiveness
 */

const fs = require('fs-extra');
const path = require('path');
const { gzipSize } = require('gzip-size');
const { brotliSize } = require('brotli-size');
const chalk = require('chalk');
const { table } = require('table');

class BundleAnalyzer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.resultsDir = path.join(__dirname, 'results');
    this.cssFiles = [];
  }

  async init() {
    await fs.ensureDir(this.resultsDir);
    console.log(chalk.blue('🔍 CSS Bundle Size Analyzer\n'));
  }

  async findCSSFiles() {
    const stylesPaths = [
      path.join(this.projectRoot, 'src/styles'),
      path.join(this.projectRoot, 'styles'),
      path.join(this.projectRoot, 'dist/assets')
    ];

    for (const stylesPath of stylesPaths) {
      if (await fs.pathExists(stylesPath)) {
        const files = await this.scanDirectory(stylesPath, '.css');
        this.cssFiles.push(...files);
      }
    }

    console.log(chalk.green(`📁 Found ${this.cssFiles.length} CSS files`));
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

  async analyzeBundles() {
    const results = [];

    for (const filePath of this.cssFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        const filename = path.relative(this.projectRoot, filePath);

        const rawSize = Buffer.byteLength(content, 'utf8');
        const gzippedSize = await gzipSize(content);
        const brotliCompressed = await brotliSize(content);

        const analysis = {
          file: filename,
          rawSize,
          gzippedSize,
          brotliSize: brotliCompressed,
          gzipRatio: ((rawSize - gzippedSize) / rawSize * 100).toFixed(1),
          brotliRatio: ((rawSize - brotliCompressed) / rawSize * 100).toFixed(1),
          lines: content.split('\n').length,
          selectors: (content.match(/\{/g) || []).length,
          mediaQueries: (content.match(/@media/g) || []).length,
          customProperties: (content.match(/--[\w-]+:/g) || []).length
        };

        results.push(analysis);
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  Could not analyze ${filePath}: ${error.message}`));
      }
    }

    return results.sort((a, b) => b.rawSize - a.rawSize);
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  generateTable(results) {
    const headers = [
      'File',
      'Raw Size',
      'Gzipped',
      'Gzip %',
      'Brotli',
      'Brotli %',
      'Selectors',
      'Media Queries',
      'CSS Variables'
    ];

    const rows = results.map(r => [
      r.file.length > 30 ? '...' + r.file.slice(-27) : r.file,
      this.formatSize(r.rawSize),
      this.formatSize(r.gzippedSize),
      `${r.gzipRatio}%`,
      this.formatSize(r.brotliSize),
      `${r.brotliRatio}%`,
      r.selectors.toString(),
      r.mediaQueries.toString(),
      r.customProperties.toString()
    ]);

    return table([headers, ...rows], {
      border: {
        topBody: `─`,
        topJoin: `┬`,
        topLeft: `┌`,
        topRight: `┐`,
        bottomBody: `─`,
        bottomJoin: `┴`,
        bottomLeft: `└`,
        bottomRight: `┘`,
        bodyLeft: `│`,
        bodyRight: `│`,
        bodyJoin: `│`,
        joinBody: `─`,
        joinLeft: `├`,
        joinRight: `┤`,
        joinJoin: `┼`
      }
    });
  }

  generateSummary(results) {
    const totals = results.reduce((acc, r) => ({
      rawSize: acc.rawSize + r.rawSize,
      gzippedSize: acc.gzippedSize + r.gzippedSize,
      brotliSize: acc.brotliSize + r.brotliSize,
      selectors: acc.selectors + r.selectors,
      mediaQueries: acc.mediaQueries + r.mediaQueries,
      customProperties: acc.customProperties + r.customProperties
    }), {
      rawSize: 0,
      gzippedSize: 0,
      brotliSize: 0,
      selectors: 0,
      mediaQueries: 0,
      customProperties: 0
    });

    const avgGzipRatio = ((totals.rawSize - totals.gzippedSize) / totals.rawSize * 100).toFixed(1);
    const avgBrotliRatio = ((totals.rawSize - totals.brotliSize) / totals.rawSize * 100).toFixed(1);

    return {
      ...totals,
      avgGzipRatio,
      avgBrotliRatio,
      fileCount: results.length
    };
  }

  async saveResults(results, summary) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.resultsDir, `bundle-analysis-${timestamp}.json`);

    const report = {
      timestamp: new Date().toISOString(),
      summary,
      files: results,
      recommendations: this.generateRecommendations(results, summary)
    };

    await fs.writeJSON(reportPath, report, { spaces: 2 });
    console.log(chalk.green(`💾 Results saved to: ${reportPath}`));

    return report;
  }

  generateRecommendations(results, summary) {
    const recommendations = [];

    // Large files
    const largeFiles = results.filter(r => r.rawSize > 50000); // > 50KB
    if (largeFiles.length > 0) {
      recommendations.push({
        type: 'size',
        priority: 'high',
        message: `${largeFiles.length} files are larger than 50KB. Consider splitting or optimizing.`,
        files: largeFiles.map(f => f.file)
      });
    }

    // Poor compression
    const poorCompression = results.filter(r => parseFloat(r.gzipRatio) < 60);
    if (poorCompression.length > 0) {
      recommendations.push({
        type: 'compression',
        priority: 'medium',
        message: 'Some files have poor gzip compression ratios (<60%). Consider minification.',
        files: poorCompression.map(f => f.file)
      });
    }

    // Too many selectors
    const complexFiles = results.filter(r => r.selectors > 1000);
    if (complexFiles.length > 0) {
      recommendations.push({
        type: 'complexity',
        priority: 'medium',
        message: 'Files with >1000 selectors may impact rendering performance.',
        files: complexFiles.map(f => f.file)
      });
    }

    // Overall bundle size
    if (summary.rawSize > 200000) { // > 200KB total
      recommendations.push({
        type: 'bundle',
        priority: 'high',
        message: `Total CSS bundle is ${(summary.rawSize / 1024).toFixed(1)}KB. Consider code splitting or removing unused CSS.`
      });
    }

    return recommendations;
  }

  async run() {
    await this.init();
    await this.findCSSFiles();

    if (this.cssFiles.length === 0) {
      console.log(chalk.red('❌ No CSS files found to analyze'));
      return;
    }

    console.log(chalk.blue('📊 Analyzing bundle sizes...\n'));
    const results = await this.analyzeBundles();
    const summary = this.generateSummary(results);

    // Display results
    console.log(this.generateTable(results));
    console.log(chalk.blue('\n📋 Summary:'));
    console.log(chalk.white(`Files: ${summary.fileCount}`));
    console.log(chalk.white(`Total Raw Size: ${this.formatSize(summary.rawSize)}`));
    console.log(chalk.white(`Total Gzipped: ${this.formatSize(summary.gzippedSize)} (${summary.avgGzipRatio}% reduction)`));
    console.log(chalk.white(`Total Brotli: ${this.formatSize(summary.brotliSize)} (${summary.avgBrotliRatio}% reduction)`));
    console.log(chalk.white(`Total Selectors: ${summary.selectors}`));
    console.log(chalk.white(`Media Queries: ${summary.mediaQueries}`));
    console.log(chalk.white(`CSS Variables: ${summary.customProperties}`));

    // Save and show recommendations
    const report = await this.saveResults(results, summary);
    
    if (report.recommendations.length > 0) {
      console.log(chalk.yellow('\n💡 Recommendations:'));
      report.recommendations.forEach(rec => {
        const priority = rec.priority === 'high' ? chalk.red('HIGH') : chalk.yellow('MEDIUM');
        console.log(`${priority}: ${rec.message}`);
        if (rec.files && rec.files.length <= 3) {
          rec.files.forEach(file => console.log(`  - ${file}`));
        }
      });
    }

    console.log(chalk.green('\n✅ Bundle analysis complete!'));
  }
}

// Run if called directly
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.run().catch(console.error);
}

module.exports = BundleAnalyzer;