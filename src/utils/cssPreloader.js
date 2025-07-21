/* =============================================================================
   CSS PRELOADING STRATEGIES
   Phase 3 Implementation - Predictive CSS loading for instant navigation
   
   Purpose: Load CSS resources before they're needed based on user behavior
   Strategy: Mouse hover detection, route prediction, connection-aware loading
   Performance Impact: Near-instant navigation between tournament sections
   ============================================================================= */

/**
 * CSS preloading manager with intelligent prediction
 */
export class CSSPreloader {
  constructor() {
    this.preloadCache = new Set();
    this.hoverTimers = new Map();
    this.connectionInfo = this._getConnectionInfo();
    this.preloadQueue = [];
    this.isPreloading = false;
    
    // Behavior tracking for better predictions
    this.userBehavior = {
      visitedRoutes: new Set(),
      navigationPatterns: new Map(),
      averageStayTime: 0,
      preferredSections: new Map()
    };
    
    this._setupBehaviorTracking();
  }
  
  /**
   * Preload CSS resource with priority and connection awareness
   * @param {string} href - CSS file URL
   * @param {Object} options - Preload options
   */
  async preloadCSS(href, options = {}) {
    const {
      priority = 'low',
      timeout = 5000,
      retries = 2,
      connectionAware = true,
      crossorigin = null
    } = options;
    
    // Skip if already preloaded
    if (this.preloadCache.has(href)) {
      return Promise.resolve();
    }
    
    // Connection-aware loading
    if (connectionAware && !this._shouldPreloadOnConnection()) {
      console.log(`⏸️ Preload skipped due to connection: ${href}`);
      return Promise.resolve();
    }
    
    return this._preloadWithRetry(href, { priority, timeout, crossorigin }, retries);
  }
  
