/**
 * Centralized Chart Engine for ALGS Championship Visualizations
 * This module provides a unified interface for creating various chart types
 * with consistent styling and behavior across the application.
 */

// Centralized Chart Manager for consistent deployment
class ChartManager {
    constructor() {
        this.instances = new Map();
        this.initializationPromises = new Map();
        this.retryAttempts = new Map();
        this.maxRetries = 3;
        this.retryDelay = 500;
    }

    async ensureChartEngine(containerId, options = {}) {
        // Return existing instance if available and valid
        if (this.instances.has(containerId)) {
            const instance = this.instances.get(containerId);
            if (this.isValidInstance(instance, containerId)) {
                console.log('📊 Reusing existing ChartEngine for:', containerId);
                return instance;
            } else {
                console.log('♻️ Cleaning up invalid ChartEngine for:', containerId);
                this.cleanup(containerId);
            }
        }

        // Return pending initialization promise if one exists
        if (this.initializationPromises.has(containerId)) {
            console.log('⏳ Waiting for pending ChartEngine initialization:', containerId);
            return await this.initializationPromises.get(containerId);
        }

        // Create new initialization promise
        const initPromise = this.initializeWithRetry(containerId, options);
        this.initializationPromises.set(containerId, initPromise);

        try {
            const instance = await initPromise;
            this.instances.set(containerId, instance);
            return instance;
        } finally {
            this.initializationPromises.delete(containerId);
        }
    }

    async initializeWithRetry(containerId, options) {
        const attempts = this.retryAttempts.get(containerId) || 0;

        try {
            // Wait for container to be available
            await this.waitForContainer(containerId);
            
            console.log(`🔧 Creating ChartEngine for: ${containerId} (attempt ${attempts + 1})`);
            const instance = new ChartEngine(containerId, options);
            
            // Validate the instance was created successfully
            if (!this.isValidInstance(instance, containerId)) {
                throw new Error('ChartEngine initialization failed - invalid instance created');
            }

            // Reset retry counter on success
            this.retryAttempts.delete(containerId);
            console.log('✅ ChartEngine created successfully for:', containerId);
            return instance;

        } catch (error) {
            console.error(`❌ ChartEngine initialization failed for ${containerId}:`, error);
            
            if (attempts < this.maxRetries) {
                this.retryAttempts.set(containerId, attempts + 1);
                console.log(`🔄 Retrying in ${this.retryDelay}ms... (${attempts + 1}/${this.maxRetries})`);
                
                await this.delay(this.retryDelay);
                return this.initializeWithRetry(containerId, options);
            } else {
                this.retryAttempts.delete(containerId);
                throw new Error(`Failed to initialize ChartEngine after ${this.maxRetries} attempts: ${error.message}`);
            }
        }
    }

    async waitForContainer(containerId, maxWait = 5000) {
        const startTime = Date.now();
        
        return new Promise((resolve, reject) => {
            const checkContainer = () => {
                const container = document.getElementById(containerId);
                
                if (container && container.offsetParent !== null) {
                    console.log('📦 Container ready:', containerId, container.offsetWidth + 'x' + container.offsetHeight);
                    resolve(container);
                    return;
                }

                if (Date.now() - startTime > maxWait) {
                    reject(new Error(`Container ${containerId} not available after ${maxWait}ms`));
                    return;
                }

                // Use requestAnimationFrame for better timing
                requestAnimationFrame(checkContainer);
            };

            checkContainer();
        });
    }

    isValidInstance(instance, containerId) {
        if (!instance) return false;
        if (!instance.container) return false;
        if (instance.container.empty()) return false;
        
        // Check if the DOM container still exists
        const domContainer = document.getElementById(containerId);
        if (!domContainer) return false;
        
        return true;
    }

    cleanup(containerId) {
        const instance = this.instances.get(containerId);
        if (instance) {
            // Clean up any timers
            if (instance.animationTimer) {
                clearTimeout(instance.animationTimer);
            }
            if (instance.resizeHandler) {
                window.removeEventListener('resize', instance.resizeHandler);
            }
            this.instances.delete(containerId);
        }
        this.retryAttempts.delete(containerId);
        this.initializationPromises.delete(containerId);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get existing instance without creating new one
    getInstance(containerId) {
        return this.instances.get(containerId);
    }

    // Force refresh of instance
    async refreshInstance(containerId, options = {}) {
        this.cleanup(containerId);
        return await this.ensureChartEngine(containerId, options);
    }
}

// Global chart manager instance
const chartManager = new ChartManager();

class ChartEngine {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = containerId ? d3.select(`#${containerId}`) : null;
        this.data = null;
        this.currentGameIndex = 1;
        this.isPlaying = false;
        this.animationTimer = null;
        this.initializationError = null;
        
        // Check for external controls early (before any setup)
        this.hasExternalControls = document.getElementById('matchup-select') !== null;
        console.log('External controls detected:', this.hasExternalControls);
        
        // Configuration
        this.config = {
            transitionDuration: 1500,
            holdDuration: 800,
            shineDuration: 400,
            ...options
        };
        
        // Initialize with better error handling
        try {
            this.initializeChart();
        } catch (error) {
            this.initializationError = error;
            console.error('ChartEngine initialization failed:', error);
            throw error;
        }
    }

    initializeChart() {
        // Get container with multiple fallback strategies
        this.container = this.getContainer();
        
        if (!this.container || this.container.empty()) {
            throw new Error(`Container with ID '${this.containerId}' not found or not ready`);
        }
        
        console.log('📊 Initializing chart for container:', this.containerId);
        
        // Initialize chart only (controls are handled separately)
        this.setupChart();
        
        console.log('✅ Chart initialization complete');
    }

