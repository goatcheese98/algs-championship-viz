// Modern TypeScript Pinia store for tournament management

import { defineStore } from 'pinia'
import type { 
  TournamentState, 
  TournamentType, 
  TournamentDay, 
  AnimationSpeed,
  ChartData,
  GameFilterOptions,
  DataLoadOptions,
  TournamentErrorDetails
} from '../types'
import { 
  loadTournamentData, 
  detectDataFormat, 
  transformLongToWideFormat, 
  processChartData,
  createTournamentError
} from '../api'

// Import legacy functions temporarily until we convert them
import { getMapColorByOccurrence, calculateMapOccurrence } from '../chart/MapColoringLogic.js'
import { getMapSequence } from '../chart/MapSequenceData.js'

/**
 * Tournament configuration constants
 */
const TOURNAMENT_CONFIG = {
  year4: { name: 'Year 4 Championships', maxGames: 8 },
  year5: { name: 'Year 5 Championships', maxGames: 6 },
  ewc2025: { name: 'EWC 2025', maxGames: { day1: 10, day2: 9, day3: 6 } }
} as const

/**
 * Animation duration mappings
 */
const ANIMATION_DURATIONS = {
  slow: 1000,
  medium: 500,
  fast: 200
} as const

/**
 * Main tournament store with full TypeScript support
 */
