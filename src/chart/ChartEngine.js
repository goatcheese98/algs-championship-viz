/**
 * ChartEngine - Modern, Modular Chart Management System
 * Refactored from 1,288 lines into clean, maintainable architecture
 * 
 * Key Features:
 * - Modular design with separate concerns
 * - Memory-efficient rendering
 * - Automatic cleanup and garbage collection
 * - Optimized for performance
 * - Type-safe operations
 */

import { ChartRenderer } from './ChartRenderer.js'
import { DataManager } from './DataManager.js'

// Ensure D3 is available globally
const d3 = window.d3
if (!d3) {
    throw new Error('D3.js is not available. Please ensure d3.v7.min.js is loaded.')
}

export class ChartEngine {
    constructor(containerId, options = {}) {
        this.containerId = containerId
        this.container = null
        this.initialized = false
        
        // Configuration with defaults
        this.config = {
            margin: { top: 50, right: 80, bottom: 60, left: 280 },
            transitionDuration: 2500,  // Slower animation for better UX
            autoResize: true,
            enableAnimation: true,
            debugMode: false,
            ...options
        }
        
        // Extract teamConfig from options
        this.teamConfig = options.teamConfig || null
        
        // Core modules
        this.dataManager = new DataManager()
        this.renderer = null
        
        // Chart state
        this.dimensions = { width: 0, height: 0 }
        this.scales = { x: null, y: null }
        this.currentGameIndex = 0  // Start at 0 to show initial state
        this.isPlaying = false
        this.gameStateInterval = null
        this.showInitialState = true  // Flag for initial render state
        
        // Performance monitoring
        this.performance = {
            renderCount: 0,
            lastRenderTime: 0,
            avgRenderTime: 0
        }
        
        // Event handlers (for cleanup)
        this.resizeHandler = null
        this.visibilityHandler = null
        
        this.setupPerformanceMonitoring()
    }
    
    /**
     * Initialize the chart engine
     * @param {string} csvPath - Path to CSV data file
     * @returns {Promise<void>}
     */
    async initialize(csvPath) {
        try {
            const startTime = performance.now()
            
            console.log('🚀 Initializing ChartEngine...')
            
            // Setup container
            this.container = d3.select(`#${this.containerId}`)
            if (this.container.empty()) {
                throw new Error(`Container #${this.containerId} not found`)
            }
            
            // Load data
            await this.dataManager.loadData(csvPath)
            
            // Setup dimensions and scales
            this.calculateDimensions()
            this.setupScales()
            
            // Set initial fallback domains to prevent NaN values
            this.scales.x.domain([0, 100])
            this.scales.y.domain(['Team1', 'Team2']) // Temporary until real data loads
            
            // Initialize renderer
            this.renderer = new ChartRenderer(this.container, this.config.margin, this.scales, this.teamConfig)
            
            // Setup event listeners
            this.setupEventListeners()
            
            // Initial render - show initial state
            await this.renderInitialState()
            
            this.initialized = true
            
            const initTime = performance.now() - startTime
            console.log(`✅ ChartEngine initialized in ${initTime.toFixed(2)}ms`)
            
        } catch (error) {
            console.error('❌ ChartEngine initialization failed:', error)
            throw error
        }
    }
    
    /**
     * Render the initial state with team names and play prompt
     * @returns {Promise<void>}
     */
    async renderInitialState() {
        console.log('🎬 Rendering initial state...')
        
        try {
            // Get all teams for initial display
            const allData = this.dataManager.getAllTeamsData()
            
            if (allData.length === 0) {
                console.warn('⚠️ No team data for initial state')
                return
            }
            
            // Update renderer dimensions
            this.renderer.updateDimensions(this.dimensions.width, this.dimensions.height)
            
            // Set up scales for initial state (show team names with zero scores)
            const maxPossibleScore = this.dataManager.getMaxPossibleScore() || 100
            this.scales.x.domain([0, maxPossibleScore])
            this.scales.y.domain(allData.map(d => d.team))
            
            // Update scales to renderer
            this.renderer.xScale = this.scales.x
            this.renderer.yScale = this.scales.y
            
            // Render initial team layout (just names and axes, no bars)
            this.renderer.renderInitialTeamLayout(allData, {
                transitionDuration: this.config.transitionDuration
            })
            
            console.log('✅ Initial state rendered')
            
        } catch (error) {
            console.error('❌ Initial state render failed:', error)
            // Fallback to regular render
            this.currentGameIndex = 1
            await this.render()
        }
    }

