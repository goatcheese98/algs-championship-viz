// Performance monitoring and optimization utilities

/**
 * Performance measurement utilities
 */
export class PerformanceMonitor {
  private static measurements = new Map<string, number>()
  private static enabled = import.meta.env.DEV

  /**
   * Start measuring performance for a given operation
   */
  static start(label: string): void {
    if (!this.enabled) return
    
    this.measurements.set(label, performance.now())
    console.time(`⚡ ${label}`)
  }

  /**
   * End measurement and log results
   */
  static end(label: string): number {
    if (!this.enabled) return 0
    
    const startTime = this.measurements.get(label)
    if (startTime === undefined) {
      console.warn(`⚠️ Performance measurement '${label}' was not started`)
      return 0
    }

    const duration = performance.now() - startTime
    this.measurements.delete(label)
    
    console.timeEnd(`⚡ ${label}`)
    console.log(`📊 ${label} took ${duration.toFixed(2)}ms`)
    
    return duration
  }

  /**
   * Measure function execution time
   */
  static measure<T>(label: string, fn: () => T): T {
    this.start(label)
    try {
      const result = fn()
      if (result instanceof Promise) {
        return result.finally(() => this.end(label)) as T
      }
      this.end(label)
      return result
    } catch (error) {
      this.end(label)
      throw error
    }
  }

  /**
   * Get current memory usage (if available)
   */
  static getMemoryUsage(): number {
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
    }
    return 0
  }

  /**
   * Log memory usage
   */
  static logMemoryUsage(label?: string): void {
    if (!this.enabled) return
    
    const usage = this.getMemoryUsage()
    if (usage > 0) {
      console.log(`🧠 ${label || 'Memory usage'}: ${usage.toFixed(2)}MB`)
    }
  }
}

/**
 * RequestAnimationFrame wrapper for smooth animations
 */
export class AnimationFrameScheduler {
  private callbacks = new Set<() => void>()
  private rafId: number | null = null

  /**
   * Schedule a callback for the next animation frame
   */
  schedule(callback: () => void): void {
    this.callbacks.add(callback)
    
    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.flush()
      })
    }
  }

  /**
   * Execute all scheduled callbacks
   */
  private flush(): void {
    const callbacks = Array.from(this.callbacks)
    this.callbacks.clear()
    this.rafId = null

    for (const callback of callbacks) {
      try {
        callback()
      } catch (error) {
        console.error('Error in scheduled animation frame callback:', error)
      }
    }
  }

  /**
   * Cancel all pending callbacks
   */
  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.callbacks.clear()
  }
}

/**
 * Singleton instance for global use
 */
export const animationScheduler = new AnimationFrameScheduler()

/**
 * Optimize heavy operations with batch processing
 */
export class BatchProcessor<T> {
  private queue: T[] = []
  private processing = false
  private batchSize: number
  private processor: (items: T[]) => void | Promise<void>

  constructor(batchSize: number, processor: (items: T[]) => void | Promise<void>) {
    this.batchSize = batchSize
    this.processor = processor
  }

  /**
   * Add item to processing queue
   */
  add(item: T): void {
    this.queue.push(item)
    this.scheduleProcessing()
  }

  /**
   * Add multiple items to processing queue
   */
  addBatch(items: T[]): void {
    this.queue.push(...items)
    this.scheduleProcessing()
  }

  /**
   * Schedule processing of queued items
   */
  private scheduleProcessing(): void {
    if (this.processing) return

    this.processing = true
    
    animationScheduler.schedule(async () => {
      try {
        while (this.queue.length > 0) {
          const batch = this.queue.splice(0, this.batchSize)
          await this.processor(batch)
          
          // Yield to browser between batches
          if (this.queue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, 0))
          }
        }
      } catch (error) {
        console.error('Error in batch processing:', error)
      } finally {
        this.processing = false
      }
    })
  }

  /**
   * Get current queue length
   */
  get queueLength(): number {
    return this.queue.length
  }

  /**
   * Clear the processing queue
   */
  clear(): void {
    this.queue.length = 0
  }
}

/**
 * Intersection Observer wrapper for performance
 */
export class LazyLoader {
  private observer: IntersectionObserver
  private callbacks = new Map<Element, () => void>()

