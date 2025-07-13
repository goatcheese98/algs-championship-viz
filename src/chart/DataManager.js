/**
 * DataManager - Handles all data loading, processing, and filtering operations
 * Extracted from ChartEngine.js for better modularity and performance
 */

// Import separate modules for better organization
import * as d3 from 'd3';
import { MAP_SEQUENCES, getMapSequence } from './MapSequenceData.js';
import { 
    getBaseMapColor, 
    getMapColorByOccurrence, 
    calculateMapOccurrence,
    getMapColorInfo,
    SPECIAL_STATE_COLORS 
} from './MapColoringLogic.js';

export class DataManager {
    constructor() {
        this.data = null
        this.gameColumns = []
        this.maxGames = 0
        this.matchupInfo = null
        this.isFiltered = false
        this.filteredGameIndices = []
        this.preCalculatedScales = null
        this.cache = new Map()
        this._missingMatchupWarningLogged = false
        
        // Pre-computed game data for better performance and reliability
        this.preComputedGameData = null
        this.teamsList = []

        console.log('📊 DataManager initialized with separated modules')
    }

    /**
     * Load data from CSV file
     * @param {string} csvPath - Path to CSV file
     * @returns {Promise} Promise that resolves when data is loaded
     */
    async loadData(csvPath) {
        console.log('📊 Loading data from:', csvPath)
        
        // Check cache first
        const cacheKey = `data_${csvPath}`
        if (this.cache.has(cacheKey)) {
            console.log('📊 Using cached data for:', csvPath)
            this.data = this.cache.get(cacheKey)
            this.setupDataProperties(csvPath)
            return Promise.resolve()
        }

        try {
            const loadedData = await d3.csv(csvPath)

            if (!loadedData || loadedData.length === 0) {
                throw new Error(`No data loaded from ${csvPath}`)
            }

            this.data = loadedData
            this.setupDataProperties(csvPath)

            // Cache the data
            this.cache.set(cacheKey, this.data)
            
            console.log('📊 Data loaded successfully:', {
                rows: this.data.length,
                columns: Object.keys(this.data[0]).length,
                maxGames: this.maxGames
            })

            return Promise.resolve()
        } catch (error) {
            console.error('❌ Error loading data:', error)
            throw error
        }
    }

    /**
     * Setup data properties after loading
     * @param {string} csvPath - Path to CSV file
     */
    setupDataProperties(csvPath) {
        if (!this.data || this.data.length === 0) return
        
        // Extract game columns (assuming they start with 'Game')
        const firstRow = this.data[0]
        this.gameColumns = Object.keys(firstRow).filter(key => key.startsWith('Game'))
        this.maxGames = this.gameColumns.length
        
        // Setup matchup info from CSV path
        const matchupId = this.extractMatchupFromPath(csvPath)
        this.matchupInfo = getMapSequence(matchupId) // Use imported function

        if (!this.matchupInfo && !this._missingMatchupWarningLogged) {
            console.warn(`⚠️ No matchup info found for: ${matchupId}`)
            this._missingMatchupWarningLogged = true
        }
        
        // Pre-compute all game data for better performance
        this.preComputeGameData()
        
        // Pre-calculate scales for performance
        this.preCalculateScales()
    }

    /**
     * Extract matchup ID from CSV path
     * @param {string} csvPath - Path to CSV file
     * @returns {string} Matchup ID
     */
    extractMatchupFromPath(csvPath) {
        const pathParts = csvPath.split('/')
        const fileName = pathParts[pathParts.length - 1]
        return fileName.replace(/[-_]?points\.csv$|[-_]?simple\.csv$/, '')
    }

