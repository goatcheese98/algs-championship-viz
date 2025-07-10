/**
 * DataManager - Handles all data loading, processing, and filtering operations
 * Extracted from ChartEngine.js for better modularity and performance
 */

// Ensure D3 is available
const d3 = window.d3
if (!d3) {
    throw new Error('D3.js is not available. Please ensure d3.v7.min.js is loaded.')
}

// Integrated map sequences data (moved from js/mapSequences.js)
const MAP_SEQUENCES = {
    // Group Stage Matchups (6 games each)
    'AvsB': {
        name: 'Groups A vs B',
        gameCount: 6,
        maps: {
            1: 'E-DISTRICT',
            2: 'E-DISTRICT',
            3: 'STORM POINT',
            4: 'STORM POINT',
            5: 'WORLD\'S EDGE',
            6: 'WORLD\'S EDGE'
        }
    },

    'CvsD': {
        name: 'Groups C vs D',
        gameCount: 6,
        maps: {
            1: 'E-DISTRICT',
            2: 'E-DISTRICT',
            3: 'STORM POINT',
            4: 'STORM POINT',
            5: 'WORLD\'S EDGE',
            6: 'WORLD\'S EDGE'
        }
    },

    'BvsD': {
        name: 'Groups B vs D',
        gameCount: 6,
        maps: {
            1: 'STORM POINT',
            2: 'STORM POINT',
            3: 'WORLD\'S EDGE',
            4: 'WORLD\'S EDGE',
            5: 'E-DISTRICT',
            6: 'E-DISTRICT'
        }
    },

    'AvsC': {
        name: 'Groups A vs C',
        gameCount: 6,
        maps: {
            1: 'E-DISTRICT',
            2: 'E-DISTRICT',
            3: 'STORM POINT',
            4: 'STORM POINT',
            5: 'WORLD\'S EDGE',
            6: 'WORLD\'S EDGE'
        }
    },

    'BvsC': {
        name: 'Groups B vs C',
        gameCount: 6,
        maps: {
            1: 'STORM POINT',
            2: 'STORM POINT',
            3: 'WORLD\'S EDGE',
            4: 'WORLD\'S EDGE',
            5: 'E-DISTRICT',
            6: 'E-DISTRICT'
        }
    },

    'AvsD': {
        name: 'Groups A vs D',
        gameCount: 6,
        maps: {
            1: 'E-DISTRICT',
            2: 'E-DISTRICT',
            3: 'STORM POINT',
            4: 'STORM POINT',
            5: 'WORLD\'S EDGE',
            6: 'WORLD\'S EDGE'
        }
    },

    // Bracket Stage Matchups (8 games each)
    'ER1': {
        name: 'Elimination Round 1',
        gameCount: 8,
        maps: {
            1: 'E-DISTRICT',
            2: 'E-DISTRICT',
            3: 'E-DISTRICT',
            4: 'STORM POINT',
            5: 'STORM POINT',
            6: 'WORLD\'S EDGE',
            7: 'WORLD\'S EDGE',
            8: 'WORLD\'S EDGE'
        }
    },

    'ER2': {
        name: 'Elimination Round 2',
        gameCount: 8,
        maps: {
            1: 'STORM POINT',
            2: 'STORM POINT',
            3: 'WORLD\'S EDGE',
            4: 'WORLD\'S EDGE',
            5: 'E-DISTRICT',
            6: 'E-DISTRICT',
            7: 'STORM POINT',
            8: 'WORLD\'S EDGE'
        }
    },

    'WR1': {
        name: 'Winners Round 1',
        gameCount: 8,
        maps: {
            1: 'WORLD\'S EDGE',
            2: 'WORLD\'S EDGE',
            3: 'E-DISTRICT',
            4: 'E-DISTRICT',
            5: 'STORM POINT',
            6: 'STORM POINT',
            7: 'WORLD\'S EDGE',
            8: 'E-DISTRICT'
        }
    }
}

export class DataManager {
    constructor() {
        this.data = null
        this.gameColumns = []
        this.maxGames = 0
        this.matchupInfo = null
        this.cache = new Map()
        this.isFiltered = false
        this.filteredGameIndices = []
        this.preCalculatedScales = null  // Will store pre-calculated scaling values
        this._missingMatchupWarningLogged = false // Flag to prevent spamming console
    }

    /**
     * Load and cache CSV data
     * @param {string} csvPath - Path to CSV file
     * @returns {Promise<Array>} Parsed CSV data
     */
    async loadData(csvPath) {
        // Check cache first
        if (this.cache.has(csvPath)) {
            console.log('📊 Loading data from cache:', csvPath)
            this.data = this.cache.get(csvPath)
            this.setupDataProperties(csvPath)
            return this.data
        }

        try {
            console.log('📊 Loading CSV data:', csvPath)
            this.data = await d3.csv(csvPath)

            // Cache the data for future use
            this.cache.set(csvPath, this.data)

            this.setupDataProperties(csvPath)

            console.log('✅ Data loaded successfully:', {
                teams: this.data.length,
                games: this.maxGames,
                columns: this.gameColumns
            })

            return this.data

        } catch (error) {
            console.error('❌ Error loading data:', error)
            throw new Error(`Failed to load data from ${csvPath}: ${error.message}`)
        }
    }