  constructor(options?: IntersectionObserverInit) {
    this.observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const callback = this.callbacks.get(entry.target)
          if (callback) {
            callback()
            this.unobserve(entry.target)
          }
        }
      }
    }, options)
  }

  /**
   * Observe element and execute callback when visible
   */
  observe(element: Element, callback: () => void): void {
    this.callbacks.set(element, callback)
    this.observer.observe(element)
  }

  /**
   * Stop observing element
   */
  unobserve(element: Element): void {
    this.observer.unobserve(element)
    this.callbacks.delete(element)
  }

  /**
   * Disconnect observer and clear all callbacks
   */
  disconnect(): void {
    this.observer.disconnect()
    this.callbacks.clear()
  }
}

/**
 * Frame rate monitor for performance tracking
 */
export class FPSMonitor {
  private frames = 0
  private startTime = performance.now()
  private lastTime = this.startTime
  private fps = 0
  private rafId: number | null = null

  /**
   * Start monitoring frame rate
   */
  start(): void {
    this.frames = 0
    this.startTime = performance.now()
    this.lastTime = this.startTime
    this.update()
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
  }

  /**
   * Get current FPS
   */
  getFPS(): number {
    return this.fps
  }

  /**
   * Update frame count and calculate FPS
   */
  private update = (): void => {
    this.frames++
    const currentTime = performance.now()
    
    if (currentTime - this.lastTime >= 1000) {
      this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime))
      this.frames = 0
      this.lastTime = currentTime
    }
    
    this.rafId = requestAnimationFrame(this.update)
  }
}

/**
 * Advanced Web Vitals monitoring
 */
class WebVitalsMonitor {
  private static metrics = new Map<string, number>()
  private static enabled = import.meta.env.DEV

  /**
   * Initialize Web Vitals monitoring
   */
  static init(): void {
    if (!this.enabled || typeof window === 'undefined') return

    // First Contentful Paint
    this.observePaint()
    
    // Largest Contentful Paint
    this.observeLCP()
    
    // Cumulative Layout Shift
    this.observeCLS()
    
    // First Input Delay (if supported)
    this.observeFID()
  }

  /**
   * Observe paint metrics
   */
  private static observePaint(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.set('FCP', entry.startTime)
            console.log(`🎨 First Contentful Paint: ${Math.round(entry.startTime)}ms`)
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    } catch (error) {
      console.warn('Paint observer not supported')
    }
  }

  /**
   * Observe Largest Contentful Paint
   */
  private static observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        this.metrics.set('LCP', lastEntry.startTime)
        console.log(`📏 Largest Contentful Paint: ${Math.round(lastEntry.startTime)}ms`)
      })
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
    } catch (error) {
      console.warn('LCP observer not supported')
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private static observeCLS(): void {
    try {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
            this.metrics.set('CLS', clsValue)
            console.log(`📐 Cumulative Layout Shift: ${clsValue.toFixed(4)}`)
          }
        }
      })
      observer.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('CLS observer not supported')
    }
  }

  /**
   * Observe First Input Delay
   */
  private static observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.metrics.set('FID', (entry as any).processingStart - entry.startTime)
          console.log(`⚡ First Input Delay: ${Math.round((entry as any).processingStart - entry.startTime)}ms`)
        }
      })
      observer.observe({ entryTypes: ['first-input'] })
    } catch (error) {
      console.warn('FID observer not supported')
    }
  }

  /**
   * Get all collected metrics
   */
  static getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  /**
   * Get performance score (0-100)
   */
  static getScore(): number {
    const fcp = this.metrics.get('FCP') || 0
    const lcp = this.metrics.get('LCP') || 0
    const cls = this.metrics.get('CLS') || 0
    const fid = this.metrics.get('FID') || 0

    let score = 100

    // FCP scoring (good < 1.8s, needs improvement < 3s)
    if (fcp > 3000) score -= 25
    else if (fcp > 1800) score -= 10

    // LCP scoring (good < 2.5s, needs improvement < 4s)
    if (lcp > 4000) score -= 25
    else if (lcp > 2500) score -= 10

    // CLS scoring (good < 0.1, needs improvement < 0.25)
    if (cls > 0.25) score -= 25
    else if (cls > 0.1) score -= 10

    // FID scoring (good < 100ms, needs improvement < 300ms)
    if (fid > 300) score -= 25
    else if (fid > 100) score -= 10

    return Math.max(0, score)
  }
}

/**
 * Bundle size analyzer
 */
class BundleAnalyzer {
  private static chunks = new Map<string, { size: number, gzipped?: number }>()