    /**
     * Process data for specific game index using pre-computed data
     * @param {number} currentGameIndex - Current game index (0 = initial state)
     * @returns {Array} Processed data for visualization
     */
    processData(currentGameIndex = 0) {
        // Enhanced validation with null/undefined checks
        if (!this.data || !this.preComputedGameData || !this.teamsList || this.teamsList.length === 0) {
            console.warn('⚠️ Data not available for processing:', {
                hasData: !!this.data,
                hasPreComputedData: !!this.preComputedGameData,
                hasTeamsList: !!this.teamsList,
                teamsCount: this.teamsList?.length || 0
            })
            return []
        }

        console.log('📊 Processing data for game index:', currentGameIndex, 'using pre-computed data')

        // Handle game filtering if active
        let teamsData = []
        
            if (this.isFiltered && this.filteredGameIndices.length > 0) {
            // Handle filtered games - need to reconstruct with only selected games
            teamsData = this.teamsList.map(team => {
                const teamPrecomputed = this.preComputedGameData[team]
                const filteredGames = []
                let cumulativeScore = 0

                // Only include games that are in the filter AND up to currentGameIndex
                this.filteredGameIndices.forEach(gameNum => {
                    if (gameNum <= currentGameIndex) {
                        const gameData = teamPrecomputed.games.find(g => g.gameNumber === gameNum)
                        if (gameData) {
                            // Recalculate startX for filtered view
                            const filteredGameData = {
                                ...gameData,
                                startX: cumulativeScore
                            }
                            filteredGames.push(filteredGameData)
                            cumulativeScore += gameData.points
                        }
                    }
                })

                return {
                    team: team,
                    games: filteredGames,
                    cumulativeScore: cumulativeScore,
                    totalScore: teamPrecomputed.totalScore
                }
            })
        } else {
            // Normal processing - use pre-computed data directly
            teamsData = this.teamsList.map(team => {
                const teamData = this.preComputedGameData[team].gameByGame[currentGameIndex]
                return {
                    team: teamData.team,
                    games: teamData.games,
                    cumulativeScore: teamData.cumulativeScore,
                    totalScore: this.preComputedGameData[team].totalScore
                }
            })
        }

        // Sort by cumulative score (descending) for game progress > 0, alphabetically for initial state
        if (currentGameIndex === 0) {
            teamsData.sort((a, b) => a.team.localeCompare(b.team))
        } else {
            teamsData.sort((a, b) => b.cumulativeScore - a.cumulativeScore)
        }

        console.log('✅ Processed data for', teamsData.length, 'teams at game index', currentGameIndex)
        return teamsData
    }

    /**
     * Filter data by selected games
     * @param {Array} selectedGames - Array of game numbers to show
     */
    filterByGames(selectedGames) {
        if (!selectedGames || selectedGames.length === 0) {
            this.clearGameFilter()
            return
        }

        this.isFiltered = true
        this.filteredGameIndices = [...selectedGames].sort((a, b) => a - b)
        console.log('📊 Applied game filter:', this.filteredGameIndices)
    }

    /**
     * Clear game filter
     */
    clearGameFilter() {
        this.isFiltered = false
        this.filteredGameIndices = []
        console.log('📊 Game filter cleared')
    }

    /**
     * Get map for specific game number
     * @param {number} gameNumber - Game number (1-based)
     * @returns {string} Map name
     */
    getMapForGame(gameNumber) {
        // Handle pre-game state
        if (gameNumber === 0) {
            return 'Pre-Game'
        }

        // Use matchup info if available
        if (this.matchupInfo && this.matchupInfo.maps) {
        return this.matchupInfo.maps[gameNumber] || 'Unknown'
        }

        // Fallback to unknown
        return 'Unknown'
    }

    /**
     * Get color for a map
     * @param {string} mapName - Map name
     * @param {number} gameNumber - Game number (optional)
     * @returns {string} CSS color string
     */
    getMapColor(mapName, gameNumber = null) {
        // Use occurrence-based coloring if gameNumber is provided
        if (gameNumber !== null && this.matchupInfo) {
            const occurrenceCount = calculateMapOccurrence(mapName, gameNumber, this.matchupInfo);
            return getMapColorByOccurrence(mapName, occurrenceCount);
        }

        // Return base color for first occurrence
        return getBaseMapColor(mapName);
    }

