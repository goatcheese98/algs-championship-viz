// API and data fetching related TypeScript interfaces

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  readonly data: T
  readonly success: boolean
  readonly error?: string
  readonly timestamp: number
}

/**
 * API error response
 */
export interface ApiError {
  readonly message: string
  readonly code?: string | number
  readonly details?: unknown
}

/**
 * CSV data loading configuration
 */
export interface CsvLoadConfig {
  readonly url: string
  readonly timeout?: number
  readonly retries?: number
  readonly parseOptions?: {
    readonly delimiter?: string
    readonly skipEmptyLines?: boolean
    readonly header?: boolean
  }
}

/**
 * Data transformation configuration
 */
export interface DataTransformConfig {
  readonly inputFormat: 'wide' | 'long'
  readonly placementPointsMap: Record<string, number>
  readonly sortBy?: 'totalScore' | 'team'
  readonly sortOrder?: 'asc' | 'desc'
}

/**
 * Cache configuration for data fetching
 */
export interface CacheConfig {
  readonly ttl: number // Time to live in milliseconds
  readonly maxSize: number // Maximum cache entries
  readonly strategy: 'lru' | 'fifo' // Cache eviction strategy
}

/**
 * Data validation result
 */
export interface DataValidationResult {
  readonly isValid: boolean
  readonly errors: readonly string[]
  readonly warnings: readonly string[]
  readonly processedRows: number
  readonly skippedRows: number
}

/**
 * Batch data loading configuration
 */
export interface BatchLoadConfig {
  readonly matchupIds: readonly string[]
  readonly concurrency?: number
  readonly onProgress?: (completed: number, total: number) => void
  readonly onError?: (matchupId: string, error: ApiError) => void
}

/**
 * Real-time data subscription configuration
 */
export interface SubscriptionConfig {
  readonly endpoint: string
  readonly interval: number
  readonly onUpdate: (data: unknown) => void
  readonly onError: (error: ApiError) => void
  readonly autoReconnect?: boolean
}