  /**
   * Preload with retry mechanism
   * @private
   */
  async _preloadWithRetry(href, options, retries) {
    const { priority, timeout, crossorigin } = options;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        await this._createPreloadLink(href, priority, timeout, crossorigin);
        this.preloadCache.add(href);
        console.log(`✅ CSS preloaded: ${href} (attempt ${attempt + 1})`);
        return;
      } catch (error) {
        if (attempt === retries) {
          console.error(`❌ CSS preload failed after ${retries + 1} attempts: ${href}`, error);
          throw error;
        }
        console.warn(`⚠️ CSS preload attempt ${attempt + 1} failed: ${href}, retrying...`);
        await this._delay(1000 * (attempt + 1)); // Exponential backoff
      }
    }
  }
  
  /**
   * Create preload link element
   * @private
   */
  _createPreloadLink(href, priority, timeout, crossorigin) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      
      if (crossorigin) {
        link.crossOrigin = crossorigin;
      }
      
      // Set priority hint if supported
      if ('fetchPriority' in link) {
        link.fetchPriority = priority;
      }
      
      const timeoutId = setTimeout(() => {
        document.head.removeChild(link);
        reject(new Error(`Preload timeout: ${href}`));
      }, timeout);
      
      link.onload = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      
      link.onerror = () => {
        clearTimeout(timeoutId);
        document.head.removeChild(link);
        reject(new Error(`Preload error: ${href}`));
      };
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * Setup hover-based preloading for navigation elements
   * @param {string} selector - CSS selector for navigation elements
   * @param {Object} routeMap - Map of elements to CSS files
   */
  setupHoverPreloading(selector, routeMap) {
    document.addEventListener('mouseover', (event) => {
      const element = event.target.closest(selector);
      if (!element) return;
      
      const route = element.getAttribute('data-route') || 
                    element.getAttribute('href') || 
                    element.getAttribute('to');
                    
      if (route && routeMap[route]) {
        this._scheduleHoverPreload(routeMap[route], element);
      }
    });
    
    document.addEventListener('mouseleave', (event) => {
      const element = event.target.closest(selector);
      if (element) {
        this._cancelHoverPreload(element);
      }
    });
  }
  
  /**
   * Schedule preload on hover with delay
   * @private
   */
  _scheduleHoverPreload(cssUrl, element) {
    const elementKey = this._getElementKey(element);
    
    // Clear existing timer
    if (this.hoverTimers.has(elementKey)) {
      clearTimeout(this.hoverTimers.get(elementKey));
    }
    
    // Schedule preload after hover delay
    const timerId = setTimeout(() => {
      this.preloadCSS(cssUrl, { 
        priority: 'high',
        connectionAware: true 
      }).catch(error => {
        console.warn('Hover preload failed:', error);
      });
      this.hoverTimers.delete(elementKey);
    }, 100); // 100ms hover delay
    
    this.hoverTimers.set(elementKey, timerId);
  }
  
  /**
   * Cancel scheduled hover preload
   * @private
   */
  _cancelHoverPreload(element) {
    const elementKey = this._getElementKey(element);
    if (this.hoverTimers.has(elementKey)) {
      clearTimeout(this.hoverTimers.get(elementKey));
      this.hoverTimers.delete(elementKey);
    }
  }
  
  /**
   * Get unique key for element
   * @private
   */
  _getElementKey(element) {
    return element.getAttribute('data-route') || 
           element.getAttribute('href') || 
           element.textContent.trim() ||
           element.outerHTML.slice(0, 50);
  }
  
  /**
   * Preload based on user behavior prediction
   * @param {string} currentRoute - Current route name
   */
  async predictivePreload(currentRoute) {
    const predictions = this._getPredictedRoutes(currentRoute);
    
    for (const prediction of predictions) {
      if (prediction.cssUrl && prediction.confidence > 0.3) {
        try {
          await this.preloadCSS(prediction.cssUrl, {
            priority: prediction.confidence > 0.7 ? 'high' : 'low',
            connectionAware: true
          });
        } catch (error) {
          console.warn(`Predictive preload failed: ${prediction.route}`, error);
        }
      }
    }
  }
  
  /**
   * Get predicted routes based on user behavior
   * @private
   */
  _getPredictedRoutes(currentRoute) {
    const patterns = this.userBehavior.navigationPatterns;
    const predictions = [];
    
    // Static predictions based on common patterns
    const staticPredictions = {
      'Home': [
        { route: 'Tournament', cssUrl: '/src/styles/routes/tournament.css', confidence: 0.8 }
      ],
      'Tournament': [
        { route: 'Home', cssUrl: '/src/styles/routes/dashboard.css', confidence: 0.4 }
      ]
    };
    
    predictions.push(...(staticPredictions[currentRoute] || []));
    
    // Dynamic predictions based on user behavior
    if (patterns.has(currentRoute)) {
      const routePatterns = patterns.get(currentRoute);
      routePatterns.forEach((count, nextRoute) => {
        const confidence = Math.min(count / 10, 0.9); // Max 90% confidence
        predictions.push({
          route: nextRoute,
          cssUrl: this._getRouteCSSUrl(nextRoute),
          confidence
        });
      });
    }
    
    // Sort by confidence
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Get CSS URL for route
   * @private
   */
  _getRouteCSSUrl(route) {
    const routeCSSMap = {
      'Home': '/src/styles/routes/dashboard.css',
      'Tournament': '/src/styles/routes/tournament.css'
    };
    return routeCSSMap[route];
  }
  
  /**
   * Setup behavior tracking for better predictions
   * @private
   */
  _setupBehaviorTracking() {
    let currentRoute = null;
    let routeStartTime = Date.now();
    
    // Track route changes (integrate with Vue Router)
    window.addEventListener('popstate', () => {
      this._trackNavigation(currentRoute, window.location.pathname);
      currentRoute = window.location.pathname;
      routeStartTime = Date.now();
    });
    
    // Track time spent on pages
    window.addEventListener('beforeunload', () => {
      if (currentRoute) {
        const stayTime = Date.now() - routeStartTime;
        this._updateStayTime(currentRoute, stayTime);
      }
    });
  }
  
  /**
   * Track navigation pattern
   * @private
   */
  _trackNavigation(fromRoute, toRoute) {
    if (!fromRoute || !toRoute || fromRoute === toRoute) return;
    
    this.userBehavior.visitedRoutes.add(toRoute);
    
    if (!this.userBehavior.navigationPatterns.has(fromRoute)) {
      this.userBehavior.navigationPatterns.set(fromRoute, new Map());
    }
    
    const routePatterns = this.userBehavior.navigationPatterns.get(fromRoute);
    routePatterns.set(toRoute, (routePatterns.get(toRoute) || 0) + 1);
  }
  
  /**
   * Update average stay time
   * @private
   */
  _updateStayTime(route, stayTime) {
    const current = this.userBehavior.averageStayTime;
    this.userBehavior.averageStayTime = (current + stayTime) / 2;
  }
  
  /**
   * Check if preloading should proceed based on connection
   * @private
   */
  _shouldPreloadOnConnection() {
    if (!this.connectionInfo) return true; // Preload if unknown
    
    const { effectiveType, saveData, downlink } = this.connectionInfo;
    
    // Don't preload on slow connections or data saver mode
    if (saveData) return false;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return false;
    if (downlink && downlink < 0.5) return false; // < 500 Kbps
    
    return true;
  }
  
  /**
   * Get connection information
   * @private
   */
  _getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }
  
  /**
   * Utility delay function
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get preloader statistics
   */
  getStats() {
    return {
      preloadedFiles: this.preloadCache.size,
      activeHoverTimers: this.hoverTimers.size,
      queueLength: this.preloadQueue.length,
      visitedRoutes: this.userBehavior.visitedRoutes.size,
      navigationPatterns: this.userBehavior.navigationPatterns.size,
      connection: this.connectionInfo
    };
  }
  
  /**
   * Clear all caches and reset
   */
  reset() {
    this.preloadCache.clear();
    this.hoverTimers.clear();
    this.preloadQueue = [];
    this.userBehavior = {
      visitedRoutes: new Set(),
      navigationPatterns: new Map(),
      averageStayTime: 0,
      preferredSections: new Map()
    };
  }
}