    /**
     * Render the chart
     * @returns {Promise<void>}
     */
    async render() {
        if (!this.initialized) {
            console.warn('⚠️ ChartEngine not initialized')
            return
        }
        
        const startTime = performance.now()
        
        try {
            // Process data
            const processedData = this.dataManager.processData(this.currentGameIndex)
            
            if (processedData.length === 0) {
                console.warn('⚠️ No data to render')
                return
            }
            
            // Update renderer dimensions first (sets scale ranges)
            this.renderer.updateDimensions(this.dimensions.width, this.dimensions.height)
            
            // Then update scales domain (after ranges are set)
            this.updateScales(processedData)
            
            // Render chart elements
            this.renderer.renderStackedBars(processedData, {
                transitionDuration: this.config.transitionDuration,
                currentGameIndex: this.currentGameIndex,
                isFiltered: this.dataManager.isFiltered,
                filteredGameIndices: this.dataManager.filteredGameIndices
            })
            
            // Update axes with synchronized timing
            this.renderer.updateAxes(processedData, this.config.transitionDuration)
            
            // Track performance
            this.trackRenderPerformance(startTime)
            
        } catch (error) {
            console.error('❌ Render failed:', error)
            throw error
        }
    }
    
    /**
     * Play animation through games
     * @param {number} startGame - Starting game number
     * @param {number} endGame - Ending game number
     * @param {number} speed - Animation speed (ms between frames)
     * @returns {Promise<void>}
     */
    async playAnimation(startGame = 1, endGame = null, speed = 1000) {
        if (this.isPlaying) {
            console.warn('⚠️ Animation already playing')
            return
        }
        
        const maxGames = this.dataManager.maxGames
        endGame = endGame || maxGames
        
        // Validate parameters
        startGame = Math.max(1, Math.min(startGame, maxGames))
        endGame = Math.max(startGame, Math.min(endGame, maxGames))
        
        console.log(`🎬 Playing animation: Games ${startGame} to ${endGame}`)
        
        // Remove initial state when starting animation
        if (this.showInitialState) {
            this.showInitialState = false
        }
        
        this.isPlaying = true
        this.currentGameIndex = startGame - 1  // Start one before, will increment before first render
        
        return new Promise((resolve) => {
            this.gameStateInterval = setInterval(async () => {
                // CRITICAL FIX: Increment BEFORE render to keep sync correct
                this.currentGameIndex++
                
                // Check if animation should end
                if (this.currentGameIndex > endGame) {
                    this.stopAnimation()
                    
                    // Ensure currentGameIndex stays at maxGames for proper map display
                    this.currentGameIndex = endGame
                    
                    // Trigger celebratory animation if we reached the maximum games
                    if (endGame === maxGames) {
                        this.triggerCelebratoryAnimation()
                    }
                    
                    resolve()
                    return
                }
                
                // Render the current game (sync is now correct)
                await this.render()
                
                console.log(`🎮 Rendered game ${this.currentGameIndex}, Vue slider will show ${this.currentGameIndex}`)
                
            }, speed)
        })
    }
    
    /**
     * Stop animation
     */
    stopAnimation() {
        if (this.gameStateInterval) {
            clearInterval(this.gameStateInterval)
            this.gameStateInterval = null
        }
        this.isPlaying = false
        console.log('⏹️ Animation stopped')
    }
    
    /**
     * Jump to specific game
     * @param {number} gameNumber - Game number to jump to
     */
    async jumpToGame(gameNumber) {
        const maxGames = this.dataManager.maxGames
        
        // Allow game 0 for initial state, otherwise clamp to valid range
        if (gameNumber === 0) {
            this.currentGameIndex = 0
            this.showInitialState = true
            await this.renderInitialState()
            console.log('🎯 Jumped to initial state (game 0)')
            return
        }
        
        gameNumber = Math.max(1, Math.min(gameNumber, maxGames))
        
        // Exit initial state when jumping to a game
        if (this.showInitialState) {
            this.showInitialState = false
        }
        
        this.currentGameIndex = gameNumber
        await this.render()
        
        console.log(`🎯 Jumped to game ${gameNumber}`)
    }
    
    /**
     * Add maxGames getter for compatibility
     */
    get maxGames() {
        return this.dataManager ? this.dataManager.maxGames : 0
    }
    
    /**
     * Get current game index for Vue component synchronization
     */
    getCurrentGameIndex() {
        return this.currentGameIndex
    }
    
    /**
     * Set game index from external control (Vue component)
     * @param {number} gameIndex - Game index to set
     */
    setCurrentGameIndex(gameIndex) {
        this.currentGameIndex = gameIndex
    }
    
    /**
     * Apply game filter
     * @param {Array<number>} selectedGames - Games to show
     */
    async filterByGames(selectedGames) {
        this.dataManager.filterByGames(selectedGames)
        await this.render()
    }
    
    /**
     * Clear game filter
     */
    async clearFilter() {
        this.dataManager.clearGameFilter()
        await this.render()
    }
    
    /**
     * Export current data
     * @param {string} matchup - Matchup identifier
     * @returns {string} CSV content
     */
    exportData(matchup) {
        return this.dataManager.exportData(matchup)
    }
    
