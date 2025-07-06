/**
 * Centralized Chart Engine for ALGS Championship Visualizations
 * This module provides a unified interface for creating various chart types
 * with consistent styling and behavior across the application.
 */

class ChartEngine {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = containerId ? d3.select(`#${containerId}`) : null;
        this.data = null;
        this.currentGameIndex = 1;
        this.isPlaying = false;
        this.animationTimer = null;
        
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
        
        // Check if container exists
        if (!this.container || this.container.empty()) {
            console.error(`Container with ID '${containerId}' not found`);
            return;
        }
        
        // Initialize chart only (controls are handled in setupActionPanel)
        this.setupChart();
    }

    setupChart() {
        // Check if container exists
        if (!this.container) {
            console.error('Container not available for chart setup');
            return;
        }
        
        // Clear existing content
        this.container.html('');
        
        // Create mini-dashboard container with ultra-dark theme
        this.miniDashboard = this.container.append('div')
            .attr('class', 'mini-dashboard')
            .style('background', 'linear-gradient(145deg, #000000 0%, #030303 25%, #080808 50%, #030303 75%, #000000 100%)')  // Much darker
            .style('border-radius', '12px')
            .style('padding', '24px')
            .style('margin', '0')
            .style('max-width', 'none')
            .style('width', '100%')
            .style('height', '100%')
            .style('box-shadow', '0 0 30px rgba(220, 38, 38, 0.4), 0 20px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(220, 38, 38, 0.3)')
            .style('border', '3px solid #dc2626')
            .style('position', 'relative')
            .style('overflow', 'visible')
            .style('box-sizing', 'border-box')
            .style('display', 'flex')
            .style('flex-direction', 'column');
        
        // Add gaming-style inner glow with red theme
        this.miniDashboard.append('div')
            .style('position', 'absolute')
            .style('top', '0')
            .style('left', '0')
            .style('right', '0')
            .style('bottom', '0')
            .style('border-radius', '12px')
            .style('box-shadow', 'inset 0 0 20px rgba(220, 38, 38, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.9)')
            .style('pointer-events', 'none');
        
        // Create single full-width chart layout inside mini-dashboard
        this.mainLayout = this.miniDashboard.append('div')
            .attr('class', 'main-layout')
            .style('width', '100%')
            .style('flex', '1')  // Take remaining height
            .style('min-width', '1200px')  // Ensure minimum width for expanded layout
            .style('position', 'relative')
            .style('z-index', '1')
            .style('display', 'flex')
            .style('flex-direction', 'column');
        
        // FULL CHART PANEL: Chart Area with ALGS gaming aesthetic - DARKER
        this.chartPanel = this.mainLayout.append('div')
            .attr('class', 'chart-panel')
            .style('width', '100%')
            .style('flex', '1')  // Take remaining height
            .style('background', 'linear-gradient(135deg, #000000 0%, #050505 25%, #0a0a0a 50%, #050505 75%, #000000 100%)')  // Much darker
            .style('border-radius', '8px')
            .style('box-shadow', '0 0 20px rgba(220, 38, 38, 0.4), 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(220, 38, 38, 0.2)')
            .style('border', '2px solid #dc2626')
            .style('padding', '20px')
            .style('position', 'relative')
            .style('overflow', 'visible')
            .style('display', 'flex')
            .style('flex-direction', 'column');
        
        // Setup SVG in left panel
        this.svg = this.chartPanel.append('svg')
            .style('width', '100%')
            .style('flex', '1')  // Take remaining height
            .style('display', 'block')
            .style('min-height', '300px');
        
        // Setup dimensions with more space for team labels, logos, and ranking numbers
        this.margin = { top: 30, right: 60, bottom: 70, left: 280 };
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
        
        // RIGHT PANEL: Action Panel
        this.setupActionPanel();
        
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
            
            // Load the appropriate CSV file
            const csvPath = `${config.matchup}_points.csv`;
            
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

    setupActionPanel() {
        // COMPACT DASHBOARD: Quarter-size gaming-style HUD panel
        this.actionPanel = this.chartPanel.append('div')
            .attr('class', 'action-panel-overlay')
            .style('position', 'absolute')
            .style('bottom', '20px')  
            .style('right', '20px')
            .style('width', '200px')  // Quarter size (was 380px)
            .style('height', 'auto')  // Auto height instead of full height
            .style('max-height', '300px')  // Limit maximum height
            .style('max-width', 'calc(100% - 40px)')  
            .style('background', 'rgba(5, 5, 5, 0.3)')  // Much more translucent
            .style('backdrop-filter', 'blur(15px)')  
            .style('border-radius', '8px')
            .style('box-shadow', '0 0 15px rgba(220, 38, 38, 0.2), 0 8px 16px rgba(0,0,0,0.3)')  
            .style('border', '1px solid rgba(220, 38, 38, 0.2)')  // More translucent border
            .style('z-index', '1000')
            .style('transition', 'all 0.3s ease')
            .style('transform', 'translateY(0)')
            .style('opacity', '1')
            .style('display', 'flex')
            .style('flex-direction', 'column');
        
        // Create compact content container
        this.mainContent = this.actionPanel.append('div')
            .attr('class', 'main-content')
            .style('padding', '12px')  // Reduced padding
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('gap', '10px')  // Reduced gap
            .style('overflow-y', 'auto');
        
        // Game Numbers Section (smaller buttons)
        this.setupGameNumbers();
        
        // Direct Play/Pause Controls (always visible)
        this.setupDirectControls();
        
        // Map Info Section  
        this.setupMapInfo();
        
        // Map Image Area
        this.setupMapImageArea();
        
        // Additional Controls Section (only if no external controls exist)
        if (!this.hasExternalControls) {
            console.log('Setting up internal controls');
            this.setupAdditionalControls();
        } else {
            console.log('Skipping internal controls - external controls detected');
        }
    }
    


    setupGameNumbers() {
        const gameSection = this.mainContent.append('div')
            .attr('class', 'game-numbers-section');
            
        gameSection.append('h3')
            .style('margin', '0 0 6px 0')  // Reduced margin
            .style('font-size', '0.8rem')  // Smaller font
            .style('font-weight', '600')
            .style('color', '#f1f5f9')
            .text('Game Progress');
            
        this.gameNumbersContainer = gameSection.append('div')
            .attr('class', 'game-numbers')
            .style('display', 'flex')
            .style('flex-wrap', 'wrap')
            .style('gap', '4px');  // Reduced gap
    }
    
    setupDirectControls() {
        const controlsSection = this.mainContent.append('div')
            .attr('class', 'direct-controls-section');
            
        controlsSection.append('h3')
            .style('margin', '0 0 6px 0')  // Reduced margin
            .style('font-size', '0.8rem')  // Smaller font
            .style('font-weight', '600')
            .style('color', '#f1f5f9')
            .text('Controls');
        
        // Direct Play/Pause buttons container
        this.directButtonContainer = controlsSection.append('div')
            .style('display', 'flex')
            .style('gap', '6px')  // Reduced gap
            .style('margin-bottom', '8px');  // Reduced margin
        
        this.playButton = this.directButtonContainer.append('button')
            .text('▶ Play')
            .attr('class', 'control-button direct-control')
            .style('flex', '1')
            .style('padding', '6px 10px')  // Smaller padding
            .style('background', 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #dc2626 100%)')
            .style('color', 'white')
            .style('border', '1px solid #000000')  // Thinner border
            .style('border-radius', '4px')  // Smaller radius
            .style('cursor', 'pointer')
            .style('font-weight', '600')  // Lighter weight
            .style('font-size', '0.7rem')  // Smaller font
            .style('font-family', 'Inter, Roboto Mono, monospace')
            .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
            .style('box-shadow', '0 0 6px rgba(220, 38, 38, 0.4), 0 2px 4px rgba(0,0,0,0.3)')  // Smaller shadow
            .style('transition', 'all 0.3s ease')
            .on('click', () => this.togglePlayback());
        
        this.restartButton = this.directButtonContainer.append('button')
            .text('⟲ Reset')
            .attr('class', 'control-button direct-control')
            .style('flex', '1')
            .style('padding', '6px 10px')  // Smaller padding
            .style('background', 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #374151 100%)')
            .style('color', '#f1f5f9')
            .style('border', '1px solid #dc2626')  // Thinner border
            .style('border-radius', '4px')  // Smaller radius
            .style('cursor', 'pointer')
            .style('font-weight', '600')  // Lighter weight
            .style('font-size', '0.7rem')  // Smaller font
            .style('font-family', 'Inter, Roboto Mono, monospace')
            .style('text-shadow', '0 1px 2px rgba(0,0,0,0.8)')
            .style('box-shadow', '0 0 6px rgba(220, 38, 38, 0.3), 0 2px 4px rgba(0,0,0,0.3)')  // Smaller shadow
            .style('transition', 'all 0.3s ease')
            .on('click', () => this.restart());
    }
    
    setupMapInfo() {
        const mapSection = this.mainContent.append('div')
            .attr('class', 'map-info-section');
            
        mapSection.append('h3')
            .style('margin', '0 0 6px 0')  // Reduced margin
            .style('font-size', '0.8rem')  // Smaller font
            .style('font-weight', '600')
            .style('color', '#f1f5f9')
            .text('Current Map');
        
        // Matchup title (for compatibility) - hidden
        this.matchupTitle = mapSection.append('div')
            .attr('class', 'matchup-title')
            .style('display', 'none');
            
        // Current game indicator - hidden
        this.currentGameIndicator = mapSection.append('div')
            .attr('class', 'current-game-indicator')
            .style('display', 'none');
            
        // Map title with colored background - smaller
        this.currentMapTitle = mapSection.append('div')
            .attr('class', 'current-map-title')
            .style('font-size', '0.9rem')  // Smaller font
            .style('font-weight', '600')
            .style('text-align', 'center')
            .style('padding', '6px 10px')  // Smaller padding
            .style('background', '#2E86AB')
            .style('color', 'white')
            .style('border-radius', '6px')  // Smaller radius
            .style('box-shadow', '0 2px 6px rgba(0,0,0,0.3)')  // Smaller shadow
            .text('E-DISTRICT');
    }
    
    setupMapImageArea() {
        // Skip map image area to save space in compact dashboard
    }

    setupAdditionalControls() {
        // Compact slider section
        const controlsSection = this.mainContent.append('div')
            .attr('class', 'additional-controls-section');
            
        controlsSection.append('h3')
            .style('margin', '0 0 6px 0')  // Reduced margin
            .style('font-size', '0.8rem')  // Smaller font
            .style('font-weight', '600')
            .style('color', '#f1f5f9')
            .text('Game Slider');
        
        // Compact slider
        this.slider = controlsSection.append('input')
            .attr('type', 'range')
            .attr('min', 1)
            .attr('max', 6)
            .attr('value', 1)
            .attr('class', 'game-slider')
            .style('width', '100%')
            .style('margin', '6px 0')  // Reduced margin
            .style('height', '6px')  // Smaller height
            .on('input', (event) => {
                this.currentGameIndex = +event.target.value;
                this.updateChart();
            });
    }

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
            this.width = 600;
            this.height = 500;
        } else {
            const containerRect = this.chartPanel.node().getBoundingClientRect();
            this.width = Math.max(containerRect.width - this.margin.left - this.margin.right, 800);  // Increased minimum width
            this.height = Math.max(containerRect.height - this.margin.top - this.margin.bottom, 500);
        }
        
        // Update SVG dimensions with responsive scaling
        if (this.svg) {
            const totalWidth = this.width + this.margin.left + this.margin.right;
            const totalHeight = this.height + this.margin.top + this.margin.bottom;
            
            this.svg
                .attr('width', '100%')
                .attr('height', '100%')
                .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
                .attr('preserveAspectRatio', 'xMidYMid meet');
        }
        
        // Update scale ranges
        if (this.xScale) this.xScale.range([0, this.width]);
        if (this.yScale) this.yScale.range([0, this.height]); // Correct range for bars
        
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
            
            // Update slider max (only if slider exists)
            if (this.slider) {
                this.slider.attr('max', this.maxGames);
            }
            
            // Get matchup info
            const matchupKey = this.extractMatchupFromPath(csvPath);
            this.matchupInfo = MapSequenceUtils.getSequence(matchupKey);
            
            // Update UI
            this.updateMatchupDisplay();
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

    updateMatchupDisplay() {
        if (this.matchupInfo) {
            // Only update the small matchup title, not the main map display
            this.matchupTitle.text(this.matchupInfo.name);
            this.updateCurrentMap();
        }
    }

    updateCurrentMap() {
        if (this.matchupInfo && this.matchupInfo.maps) {
            const currentMap = this.getCurrentMap();
            const mapColor = this.getMapColor(currentMap, this.currentGameIndex); // Use unified coloring
            
            this.currentMapTitle
                .text(currentMap.toUpperCase())
                .style('background', mapColor); // Update background color
                
            this.currentGameIndicator.text(`Game ${this.currentGameIndex} of ${this.maxGames}`);
        }
    }
    
    updateGameNumbers() {
        if (!this.gameNumbersContainer || !this.maxGames) return;
        
        // Clear existing game numbers
        this.gameNumbersContainer.selectAll('.game-number').remove();
        
        // Create compact game number buttons
        for (let i = 1; i <= this.maxGames; i++) {
            const isCurrentGame = i === this.currentGameIndex;
            const mapForGame = this.getMapForGame(i);
            const mapColor = this.getMapColor(mapForGame, i); // Pass game number for unified coloring
            
            this.gameNumbersContainer.append('div')
                .attr('class', 'game-number')
                .style('width', '20px')        // Much smaller buttons
                .style('height', '20px')       // Much smaller buttons
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('justify-content', 'center')
                .style('border-radius', '3px')  // Smaller radius
                .style('font-weight', '600')
                .style('font-size', '0.65rem') // Much smaller font
                .style('cursor', 'pointer')
                .style('transition', 'all 0.3s ease')
                .style('background', isCurrentGame ? mapColor : 'rgba(30, 30, 30, 0.8)')
                .style('color', isCurrentGame ? 'white' : '#f1f5f9')
                .style('border', isCurrentGame ? `1px solid ${mapColor}` : '1px solid rgba(220, 38, 38, 0.3)')  // Thinner border
                .style('box-shadow', isCurrentGame ? '0 2px 6px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.2)')  // Smaller shadow
                .text(i)
                .on('click', () => {
                    this.currentGameIndex = i;
                    this.updateChart();
                })
                .on('mouseover', function() {
                    if (!isCurrentGame) {
                        d3.select(this)
                            .style('background', mapColor) // Uses the unified color for this game
                            .style('color', 'white')
                            .style('transform', 'translateY(-2px)');
                    }
                })
                .on('mouseout', function() {
                    if (!isCurrentGame) {
                        d3.select(this)
                            .style('background', 'rgba(30, 30, 30, 0.8)')
                            .style('color', '#f1f5f9')
                            .style('transform', 'translateY(0)');
                    }
                });
        }
    }

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
        
        this.updateCurrentMap();
        this.updateGameNumbers();
        
        // Process data for stacked visualization
        const processedData = this.data.map(d => {
            const teamData = {
                team: d.Team,
                games: [],
                cumulativeScore: 0
            };
            
            // Build game-by-game data with colors
            for (let i = 1; i <= this.currentGameIndex; i++) {
                const gameCol = this.gameColumns[i - 1];
                const gamePoints = +d[gameCol] || 0;
                const mapForGame = this.getMapForGame(i);
                const gameColor = this.getMapColor(mapForGame, i);
                
                teamData.games.push({
                    gameNumber: i,
                    points: gamePoints,
                    color: gameColor,
                    map: mapForGame,
                    startX: teamData.cumulativeScore
                });
                
                teamData.cumulativeScore += gamePoints;
            }
            
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
        
        // Update slider position (only if slider exists)
        if (this.slider) {
            this.slider.property('value', this.currentGameIndex);
        }
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
                .attr('y', -this.yScale.bandwidth() * 0.25)  // Center the thicker bar
                .attr('x', 0)
                .attr('width', 0)
                .attr('rx', 8)
                .attr('ry', 8);
            
            // Add text labels for game points
            segmentsEnter.append('text')
                .attr('class', 'segment-label')
                .attr('y', this.yScale.bandwidth() / 2)
                .attr('dy', '0.35em')
                .style('font-size', '14px') // Increased font size
                .style('font-weight', '600')
                .style('text-anchor', 'middle')
                .style('fill', 'white')
                .style('text-shadow', '1px 1px 2px rgba(0,0,0,0.5)');
            
            const allSegments = gameSegments.merge(segmentsEnter);
            
            // Update segments with rounded corners and sliding reveal effect
            allSegments.select('.segment-bar')
                .style('opacity', d => d.gameNumber <= this.currentGameIndex ? 1 : 0)
                .transition()
                .duration(this.config.transitionDuration)
                .attr('x', d => {
                    // Create sliding effect: new segments start from under previous ones
                    if (d.gameNumber > this.currentGameIndex) {
                        // Hide future segments by positioning them at the end of current visible area
                        return this.xScale(teamData.cumulativeScore);
                    }
                    return this.xScale(d.startX);
                })
                .attr('width', d => {
                    if (d.gameNumber <= this.currentGameIndex) {
                        return this.xScale(d.points);
                    }
                    return 0; // Future segments have no width
                })
                .attr('height', this.yScale.bandwidth() * 1.5)
                .attr('y', -this.yScale.bandwidth() * 0.25)  // Center the thicker bar
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
                .attr('y', this.yScale.bandwidth() / 2)
                .text(d => d.points > 0 ? d.points : '')
                .style('opacity', d => {
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
                .attr('y', this.yScale.bandwidth() / 2)
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
                .attr('y', this.yScale.bandwidth() / 2)
                .text(d => d.cumulativeScore);
        });
    }

    togglePlayback() {
        this.isPlaying = !this.isPlaying;
        
        // Update button text with icons
        if (this.playButton) {
            this.playButton.text(this.isPlaying ? '⏸ Pause' : '▶ Play');
        }
        
        if (this.isPlaying) {
            this.playAnimation();
        } else {
            if (this.animationTimer) {
                clearTimeout(this.animationTimer);
            }
        }
    }

    playAnimation() {
        if (!this.isPlaying || this.currentGameIndex >= this.maxGames) {
            this.isPlaying = false;
            
            // Update button text with icon
            if (this.playButton) {
                this.playButton.text('▶ Play');
            }
            return;
        }
        
        this.currentGameIndex++;
        this.updateChart();
        
        this.animationTimer = setTimeout(() => {
            this.playAnimation();
        }, this.config.transitionDuration + this.config.holdDuration);
    }

    restart() {
        this.isPlaying = false;
        
        // Update button text only if button exists
        if (this.playButton) {
            this.playButton.text('Play');
        }
        
        this.currentGameIndex = 1;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
        }
        this.updateChart();
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
        
        // Add team logo placeholder (circle with icon)
        teamEntriesEnter.append('circle')
            .attr('class', 'team-logo')
            .attr('r', 14)
            .attr('cx', -220)
            .style('fill', 'rgba(220, 38, 38, 0.1)')
            .style('stroke', '#dc2626')
            .style('stroke-width', '2px');
        
        // Add trophy icon inside the circle
        teamEntriesEnter.append('text')
            .attr('class', 'team-icon')
            .attr('x', -220)
            .attr('y', 0)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', '#dc2626')
            .text('🏆');
        
        // Add team name label
        teamEntriesEnter.append('text')
            .attr('class', 'team-label')
            .attr('x', -190)
            .attr('dy', '0.35em')
            .style('text-anchor', 'start')
            .style('font-size', '18px') // Increased font size
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
        
        allTeamEntries.select('.team-label')
            .text(d => d.team);
    }

    // Method to handle external controls (for experiment page)
    setupExternalControlHandlers() {
        if (this.hasExternalControls) {
            // The experiment page will handle control events
            console.log('External controls detected - using experiment page controls');
        }
    }
    
    setupResizeListener() {
        // Debounced resize handler to prevent excessive redraws
        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                console.log('Window resized, updating chart dimensions...');
                this.updateDimensions();
                
                // Redraw chart if data is loaded
                if (this.data) {
                    this.updateChart();
                }
                
                // Update action panel position if it exists
                if (this.actionPanel) {
                    // Action panel will adjust automatically due to its responsive positioning
                }
            }, 250); // 250ms debounce
        };
        
        // Add resize listener
        window.addEventListener('resize', handleResize);
        
        // Store reference for cleanup if needed
        this.resizeHandler = handleResize;
    }
}

// Export for use in other modules
window.ChartEngine = ChartEngine; 