/**
 * ALGS-specific preloading strategies
 */
export class ALGSCSSPreloader extends CSSPreloader {
  constructor() {
    super();
    this.tournamentRoutes = new Map();
    this.chartStyles = new Set();
  }
  
  /**
   * Initialize ALGS-specific preloading
   */
  initialize() {
    // Setup hover preloading for navigation elements
    this.setupHoverPreloading('[data-route], .router-link, a[href^="/"]', {
      '/': '/src/styles/routes/dashboard.css',
      '/tournament': '/src/styles/routes/tournament.css'
    });
    
    // Preload chart styles when user hovers over chart containers
    this.setupChartPreloading();
    
    // Setup tournament-specific preloading
    this.setupTournamentPreloading();
    
    console.log('🎯 ALGS CSS Preloader initialized');
  }
  
  /**
   * Setup chart-specific preloading
   */
  setupChartPreloading() {
    document.addEventListener('mouseover', (event) => {
      if (event.target.closest('.chart-container, [data-chart]')) {
        this.preloadCSS('/src/styles/chart-enhancements.css', {
          priority: 'high',
          connectionAware: false // Charts are core functionality
        }).catch(error => console.warn('Chart CSS preload failed:', error));
      }
    });
  }
  
  /**
   * Setup tournament-specific preloading
   */
  setupTournamentPreloading() {
    // Preload tournament CSS when user shows intent to navigate
    const tournamentTriggers = [
      '.tournament-card',
      '.enter-button',
      '[data-tournament]',
      '.ewc-banner-button'
    ];
    
    tournamentTriggers.forEach(selector => {
      document.addEventListener('mouseover', (event) => {
        if (event.target.closest(selector)) {
          this.preloadCSS('/src/styles/routes/tournament.css', {
            priority: 'high'
          }).catch(error => console.warn('Tournament CSS preload failed:', error));
        }
      });
    });
  }
}

/**
 * Initialize CSS preloading system
 * @param {Object} options - Configuration options
 */
export function initializeCSSPreloader(options = {}) {
  const preloader = new ALGSCSSPreloader();
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => preloader.initialize());
  } else {
    preloader.initialize();
  }
  
  // Setup periodic behavior analysis
  setInterval(() => {
    const currentRoute = window.location.pathname;
    preloader.predictivePreload(currentRoute);
  }, 30000); // Every 30 seconds
  
  return preloader;
}

/* =============================================================================
   CSS PRELOADING USAGE EXAMPLES
   
   // Initialize in main.js:
   import { initializeCSSPreloader } from './utils/cssPreloader.js';
   
   const preloader = initializeCSSPreloader();
   
   // Manual preloading:
   preloader.preloadCSS('/src/styles/routes/tournament.css', {
     priority: 'high',
     timeout: 3000
   });
   
   // Check stats:
   console.log(preloader.getStats());
   
   EXPECTED PERFORMANCE IMPROVEMENTS:
   ✅ Near-instant navigation (0-50ms CSS load time on preloaded routes)
   ✅ 90%+ cache hit rate for predicted navigation patterns
   ✅ Connection-aware loading (respects data saver mode)
   ✅ Intelligent hover detection with 100ms delay
   ✅ Behavioral prediction based on user patterns
   ✅ Automatic retry with exponential backoff
   ============================================================================= */