    /**
     * Get color for a map based on its occurrence in the sequence
     * @param {string} mapName - Map name
     * @param {number} gameNumber - Game number
     * @returns {string} CSS color string
     */
    getMapColorByOccurrence(mapName, gameNumber) {
        if (!this.matchupInfo) {
            return getBaseMapColor(mapName);
        }

        const occurrenceCount = calculateMapOccurrence(mapName, gameNumber, this.matchupInfo);
        return getMapColorByOccurrence(mapName, occurrenceCount);
    }

    /**
     * Export data as CSV
     * @param {string} matchup - Matchup identifier
     * @returns {string} CSV content
     */
    exportData(matchup) {
        if (!this.data) return ''

        const headers = ['Team', ...this.gameColumns, 'Total']
        const rows = this.data.map(d => [
            d.Team,
            ...this.gameColumns.map(col => d[col]),
            d.Total
        ])

        const csvContent = [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(','))
            .join('\n')

        return csvContent
    }

    /**
     * Get current state
     * @returns {Object} Current state information
     */
    getState() {
        return {
            hasData: !!this.data,
            dataLength: this.data ? this.data.length : 0,
            maxGames: this.maxGames,
            gameColumns: this.gameColumns,
            matchupInfo: this.matchupInfo,
            isFiltered: this.isFiltered,
            filteredGameIndices: this.filteredGameIndices,
            cacheSize: this.cache.size,
            hasPreComputedData: !!this.preComputedGameData,
            teamsCount: this.teamsList.length,
            modulesLoaded: {
                mapSequences: !!MAP_SEQUENCES,
                mapColoring: !!getBaseMapColor
            }
        }
    }

    /**
     * Get all teams data for initial state using pre-computed data
     * @returns {Array} Team data with zero scores
     */
    getAllTeamsData() {
        if (!this.preComputedGameData || !this.teamsList) {
            // Fallback to basic structure if pre-computed data isn't available
        if (!this.data) return []

        return this.data.map(d => ({
            team: d.Team,
            games: [],
                cumulativeScore: 0,
                totalScore: parseInt(d.Total) || 0
            })).sort((a, b) => a.team.localeCompare(b.team))
        }

        // Use pre-computed initial state data
        return this.teamsList.map(team => {
            const teamData = this.preComputedGameData[team].gameByGame[0]
            return {
                team: teamData.team,
                games: teamData.games,
                cumulativeScore: teamData.cumulativeScore,
                totalScore: this.preComputedGameData[team].totalScore
            }
        }).sort((a, b) => a.team.localeCompare(b.team))
    }

    /**
     * Get maximum possible score (used for scale calculation)
     * @returns {number} Maximum possible score
     */
    getMaxPossibleScore() {
        if (!this.data) return 100

        // Calculate max score from actual data
        let maxScore = 0
        this.data.forEach(d => {
            const total = parseInt(d.Total) || 0
            maxScore = Math.max(maxScore, total)
        })

        return maxScore || 100
    }

    /**
     * Get maximum score at specific game index for dynamic scaling
     * @param {number} gameIndex - Game index (0 = initial state, 1+ = game number)
     * @returns {number} Maximum score at that game index
     */
    getMaxScoreAtGame(gameIndex) {
        // Use pre-calculated values if available
        if (this.preCalculatedScales && this.preCalculatedScales[gameIndex] !== undefined) {
            const value = this.preCalculatedScales[gameIndex]
            console.log(`📊 Using pre-calculated scale for game ${gameIndex}: ${value}`)
            return value
        }

        // Fallback to real-time calculation
        console.log(`📊 Calculating real-time scale for game ${gameIndex}`)
        return this.calculateMaxScoreAtGame(gameIndex)
    }

    /**
     * Calculate maximum score at specific game index (internal method)
     * @param {number} gameIndex - Game index (0 = initial state, 1+ = game number)
     * @returns {number} Maximum score at that game index
     */
    calculateMaxScoreAtGame(gameIndex) {
        if (!this.data || !this.gameColumns) return 100

        // Handle initial state (game 0) - user specified this should be 12
        if (gameIndex === 0) {
            return 12
        }

        // Ensure gameIndex is within bounds
        gameIndex = Math.max(1, Math.min(gameIndex, this.maxGames))

        let maxScore = 0

        // Calculate actual max cumulative score at this game index
        this.data.forEach(d => {
            let cumulativeScore = 0
            for (let i = 1; i <= gameIndex; i++) {
                const gameColumn = `Game ${i}`
                const gameScore = parseInt(d[gameColumn]) || 0
                cumulativeScore += gameScore
            }
            maxScore = Math.max(maxScore, cumulativeScore)
        })

        // Add buffer for better visualization
        const bufferedMax = Math.ceil(maxScore * 1.1)
        return Math.max(bufferedMax, 12) // Ensure minimum scale
    }