    /**
     * Get current state
     * @returns {Object} Current state
     */
    getState() {
        return {
            initialized: this.initialized,
            isPlaying: this.isPlaying,
            currentGameIndex: this.currentGameIndex,
            dimensions: this.dimensions,
            performance: this.performance,
            data: this.dataManager.getState()
        }
    }
    
    /**
     * Trigger celebratory animation for top 3 teams
     */
    triggerCelebratoryAnimation() {
        if (!this.renderer || !this.dataManager) return
        
        // Get current data (sorted by cumulative score)
        const currentData = this.dataManager.processData(this.currentGameIndex)
        
        if (!currentData || currentData.length < 3) return
        
        // Add delay to ensure final render is complete
        setTimeout(() => {
            console.log('🎉 Starting celebratory animation for tournament completion')
            this.renderer.triggerCelebratoryAnimation(currentData)
        }, 500) // 500ms delay after animation completes
    }
    
    /**
     * Calculate chart dimensions
     */
    calculateDimensions() {
        const containerRect = this.container.node().getBoundingClientRect()
        
        this.dimensions = {
            width: Math.max(800, containerRect.width - this.config.margin.left - this.config.margin.right),
            height: Math.max(600, containerRect.height - this.config.margin.top - this.config.margin.bottom)
        }
        
        if (this.config.debugMode) {
            console.log('📐 Calculated dimensions:', this.dimensions)
        }
    }
    
    /**
     * Setup D3 scales
     */
    setupScales() {
        this.scales.x = d3.scaleLinear()
            .range([0, this.dimensions.width])
            .domain([0, 100])  // Initialize with reasonable domain to prevent 0-1 decimals
        
        this.scales.y = d3.scaleBand()
            .range([0, this.dimensions.height])
            .padding(0.1)
    }
    
    /**
     * Update scales based on data
     * @param {Array} data - Processed data
     */
    updateScales(data) {
        // Update X scale domain with minimum reasonable range
        const maxScore = d3.max(data, d => d.cumulativeScore) || 100
        
        // Ensure minimum scale range to prevent 0-1 decimal display
        const minDomain = Math.max(10, maxScore * 1.1)
        this.scales.x.domain([0, minDomain])
        
        // Update Y scale domain
        this.scales.y.domain(data.map(d => d.team))
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.config.autoResize) {
            this.resizeHandler = this.debounce(() => {
                this.calculateDimensions()
                this.setupScales()
                this.render()
            }, 300)
            
            window.addEventListener('resize', this.resizeHandler)
        }
        
        // Pause animations when page is hidden
        this.visibilityHandler = () => {
            if (document.hidden && this.isPlaying) {
                this.stopAnimation()
            }
        }
        
        document.addEventListener('visibilitychange', this.visibilityHandler)
    }
    
    /**
     * Setup performance monitoring
     */
    setupPerformanceMonitoring() {
        if (this.config.debugMode) {
            // Log performance metrics every 10 renders
            setInterval(() => {
                if (this.performance.renderCount > 0) {
                    console.log('📊 Performance:', {
                        renders: this.performance.renderCount,
                        avgRenderTime: this.performance.avgRenderTime.toFixed(2) + 'ms',
                        lastRenderTime: this.performance.lastRenderTime.toFixed(2) + 'ms'
                    })
                }
            }, 10000)
        }
    }
    
    /**
     * Track render performance
     * @param {number} startTime - Start time in milliseconds
     */
    trackRenderPerformance(startTime) {
        const renderTime = performance.now() - startTime
        this.performance.renderCount++
        this.performance.lastRenderTime = renderTime
        this.performance.avgRenderTime = (
            (this.performance.avgRenderTime * (this.performance.renderCount - 1) + renderTime) / 
            this.performance.renderCount
        )
    }
    
    /**
     * Debounce utility function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} Debounced function
     */
    debounce(func, wait) {
        let timeout
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout)
                func(...args)
            }
            clearTimeout(timeout)
            timeout = setTimeout(later, wait)
        }
    }
    
    /**
     * Cleanup resources
     */
    cleanup() {
        console.log('🧹 Cleaning up ChartEngine...')
        
        // Stop animations
        this.stopAnimation()
        
        // Remove event listeners
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler)
        }
        
        if (this.visibilityHandler) {
            document.removeEventListener('visibilitychange', this.visibilityHandler)
        }
        
        // Cleanup renderer
        if (this.renderer) {
            this.renderer.cleanup()
        }
        
        // Reset data manager
        this.dataManager.reset()
        
        // Reset state
        this.initialized = false
        this.isPlaying = false
        this.currentGameIndex = 1
        
        console.log('✅ ChartEngine cleanup complete')
    }
}

// Export for global access (backward compatibility)
window.ChartEngine = ChartEngine 