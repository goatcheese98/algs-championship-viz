import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { initializePerformanceMonitoring, perf } from './utils/performance-simple'
import './styles/app.css'

// Type-safe performance monitoring
interface PerformanceData {
  domContentLoaded: number
  loadComplete: number
  firstPaint: number | string
  firstContentfulPaint: number | string
  memoryUsage?: number
}

/**
 * Initialize performance monitoring in development
 */
function initializePerformanceMonitoring(): void {
  if (import.meta.env.DEV) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        const firstPaint = performance.getEntriesByName('first-paint')[0]
        const firstContentfulPaint = performance.getEntriesByName('first-contentful-paint')[0]
        
        const performanceMetrics: PerformanceData = {
          domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
          loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
          firstPaint: firstPaint ? Math.round(firstPaint.startTime) : 'N/A',
          firstContentfulPaint: firstContentfulPaint ? Math.round(firstContentfulPaint.startTime) : 'N/A'
        }
        
        // Add memory usage if available
        if ('memory' in performance) {
          const memory = (performance as any).memory
          performanceMetrics.memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        }
        
        console.log('📊 Load Performance:', performanceMetrics)
      }, 1000)
    })
  }
}

/**
 * Apply critical path optimizations
 */
function initializeCriticalPath(): void {
  // Reset browser zoom issues
  document.documentElement.style.zoom = 'normal'
  document.body.style.zoom = '1'
  document.body.style.transform = 'scale(1)'
  
  // Preload critical fonts
  const linkPreload = document.createElement('link')
  linkPreload.rel = 'preload'
  linkPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
  linkPreload.as = 'style'
  document.head.appendChild(linkPreload)
}

/**
 * Initialize CSS loading strategy
 */
function initializeCSSLoading(): void {
  const loadStylesheet = (href: string, media = 'all'): void => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.media = media
    document.head.appendChild(link)
  }
  
  // Load critical CSS immediately
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      loadStylesheet('/src/styles/critical.css')
    })
  } else {
    loadStylesheet('/src/styles/critical.css')
  }
  
  // Load non-critical CSS after load
  window.addEventListener('load', () => {
    loadStylesheet('/src/styles/main.css')
  })
}

/**
 * Setup error handling
 */
function initializeErrorHandling(): void {
  // Global error handler
  window.addEventListener('error', (event) => {
    console.error('💥 Global Error:', event.error)
    
    if (import.meta.env.PROD) {
      // In production, could send to error reporting service
      // Example: Sentry.captureException(event.error)
    }
  })
  
  // Promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled Promise Rejection:', event.reason)
    
    if (import.meta.env.PROD) {
      // In production, could send to error reporting service
      // Example: Sentry.captureException(event.reason)
    }
  })
}

/**
 * Initialize application
 */
async function initializeApp(): Promise<void> {
  try {
    // Start performance monitoring
    perf.start('app-initialization')
    initializePerformanceMonitoring()
    
    // Initialize critical path optimizations
    initializeCriticalPath()
    
    // Setup error handling early
    initializeErrorHandling()
    
    // Initialize CSS loading strategy
    initializeCSSLoading()
    
    // Create Vue app instance
    perf.start('vue-app-creation')
    const app = createApp(App)
    const pinia = createPinia()
    perf.end('vue-app-creation')
    
    // Configure Pinia for better performance
    pinia.use(({ store }) => {
      // Add store-level error handling
      store.$onAction(({ name, onError }) => {
        onError((error) => {
          console.error(`💥 Store Action Error [${store.$id}.${name}]:`, error)
        })
      })
    })
    
    // Install plugins
    app.use(pinia)
    app.use(router)
    
    // Development-only configurations
    if (import.meta.env.DEV) {
      app.config.performance = true
      app.config.devtools = true
    }
    
    // Production-only configurations
    if (import.meta.env.PROD) {
      app.config.errorHandler = (error, instance, info) => {
        console.error('💥 Vue Error Handler:', { error, instance, info })
        // Could send to error reporting service
      }
    }
    
    // Mount application
    perf.start('vue-app-mount')
    app.mount('#app')
    perf.end('vue-app-mount')
    
    // End overall initialization timing
    const initTime = perf.end('app-initialization')
    
    console.log(`🚀 ALGS Championship Dashboard initialized in ${initTime.toFixed(2)}ms`)
    perf.logMemoryUsage('Application initialized')
    
  } catch (error) {
    console.error('💥 Failed to initialize app:', error)
    
    // Fallback error display
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: system-ui, sans-serif;
        background: #0f172a;
        color: #f1f5f9;
        text-align: center;
        padding: 2rem;
      ">
        <div>
          <h1 style="color: #ef4444; margin-bottom: 1rem;">Application Error</h1>
          <p style="margin-bottom: 1rem;">Failed to initialize the tournament dashboard.</p>
          <button onclick="location.reload()" style="
            background: #ef4444;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
          ">
            Reload Application
          </button>
        </div>
      </div>
    `
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp)
} else {
  initializeApp()
}