export const useTournamentStore = defineStore('tournament', {
  state: (): TournamentState => ({
    // Selection state
    selectedMatchup: '',
    selectedDay: 'day1',
    tournamentType: 'year4',
    
    // Playback state  
    isPlaying: false,
    currentGame: 0,
    animationSpeed: 'medium',
    
    // Filtering state (single source of truth)
    selectedGames: [],
    
    // Data state
    processedChartData: [],
    isLoading: false,
    errorMessage: '',
    
    // UI state
    isLegendVisible: false
  }),

  getters: {
    /**
     * Calculate maximum games based on tournament type and day
     */
    maxGames: (state): number => {
      if (state.processedChartData.length > 0) {
        const firstTeam = state.processedChartData[0]
        return firstTeam?.games.length || 0
      }
      
      // Fallback based on tournament type
      if (state.tournamentType === 'ewc2025') {
        const ewcConfig = TOURNAMENT_CONFIG.ewc2025.maxGames
        return ewcConfig[state.selectedDay] || 6
      }
      
      return TOURNAMENT_CONFIG[state.tournamentType]?.maxGames || 8
    },

    /**
     * Check if any game filtering is active
     */
    isFiltered: (state): boolean => state.selectedGames.length > 0,

    /**
     * Get sorted selected games for consistent ordering
     */
    sortedSelectedGames: (state): readonly number[] => 
      [...state.selectedGames].sort((a, b) => a - b),

    /**
     * Check if a specific game is selected
     */
    isGameSelected: (state) => (gameNumber: number): boolean => 
      state.selectedGames.includes(gameNumber),

    /**
     * Get animation duration based on current speed setting
     */
    animationDuration: (state): number => ANIMATION_DURATIONS[state.animationSpeed],

    /**
     * Get tournament display name
     */
    tournamentDisplayName: (state): string => {
      const config = TOURNAMENT_CONFIG[state.tournamentType]
      return config?.name || 'Unknown Tournament'
    },

    /**
     * Get current progress as percentage
     */
    progressPercentage: (state, getters): number => {
      if (getters.maxGames === 0) return 0
      return Math.round((state.currentGame / getters.maxGames) * 100)
    },

    /**
     * Check if playback can continue
     */
    canPlay: (state, getters): boolean => 
      !state.isLoading && state.currentGame < getters.maxGames,

    /**
     * Get filtered chart data if filtering is active
     */
    filteredChartData: (state): ChartData => {
      if (!state.isFiltered || state.selectedGames.length === 0) {
        return state.processedChartData
      }
      
      // TODO: Import and use filterChartData from API
      // For now, return all data (will be implemented when we convert chart functions)
      return state.processedChartData
    }
  },

  actions: {
    /**
     * Set tournament type and reset related state
     */
    setTournamentType(type: TournamentType): void {
      console.log(`🏆 [Store] Setting tournament type: ${type}`)
      this.tournamentType = type
      this.resetPlayback()
    },

    /**
     * Select a matchup and trigger data loading
     */
    async selectMatchup(matchupId: string): Promise<void> {
      if (matchupId === this.selectedMatchup) {
        return // No change needed
      }
      
      console.log(`🎯 [Store] Selecting matchup: ${matchupId}`)
      this.selectedMatchup = matchupId
      this.resetPlayback()
      
      if (matchupId) {
        await this.loadMatchupData()
      }
    },

    /**
     * Set tournament day and reset selection
     */
    setDay(dayId: TournamentDay): void {
      console.log(`📅 [Store] Setting day: ${dayId}`)
      this.selectedDay = dayId
      this.selectedMatchup = ''
      this.resetPlayback()
    },

    /**
     * Set day without clearing matchup (for initial loading)
     */
    setDayOnly(dayId: TournamentDay): void {
      console.log(`📅 [Store] Setting day only: ${dayId}`)
      this.selectedDay = dayId
      this.resetPlayback()
    },

    /**
     * Toggle legend visibility
     */
    toggleLegend(): void {
      this.isLegendVisible = !this.isLegendVisible
      console.log(`👁️ [Store] Legend visibility: ${this.isLegendVisible}`)
    },

    /**
     * Set animation speed
     */
    setAnimationSpeed(speed: AnimationSpeed): void {
      this.animationSpeed = speed
      console.log(`⚡ [Store] Animation speed set to: ${speed}`)
    },

    /**
     * Toggle playback state
     */
    togglePlayback(): void {
      this.isPlaying = !this.isPlaying
      console.log(`▶️ [Store] Playback ${this.isPlaying ? 'started' : 'paused'}`)
    },

    /**
     * Set playing state directly
     */
    setPlaying(status: boolean): void {
      this.isPlaying = status
    },

    /**
     * Set current game with bounds checking
     */
    setCurrentGame(gameIndex: number): void {
      const boundedIndex = Math.min(Math.max(0, gameIndex), this.maxGames)
      
      if (boundedIndex !== this.currentGame) {
        this.currentGame = boundedIndex
        console.log(`🎮 [Store] Current game set to: ${boundedIndex}`)
        
        // Auto-clear filtering if returning to start
        if (boundedIndex === 0 && this.isFiltered) {
          this.clearGameFilter()
        }
      }
    },

    /**
     * Reset playback to initial state
     */
    resetPlayback(): void {
      console.log('🔄 [Store] Resetting playback state')
      this.isPlaying = false
      this.currentGame = 0
      this.clearGameFilter()
    },

    /**
     * Add a game to the filter selection
     */
    addGameToFilter(gameNumber: number): void {
      if (!this.selectedGames.includes(gameNumber)) {
        this.selectedGames = [...this.selectedGames, gameNumber].sort((a, b) => a - b)
        console.log(`➕ [Store] Added game ${gameNumber} to filter. Selected: [${this.selectedGames.join(', ')}]`)
        
        // Auto-advance to max game when filtering
        if (this.currentGame < this.maxGames) {
          this.setCurrentGame(this.maxGames)
        }
      }
    },

    /**
     * Remove a game from the filter selection
     */
    removeGameFromFilter(gameNumber: number): void {
      const index = this.selectedGames.indexOf(gameNumber)
      if (index > -1) {
        this.selectedGames = this.selectedGames.filter(game => game !== gameNumber)
        console.log(`➖ [Store] Removed game ${gameNumber} from filter. Selected: [${this.selectedGames.join(', ')}]`)
      }
    },

    /**
     * Clear all game filters
     */
    clearGameFilter(): void {
      console.log('🔄 [Store] Clearing game filter and returning to initial state')
      this.selectedGames = []
      this.setCurrentGame(0)
    },

    /**
     * Toggle a game in the filter selection
     */
    toggleGameFilter(gameNumber: number): void {
      if (this.selectedGames.includes(gameNumber)) {
        this.removeGameFromFilter(gameNumber)
      } else {
        this.addGameToFilter(gameNumber)
      }
    },

    /**
     * Set selected games directly
     */
    setSelectedGames(games: readonly number[]): void {
      this.selectedGames = [...games].sort((a, b) => a - b)
      console.log(`🎯 [Store] Selected games set to: [${this.selectedGames.join(', ')}]`)
      
      // Auto-advance to max game when filtering
      if (games.length > 0 && this.currentGame < this.maxGames) {
        this.setCurrentGame(this.maxGames)
      }
    },

    /**
     * Legacy game filter method for backward compatibility
     * TODO: Remove once all components are converted
     */
    setGameFilter(options: GameFilterOptions): void {
      const { games, action } = options
      
      switch (action) {
        case 'clear':
          this.clearGameFilter()
          break
        case 'set':
          this.setSelectedGames(games)
          break
        case 'add':
          if (options.gameNum) {
            this.addGameToFilter(options.gameNum)
          }
          break
        case 'remove':
          if (options.gameNum) {
            this.removeGameFromFilter(options.gameNum)
          }
          break
      }
    },

    /**
     * Load and process data for the selected matchup
     */
    async loadMatchupData(options?: Partial<DataLoadOptions>): Promise<void> {
      if (!this.selectedMatchup) {
        console.warn('⚠️ [Store] No matchup selected for data loading')
        return
      }

      const { forceRefresh = false } = options || {}
      
      // Skip loading if data exists and not forcing refresh
      if (!forceRefresh && this.processedChartData.length > 0) {
        console.log('📊 [Store] Using cached data for matchup:', this.selectedMatchup)
        return
      }

      console.log('📊 [Store] Loading data for matchup:', this.selectedMatchup)
      
      this.isLoading = true
      this.processedChartData = []
      this.errorMessage = ''

      try {
        // Load raw CSV data
        const response = await loadTournamentData(this.tournamentType, this.selectedMatchup)
        
        if (!response.success || !response.data) {
          throw createTournamentError('DATA_PARSE_ERROR', response.error || 'Failed to load tournament data')
        }

        const rawData = response.data as any[]
        
        // Detect and transform data format
        const dataFormat = detectDataFormat(rawData)
        console.log(`📊 [Store] Detected data format: ${dataFormat}`)

        let processedData: any[]
        
        if (dataFormat === 'long') {
          processedData = transformLongToWideFormat(rawData)
        } else if (dataFormat === 'wide') {
          processedData = rawData
        } else {
          throw createTournamentError('DATA_PARSE_ERROR', 'Unknown data format detected')
        }

        // Get map sequence for coloring
        const mapSequence = getMapSequence(this.selectedMatchup)
        console.log('🗺️ [Store] Using map sequence:', mapSequence)

        // Process data for chart rendering
        const chartData = processChartData(
          processedData,
          mapSequence,
          getMapColorByOccurrence,
          calculateMapOccurrence
        )

        this.processedChartData = chartData
        this.setCurrentGame(0)

        console.log('✅ [Store] Data loaded successfully:', {
          teams: chartData.length,
          maxGames: this.maxGames,
          sampleTeam: chartData[0]?.team
        })

      } catch (error) {
        const errorDetails = error as TournamentErrorDetails
        this.errorMessage = errorDetails.message || 'Failed to load tournament data'
        this.processedChartData = []
        
        console.error('❌ [Store] Data loading failed:', {
          matchup: this.selectedMatchup,
          error: errorDetails
        })
      } finally {
        this.isLoading = false
      }
    }
  }
})