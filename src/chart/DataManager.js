/**
 * DataManager - Handles all data loading, processing, and filtering operations
 * Extracted from ChartEngine.js for better modularity and performance
 */

// Ensure D3 is available
const d3 = window.d3
if (!d3) {
    throw new Error('D3.js is not available. Please ensure d3.v7.min.js is loaded.')
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
        
        // Get matchup info
        const matchupKey = this.extractMatchupFromPath(csvPath)
        this.matchupInfo = window.MapSequenceUtils?.getSequence(matchupKey)
        
        console.log('📊 Data properties setup:', {
            matchup: matchupKey,
            gameColumns: this.gameColumns.length,
            maxGames: this.maxGames
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
            console.warn('No matchup info available for map lookup')
            return 'Unknown'
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
        if (gameNumber !== null && this.matchupInfo && this.matchupInfo.maps) {
            return this.getMapColorByOccurrence(mapName, gameNumber)
        }
        
        // Fallback to default colors
        const mapColors = {
            'E-DISTRICT': 'hsl(250, 80%, 60%)',
            'STORM POINT': 'hsl(28, 80%, 60%)', 
            'WORLD\'S EDGE': 'hsl(10, 80%, 60%)',
            'OLYMPUS': 'hsl(15, 80%, 55%)',
            'KING\'S CANYON': 'hsl(120, 80%, 55%)',
            'BROKEN MOON': 'hsl(280, 80%, 60%)'
        }
        return mapColors[mapName] || 'hsl(0, 0%, 50%)'
    }
    
    /**
     * Get map color based on occurrence count
     * @param {string} mapName - Map name
     * @param {number} gameNumber - Game number
     * @returns {string} HSL color string
     */
    getMapColorByOccurrence(mapName, gameNumber) {
        // Count occurrences up to this game
        let occurrenceCount = 0
        for (let i = 1; i <= gameNumber; i++) {
            if (this.matchupInfo.maps[i] === mapName) {
                occurrenceCount++
            }
        }
        
        // HSL coloring system based on occurrence
        const colorSchemes = {
            'STORM POINT': {
                1: 'hsl(28, 100%, 60%)',
                2: 'hsl(28, 100%, 70%)',
                3: 'hsl(28, 100%, 80%)'
            },
            'WORLD\'S EDGE': {
                1: 'hsl(10, 100%, 60%)',
                2: 'hsl(10, 100%, 70%)',
                3: 'hsl(10, 100%, 80%)'
            },
            'E-DISTRICT': {
                1: 'hsl(250, 100%, 60%)',
                2: 'hsl(250, 100%, 70%)',
                3: 'hsl(250, 100%, 80%)'
            }
        }
        
        const scheme = colorSchemes[mapName]
        if (scheme && scheme[occurrenceCount]) {
            return scheme[occurrenceCount]
        }
        
        if (scheme && scheme[1]) {
            return scheme[1]
        }
        
        return '#666666'
    }
    
    /**
     * Export data as CSV
     * @param {string} matchup - Matchup identifier
     * @returns {string} CSV content
     */
    exportData(matchup) {
        if (!this.data) {
            console.warn('📊 No data to export')
            return ''
        }
        
        try {
            const csvContent = d3.csvFormat(this.data)
            
            // Trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            const url = URL.createObjectURL(blob)
            
            link.setAttribute('href', url)
            link.setAttribute('download', `${matchup}_exported_data.csv`)
            link.style.visibility = 'hidden'
            
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            
            URL.revokeObjectURL(url)
            
            console.log('📊 Data exported for:', matchup)
            return csvContent
            
        } catch (error) {
            console.error('❌ Export failed:', error)
            throw new Error(`Failed to export data: ${error.message}`)
        }
    }
    
    /**
     * Get current data state
     * @returns {Object} Current data state
     */
    getState() {
        return {
            hasData: !!this.data,
            teamCount: this.data?.length || 0,
            maxGames: this.maxGames,
            gameColumns: this.gameColumns,
            isFiltered: this.isFiltered,
            filteredGames: this.filteredGameIndices,
            matchupInfo: this.matchupInfo,
            cacheSize: this.cache.size
        }
    }
    
    /**
     * Clear cache and reset state
     */
    reset() {
        this.data = null
        this.gameColumns = []
        this.maxGames = 0
        this.matchupInfo = null
        this.isFiltered = false
        this.filteredGameIndices = []
        
        console.log('📊 DataManager reset')
    }
    
    /**
     * Get all teams data for initial state display
     * @returns {Array} All teams with zero scores in final ranking order
     */
    getAllTeamsData() {
        if (!this.data) return []
        
        // Calculate final scores for each team to determine proper ranking order
        const teamsWithFinalScores = this.data.map(d => {
            const finalScore = this.gameColumns.reduce((sum, col) => sum + (+d[col] || 0), 0)
            return {
                team: d.Team,
                finalScore: finalScore,
                games: [],
                cumulativeScore: 0
            }
        })
        
        // Sort by final scores (highest to lowest) to maintain proper team order
        teamsWithFinalScores.sort((a, b) => b.finalScore - a.finalScore)
        
        // Return teams in final ranking order but with 0 cumulative scores for initial state
        return teamsWithFinalScores.map(d => ({
            team: d.team,
            games: [],
            cumulativeScore: 0
        }))
    }
    
    /**
     * Get maximum possible score across all games
     * @returns {number} Maximum possible score
     */
    getMaxPossibleScore() {
        if (!this.data || !this.gameColumns) return 100
        
        let maxScore = 0
        this.data.forEach(team => {
            let totalScore = 0
            this.gameColumns.forEach(gameCol => {
                totalScore += +team[gameCol] || 0
            })
            maxScore = Math.max(maxScore, totalScore)
        })
        
        return maxScore || 100
    }


    

    
    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear()
        console.log('📊 Data cache cleared')
    }
} 