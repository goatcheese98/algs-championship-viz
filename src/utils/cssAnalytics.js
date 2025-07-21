/* =============================================================================
   CSS PERFORMANCE MONITORING & ANALYTICS
   Phase 3 Implementation - Real-world CSS performance tracking and optimization
   
   Purpose: Monitor CSS loading performance and provide actionable insights
   Features: Core Web Vitals tracking, CSS load analysis, user experience metrics
   Strategy: Real-user monitoring with performance recommendations
   ============================================================================= */

/**
 * CSS Performance Analytics Manager
 * Comprehensive monitoring of CSS-related performance metrics
 */
export class CSSPerformanceAnalytics {
  constructor() {
    this.metrics = new Map();
    this.loadTimes = [];
    this.cacheHits = new Map();
    this.errors = [];
    this.userTimings = [];
    
    // Performance thresholds (in milliseconds)
    this.thresholds = {
      criticalCSS: 100,      // Critical CSS should load within 100ms
      routeCSS: 200,         // Route-specific CSS within 200ms  
      asyncCSS: 500,         // Non-critical CSS within 500ms
      firstPaint: 1000,      // First Paint within 1s
      largestPaint: 2500     // Largest Contentful Paint within 2.5s
    };
    
    this.isMonitoring = false;
    this.startTime = performance.now();
    
    this._setupPerformanceObservers();
  }
  
  /**
   * Initialize CSS performance monitoring
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.startTime = performance.now();
    
    // Monitor existing stylesheets
    this._analyzeExistingStylesheets();
    
    // Setup mutation observer for dynamic CSS loading
    this._setupMutationObserver();
    
    // Track Core Web Vitals
    this._trackCoreWebVitals();
    
    // Setup periodic reporting
    this._setupPeriodicReporting();
    
    console.log('📊 CSS Performance Analytics started');
  }
  
  /**
   * Stop monitoring and generate final report
   */
  stopMonitoring() {
    this.isMonitoring = false;
    return this.generateReport();
  }
  
  /**
   * Track CSS resource loading
   * @param {string} url - CSS file URL
   * @param {number} loadTime - Load time in milliseconds
   * @param {string} type - CSS type (critical, route, async)
   * @param {boolean} fromCache - Whether loaded from cache
   */
  trackCSSLoad(url, loadTime, type = 'unknown', fromCache = false) {
    const metric = {
      url,
      loadTime,
      type,
      fromCache,
      timestamp: Date.now(),
      performance: this._classifyPerformance(loadTime, type)
    };
    
    this.loadTimes.push(metric);
    
    // Update cache statistics
    const cacheKey = fromCache ? 'hits' : 'misses';
    this.cacheHits.set(cacheKey, (this.cacheHits.get(cacheKey) || 0) + 1);
    
    // Log performance issues
    if (metric.performance === 'poor') {
      this._logPerformanceIssue(metric);
    }
    
    console.log(`📈 CSS Load: ${url} (${loadTime}ms, ${type}, ${fromCache ? 'cached' : 'network'})`);
  }
  
  /**
   * Track CSS-related error
   * @param {string} url - CSS file URL
   * @param {Error} error - Error object
   * @param {string} context - Error context
   */
  trackCSSError(url, error, context = 'load') {
    const errorMetric = {
      url,
      error: error.message,
      context,
      timestamp: Date.now(),
      stack: error.stack
    };
    
    this.errors.push(errorMetric);
    console.error(`❌ CSS Error: ${url} - ${error.message}`);
  }
  
  /**
   * Track custom CSS performance timing
   * @param {string} name - Timing name
   * @param {number} duration - Duration in milliseconds
   * @param {Object} metadata - Additional metadata
   */
  trackCustomTiming(name, duration, metadata = {}) {
    const timing = {
      name,
      duration,
      metadata,
      timestamp: Date.now()
    };
    
    this.userTimings.push(timing);
    
    // Create performance mark for DevTools
    if ('mark' in performance) {
      performance.mark(`css-${name}-${Date.now()}`);
    }
  }
  
