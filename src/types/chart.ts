// Chart and visualization related TypeScript interfaces

/**
 * Chart dimensions and viewport configuration
 */
export interface ChartDimensions {
  readonly width: number
  readonly height: number
  readonly margin: {
    readonly top: number
    readonly right: number
    readonly bottom: number
    readonly left: number
  }
}

/**
 * Chart scale configuration
 */
export interface ChartScales {
  readonly x: d3.ScaleLinear<number, number>
  readonly y: d3.ScaleBand<string>
  readonly color: d3.ScaleOrdinal<string, string>
}

/**
 * Chart animation configuration
 */
export interface ChartAnimationConfig {
  readonly duration: number
  readonly ease: string
  readonly stagger: number
}

/**
 * Chart rendering state
 */
export interface ChartState {
  // Visual state
  isLegendVisible: boolean
  animationSpeed: 'slow' | 'medium' | 'fast'
  
  // Interaction state
  hoveredTeam: string | null
  selectedTeam: string | null
  
  // Filtering state
  isFiltered: boolean
  visibleGames: readonly number[]
  
  // Rendering state
  isRendering: boolean
  lastUpdateTime: number
}

/**
 * Chart data point for D3.js visualization
 */
export interface ChartDataPoint {
  readonly team: string
  readonly gameNumber: number
  readonly value: number
  readonly startValue: number
  readonly color: string
  readonly map: string
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/**
 * Chart tooltip data
 */
export interface ChartTooltipData {
  readonly team: string
  readonly game: number
  readonly map: string
  readonly points: number
  readonly placementPoints: number
  readonly kills: number
  readonly position: {
    readonly x: number
    readonly y: number
  }
}

/**
 * Chart legend item
 */
export interface ChartLegendItem {
  readonly map: string
  readonly color: string
  readonly count: number
  readonly visible: boolean
}

/**
 * Chart export configuration
 */
export interface ChartExportConfig {
  readonly format: 'png' | 'svg' | 'pdf'
  readonly width: number
  readonly height: number
  readonly quality?: number
}

/**
 * Chart performance metrics
 */
export interface ChartPerformanceMetrics {
  readonly renderTime: number
  readonly dataPoints: number
  readonly frameRate: number
  readonly memoryUsage: number
}