    /**
     * Setup data properties after loading
     * @param {string} csvPath - Path to CSV file
     */
    setupDataProperties(csvPath) {
        if (!this.data) return
        
        // Identify game columns (exclude first Team column and last Total column)
        const allColumns = this.data.columns
        this.gameColumns = allColumns.slice(1, -1)
        this.maxGames = this.gameColumns.length
        
        // Get matchup info from integrated sequences
        const matchupKey = this.extractMatchupFromPath(csvPath)
        this.matchupInfo = MAP_SEQUENCES[matchupKey]
        
        // Pre-calculate scaling values for better performance
        console.log('📊 Setting up data properties and pre-calculating scales...')
        this.preCalculateScales()
        
        console.log('📊 Data properties setup:', {
            matchup: matchupKey,
            gameColumns: this.gameColumns,
            maxGames: this.maxGames,
            dataRows: this.data.length,
            hasScales: !!this.preCalculatedScales
        })
    }

    /**
     * Extract matchup key from CSV path
     * @param {string} csvPath - Path to CSV file
     * @returns {string} Matchup key
     */
    extractMatchupFromPath(csvPath) {
        const filename = csvPath.split('/').pop().split('.')[0]
        return filename.replace('_points', '')
    }

    /**
     * Process data for chart rendering
     * @param {number} currentGameIndex - Current game to display up to (0 = initial state)
     * @returns {Array} Processed data for chart
     */
    processData(currentGameIndex = 0) {
        if (!this.data || !this.gameColumns) return []

        // Handle initial state (Game 0) - show all teams with 0 points
        if (currentGameIndex === 0) {
            return this.getAllTeamsData()
        }

        // Ensure currentGameIndex is within valid bounds (1 to maxGames)
        currentGameIndex = Math.max(1, Math.min(currentGameIndex, this.maxGames))

        const processedData = this.data.map(d => {
            const teamData = {
                team: d.Team,
                games: [],
                cumulativeScore: 0
            }

            // Determine which games to include
            let gamesToInclude
            if (this.isFiltered && this.filteredGameIndices.length > 0) {
                gamesToInclude = this.filteredGameIndices.slice().sort((a, b) => a - b)
            } else {
                gamesToInclude = Array.from({length: currentGameIndex}, (_, i) => i + 1)
            }

            // Build game-by-game data with colors based on original game numbers
            gamesToInclude.forEach(originalGameNum => {
                const gameCol = this.gameColumns[originalGameNum - 1]
                const gamePoints = +d[gameCol] || 0
                const mapForGame = this.getMapForGame(originalGameNum)
                const gameColor = this.getMapColor(mapForGame, originalGameNum)

                teamData.games.push({
                    gameNumber: originalGameNum,
                    points: gamePoints,
                    color: gameColor,
                    map: mapForGame,
                    startX: teamData.cumulativeScore
                })

                teamData.cumulativeScore += gamePoints
            })

            return teamData
        })

        // Sort by cumulative score (or alphabetically for initial state)
        if (currentGameIndex === 0) {
            processedData.sort((a, b) => a.team.localeCompare(b.team))
        } else {
            processedData.sort((a, b) => b.cumulativeScore - a.cumulativeScore)
        }

        return processedData
    }

    /**
     * Apply game filter
     * @param {Array<number>} selectedGames - Array of game numbers to show
     */
    filterByGames(selectedGames) {
        if (!selectedGames || selectedGames.length === 0) {
            this.clearGameFilter()
            return
        }

        this.selectedGames = selectedGames
        this.isFiltered = true
        this.filteredGameIndices = selectedGames.slice()

        console.log('📊 Applied game filter:', selectedGames)
    }

    /**
     * Clear game filter
     */
    clearGameFilter() {
        this.selectedGames = []
        this.isFiltered = false
        this.filteredGameIndices = []

        console.log('📊 Cleared game filter')
    }

    /**
     * Get map name for a specific game
     * @param {number} gameNumber - Game number
     * @returns {string} Map name
     */
    getMapForGame(gameNumber) {
        if (!this.matchupInfo || !this.matchupInfo.maps) {
            // Only log warning once per session to avoid spam
            if (!this._missingMatchupWarningLogged) {
                console.warn('📊 DataManager: Matchup info not yet loaded, using fallback map data')
                this._missingMatchupWarningLogged = true
            }
            return 'Loading...'
        }

        // Handle initial state (game 0)
        if (gameNumber === 0) {
            return 'Pre-Game'
        }

        return this.matchupInfo.maps[gameNumber] || 'Unknown'
    }