  /**
   * Register chunk information
   */
  static registerChunk(name: string, size: number, gzipped?: number): void {
    this.chunks.set(name, { size, gzipped })
  }

  /**
   * Get bundle statistics
   */
  static getStats(): { totalSize: number, totalGzipped: number, chunks: Array<{name: string, size: number, gzipped?: number}> } {
    const chunks = Array.from(this.chunks.entries()).map(([name, data]) => ({
      name,
      ...data
    }))

    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0)
    const totalGzipped = chunks.reduce((sum, chunk) => sum + (chunk.gzipped || 0), 0)

    return { totalSize, totalGzipped, chunks }
  }

  /**
   * Log bundle analysis
   */
  static analyze(): void {
    const stats = this.getStats()
    
    console.group('📦 Bundle Analysis')
    console.log(`Total size: ${(stats.totalSize / 1024).toFixed(2)} KB`)
    if (stats.totalGzipped > 0) {
      console.log(`Gzipped size: ${(stats.totalGzipped / 1024).toFixed(2)} KB`)
    }
    
    // Sort chunks by size
    const sortedChunks = stats.chunks.sort((a, b) => b.size - a.size)
    
    console.table(sortedChunks.map(chunk => ({
      Chunk: chunk.name,
      'Size (KB)': (chunk.size / 1024).toFixed(2),
      'Gzipped (KB)': chunk.gzipped ? (chunk.gzipped / 1024).toFixed(2) : 'N/A'
    })))
    
    console.groupEnd()
  }
}

/**
 * Vue component performance tracker
 */
function useComponentPerformance(componentName: string) {
  const startTime = performance.now()
  
  const onMounted = () => {
    const mountTime = performance.now() - startTime
    PerformanceMonitor.logMemoryUsage(`${componentName} mounted`)
    
    if (import.meta.env.DEV && mountTime > 50) {
      console.warn(`⚠️ ${componentName} took ${mountTime.toFixed(2)}ms to mount`)
    }
  }

  const measureRender = (callback: () => void) => {
    const renderStart = performance.now()
    callback()
    const renderTime = performance.now() - renderStart
    
    if (import.meta.env.DEV && renderTime > 16.67) { // > 60fps
      console.warn(`⚠️ ${componentName} render took ${renderTime.toFixed(2)}ms (>16.67ms)`)
    }
    
    return renderTime
  }

  return {
    onMounted,
    measureRender,
    startTime
  }
}

/**
 * Network performance utilities
 */
class NetworkMonitor {
  private static requests = new Map<string, { start: number, end?: number, size?: number }>()

  /**
   * Start tracking a network request
   */
  static startRequest(url: string): void {
    this.requests.set(url, { start: performance.now() })
  }

  /**
   * End tracking a network request
   */
  static endRequest(url: string, size?: number): void {
    const request = this.requests.get(url)
    if (request) {
      request.end = performance.now()
      request.size = size
      
      const duration = request.end - request.start
      console.log(`🌐 ${url}: ${duration.toFixed(2)}ms${size ? ` (${(size / 1024).toFixed(2)} KB)` : ''}`)
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow network request: ${url} took ${duration.toFixed(2)}ms`)
      }
    }
  }

  /**
   * Get network statistics
   */
  static getStats(): Array<{url: string, duration: number, size?: number}> {
    return Array.from(this.requests.entries())
      .filter(([_, request]) => request.end)
      .map(([url, request]) => ({
        url,
        duration: request.end! - request.start,
        size: request.size
      }))
      .sort((a, b) => b.duration - a.duration)
  }
}

/**
 * Initialize all performance monitoring
 */
function initializePerformanceMonitoring(): void {
  if (import.meta.env.DEV) {
    WebVitalsMonitor.init()
    
    // Log performance summary after page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        console.group('📊 Performance Summary')
        console.log('Web Vitals Score:', WebVitalsMonitor.getScore())
        console.log('Web Vitals Metrics:', WebVitalsMonitor.getMetrics())
        PerformanceMonitor.logMemoryUsage('Page loaded')
        console.groupEnd()
      }, 2000)
    })
  }
}

/**
 * Export performance utilities
 */
export {
  PerformanceMonitor as perf,
  AnimationFrameScheduler,
  BatchProcessor,
  LazyLoader,
  FPSMonitor,
  WebVitalsMonitor,
  BundleAnalyzer,
  NetworkMonitor,
  useComponentPerformance,
  initializePerformanceMonitoring
}