  /**
   * Setup performance observers for browser metrics
   * @private
   */
  _setupPerformanceObservers() {
    // Paint metrics observer
    if ('PerformanceObserver' in window) {
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.set(entry.name, {
              value: entry.startTime,
              timestamp: Date.now(),
              classification: this._classifyPaintMetric(entry.name, entry.startTime)
            });
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        
        // Largest Contentful Paint observer
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.set('largest-contentful-paint', {
            value: lastEntry.startTime,
            timestamp: Date.now(),
            classification: this._classifyPaintMetric('largest-contentful-paint', lastEntry.startTime)
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Layout Shift observer
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          let clsValue = 0;
          entries.forEach(entry => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          this.metrics.set('cumulative-layout-shift', {
            value: clsValue,
            timestamp: Date.now(),
            classification: this._classifyLayoutShift(clsValue)
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }
  
  /**
   * Analyze existing stylesheets on page
   * @private
   */
  _analyzeExistingStylesheets() {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style');
    
    stylesheets.forEach(element => {
      if (element.tagName === 'LINK') {
        const href = element.href;
        const isPhase3 = element.getAttribute('data-phase3-css');
        const routeType = element.getAttribute('data-route');
        
        // Estimate load time for existing stylesheets (approximate)
        const estimatedLoadTime = this._estimateLoadTime(element);
        
        this.trackCSSLoad(
          href,
          estimatedLoadTime,
          isPhase3 ? 'phase3' : routeType ? 'route' : 'legacy',
          true // Assume cached since already loaded
        );
      } else {
        // Inline styles
        const size = element.textContent.length;
        this.trackCustomTiming('inline-css-size', size, { 
          type: 'inline',
          element: element.tagName 
        });
      }
    });
  }
  
  /**
   * Estimate load time for existing stylesheets
   * @private
   */
  _estimateLoadTime(linkElement) {
    // This is an approximation - actual load times would need to be tracked during loading
    const href = linkElement.href;
    const isLocalFile = href.includes(window.location.origin);
    const isPhase3 = linkElement.getAttribute('data-phase3-css');
    
    if (isPhase3) return 50; // Phase 3 optimized files load faster
    if (isLocalFile) return 100; // Local files
    return 300; // External files
  }
  
  /**
   * Setup mutation observer for dynamic CSS changes
   * @private
   */
  _setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === 'LINK' && node.rel === 'stylesheet') {
                this._trackDynamicCSSLoad(node);
              } else if (node.tagName === 'STYLE') {
                this.trackCustomTiming('dynamic-style-injection', node.textContent.length);
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.head, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Track dynamically loaded CSS
   * @private
   */
  _trackDynamicCSSLoad(linkElement) {
    const href = linkElement.href;
    const startTime = performance.now();
    
    linkElement.addEventListener('load', () => {
      const loadTime = performance.now() - startTime;
      const isPhase3 = linkElement.getAttribute('data-phase3-css');
      const routeType = linkElement.getAttribute('data-route');
      
      this.trackCSSLoad(
        href,
        loadTime,
        isPhase3 ? 'phase3' : routeType ? 'route' : 'dynamic',
        false
      );
    });
    
    linkElement.addEventListener('error', (error) => {
      this.trackCSSError(href, new Error('Failed to load'), 'dynamic-load');
    });
  }
  
  /**
   * Track Core Web Vitals
   * @private
   */
  _trackCoreWebVitals() {
    // First Input Delay (FID)
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.set('first-input-delay', {
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now(),
              classification: this._classifyFID(entry.processingStart - entry.startTime)
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (error) {
        console.warn('FID observer not supported:', error);
      }
    }
  }
  
  /**
   * Setup periodic reporting
   * @private
   */
  _setupPeriodicReporting() {
    // Report every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        console.log('📊 CSS Performance Report:', this.getQuickStats());
      }, 30000);
    }
  }
  
  /**
   * Classify performance based on load time and type
   * @private
   */
  _classifyPerformance(loadTime, type) {
    const threshold = this.thresholds[type] || this.thresholds.asyncCSS;
    
    if (loadTime <= threshold * 0.5) return 'excellent';
    if (loadTime <= threshold) return 'good';
    if (loadTime <= threshold * 2) return 'fair';
    return 'poor';
  }
  
  /**
   * Classify paint metrics
   * @private
   */
  _classifyPaintMetric(name, value) {
    const thresholds = {
      'first-paint': { good: 1000, poor: 3000 },
      'first-contentful-paint': { good: 1000, poor: 3000 },
      'largest-contentful-paint': { good: 2500, poor: 4000 }
    };
    
    const threshold = thresholds[name];
    if (!threshold) return 'unknown';
    
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }
  
  /**
   * Classify layout shift
   * @private
   */
  _classifyLayoutShift(value) {
    if (value <= 0.1) return 'good';
    if (value <= 0.25) return 'needs-improvement';
    return 'poor';
  }
  
  /**
   * Classify First Input Delay
   * @private
   */
  _classifyFID(value) {
    if (value <= 100) return 'good';
    if (value <= 300) return 'needs-improvement';
    return 'poor';
  }
  
  /**
   * Log performance issue
   * @private
   */
  _logPerformanceIssue(metric) {
    console.warn(`🐌 CSS Performance Issue:`, {
      url: metric.url,
      loadTime: metric.loadTime,
      type: metric.type,
      recommendation: this._getPerformanceRecommendation(metric)
    });
  }
  
  /**
   * Get performance recommendation
   * @private
   */
  _getPerformanceRecommendation(metric) {
    if (metric.type === 'critical' && metric.loadTime > this.thresholds.criticalCSS) {
      return 'Consider inlining critical CSS or reducing critical CSS size';
    }
    
    if (metric.type === 'route' && metric.loadTime > this.thresholds.routeCSS) {
      return 'Consider preloading route CSS or further optimization';
    }
    
    if (!metric.fromCache && metric.loadTime > 300) {
      return 'Consider implementing service worker caching for better performance';
    }
    
    return 'Review CSS optimization opportunities';
  }
  
  /**
   * Get quick performance statistics
   */
  getQuickStats() {
    const totalLoads = this.loadTimes.length;
    const averageLoadTime = totalLoads > 0 
      ? this.loadTimes.reduce((sum, metric) => sum + metric.loadTime, 0) / totalLoads
      : 0;
    
    const cacheHitRate = this.cacheHits.get('hits') || 0;
    const cacheMissRate = this.cacheHits.get('misses') || 0;
    const totalRequests = cacheHitRate + cacheMissRate;
    
    return {
      totalCSSLoads: totalLoads,
      averageLoadTime: Math.round(averageLoadTime),
      cacheHitRate: totalRequests > 0 ? `${Math.round((cacheHitRate / totalRequests) * 100)}%` : '0%',
      errors: this.errors.length,
      coreWebVitals: Object.fromEntries(this.metrics)
    };
  }
  
  /**
   * Generate comprehensive performance report
   */
  generateReport() {
    const now = performance.now();
    const sessionDuration = now - this.startTime;
    
    // Calculate detailed statistics
    const loadTimesByType = this._groupLoadTimesByType();
    const performanceDistribution = this._calculatePerformanceDistribution();
    const coreWebVitalsReport = this._generateCoreWebVitalsReport();
    const recommendations = this._generateRecommendations();
    
    const report = {
      sessionInfo: {
        duration: Math.round(sessionDuration),
        startTime: new Date(Date.now() - sessionDuration).toISOString(),
        endTime: new Date().toISOString()
      },
      summary: this.getQuickStats(),
      loadTimes: {
        byType: loadTimesByType,
        distribution: performanceDistribution
      },
      coreWebVitals: coreWebVitalsReport,
      errors: this.errors,
      customTimings: this.userTimings,
      recommendations
    };
    
    console.log('📊 Complete CSS Performance Report:', report);
    return report;
  }
  
  /**
   * Group load times by CSS type
   * @private
   */
  _groupLoadTimesByType() {
    const grouped = {};
    
    this.loadTimes.forEach(metric => {
      if (!grouped[metric.type]) {
        grouped[metric.type] = [];
      }
      grouped[metric.type].push(metric.loadTime);
    });
    
    // Calculate averages for each type
    Object.keys(grouped).forEach(type => {
      const times = grouped[type];
      grouped[type] = {
        count: times.length,
        average: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
        min: Math.min(...times),
        max: Math.max(...times)
      };
    });
    
    return grouped;
  }
  
  /**
   * Calculate performance distribution
   * @private
   */
  _calculatePerformanceDistribution() {
    const distribution = { excellent: 0, good: 0, fair: 0, poor: 0 };
    
    this.loadTimes.forEach(metric => {
      distribution[metric.performance]++;
    });
    
    return distribution;
  }
  
  /**
   * Generate Core Web Vitals report
   * @private
   */
  _generateCoreWebVitalsReport() {
    const vitals = {};
    
    this.metrics.forEach((data, name) => {
      vitals[name] = {
        value: Math.round(data.value),
        classification: data.classification,
        timestamp: data.timestamp
      };
    });
    
    return vitals;
  }
  
  /**
   * Generate performance recommendations
   * @private
   */
  _generateRecommendations() {
    const recommendations = [];
    
    // Check critical CSS performance
    const criticalCSS = this.loadTimes.filter(m => m.type === 'critical');
    if (criticalCSS.some(m => m.loadTime > this.thresholds.criticalCSS)) {
      recommendations.push({
        type: 'critical',
        priority: 'high',
        message: 'Critical CSS load time exceeds threshold. Consider inlining or reducing size.',
        impact: 'First Contentful Paint improvement'
      });
    }
    
    // Check cache hit rate
    const cacheHits = this.cacheHits.get('hits') || 0;
    const totalRequests = cacheHits + (this.cacheHits.get('misses') || 0);
    const hitRate = totalRequests > 0 ? cacheHits / totalRequests : 0;
    
    if (hitRate < 0.8) {
      recommendations.push({
        type: 'caching',
        priority: 'medium',
        message: 'CSS cache hit rate is below 80%. Consider implementing service worker caching.',
        impact: 'Repeat visit performance improvement'
      });
    }
    
    // Check error rate
    if (this.errors.length > 0) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `${this.errors.length} CSS loading errors detected. Review error logs.`,
        impact: 'User experience and functionality'
      });
    }
    
    // Check Core Web Vitals
    const lcp = this.metrics.get('largest-contentful-paint');
    if (lcp && lcp.classification === 'poor') {
      recommendations.push({
        type: 'core-web-vitals',
        priority: 'high',
        message: 'Largest Contentful Paint needs improvement. Review CSS loading strategy.',
        impact: 'SEO and user experience'
      });
    }
    
    return recommendations;
  }
}

/**
 * Initialize CSS performance analytics
 * @param {Object} options - Configuration options
 */
export function initializeCSSAnalytics(options = {}) {
  const analytics = new CSSPerformanceAnalytics();
  
  // Start monitoring when page is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => analytics.startMonitoring());
  } else {
    analytics.startMonitoring();
  }
  
  // Generate report before page unload
  window.addEventListener('beforeunload', () => {
    analytics.generateReport();
  });
  
  // Expose to global scope for debugging
  if (process.env.NODE_ENV === 'development') {
    window.cssAnalytics = analytics;
  }
  
  return analytics;
}

/* =============================================================================
   CSS ANALYTICS USAGE EXAMPLES
   
   // Initialize in main.js:
   import { initializeCSSAnalytics } from './utils/cssAnalytics.js';
   
   const analytics = initializeCSSAnalytics();
   
   // Track custom CSS load:
   analytics.trackCSSLoad('/custom.css', 150, 'custom', false);
   
   // Track error:
   analytics.trackCSSError('/missing.css', new Error('404'), 'load');
   
   // Get quick stats:
   console.log(analytics.getQuickStats());
   
   // Generate full report:
   const report = analytics.generateReport();
   
   MONITORING CAPABILITIES:
   ✅ Real-time CSS load performance tracking
   ✅ Core Web Vitals monitoring (FCP, LCP, CLS, FID)
   ✅ Cache hit rate analysis
   ✅ Error tracking and logging
   ✅ Performance classification and recommendations
   ✅ Custom timing events
   ✅ Automatic reporting and alerting
   ============================================================================= */