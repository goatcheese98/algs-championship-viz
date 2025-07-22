// Pure utility functions for data transformation

import type { ChartData, GameData } from '../types'

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => { inThrottle = false }, limit)
    }
  }
}

/**
 * Deep clone object using JSON serialization
 * Note: This is faster than structured clone for simple objects
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T
  }
  
  return Object.keys(obj).reduce((cloned, key) => {
    (cloned as any)[key] = deepClone((obj as any)[key])
    return cloned
  }, {} as T)
}

/**
 * Format number with appropriate precision
 */
export function formatNumber(
  num: number, 
  decimals: number = 0,
  suffix: string = ''
): string {
  if (isNaN(num)) return '0'
  
  const rounded = Number(num.toFixed(decimals))
  return rounded.toLocaleString() + suffix
}

/**
 * Format percentage with proper rounding
 */
export function formatPercentage(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0%'
  const percentage = (value / total) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Calculate cumulative values for chart data
 */
export function calculateCumulativeScores(games: readonly GameData[]): GameData[] {
  let cumulative = 0
  
  return games.map(game => ({
    ...game,
    startX: cumulative,
    points: (cumulative += game.points) - cumulative + game.points
  }))
}

/**
 * Sort teams by total score (descending)
 */
export function sortTeamsByScore(data: ChartData): ChartData {
  return [...data].sort((a, b) => b.totalScore - a.totalScore)
}

/**
 * Generate unique ID for components/elements
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Safely access nested object properties
 */
export function safeGet<T>(
  obj: any, 
  path: string, 
  defaultValue: T
): T {
  try {
    const result = path.split('.').reduce((current, key) => current?.[key], obj)
    return result !== undefined ? result : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string' && value.trim() === '') return true
  if (Array.isArray(value) && value.length === 0) return true
  if (typeof value === 'object' && Object.keys(value).length === 0) return true
  return false
}

/**
 * Clamp number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * clamp(factor, 0, 1)
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}