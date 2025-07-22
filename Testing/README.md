# CSS Performance Testing Suite

This testing suite provides comprehensive tools to measure and analyze CSS performance for the ALGS Championship Visualization project.

## Available Tests

### 1. **Bundle Size Analysis** (`bundle-analyzer.js`)
- Measures CSS file sizes (raw, gzipped, brotli)
- Compares before/after optimization
- Generates size reports and visualizations

### 2. **Load Performance Testing** (`load-performance.js`)
- Tests First Contentful Paint (FCP) times
- Measures CSS loading and parsing time
- Compares critical vs non-critical loading strategies

### 3. **Browser Performance** (`browser-perf-test.js`)
- Uses Playwright to test real browser performance
- Measures rendering metrics
- Tests across different browsers/devices

### 4. **CSS Coverage Analysis** (`coverage-analyzer.js`)
- Analyzes which CSS is actually used
- Identifies unused selectors
- Measures CSS utilization percentage

### 5. **Visual Regression Testing** (`visual-regression.js`)
- Takes screenshots before/after CSS changes
- Compares visual differences
- Ensures styling consistency

## Quick Start

```bash
# Install dependencies
cd Testing
npm install

# Run all performance tests
npm run test:all

# Run specific test
npm run test:bundle
npm run test:load
npm run test:browser
npm run test:coverage
npm run test:visual

# Generate performance report
npm run report
```

## Test Results

All test results are saved to `Testing/results/` with timestamps for comparison tracking.