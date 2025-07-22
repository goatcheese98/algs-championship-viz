#!/usr/bin/env node

/**
 * CSS Performance Benchmark Suite
 * Runs performance tests and compares against baseline metrics
 */

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { performance } = require('perf_hooks');

class BenchmarkSuite {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.resultsDir = path.join(__dirname, 'results');
    this.benchmarkFile = path.join(this.resultsDir, 'baseline-benchmark.json');
    this.baseline = null;
  }

  async init() {
    await fs.ensureDir(this.resultsDir);
    console.log(chalk.blue('🎯 CSS Performance Benchmark Suite\n'));
    
    // Load baseline if exists
    if (await fs.pathExists(this.benchmarkFile)) {
      this.baseline = await fs.readJSON(this.benchmarkFile);
      console.log(chalk.green(`📊 Loaded baseline from ${new Date(this.baseline.timestamp).toLocaleDateString()}`));
    } else {
      console.log(chalk.yellow('📊 No baseline found - first run will create baseline'));
    }
  }

  async benchmarkCSSParsing() {
    console.log(chalk.blue('⏱️  Benchmarking CSS parsing performance...'));
    
    const cssFiles = await this.getAllCSSFiles();
    const results = {};

    for (const filePath of cssFiles) {
      const filename = path.basename(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Benchmark CSS parsing
      const parseResults = await this.benchmarkSingleFile(content, filename);
      results[filename] = parseResults;
    }

    return results;
  }

  async getAllCSSFiles() {
    const files = [];
    const searchPaths = [
      path.join(this.projectRoot, 'src/styles'),
      path.join(this.projectRoot, 'styles')
    ];

    for (const searchPath of searchPaths) {
      if (await fs.pathExists(searchPath)) {
        const found = await this.findCSSFiles(searchPath);
        files.push(...found);
      }
    }

    return files;
  }

  async findCSSFiles(dir) {
    const files = [];
    const items = await fs.readdir(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        const subFiles = await this.findCSSFiles(fullPath);
        files.push(...subFiles);
      } else if (path.extname(item) === '.css') {
        files.push(fullPath);
      }
    }

    return files;
  }

  async benchmarkSingleFile(content, filename) {
    const iterations = 100;
    const results = {
      filename,
      size: content.length,
      parseTime: 0,
      selectorCount: (content.match(/\{/g) || []).length,
      ruleCount: (content.match(/[;}]/g) || []).length,
      mediaQueryCount: (content.match(/@media/g) || []).length,
      iterations
    };

    // Simulate CSS parsing by using browser APIs if available
    const parseTimes = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      // Simulate CSS parsing work
      await this.simulateCSSparsing(content);
      
      const end = performance.now();
      parseTimes.push(end - start);
    }

    results.parseTime = parseTimes.reduce((a, b) => a + b, 0) / iterations;
    results.minParseTime = Math.min(...parseTimes);
    results.maxParseTime = Math.max(...parseTimes);
    results.parseTimeStdDev = this.calculateStdDev(parseTimes);

    return results;
  }

  async simulateCSSparsing(cssContent) {
    // Simulate the work a CSS parser would do
    // This is a lightweight simulation of CSS parsing operations
    
    const operations = [
      // Tokenization simulation
      () => cssContent.split(/[\s\{\}:;]/),
      
      // Selector parsing simulation  
      () => cssContent.match(/[^{}]*\{[^}]*\}/g) || [],
      
      // Property extraction simulation
      () => cssContent.match(/[\w-]+\s*:\s*[^;]+/g) || [],
      
      // Media query processing simulation
      () => cssContent.match(/@media[^{]+\{[^}]+\}/g) || [],
      
      // CSS variable extraction simulation
      () => cssContent.match(/--[\w-]+\s*:\s*[^;]+/g) || []
    ];

    // Execute operations to simulate parsing work
    for (const operation of operations) {
      operation();
    }

    // Add small async delay to simulate I/O
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  calculateStdDev(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(avgSquareDiff);
  }

  async benchmarkBundleOperations() {
    console.log(chalk.blue('📦 Benchmarking bundle operations...'));
    
    const operations = {
      concatenation: await this.benchmarkConcatenation(),
      compression: await this.benchmarkCompression(),
      minification: await this.benchmarkMinification()
    };

    return operations;
  }

  async benchmarkConcatenation() {
    const cssFiles = await this.getAllCSSFiles();
    const iterations = 10;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      let concatenated = '';
      for (const file of cssFiles) {
        const content = await fs.readFile(file, 'utf8');
        concatenated += content + '\n';
      }
      
      const end = performance.now();
      times.push(end - start);
    }

    return {
      operation: 'concatenation',
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      fileCount: cssFiles.length,
      iterations
    };
  }

  async benchmarkCompression() {
    const gzipSize = require('gzip-size');
    const allCSS = await this.getConcatenatedCSS();
    const iterations = 10;
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await gzipSize(allCSS);
      const end = performance.now();
      times.push(end - start);
    }

    return {
      operation: 'gzip-compression',
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      originalSize: allCSS.length,
      compressedSize: await gzipSize(allCSS),
      iterations
    };
  }

  async benchmarkMinification() {
    const allCSS = await this.getConcatenatedCSS();
    const iterations = 5; // Fewer iterations as minification is slower
    const times = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      
      // Simple minification simulation (remove comments and extra whitespace)
      const minified = allCSS
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
        .trim();
      
      const end = performance.now();
      times.push(end - start);
    }

    const minified = allCSS
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/;\s*}/g, '}')
      .trim();

    return {
      operation: 'minification',
      avgTime: times.reduce((a, b) => a + b, 0) / times.length,
      originalSize: allCSS.length,
      minifiedSize: minified.length,
      reduction: ((allCSS.length - minified.length) / allCSS.length * 100).toFixed(1),
      iterations
    };
  }

  async getConcatenatedCSS() {
    const cssFiles = await this.getAllCSSFiles();
    let concatenated = '';
    
    for (const file of cssFiles) {
      const content = await fs.readFile(file, 'utf8');
      concatenated += content + '\n';
    }
    
    return concatenated;
  }

  async runFullBenchmark() {
    const benchmark = {
      timestamp: new Date().toISOString(),
      system: {
        node: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: process.memoryUsage()
      },
      results: {
        cssParsingBenchmark: await this.benchmarkCSSParsing(),
        bundleOperationsBenchmark: await this.benchmarkBundleOperations()
      }
    };

    return benchmark;
  }

  compareWithBaseline(current) {
    if (!this.baseline) {
      return { message: 'No baseline available for comparison' };
    }

    const comparison = {
      timestamp: new Date().toISOString(),
      baseline: this.baseline.timestamp,
      improvements: [],
      regressions: [],
      summary: {}
    };

    // Compare CSS parsing performance
    const currentParsing = current.results.cssParsingBenchmark;
    const baselineParsing = this.baseline.results.cssParsingBenchmark;

    Object.keys(currentParsing).forEach(filename => {
      if (baselineParsing[filename]) {
        const currentTime = currentParsing[filename].parseTime;
        const baselineTime = baselineParsing[filename].parseTime;
        const diff = ((currentTime - baselineTime) / baselineTime * 100);

        if (diff < -5) { // More than 5% improvement
          comparison.improvements.push({
            file: filename,
            metric: 'parseTime',
            improvement: -diff.toFixed(1) + '%',
            current: currentTime.toFixed(2) + 'ms',
            baseline: baselineTime.toFixed(2) + 'ms'
          });
        } else if (diff > 5) { // More than 5% regression
          comparison.regressions.push({
            file: filename,
            metric: 'parseTime',
            regression: diff.toFixed(1) + '%',
            current: currentTime.toFixed(2) + 'ms',
            baseline: baselineTime.toFixed(2) + 'ms'
          });
        }
      }
    });

    // Compare bundle operations
    const currentBundle = current.results.bundleOperationsBenchmark;
    const baselineBundle = this.baseline.results.bundleOperationsBenchmark;

    ['concatenation', 'compression', 'minification'].forEach(op => {
      if (currentBundle[op] && baselineBundle[op]) {
        const currentTime = currentBundle[op].avgTime;
        const baselineTime = baselineBundle[op].avgTime;
        const diff = ((currentTime - baselineTime) / baselineTime * 100);

        if (diff < -5) {
          comparison.improvements.push({
            operation: op,
            metric: 'avgTime',
            improvement: -diff.toFixed(1) + '%',
            current: currentTime.toFixed(2) + 'ms',
            baseline: baselineTime.toFixed(2) + 'ms'
          });
        } else if (diff > 5) {
          comparison.regressions.push({
            operation: op,
            metric: 'avgTime',
            regression: diff.toFixed(1) + '%',
            current: currentTime.toFixed(2) + 'ms',
            baseline: baselineTime.toFixed(2) + 'ms'
          });
        }
      }
    });

    comparison.summary = {
      totalImprovements: comparison.improvements.length,
      totalRegressions: comparison.regressions.length,
      overallTrend: comparison.improvements.length > comparison.regressions.length ? 'improved' : 
                   comparison.regressions.length > comparison.improvements.length ? 'regressed' : 'stable'
    };

    return comparison;
  }

  displayBenchmarkResults(benchmark, comparison = null) {
    console.log(chalk.blue('\n🎯 Benchmark Results:\n'));

    // CSS Parsing Results
    console.log(chalk.green('📊 CSS Parsing Performance:'));
    Object.entries(benchmark.results.cssParsingBenchmark).forEach(([filename, results]) => {
      console.log(`  ${filename}:`);
      console.log(`    Parse Time: ${results.parseTime.toFixed(2)}ms (±${results.parseTimeStdDev.toFixed(2)}ms)`);
      console.log(`    Size: ${this.formatSize(results.size)}`);
      console.log(`    Selectors: ${results.selectorCount}`);
    });

    // Bundle Operations Results
    console.log(chalk.blue('\n📦 Bundle Operations Performance:'));
    Object.entries(benchmark.results.bundleOperationsBenchmark).forEach(([operation, results]) => {
      console.log(`  ${operation}:`);
      console.log(`    Avg Time: ${results.avgTime.toFixed(2)}ms`);
      if (results.originalSize && results.compressedSize) {
        console.log(`    Compression: ${this.formatSize(results.originalSize)} → ${this.formatSize(results.compressedSize)}`);
      }
      if (results.reduction) {
        console.log(`    Reduction: ${results.reduction}%`);
      }
    });

    // Comparison Results
    if (comparison && !comparison.message) {
      console.log(chalk.blue('\n🔄 Comparison with Baseline:'));
      console.log(`  Overall Trend: ${comparison.summary.overallTrend}`);
      
      if (comparison.improvements.length > 0) {
        console.log(chalk.green(`  Improvements (${comparison.improvements.length}):`));
        comparison.improvements.slice(0, 5).forEach(imp => {
          console.log(`    ${imp.file || imp.operation}: ${imp.improvement} faster`);
        });
      }

      if (comparison.regressions.length > 0) {
        console.log(chalk.red(`  Regressions (${comparison.regressions.length}):`));
        comparison.regressions.slice(0, 5).forEach(reg => {
          console.log(`    ${reg.file || reg.operation}: ${reg.regression} slower`);
        });
      }
    }
  }

  formatSize(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }

  async saveBenchmark(benchmark, comparison) {
    // Save current benchmark
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const benchmarkPath = path.join(this.resultsDir, `benchmark-${timestamp}.json`);
    await fs.writeJSON(benchmarkPath, benchmark, { spaces: 2 });

    // Update baseline if this is the first run or if it's significantly better
    if (!this.baseline || (comparison && comparison.summary.overallTrend === 'improved')) {
      await fs.writeJSON(this.benchmarkFile, benchmark, { spaces: 2 });
      console.log(chalk.green('📊 Updated baseline benchmark'));
    }

    console.log(chalk.green(`💾 Benchmark saved: ${benchmarkPath}`));

    if (comparison) {
      const comparisonPath = path.join(this.resultsDir, `comparison-${timestamp}.json`);
      await fs.writeJSON(comparisonPath, comparison, { spaces: 2 });
    }
  }

  async run() {
    try {
      await this.init();

      console.log(chalk.blue('🚀 Running CSS performance benchmark...\n'));
      
      const benchmark = await this.runFullBenchmark();
      const comparison = this.compareWithBaseline(benchmark);

      this.displayBenchmarkResults(benchmark, comparison);
      await this.saveBenchmark(benchmark, comparison);

      console.log(chalk.green('\n✅ Benchmark complete!'));

    } catch (error) {
      console.error(chalk.red('❌ Benchmark failed:'), error);
      throw error;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const benchmark = new BenchmarkSuite();
  benchmark.run().catch(console.error);
}

module.exports = BenchmarkSuite;