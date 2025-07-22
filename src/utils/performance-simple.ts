/**
 * Simplified Performance Monitoring
 */

export class PerformanceMonitor {
  private static measurements = new Map<string, number>()
  private static enabled = import.meta.env.DEV

  static start(label: string): void {
    if (!this.enabled) return
    this.measurements.set(label, performance.now())
  }

  static end(label: string): number {
    if (!this.enabled) return 0
    
    const startTime = this.measurements.get(label)
    if (startTime === undefined) return 0

    const duration = performance.now() - startTime
    this.measurements.delete(label)
    
    console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`)
    return duration
  }

  static logMemoryUsage(label = 'Memory usage'): void {
    if (!this.enabled) return
    
    if ('memory' in performance && (performance as any).memory) {
      const memory = (performance as any).memory
      const usage = memory.usedJSHeapSize / 1024 / 1024
      console.log(`🧠 ${label}: ${usage.toFixed(2)}MB`)
    }
  }
}

export function initializePerformanceMonitoring(): void {
  if (import.meta.env.DEV) {
    console.log('📊 Performance monitoring initialized')
  }
}

export const perf = PerformanceMonitor