    /**
     * Pre-calculate scales for all game indices for better performance
     */
    preCalculateScales() {
        if (!this.data || !this.gameColumns) return

        console.log('📊 Pre-calculating scales for performance...')

        this.preCalculatedScales = {}

        // Calculate for initial state (game 0)
        this.preCalculatedScales[0] = 12

        // Calculate for each game
        for (let gameIndex = 1; gameIndex <= this.maxGames; gameIndex++) {
            this.preCalculatedScales[gameIndex] = this.calculateMaxScoreAtGame(gameIndex)
        }

        console.log('📊 Pre-calculated scales:', this.preCalculatedScales)
    }

    /**
     * Clear cache to free memory
     */
    clearCache() {
        this.cache.clear()
        console.log('📊 Cache cleared')
    }

    /**
     * Pre-compute all game data including cumulative scores for better performance
     * This eliminates on-the-fly calculations and prevents timing issues
     */
    preComputeGameData() {
        if (!this.data || !this.gameColumns) return

        console.log('📊 Pre-computing all game data for better performance...')
        
        this.preComputedGameData = {}
        this.teamsList = []

        // Process each team
        this.data.forEach(d => {
            const team = d.Team
            this.teamsList.push(team)
            
            this.preComputedGameData[team] = {
                team: team,
                totalScore: parseInt(d.Total) || 0,
                gameByGame: [], // Will store data for each game index (0 to maxGames)
                games: []       // Will store individual game data
            }

            let cumulativeScore = 0
            
            // Game 0 - Initial state
            this.preComputedGameData[team].gameByGame[0] = {
                currentGameIndex: 0,
                cumulativeScore: 0,
                games: [],
                team: team
            }

            // Games 1 to maxGames
            for (let gameIndex = 1; gameIndex <= this.maxGames; gameIndex++) {
                const gameColumn = `Game ${gameIndex}`
                const gameScore = parseInt(d[gameColumn]) || 0
                const mapForGame = this.getMapForGame(gameIndex)
                const gameColor = this.getMapColor(mapForGame, gameIndex)

                // Add to individual games array
                const gameData = {
                    gameNumber: gameIndex,
                    game: gameIndex,
                    points: gameScore,
                    score: gameScore,
                    color: gameColor,
                    map: mapForGame,
                    startX: cumulativeScore,
                    cumulativeScore: cumulativeScore + gameScore
                }
                
                this.preComputedGameData[team].games.push(gameData)
                cumulativeScore += gameScore

                // Store cumulative data for this game index
                this.preComputedGameData[team].gameByGame[gameIndex] = {
                    currentGameIndex: gameIndex,
                    cumulativeScore: cumulativeScore,
                    games: this.preComputedGameData[team].games.slice(0, gameIndex), // Games up to this index
                    team: team,
                    totalScore: parseInt(d.Total) || 0
                }
            }
        })

        console.log('✅ Pre-computed game data for', this.teamsList.length, 'teams and', this.maxGames, 'games')
    }

    /**
     * Reset data manager
     */
    reset() {
        this.data = null
        this.gameColumns = []
        this.maxGames = 0
        this.matchupInfo = null
        this.isFiltered = false
        this.filteredGameIndices = []
        this.preCalculatedScales = null  // Reset pre-calculated scales
        this._missingMatchupWarningLogged = false // Reset warning flag
        
        // Clear pre-computed data
        this.preComputedGameData = null
        this.teamsList = []
        
        // Keep cache for performance

        console.log('📊 DataManager reset')
    }
} 