    getContainer() {
        // Try multiple selection strategies
        let container = null;
        
        // Strategy 1: Direct D3 selection
        try {
            container = d3.select(`#${this.containerId}`);
            if (!container.empty()) {
                console.log('📍 Container found via D3 selection');
                return container;
            }
        } catch (e) {
            console.warn('D3 selection failed:', e);
        }

        // Strategy 2: DOM query + D3 wrap
        try {
            const domElement = document.getElementById(this.containerId);
            if (domElement) {
                container = d3.select(domElement);
                console.log('📍 Container found via DOM query');
                return container;
            }
        } catch (e) {
            console.warn('DOM query failed:', e);
        }

        // Strategy 3: Wait and retry (for timing issues)
        console.warn('Container not immediately available, this might cause issues');
        return null;
    }

    setupChart() {
        // Check if container exists
        if (!this.container) {
            console.error('Container not available for chart setup');
            return;
        }
        
        // Clear existing content
        this.container.html('');
        
        // Create simplified single chart container with gaming aesthetic
        this.chartPanel = this.container.append('div')
            .attr('class', 'chart-panel')
            .style('width', '100%')
            .style('height', '100%')
            .style('background', 'linear-gradient(145deg, #000000 0%, #030303 25%, #080808 50%, #030303 75%, #000000 100%)')
            .style('border-radius', '12px')
            .style('padding', '20px 20px 40px 20px')
            .style('margin', '0')
            .style('box-shadow', '0 0 30px rgba(220, 38, 38, 0.4), 0 20px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(220, 38, 38, 0.3)')
            .style('border', '3px solid #dc2626')
            .style('position', 'relative')
            .style('overflow', 'visible')
            .style('box-sizing', 'border-box')
            .style('display', 'flex')
            .style('flex-direction', 'column');
        
        // Add gaming-style inner glow
        this.chartPanel.append('div')
            .style('position', 'absolute')
            .style('top', '0')
            .style('left', '0')
            .style('right', '0')
            .style('bottom', '0')
            .style('border-radius', '12px')
            .style('box-shadow', 'inset 0 0 20px rgba(220, 38, 38, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.9)')
            .style('pointer-events', 'none');
        
        // Setup SVG directly in chart panel
        this.svg = this.chartPanel.append('svg')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'block')
            .style('position', 'relative')
            .style('z-index', '1')
            .style('overflow', 'visible');
        
        // Setup dimensions with more space for team labels, logos, and ranking numbers - Extended for longer panel
        this.margin = { top: 30, right: 60, bottom: 100, left: 320 };
        this.updateDimensions();
        
        // Ensure dimensions are valid
        if (this.width <= 0 || this.height <= 0) {
            console.warn('Invalid dimensions detected, using defaults');
            this.width = 600;
            this.height = 400;
        }
        
        // Setup scales with proper ranges
        this.xScale = d3.scaleLinear()
            .range([0, this.width]);
        this.yScale = d3.scaleBand()
            .range([0, this.height])  // Correct range for bars to render properly
            .padding(0.625); // Increased padding for 25% more spacing between bars
        
        // Setup main group
        this.mainGroup = this.svg.append('g')
            .attr('class', 'main-group')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
                // Setup axes
        this.xAxisGroup = this.mainGroup.append('g')
            .attr('class', 'x-axis axis x-axis-large-font')
            .attr('transform', `translate(0,${this.height})`);
            
        this.yAxisGroup = this.mainGroup.append('g')
            .attr('class', 'y-axis');
            
        // Setup custom Y-axis with team logos and larger text
        this.setupCustomYAxis();
        
        // Action panel removed - using integrated GSAP-powered draggable controls
        
        // Apply styles
        this.applyStyles();
        
