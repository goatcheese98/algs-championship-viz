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
            
            // Set initial game index to 0 for proper initial state scaling
            this.currentGameIndex = 0
            console.log('🔍 ChartEngine currentGameIndex set to:', this.currentGameIndex)
            
            // Setup dimensions and scales
            this.calculateDimensions()
            this.setupScales()
            
            // DEBUG: Check initial scale domain after setupScales
            console.log('🔍 ChartEngine after setupScales - xScale domain:', this.scales.x.domain())
            
            // Setup renderer
            this.renderer = new ChartRenderer(this.container, this.config.margin, this.scales, this.teamConfig)
            
            // Setup event listeners
            this.setupEventListeners()
            
            // Render initial state
            await this.renderInitialState()
            
            this.initialized = true
            
            const endTime = performance.now()
            console.log(`✅ ChartEngine initialized in ${(endTime - startTime).toFixed(2)}ms`)
            
        } catch (error) {
            console.error('❌ ChartEngine initialization error:', error)
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
            
            // Set up scales for initial state using dynamic scaling
            const initialMax = this.dataManager.getMaxScoreAtGame(0)  // Game 0 = initial state
            console.log('📊 Initial state scaling - getMaxScoreAtGame(0):', initialMax)
            
            // Update scales with dynamic domain
            this.scales.x.domain([0, initialMax])
            this.scales.y.domain(allData.map(d => d.team))
            
            // Update scales to renderer (critical for proper axis rendering)
            this.renderer.xScale = this.scales.x
            this.renderer.yScale = this.scales.y
            
            console.log('📊 Initial state final x-axis domain:', this.scales.x.domain())
            
            // CRITICAL: Call updateAxes to properly render the x-axis with correct domain
            this.renderer.updateAxes(allData, 0)  // No transition for initial state
            
            // Render initial team layout
            await this.renderer.renderInitialTeamLayout(allData)
            
            console.log('✅ Initial state rendered with dynamic scaling')
            
        } catch (error) {
            console.error('❌ Error rendering initial state:', error)
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
            
            // Update scales with dynamic scaling based on current game progress
            this.updateScales(processedData)
            
            // DEBUG: Check scale domain after updateScales
            console.log('🔍 ChartEngine after updateScales - xScale domain:', this.scales.x.domain())
            
            // CRITICAL: Update renderer scale references so it uses the dynamic scaling
            this.renderer.xScale = this.scales.x
            this.renderer.yScale = this.scales.y
            console.log('🔍 ChartEngine updated renderer scale references')
            
            // Render the chart
            this.renderer.renderStackedBars(processedData, {
                transitionDuration: this.config.transitionDuration,
                currentGameIndex: this.currentGameIndex,
                isFiltered: this.dataManager.isFiltered,
                filteredGameIndices: this.dataManager.filteredGameIndices
            })
            
            // Update axes with the dynamic scaling
            this.renderer.updateAxes(processedData, this.config.transitionDuration)
            
            const endTime = performance.now()
            console.log(`✅ Chart rendered in ${(endTime - startTime).toFixed(2)}ms`)
            
        } catch (error) {
            console.error('❌ Chart rendering error:', error)
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
     * Calculate chart dimensions with responsive behavior
     */
    calculateDimensions() {
        const containerRect = this.container.node().getBoundingClientRect()
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight
        const isMobile = windowWidth <= 768
        
        // Responsive margin adjustments
        let adjustedMargins = { ...this.config.margin }
        
        // Mobile-specific dimensions and margins
        if (isMobile) {
            // Use actual container width instead of window width for accurate calculations
            const containerWidth = containerRect.width || windowWidth
            const containerHeight = containerRect.height || windowHeight
            
            // Calculate safe mobile dimensions to prevent overflow
            // Leave adequate margins for mobile display
            const safeWidth = containerWidth - 40  // Reduced margin for tighter fit
            const safeHeight = Math.min(600, containerHeight * 0.55)
            
            // Ensure chart width never exceeds container bounds with proper safety margin
            this.dimensions = {
                width: Math.max(280, Math.min(safeWidth, containerWidth - 80)),  // Min 280px, max container-80px
                height: Math.max(480, safeHeight)
            }
            
            // Mobile margins - optimized for mobile without team names
            adjustedMargins.left = 60   // Fixed smaller left margin
            adjustedMargins.right = 30  // Fixed smaller right margin  
            adjustedMargins.top = 25    // Fixed smaller top margin
            adjustedMargins.bottom = 60 // Fixed bottom margin for axis labels
            
            // Additional safety check: ensure total width (chart + margins) doesn't exceed container
            const totalWidth = this.dimensions.width + adjustedMargins.left + adjustedMargins.right
            if (totalWidth > containerWidth) {
                // Reduce chart width to fit within container
                this.dimensions.width = Math.max(200, containerWidth - adjustedMargins.left - adjustedMargins.right - 20)
                console.log('🔧 Adjusted chart width for container fit:', this.dimensions.width)
            }
            
            console.log('📱 Mobile dimensions set:', {
                container: { width: containerWidth, height: containerHeight },
                chart: this.dimensions,
                margins: adjustedMargins,
                totalWidth: this.dimensions.width + adjustedMargins.left + adjustedMargins.right
            })
        } else {
            // Desktop responsive margin adjustments
            // Adjust margins for smaller screens
            if (windowWidth < 1200) {
                adjustedMargins.left = Math.max(200, this.config.margin.left * 0.7)
                adjustedMargins.right = Math.max(50, this.config.margin.right * 0.7)
            }
            
            if (windowWidth < 900) {
                adjustedMargins.left = Math.max(180, this.config.margin.left * 0.6)
                adjustedMargins.right = Math.max(40, this.config.margin.right * 0.6)
                adjustedMargins.top = Math.max(30, this.config.margin.top * 0.8)
                adjustedMargins.bottom = Math.max(50, this.config.margin.bottom * 0.8)
            }
            
            if (windowWidth < 700) {
                adjustedMargins.left = Math.max(150, this.config.margin.left * 0.5)
                adjustedMargins.right = Math.max(30, this.config.margin.right * 0.5)
                adjustedMargins.top = Math.max(25, this.config.margin.top * 0.7)
                adjustedMargins.bottom = Math.max(45, this.config.margin.bottom * 0.9)
            }
            
            // Calculate responsive dimensions for desktop
            const availableWidth = containerRect.width - adjustedMargins.left - adjustedMargins.right
            const availableHeight = containerRect.height - adjustedMargins.top - adjustedMargins.bottom
            
            // Set responsive minimums that scale with screen size
            const minWidth = Math.min(600, windowWidth * 0.6)
            const minHeight = Math.min(400, windowHeight * 0.4)
            
            this.dimensions = {
                width: Math.max(minWidth, availableWidth),
                height: Math.max(minHeight, availableHeight)
            }
            
            // Ensure dimensions don't exceed container bounds
            this.dimensions.width = Math.min(this.dimensions.width, containerRect.width - adjustedMargins.left - adjustedMargins.right)
            this.dimensions.height = Math.min(this.dimensions.height, containerRect.height - adjustedMargins.top - adjustedMargins.bottom)
        }
        
        // Update the config margins for renderer
        this.config.margin = adjustedMargins
        
        // Update renderer margins if it exists
        if (this.renderer) {
            this.renderer.margin = adjustedMargins
        }
        
        if (this.config.debugMode) {
            console.log('📐 Responsive dimensions:', {
                window: { width: windowWidth, height: windowHeight },
                container: { width: containerRect.width, height: containerRect.height },
                margins: adjustedMargins,
                chart: this.dimensions,
                isMobile: isMobile
            })
        }
    }
    
    /**
     * Setup D3 scales
     */
    setupScales() {
        // Get dynamic max for current game index
        const dynamicMax = this.dataManager ? this.dataManager.getMaxScoreAtGame(this.currentGameIndex) : 100
        console.log('🔍 ChartEngine setupScales - currentGameIndex:', this.currentGameIndex)
        console.log('🔍 ChartEngine setupScales - dynamicMax:', dynamicMax)
        
        this.scales.x = d3.scaleLinear()
            .range([0, this.dimensions.width])
            .domain([0, dynamicMax])  // Use dynamic scaling instead of hardcoded [0, 100]
        
        this.scales.y = d3.scaleBand()
            .range([0, this.dimensions.height])
            .padding(0.1)
            
        console.log('🔍 ChartEngine setupScales - final xScale domain:', this.scales.x.domain())
    }
    
    /**
     * Update scales based on data
     * @param {Array} data - Processed data
     */
    updateScales(data) {
        // Use dynamic scaling based on current game progress
        // Get maximum score at current game index for responsive scaling
        const dynamicMax = this.dataManager.getMaxScoreAtGame(this.currentGameIndex)
        
        console.log('🔍 ChartEngine updateScales - currentGameIndex:', this.currentGameIndex)
        console.log('🔍 ChartEngine updateScales - dynamicMax:', dynamicMax)
        console.log('🔍 ChartEngine updateScales - current xScale domain before update:', this.scales.x.domain())
        
        // Update X scale domain with dynamic maximum
        this.scales.x.domain([0, dynamicMax])
        
        console.log('🔍 ChartEngine updateScales - xScale domain after update:', this.scales.x.domain())
        
        // Update Y scale domain
        this.scales.y.domain(data.map(d => d.team))
        
        console.log('🔍 ChartEngine updateScales - yScale domain:', this.scales.y.domain())
    }
    
    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.config.autoResize) {
            this.resizeHandler = this.debounce(() => {
                console.log('🔄 Window resize detected, updating chart dimensions')
                
                // Recalculate responsive dimensions
                this.calculateDimensions()
                
                // Update renderer dimensions with new margins
                if (this.renderer) {
                    this.renderer.updateDimensions(this.dimensions.width, this.dimensions.height)
                }
                
                // Update scales with new dimensions
                this.setupScales()
                
                // Re-render current state properly
                if (this.showInitialState) {
                    this.renderInitialState()
                } else {
                    this.render()
                }
            }, 200)
            
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