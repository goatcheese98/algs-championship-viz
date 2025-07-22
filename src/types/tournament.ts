// Tournament-related TypeScript interfaces

/**
 * Supported tournament types in the application
 */
export type TournamentType = 'year4' | 'year5' | 'ewc2025'

/**
 * Tournament day identifiers
 */
export type TournamentDay = 'day1' | 'day2' | 'day3'

/**
 * Animation speed settings for charts
 */
export type AnimationSpeed = 'slow' | 'medium' | 'fast'

/**
 * Base tournament configuration
 */
export interface TournamentConfig {
  readonly type: TournamentType
  readonly name: string
  readonly totalDays: number
  readonly gamesPerDay: Record<TournamentDay, number>
}

/**
 * Tournament matchup identifier and metadata
 */
export interface TournamentMatchup {
  readonly id: string
  readonly name: string
  readonly day: TournamentDay
  readonly tournamentType: TournamentType
  readonly csvPath: string
}

/**
 * Raw CSV data structure for wide format (Year 4)
 */
export interface RawTeamDataWide {
  readonly Team: string
  readonly 'Overall Points': number
  readonly [gameColumn: `Game ${number} P`]: number // Placement points
  readonly [killColumn: `Game ${number} K`]: number // Kill points
}

/**
 * Raw CSV data structure for long format (Year 5, EWC 2025)
 */
export interface RawTeamDataLong {
  readonly Team: string
  readonly Game: string
  readonly Placement: string
  readonly Kills: string
}

/**
 * Processed game data for a single game
 */
export interface GameData {
  readonly gameNumber: number
  readonly placementPoints: number
  readonly kills: number
  readonly points: number
  readonly startX: number // Cumulative score at game start (for chart positioning)
  readonly map: string
  readonly color: string // Color associated with the map
}

/**
 * Complete team data with all games
 */
export interface TeamData {
  readonly team: string
  readonly games: readonly GameData[]
  readonly totalScore: number
  readonly cumulativeScore: number // Same as totalScore, kept for compatibility
}

/**
 * Chart data is an array of team data sorted by performance
 */
export type ChartData = readonly TeamData[]

/**
 * Map sequence configuration
 */
export interface MapSequence {
  readonly matchupId: string
  readonly maps: Record<number, string>
}

/**
 * Tournament state interface for store
 */
export interface TournamentState {
  // Selection state
  selectedMatchup: string
  selectedDay: TournamentDay
  tournamentType: TournamentType
  
  // Playback state  
  isPlaying: boolean
  currentGame: number
  animationSpeed: AnimationSpeed
  
  // Filtering state
  selectedGames: readonly number[]
  
  // Data state
  processedChartData: ChartData
  isLoading: boolean
  errorMessage: string
  
  // UI state
  isLegendVisible: boolean
}

/**
 * Game filter configuration
 */
export interface GameFilterOptions {
  readonly games: readonly number[]
  readonly action: 'add' | 'remove' | 'clear' | 'set'
  readonly gameNum?: number
  readonly maxGames?: number
}

/**
 * Data loading and processing options
 */
export interface DataLoadOptions {
  readonly matchupId: string
  readonly tournamentType: TournamentType
  readonly forceRefresh?: boolean
}

/**
 * Error types for better error handling
 */
export type TournamentError = 
  | 'NETWORK_ERROR'
  | 'DATA_PARSE_ERROR' 
  | 'INVALID_MATCHUP'
  | 'PROCESSING_ERROR'

export interface TournamentErrorDetails {
  readonly type: TournamentError
  readonly message: string
  readonly details?: unknown
}