    /**
     * Get color for a map based on occurrence
     * @param {string} mapName - Map name
     * @param {number} gameNumber - Game number for occurrence calculation
     * @returns {string} CSS color string
     */
    getMapColor(mapName, gameNumber = null) {
        if (!mapName || mapName === 'Unknown') {
            return '#6b7280' // Gray for unknown maps
        }

        // Handle pre-game state
        if (mapName === 'Pre-Game') {
            return '#8b5cf6' // Purple for pre-game state
        }

        // Use occurrence-based coloring if gameNumber is provided
        if (gameNumber !== null && this.matchupInfo) {
            return this.getMapColorByOccurrence(mapName, gameNumber)
        }

        // Default map colors (using new HSL scheme - first occurrence)
        const mapColors = {
            'E-DISTRICT': 'hsl(198, 40%, 50%)',     // Blue
            'STORM POINT': 'hsl(28, 40%, 50%)',     // Orange
            'WORLD\'S EDGE': 'hsl(350, 40%, 50%)'   // Red
        }

        return mapColors[mapName] || '#6b7280'
    }

    /**
     * Get color for a map based on its occurrence in the sequence
     * @param {string} mapName - Map name
     * @param {number} gameNumber - Game number
     * @returns {string} CSS color string
     */
    getMapColorByOccurrence(mapName, gameNumber) {
        if (!this.matchupInfo || !this.matchupInfo.maps) {
            return this.getMapColor(mapName)
        }

        // Count occurrences of this map up to the current game
        let occurrenceCount = 0
        for (let i = 1; i <= gameNumber; i++) {
            if (this.matchupInfo.maps[i] === mapName) {
                occurrenceCount++
            }
        }

        // New HSL color scheme based on occurrence
        const hslColorVariations = {
            'E-DISTRICT': [
                'hsl(198, 40%, 50%)',   // 1st occurrence
                'hsl(198, 50%, 50%)',   // 2nd occurrence
                'hsl(198, 60%, 50%)'    // 3rd+ occurrence
            ],
            'STORM POINT': [
                'hsl(28, 40%, 50%)',    // 1st occurrence
                'hsl(28, 50%, 50%)',    // 2nd occurrence
                'hsl(28, 60%, 50%)'     // 3rd+ occurrence
            ],
            'WORLD\'S EDGE': [
                'hsl(350, 40%, 50%)',   // 1st occurrence
                'hsl(350, 50%, 50%)',   // 2nd occurrence
                'hsl(350, 60%, 50%)'    // 3rd+ occurrence
            ]
        }

        const variations = hslColorVariations[mapName]
        if (!variations) {
            return '#6b7280' // Gray fallback
        }

        // Return color based on occurrence (1st, 2nd, 3rd+ occurrence)
        const colorIndex = Math.min(occurrenceCount - 1, variations.length - 1)
        return variations[colorIndex]
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
            cacheSize: this.cache.size
        }
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
        // Keep cache for performance

        console.log('📊 DataManager reset')
    }

    /**
     * Get all teams data for initial state
     * @returns {Array} Team data with zero scores
     */
    getAllTeamsData() {
        if (!this.data) return []

        return this.data.map(d => ({
            team: d.Team,
            games: [],
            cumulativeScore: 0
        }))
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

            // Sum up scores for all games up to this point
            for (let i = 1; i <= gameIndex; i++) {
                const gameCol = this.gameColumns[i - 1]
                const gamePoints = parseInt(d[gameCol]) || 0
                cumulativeScore += gamePoints
            }

            maxScore = Math.max(maxScore, cumulativeScore)
        })

        // Apply user's exact scaling rules:
        // - If max ≤ 50: round up to nearest 5
        // - If max > 50: round up to nearest 10
        if (maxScore === 0) {
            return 5  // Minimum scale when no scores yet
        }

        if (maxScore <= 50) {
            // Round up to nearest 5
            return Math.ceil(maxScore / 5) * 5
        } else {
            // Round up to nearest 10
            return Math.ceil(maxScore / 10) * 10
        }
    }

    /**
     * Pre-calculate all scaling values for better performance
     */
    preCalculateScales() {
        if (!this.data || !this.gameColumns) return

        console.log('📊 Pre-calculating scaling values for all game indices...')

        this.preCalculatedScales = {}

        // Calculate for initial state (game 0)
        this.preCalculatedScales[0] = 12

        // Calculate for all game indices
        for (let gameIndex = 1; gameIndex <= this.maxGames; gameIndex++) {
            this.preCalculatedScales[gameIndex] = this.calculateMaxScoreAtGame(gameIndex)
        }

        // Always show pre-calculated scales for verification
        console.log('📊 Pre-calculated scales:', this.preCalculatedScales)
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear()
        console.log('📊 DataManager cache cleared')
    }
} 