        // Add resize listener for responsive behavior
        this.setupResizeListener();
    }

    async renderChart(config) {
        try {
            // Validate config
            if (!config || !config.matchup) {
                throw new Error('Invalid configuration: matchup is required');
            }

            // Update configuration
            this.config = { ...this.config, ...config };
            
            // Load the appropriate CSV file from data directory (public/ is served from root in Vite)
            const csvPath = `data/${config.matchup}_points.csv`;
            
            // Load and render the data
            await this.loadData(csvPath);
            
            console.log('Chart rendered successfully for:', config.matchup);
            
        } catch (error) {
            console.error('Error rendering chart:', error);
            this.showError(`Failed to render chart: ${error.message}`);
            throw error;
        }
    }

    exportData(matchup) {
        if (!this.data) {
            console.warn('No data to export');
            return;
        }
        
        // Create CSV content
        const csvContent = d3.csvFormat(this.data);
        
        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${matchup}_exported_data.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Data exported for:', matchup);
    }

    // Game filtering methods for Enhanced Action Panel
    filterByGames(selectedGames) {
        if (!this.data || !selectedGames || selectedGames.length === 0) {
            this.clearGameFilter();
            return;
        }
        
        this.selectedGames = selectedGames;
        this.applyGameFilter();
        console.log('Applied game filter:', selectedGames);
    }

    clearGameFilter() {
        this.selectedGames = [];
        this.isFiltered = false;
        this.filteredGameIndices = [];
        this.updateChart();
        console.log('Cleared game filter');
    }

    applyGameFilter() {
        // Store filter state
        this.isFiltered = this.selectedGames && this.selectedGames.length > 0;
        this.filteredGameIndices = this.selectedGames || [];
        
        // Update chart with filter applied
        this.updateChart();
    }

    // Old action panel removed - now using GSAP-powered draggable enhanced controls
    


    // setupGameNumbers removed - old action panel functionality
    
    // setupDirectControls removed - old action panel functionality
    
    // setupMapInfo removed - old action panel functionality
    
    // setupMapImageArea and setupAdditionalControls removed - old action panel functionality

    applyStyles() {
        // Add CSS for ALGS Apex Esports gaming aesthetic
        const style = document.createElement('style');
        style.textContent = `
            .chart-container {
                font-family: 'Inter', 'Roboto Mono', monospace;
                color: #f1f5f9;
                background: radial-gradient(circle at center, rgba(10, 10, 10, 0.95) 0%, rgba(0, 0, 0, 1) 100%);
            }
            
            .control-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 0 20px rgba(220, 38, 38, 0.6), 0 6px 20px rgba(0, 0, 0, 0.4);
            }
            
            .direct-control:hover {
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 0 25px rgba(220, 38, 38, 0.8), 0 8px 24px rgba(0, 0, 0, 0.5);
            }
            
            .game-slider {
                -webkit-appearance: none;
                appearance: none;
                height: 10px;
                background: linear-gradient(90deg, #000000 0%, #1a0a0a 50%, #000000 100%);
                border-radius: 5px;
                outline: none;
                border: 2px solid #dc2626;
                box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8);
            }
            
            .game-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #dc2626 100%);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 0 15px rgba(220, 38, 38, 0.8), 0 4px 8px rgba(0,0,0,0.6);
                transition: all 0.3s ease;
                border: 3px solid #000000;
            }
            
            .game-slider::-webkit-slider-thumb:hover {
                transform: scale(1.2);
                box-shadow: 0 0 25px rgba(220, 38, 38, 1), 0 6px 12px rgba(0,0,0,0.8);
            }
            
            .game-slider::-moz-range-thumb {
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #dc2626 100%);
                border-radius: 50%;
                cursor: pointer;
                border: 3px solid #000000;
                box-shadow: 0 0 15px rgba(220, 38, 38, 0.8), 0 4px 8px rgba(0,0,0,0.6);
            }
            
            .bar-3d {
                filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.3)) drop-shadow(0 4px 8px rgba(0,0,0,0.6));
                transition: all 0.3s ease;
                stroke: #000000 !important;
                stroke-width: 2px !important;
            }
            
            .bar-3d:hover {
                filter: drop-shadow(0 0 15px rgba(220, 38, 38, 0.6)) drop-shadow(0 6px 12px rgba(0,0,0,0.8));
                transform: translateY(-2px);
            }
            
            .bar-shine {
                filter: brightness(1.3) drop-shadow(0 0 15px rgba(220, 38, 38, 0.8)) drop-shadow(0 4px 8px rgba(0,0,0,0.6));
                stroke: #dc2626 !important;
                stroke-width: 3px !important;
            }
            
            .team-label {
                filter: drop-shadow(0 0 5px rgba(220, 38, 38, 0.3)) drop-shadow(0 1px 2px rgba(0,0,0,0.8));
                transition: all 0.3s ease;
                fill: #f1f5f9 !important;
                font-weight: 700 !important;
                font-family: 'Inter', 'Roboto Mono', monospace !important;
            }
            
            .ranking-number {
                fill: #dc2626 !important;
                font-weight: 900 !important;
                font-family: 'Inter', 'Roboto Mono', monospace !important;
                filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.8)) drop-shadow(0 1px 2px rgba(0,0,0,0.8));
            }
            
            .legend-item {
                transition: all 0.3s ease;
                color: #f1f5f9;
                font-family: 'Inter', 'Roboto Mono', monospace;
                font-weight: 600;
            }
            
            .legend-item:hover {
                transform: translateX(3px);
                color: #dc2626;
                text-shadow: 0 0 5px rgba(220, 38, 38, 0.8);
            }
            
            .map-sequence-item {
                transition: all 0.3s ease;
                border-radius: 6px;
                padding: 8px;
                margin: 4px 0;
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(220, 38, 38, 0.1) 100%);
                color: #f1f5f9;
                border: 1px solid rgba(220, 38, 38, 0.3);
                font-family: 'Inter', 'Roboto Mono', monospace;
                font-weight: 600;
            }
            
            .map-sequence-item:hover {
                background: linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(0, 0, 0, 0.9) 100%);
                transform: translateX(3px);
                border-color: rgba(220, 38, 38, 0.6);
                box-shadow: 0 0 10px rgba(220, 38, 38, 0.4);
            }
            
            .map-sequence-item.current-game {
                background: linear-gradient(135deg, rgba(220, 38, 38, 0.3) 0%, rgba(0, 0, 0, 0.9) 100%);
                border: 2px solid rgba(220, 38, 38, 0.8);
                transform: translateX(5px);
                color: #dc2626;
                box-shadow: 0 0 15px rgba(220, 38, 38, 0.6);
                text-shadow: 0 0 5px rgba(220, 38, 38, 0.8);
            }
            
            /* ALGS Gaming aesthetic for axes - MAXIMUM SPECIFICITY */
            .mini-dashboard .chart-panel .axis text,
            .mini-dashboard .chart-panel g.axis text,
            .mini-dashboard .chart-panel svg .axis text,
            .mini-dashboard .chart-panel .x-axis text,
            .mini-dashboard .chart-panel .x-axis-large-font text,
            .x-axis text,
            .x-axis-large-font text,
            .axis text {
                fill: #f1f5f9 !important;
                font-family: 'Inter', 'Roboto Mono', monospace !important;
                font-weight: 700 !important;
                font-size: 24px !important; /* Optimal x-axis font size */
                filter: drop-shadow(0 0 3px rgba(220, 38, 38, 0.3)) drop-shadow(0 1px 2px rgba(0,0,0,0.8)) !important;
            }
            
            .axis line, .axis path {
                stroke: #dc2626 !important;
                stroke-width: 2px !important;
                filter: drop-shadow(0 0 5px rgba(220, 38, 38, 0.5));
            }
            
            .axis .domain {
                stroke: #dc2626 !important;
                stroke-width: 3px !important;
                filter: drop-shadow(0 0 8px rgba(220, 38, 38, 0.8));
            }
            
            /* Remove grid lines */
            .grid line {
                display: none !important;
            }
            
            /* Enhanced cumulative labels */
            .cumulative-label {
                font-family: 'Inter', 'Roboto Mono', monospace !important;
                font-weight: 900 !important;
                font-size: 16px !important;
                fill: #f1f5f9 !important;
                filter: drop-shadow(0 0 5px rgba(220, 38, 38, 0.4)) drop-shadow(0 1px 2px rgba(0,0,0,0.8)) !important;
            }
            
            /* Gaming-style segment labels */
            .segment-label {
                font-family: 'Inter', 'Roboto Mono', monospace !important;
                font-weight: 800 !important;
                font-size: 14px !important;
                fill: #000000 !important;
                text-shadow: 0 0 3px rgba(255, 255, 255, 0.8) !important;
            }
        `;
        document.head.appendChild(style);
    }

    updateDimensions() {
        if (!this.chartPanel || !this.chartPanel.node()) {
            console.warn('Chart panel not available for dimension calculation');
            this.width = 800;
            this.height = 900;
        } else {
            const containerRect = this.chartPanel.node().getBoundingClientRect();
            
            // Account for padding (20px left/right, 20px top, 40px bottom = 60px total) and border (3px on each side = 6px total)
            const availableWidth = Math.max(containerRect.width - 46, 400);  // 40px padding + 6px border
            const availableHeight = Math.max(containerRect.height - 66, 800); // 60px padding + 6px border
            
            // Calculate chart dimensions by subtracting margins - Extended width for longer panel
            this.width = Math.max(availableWidth - this.margin.left - this.margin.right, 600);
            this.height = Math.max(availableHeight - this.margin.top - this.margin.bottom, 800);
            
            // Ensure reasonable aspect ratio for readability
            const aspectRatio = this.width / this.height;
            if (aspectRatio > 3.5) {
                this.height = this.width / 3.5;
            } else if (aspectRatio < 1.2) {
                this.width = this.height * 1.2;
            }
        }
        
        // Update SVG with proper responsive dimensions
        if (this.svg) {
            const totalWidth = this.width + this.margin.left + this.margin.right;
            const totalHeight = this.height + this.margin.top + this.margin.bottom;
            
            // Remove viewBox to prevent zooming issues and use natural scaling
            this.svg
                .attr('width', totalWidth)
                .attr('height', totalHeight)
                .style('width', '100%')
                .style('height', 'auto')
                .style('max-width', '100%')
                .style('max-height', '100%');
        }
        
        // Update scale ranges
        if (this.xScale) this.xScale.range([0, this.width]);
        if (this.yScale) this.yScale.range([0, this.height]);
        
        // Update axis positions
        if (this.xAxisGroup) {
            this.xAxisGroup.attr('transform', `translate(0,${this.height})`);
        }
    }

    async loadData(csvPath) {
        try {
            this.data = await d3.csv(csvPath);
            
            // Correctly identify game columns: exclude first (Team) and last (Total) columns
            const allColumns = this.data.columns;
            this.gameColumns = allColumns.slice(1, -1); // Remove first and last columns
            this.maxGames = this.gameColumns.length;
            
            console.log('Detected game columns:', this.gameColumns);
            console.log('Max games:', this.maxGames);
            
            // Slider removed - using new draggable controls
            
            // Get matchup info
            const matchupKey = this.extractMatchupFromPath(csvPath);
            this.matchupInfo = MapSequenceUtils.getSequence(matchupKey);
            
            // Update chart
            this.updateChart();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load data. Please check the file path.');
        }
    }

    extractMatchupFromPath(csvPath) {
        const filename = csvPath.split('/').pop().split('.')[0];
        return filename.replace('_points', '');
    }

    // updateMatchupDisplay removed - old action panel functionality

    // updateCurrentMap removed - old action panel functionality
    
    // updateGameNumbers removed - old action panel functionality

    getCurrentMap() {
        if (!this.matchupInfo || !this.matchupInfo.maps) return 'Unknown';
        
        return this.matchupInfo.maps[this.currentGameIndex] || 'Unknown';
    }



    getMapForGame(gameNumber) {
        if (!this.matchupInfo || !this.matchupInfo.maps) return 'Unknown';
        
        return this.matchupInfo.maps[gameNumber] || 'Unknown';
    }

    getMapColor(mapName, gameNumber = null) {
        // If gameNumber is provided, use unified coloring system based on occurrence
        if (gameNumber !== null && this.matchupInfo && this.matchupInfo.maps) {
            return this.getMapColorByOccurrence(mapName, gameNumber);
        }
        
        // Fallback to default colors for current map display
        const mapColors = {
            'E-DISTRICT': 'hsl(198, 40%, 50%)',      // First occurrence color
            'STORM POINT': 'hsl(28, 40%, 50%)',      // First occurrence color  
            'WORLD\'S EDGE': 'hsl(350, 40%, 50%)',   // First occurrence color
            'OLYMPUS': 'hsl(15, 60%, 45%)',          // Red
            'KING\'S CANYON': 'hsl(120, 40%, 45%)',  // Green
            'BROKEN MOON': 'hsl(280, 50%, 50%)'      // Purple
        };
        return mapColors[mapName] || '#666666';
    }

    getMapColorByOccurrence(mapName, gameNumber) {
        // Count how many times this map has appeared up to this game
        let occurrenceCount = 0;
        for (let i = 1; i <= gameNumber; i++) {
            if (this.matchupInfo.maps[i] === mapName) {
                occurrenceCount++;
            }
        }
        
        // Debug: Log color progression
        if (gameNumber <= 3) { // Only log for first few games to avoid spam
            console.log(`Game ${gameNumber}: ${mapName} occurrence #${occurrenceCount}`);
        }

        // Unified HSL coloring system based on occurrence
        const colorSchemes = {
            'STORM POINT': {
                1: 'hsl(28, 100%, 60%)',  // 1st occurrence
                2: 'hsl(28, 100%, 70%)',  // 2nd occurrence  
                3: 'hsl(28, 100%, 80%)'   // 3rd occurrence
            },
            'WORLD\'S EDGE': {
                1: 'hsl(10, 100%, 60%)', // 1st occurrence
                2: 'hsl(10, 100%, 70%)', // 2nd occurrence
                3: 'hsl(10, 100%, 80%)'  // 3rd occurrence
            },
            'E-DISTRICT': {
                1: 'hsl(250, 100%, 60%)', // 1st occurrence
                2: 'hsl(250, 100%, 70%)', // 2nd occurrence
                3: 'hsl(250, 100%, 80%)'  // 3rd occurrence
            }
        };

        // Get color scheme for this map
        const scheme = colorSchemes[mapName];
        if (scheme && scheme[occurrenceCount]) {
            return scheme[occurrenceCount];
        }

        // Fallback to first occurrence color if not found
        if (scheme && scheme[1]) {
            return scheme[1];
        }

        // Ultimate fallback
        return '#666666';
    }

    updateChart() {
        if (!this.data || !this.gameColumns) return;
        
        // Ensure currentGameIndex is within valid bounds
        this.currentGameIndex = Math.max(1, Math.min(this.currentGameIndex, this.maxGames));
        
        // Process data for stacked visualization
        const processedData = this.data.map(d => {
            const teamData = {
                team: d.Team,
                games: [],
                cumulativeScore: 0
            };
            
            // Determine which games to include
            let gamesToInclude;
            if (this.isFiltered && this.filteredGameIndices.length > 0) {
                // When filtering, only show selected games
                gamesToInclude = this.filteredGameIndices.slice().sort((a, b) => a - b);
            } else {
                // When not filtering, show games up to current index
                gamesToInclude = Array.from({length: this.currentGameIndex}, (_, i) => i + 1);
            }
            
            // Build game-by-game data with colors based on ORIGINAL game numbers for proper color coding
            gamesToInclude.forEach(originalGameNum => {
                const gameCol = this.gameColumns[originalGameNum - 1];
                const gamePoints = +d[gameCol] || 0;
                const mapForGame = this.getMapForGame(originalGameNum);
                const gameColor = this.getMapColor(mapForGame, originalGameNum); // Use original game number for proper color
                
                teamData.games.push({
                    gameNumber: originalGameNum, // Keep original game number for reference
                    points: gamePoints,
                    color: gameColor,
                    map: mapForGame,
                    startX: teamData.cumulativeScore
                });
                
                teamData.cumulativeScore += gamePoints;
            });
            
            return teamData;
        });
        
        // Sort by cumulative score
        processedData.sort((a, b) => b.cumulativeScore - a.cumulativeScore);
        
        // Update scales
        this.xScale.domain([0, d3.max(processedData, d => d.cumulativeScore)]);
        this.yScale.domain(processedData.map(d => d.team));
        
        // Update X axis without grid lines
        const xAxis = d3.axisBottom(this.xScale)
            .tickFormat(d3.format('.0f'));
        
        this.xAxisGroup.call(xAxis);
        
        // FORCE X-AXIS FONT SIZE - Apply directly after axis creation with MAXIMUM override
        this.xAxisGroup.selectAll('text')
            .style('font-size', '24px', 'important')
            .style('font-weight', '700', 'important')
            .style('font-family', 'Inter, Roboto Mono, monospace', 'important')
            .style('fill', '#f1f5f9', 'important')
            .style('filter', 'drop-shadow(0 0 3px rgba(220, 38, 38, 0.3)) drop-shadow(0 1px 2px rgba(0,0,0,0.8))', 'important')
            .attr('font-size', '24px')  // Also set as attribute
            .attr('font-weight', '700')
            .attr('font-family', 'Inter, Roboto Mono, monospace');
            
        // DELAYED FORCE APPLICATION - Ensure styles stick after any D3 transitions
        setTimeout(() => {
            this.xAxisGroup.selectAll('text')
                .style('font-size', '24px', 'important')
                .style('font-weight', '700', 'important')
                .attr('font-size', '24px');
        }, 100);
        this.updateCustomYAxis(processedData);
        
        // Render stacked bars
        this.renderStackedBars(processedData);
        
        // Slider removed - using new draggable controls
    }

    renderStackedBars(data) {
        // Create team groups
        const teamGroups = this.mainGroup.selectAll('.team-group')
            .data(data, d => d.team);
        
        teamGroups.exit().remove();
        
        const teamGroupsEnter = teamGroups.enter()
            .append('g')
            .attr('class', 'team-group');
        
        const allTeamGroups = teamGroups.merge(teamGroupsEnter);
        
        // Position team groups - adjusted for thicker bars (centered)
        allTeamGroups
            .transition()
            .duration(this.config.transitionDuration)
            .attr('transform', d => `translate(0, ${this.yScale(d.team) + this.yScale.bandwidth() / 2})`);
        
        // Render game segments for each team
        const self = this; // Store reference for inner functions
        allTeamGroups.each((teamData, i, nodes) => {
            const teamGroup = d3.select(nodes[i]);
            
            // Game segments
            const gameSegments = teamGroup.selectAll('.game-segment')
                .data(teamData.games, d => d.gameNumber);
            
            gameSegments.exit().remove();
            
            const segmentsEnter = gameSegments.enter()
                .append('g')
                .attr('class', 'game-segment');
            
            // Add rectangles for game segments with rounded corners - 50% thicker
            segmentsEnter.append('rect')
                .attr('class', 'segment-bar')
                .attr('height', this.yScale.bandwidth() * 1.5)
                .attr('y', -this.yScale.bandwidth() * 0.75)  // Center the bar with text and labels
                .attr('x', 0)
                .attr('width', 0)
                .attr('rx', 8)
                .attr('ry', 8);
            
            // Add text labels for game points
            segmentsEnter.append('text')
                .attr('class', 'segment-label')
                .attr('y', 0)  // Align with team labels at center of team group
                .attr('dy', '0.35em')
                .style('font-size', '14px') // Increased font size
                .style('font-weight', '600')
                .style('text-anchor', 'middle')
                .style('fill', 'white')
                .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)');
            
            const allSegments = gameSegments.merge(segmentsEnter);
            
            // Update segments with rounded corners and sliding reveal effect
            allSegments.select('.segment-bar')
                .style('opacity', d => {
                    // When filtering is active, show all filtered games regardless of current game index
                    if (this.isFiltered && this.filteredGameIndices.length > 0) {
                        return this.filteredGameIndices.includes(d.gameNumber) ? 1 : 0;
                    }
                    // When not filtering, use current game index
                    return d.gameNumber <= this.currentGameIndex ? 1 : 0;
                })
                .transition()
                .duration(this.config.transitionDuration)
                .attr('x', d => {
                    // When filtering is active, show all filtered segments
                    if (this.isFiltered && this.filteredGameIndices.length > 0) {
                        if (this.filteredGameIndices.includes(d.gameNumber)) {
                            return this.xScale(d.startX);
                        } else {
                            // Hide non-filtered segments
                            return this.xScale(teamData.cumulativeScore);
                        }
                    }
                    // Original sliding effect for non-filtered mode
                    if (d.gameNumber > this.currentGameIndex) {
                        return this.xScale(teamData.cumulativeScore);
                    }
                    return this.xScale(d.startX);
                })
                .attr('width', d => {
                    // When filtering is active, show full width for filtered games
                    if (this.isFiltered && this.filteredGameIndices.length > 0) {
                        return this.filteredGameIndices.includes(d.gameNumber) ? this.xScale(d.points) : 0;
                    }
                    // Original logic for non-filtered mode
                    if (d.gameNumber <= this.currentGameIndex) {
                        return this.xScale(d.points);
                    }
                    return 0;
                })
                .attr('height', this.yScale.bandwidth() * 1.5)
                .attr('y', -this.yScale.bandwidth() * 0.75)  // Center the bar with text and labels
                .attr('rx', 8) // Rounded corners
                .attr('ry', 8)
                .style('fill', d => d.color)
                .style('stroke', 'rgba(0,0,0,0.8)')
                .style('stroke-width', '1px')
                .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))');
            
            // Update segment labels
            allSegments.select('.segment-label')
                .transition()
                .duration(this.config.transitionDuration)
                .attr('x', d => this.xScale(d.startX) + this.xScale(d.points) / 2)
                .attr('y', 0)  // Align with team labels at center of team group
                .text(d => d.points > 0 ? d.points : '')
                .style('opacity', d => {
                    // When filtering is active, only show labels for filtered games
                    if (this.isFiltered && this.filteredGameIndices.length > 0) {
                        if (!this.filteredGameIndices.includes(d.gameNumber)) {
                            return 0; // Hide labels for non-filtered games
                        }
                    } else {
                        // Original logic: hide labels for future games
                        if (d.gameNumber > this.currentGameIndex) {
                            return 0;
                        }
                    }
                    // Hide text if segment is too narrow
                    const segmentWidth = this.xScale(d.points);
                    return segmentWidth > 30 ? 1 : 0;
                });
            
            // Add cumulative score label at the end
            const cumulativeLabel = teamGroup.selectAll('.cumulative-label')
                .data([teamData]);
            
            cumulativeLabel.exit().remove();
            
            const cumulativeLabelEnter = cumulativeLabel.enter()
                .append('text')
                .attr('class', 'cumulative-label')
                .attr('y', 0)  // Align with team labels at center of team group
                .attr('dy', '0.35em')
                .style('font-size', '14px')
                .style('font-weight', '700')
                .style('fill', '#f1f5f9')
                .style('text-anchor', 'start')
                .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))');
            
            cumulativeLabel.merge(cumulativeLabelEnter)
                .transition()
                .duration(this.config.transitionDuration)
                .attr('x', d => this.xScale(d.cumulativeScore) + 8)
                .attr('y', 0)  // Align with team labels at center of team group
                .text(d => d.cumulativeScore);
        });
    }

    togglePlayback() {
        this.isPlaying = !this.isPlaying;
        
        if (this.isPlaying) {
            this.playAnimation();
        } else {
            if (this.animationTimer) {
                clearTimeout(this.animationTimer);
            }
        }
    }

    playAnimation(startGame = null, maxGames = null, intervalMs = null) {
        // If parameters provided, set up new animation sequence
        if (startGame !== null) {
            this.currentGameIndex = startGame;
            this.isPlaying = true;
            this.animationIntervalMs = intervalMs || (this.config.transitionDuration + this.config.holdDuration);
        }
        
        if (!this.isPlaying || this.currentGameIndex >= (maxGames || this.maxGames)) {
            this.isPlaying = false;
            return;
        }
        
        this.currentGameIndex++;
        this.updateChart();
        
        this.animationTimer = setTimeout(() => {
            this.playAnimation();
        }, this.animationIntervalMs || (this.config.transitionDuration + this.config.holdDuration));
    }

    restart() {
        this.isPlaying = false;
        this.currentGameIndex = 1;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
        }
        this.updateChart();
    }

    jumpToGame(gameIndex) {
        // Support game 0 as initial state
        if (gameIndex === 0) {
            this.currentGameIndex = 0;
            // Show initial state with all teams but zero scores
            this.renderInitialState();
            return;
        }
        
        // Ensure gameIndex is within valid bounds
        this.currentGameIndex = Math.max(1, Math.min(gameIndex, this.maxGames || 6));
        this.updateChart();
    }

    stopAnimation() {
        this.isPlaying = false;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }
    }

    renderInitialState() {
        console.log('🔄 Rendering initial state (Game 0)');
        if (!this.data || !this.gameColumns) {
            console.warn('⚠️ ChartEngine not initialized');
            return;
        }

        // Process data to show teams in final ranking order but with 0 cumulative scores
        const processedData = this.data.map(d => {
            const teamData = {
                team: d.Team,
                games: [],
                cumulativeScore: 0 // Show 0 for initial state
            };
            return teamData;
        });

        // Sort by final total score to show proper ranking order
        const finalScores = this.data.map(d => ({
            team: d.Team,
            total: +d.Total || 0
        })).sort((a, b) => b.total - a.total);

        // Reorder processedData to match final ranking
        const sortedData = finalScores.map(finalScore => 
            processedData.find(pd => pd.team === finalScore.team)
        );

        // Update scales
        this.xScale.domain([0, Math.max(...finalScores.map(d => d.total))]);
        this.yScale.domain(sortedData.map(d => d.team));

        // Update axes
        const xAxis = d3.axisBottom(this.xScale).tickFormat(d3.format('.0f'));
        this.xAxisGroup.call(xAxis);

        // Force X-axis font size
        this.xAxisGroup.selectAll('text')
            .style('font-size', '24px', 'important')
            .style('font-weight', '700', 'important')
            .style('font-family', 'Inter, Roboto Mono, monospace', 'important')
            .style('fill', '#f1f5f9', 'important');

        this.updateCustomYAxis(sortedData);
        this.renderStackedBars(sortedData);
    }

    cleanup() {
        // Stop any running animations
        this.stopAnimation();
        
        // Clear the container
        if (this.container && !this.container.empty()) {
            this.container.html('');
        }
        
        // Remove resize listener
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
        console.log('🧹 ChartEngine cleanup completed');
    }

    showError(message) {
        console.error('Chart Error:', message);
        
        // Clear chart panel and show error with dark theme
        if (this.chartPanel) {
            this.chartPanel.html('')
                .append('div')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('justify-content', 'center')
                .style('height', '100%')
                .style('color', '#fca5a5')
                .style('font-size', '1.2rem')
                .style('background', 'rgba(220, 38, 38, 0.1)')
                .style('border', '1px solid #dc2626')
                .style('border-radius', '8px')
                .style('padding', '20px')
                .text(message);
        } else {
            // Fallback if chart panel doesn't exist
            console.error('Chart panel not available for error display');
        }
    }



    setupCustomYAxis() {
        // Create a group for custom Y-axis with team logos and labels
        this.customYAxisGroup = this.mainGroup.append('g')
            .attr('class', 'custom-y-axis');
    }

    updateCustomYAxis(data) {
        // Clear existing Y-axis
        this.yAxisGroup.selectAll('*').remove();
        
        // Create team entries with ranking numbers, logos and labels
        const teamEntries = this.customYAxisGroup.selectAll('.team-entry')
            .data(data, d => d.team);
        
        teamEntries.exit().remove();
        
        const teamEntriesEnter = teamEntries.enter()
            .append('g')
            .attr('class', 'team-entry');
        
        // Add ranking number on the far left
        teamEntriesEnter.append('text')
            .attr('class', 'ranking-number')
            .attr('x', -260)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', '700')
            .style('fill', '#dc2626');
        
        // Add team logo container group
        const logoGroup = teamEntriesEnter.append('g')
            .attr('class', 'logo-container')
            .attr('transform', 'translate(-220, 0)');
        
        // Add background circle for logo
        logoGroup.append('circle')
            .attr('class', 'logo-background')
            .attr('r', 16)
            .style('fill', 'rgba(0, 0, 0, 0.8)')
            .style('stroke', 'rgba(0, 0, 0, 0.3)')
            .style('stroke-width', '1px')
            .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))');
        
        // Add team logo image (will be populated with actual logos)
        logoGroup.append('image')
            .attr('class', 'team-logo-image')
            .attr('x', -14)
            .attr('y', -14)
            .attr('width', 28)
            .attr('height', 28)
            .style('opacity', 0) // Start hidden until loaded
            .style('clip-path', 'circle(14px at center)')
            .on('load', function() {
                d3.select(this).style('opacity', 1);
                // Hide fallback when image loads
                d3.select(this.parentNode).select('.logo-fallback').style('opacity', 0);
            })
            .on('error', function() {
                // Show fallback on error
                d3.select(this).style('opacity', 0);
                d3.select(this.parentNode).select('.logo-fallback').style('opacity', 1);
            });
        
        // Add fallback for teams without logos or failed loads
        const fallbackGroup = logoGroup.append('g')
            .attr('class', 'logo-fallback')
            .style('opacity', 1); // Start visible, hide when image loads
        
        // Fallback background circle (colored based on team name)
        fallbackGroup.append('circle')
            .attr('class', 'fallback-bg')
            .attr('r', 14)
            .style('stroke', 'rgba(0, 0, 0, 0.5)')
            .style('stroke-width', '1px');
        
        // Fallback text (team initials or icon)
        fallbackGroup.append('text')
            .attr('class', 'fallback-text')
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('font-weight', '700')
            .style('fill', '#ffffff')
            .style('text-shadow', '0 1px 2px rgba(0,0,0,0.5)');
        
        // Add team name label
        teamEntriesEnter.append('text')
            .attr('class', 'team-label')
            .attr('x', -190)
            .attr('dy', '0.35em')
            .style('text-anchor', 'start')
            .style('font-size', '18px')
            .style('font-weight', '600')
            .style('fill', '#f1f5f9');
        
        const allTeamEntries = teamEntries.merge(teamEntriesEnter);
        
        // Update positions and labels
        allTeamEntries
            .transition()
            .duration(this.config.transitionDuration)
            .attr('transform', d => `translate(0, ${this.yScale(d.team) + this.yScale.bandwidth() / 2})`);
        
        // Update ranking numbers (1-20 based on current position)
        allTeamEntries.select('.ranking-number')
            .text((d, i) => i + 1);
        
        // Update team labels
        allTeamEntries.select('.team-label')
            .text(d => d.team);
        
        // Update team logos with actual images and fallbacks
        allTeamEntries.each((teamData, i, nodes) => {
            const teamGroup = d3.select(nodes[i]);
            const teamName = teamData.team;
            
            // Get logo URL from TeamConfig
            const logoUrl = window.TeamConfig ? window.TeamConfig.getTeamLogo(teamName) : null;
            const logoImage = teamGroup.select('.team-logo-image');
            const fallbackGroup = teamGroup.select('.logo-fallback');
            
            if (logoUrl) {
                // Set image source
                logoImage.attr('href', logoUrl);
                // Start with fallback visible, hide when image loads
                fallbackGroup.style('opacity', 1);
                logoImage.style('opacity', 0);
            } else {
                // No logo available, show fallback immediately
                logoImage.style('opacity', 0);
                fallbackGroup.style('opacity', 1);
            }
            
            // Setup fallback styling
            const fallbackConfig = window.TeamConfig ? 
                window.TeamConfig.getFallbackConfig(teamName) : 
                { backgroundColor: '#dc2626', initials: teamName.substring(0, 2), icon: '🏆' };
            
            fallbackGroup.select('.fallback-bg')
                .style('fill', fallbackConfig.backgroundColor);
            
            // Use initials for most teams, but show special icons for some
            const displayText = fallbackConfig.initials.length <= 3 ? 
                fallbackConfig.initials : fallbackConfig.icon;
            
            fallbackGroup.select('.fallback-text')
                .text(displayText)
                .style('font-size', displayText.length > 2 ? '10px' : '12px');
        });
    }

    // Method to handle external controls (for experiment page)
    setupExternalControlHandlers() {
        if (this.hasExternalControls) {
            // The experiment page will handle control events
            console.log('External controls detected - using experiment page controls');
        }
    }
    
    setupResizeListener() {
        // High-performance debounced resize handler to prevent excessive redraws
        let resizeTimeout;
        let isResizing = false;
        
        const handleResize = () => {
            if (isResizing) return; // Prevent overlapping resize operations
            
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                isResizing = true;
                
                // Use requestAnimationFrame for smooth resize updates
                requestAnimationFrame(() => {
                    console.log('Window resized, updating chart dimensions...');
                    this.updateDimensions();
                    
                    // Redraw chart if data is loaded
                    if (this.data) {
                        this.updateChart();
                    }
                    
                    // Reset resize flag
                    isResizing = false;
                });
            }, 200); // Reduced debounce for more responsive feel
        };
        
        // Use passive listener for better performance
        window.addEventListener('resize', handleResize, { passive: true });
        
        // Store reference for cleanup if needed
        this.resizeHandler = handleResize;
    }
}

// Export for use in other modules
window.ChartEngine = ChartEngine;
window.chartManager = chartManager;

// Debug helper for troubleshooting
window.debugChartManager = () => {
    console.log('📊 Chart Manager Debug Info:');
    console.log('Active instances:', chartManager.instances.size);
    console.log('Pending initializations:', chartManager.initializationPromises.size);
    console.log('Retry attempts:', chartManager.retryAttempts.size);
    
    chartManager.instances.forEach((instance, containerId) => {
        console.log(`📍 Instance ${containerId}:`, {
            hasContainer: !!instance.container,
            isEmpty: instance.container ? instance.container.empty() : 'N/A',
            hasData: !!instance.data,
            currentGame: instance.currentGameIndex,
            isPlaying: instance.isPlaying
        });
    });
}; 