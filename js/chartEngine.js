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
        
        // Create mini-dashboard container with 3D dark theme effect
        this.miniDashboard = this.container.append('div')
            .attr('class', 'mini-dashboard')
            .style('background', 'linear-gradient(145deg, #1e1414 0%, #2d1b1b 50%, #1e1414 100%)')
            .style('border-radius', '16px')
            .style('padding', '24px')
            .style('margin', '20px auto')
            .style('max-width', 'none')
            .style('width', 'calc(100% + 160px)')  // Increased by 200px (minus existing 40px margin)
            .style('box-shadow', '0 20px 40px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(217, 119, 6, 0.1)')
            .style('border', '2px solid #d97706')
            .style('position', 'relative')
            .style('overflow', 'hidden');
        
        // Add subtle inner glow for depth (dark theme)
        this.miniDashboard.append('div')
            .style('position', 'absolute')
            .style('top', '0')
            .style('left', '0')
            .style('right', '0')
            .style('bottom', '0')
            .style('border-radius', '16px')
            .style('box-shadow', 'inset 0 2px 4px rgba(217, 119, 6, 0.2)')
            .style('pointer-events', 'none');
        
        // Create single full-width chart layout inside mini-dashboard
        this.mainLayout = this.miniDashboard.append('div')
            .attr('class', 'main-layout')
            .style('width', '100%')
            .style('height', '850px')
            .style('min-width', '1200px')  // Ensure minimum width for expanded layout
            .style('position', 'relative')
            .style('z-index', '1');
        
        // FULL CHART PANEL: Chart Area with dark theme overlay
        this.chartPanel = this.mainLayout.append('div')
            .attr('class', 'chart-panel')
            .style('width', '100%')
            .style('height', '100%')
            .style('background', 'linear-gradient(135deg, #2d1b1b 0%, #1a0f0f 50%, #2d1b1b 100%)')
            .style('border-radius', '12px')
            .style('box-shadow', '0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(217, 119, 6, 0.1)')
            .style('border', '1px solid #d97706')
            .style('padding', '20px')
            .style('position', 'relative');
        
        // Setup SVG in left panel
        this.svg = this.chartPanel.append('svg')
            .style('width', '100%')
            .style('height', '100%')
            .style('display', 'block');
        
        // Setup dimensions with more space for team labels, logos, and ranking numbers
        this.margin = { top: 30, right: 20, bottom: 50, left: 250 };
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
            .padding(0.5); // Greatly increased padding for more space between bars
        
        // Setup main group
        this.mainGroup = this.svg.append('g')
            .attr('class', 'main-group')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        
                // Setup axes
        this.xAxisGroup = this.mainGroup.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${this.height})`);
            
        this.yAxisGroup = this.mainGroup.append('g')
            .attr('class', 'y-axis');
            
        // Setup custom Y-axis with team logos and larger text
        this.setupCustomYAxis();
        
        // RIGHT PANEL: Action Panel
        this.setupActionPanel();
        
        // Apply styles
        this.applyStyles();
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
        // OVERLAY ACTION PANEL: Collapsible panel in bottom right with dark theme
        this.actionPanel = this.chartPanel.append('div')
            .attr('class', 'action-panel-overlay')
            .style('position', 'absolute')
            .style('bottom', '70px')  // Moved higher to avoid x-axis labels
            .style('right', '20px')
            .style('width', '320px')
            .style('background', 'rgba(45, 27, 27, 0.95)')
            .style('backdrop-filter', 'blur(10px)')
            .style('border-radius', '16px')
            .style('box-shadow', '0 12px 32px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)')
            .style('border', '1px solid rgba(217, 119, 6, 0.3)')
            .style('z-index', '1000')
            .style('transition', 'all 0.3s ease')
            .style('transform', 'translateY(0)')
            .style('opacity', '1');
        
        // Add collapse/expand functionality (start collapsed by default)
        this.isCollapsed = true;
        this.setupCollapseButton();
        
        // Create persistent game progress section (always visible)
        this.persistentContent = this.actionPanel.append('div')
            .attr('class', 'persistent-content')
            .style('padding', '15px 20px')
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('gap', '10px');
        
        // Game Numbers Section (always visible)
        this.setupGameNumbers();
        
        // Create collapsible content container (hidden when collapsed)
        this.collapsibleContent = this.actionPanel.append('div')
            .attr('class', 'collapsible-content')
            .style('padding', '0 20px 20px 20px')
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('gap', '15px')
            .style('border-top', '1px solid rgba(0,0,0,0.1)')
            .style('margin-top', '0');
        
        // Map Info Section  
        this.setupMapInfo();
        
        // Map Image Area
        this.setupMapImageArea();
        
        // Controls Section (only if no external controls exist)
        if (!this.hasExternalControls) {
            console.log('Setting up internal controls');
            this.setupControls();
        } else {
            console.log('Skipping internal controls - external controls detected');
            // Ensure no controls are accidentally created
            this.collapsibleContent.selectAll('.controls-section').remove();
        }
        
        // Set initial collapsed state
        this.setInitialCollapsedState();
    }
    
    setupCollapseButton() {
        // Collapse/Expand button
        this.collapseButton = this.actionPanel.append('div')
            .attr('class', 'collapse-button')
            .style('position', 'absolute')
            .style('top', '10px')
            .style('right', '10px')
            .style('width', '32px')
            .style('height', '32px')
            .style('background', 'rgba(102, 126, 234, 0.9)')
            .style('border-radius', '50%')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .style('cursor', 'pointer')
            .style('color', 'white')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('transition', 'all 0.3s ease')
            .style('z-index', '1001')
            .text('+')  // Start with + since we start collapsed
            .on('click', () => this.togglePanel());
    }

    setInitialCollapsedState() {
        // Set initial collapsed state (show only game progress)
        this.collapsibleContent.style('display', 'none');
        this.actionPanel.style('width', '280px');
        this.collapseButton.text('+');
    }

    togglePanel() {
        this.isCollapsed = !this.isCollapsed;
        
        if (this.isCollapsed) {
            // Hide collapsible content, keep game progress visible
            this.collapsibleContent.style('display', 'none');
            this.actionPanel.style('width', '280px').style('height', 'auto');
            this.collapseButton.text('+');
        } else {
            // Show all content
            this.collapsibleContent.style('display', 'flex');
            this.actionPanel.style('width', '320px').style('height', 'auto');
            this.collapseButton.text('−');
        }
    }

    setupGameNumbers() {
        const gameSection = this.persistentContent.append('div')
            .attr('class', 'game-numbers-section');
            
        gameSection.append('h3')
            .style('margin', '0 0 8px 0')
            .style('font-size', '0.9rem')
            .style('font-weight', '600')
            .style('color', '#333')
            .text('Game Progress');
            
        this.gameNumbersContainer = gameSection.append('div')
            .attr('class', 'game-numbers')
            .style('display', 'flex')
            .style('flex-wrap', 'wrap')
            .style('gap', '6px');
    }
    
    setupMapInfo() {
        const mapSection = this.collapsibleContent.append('div')
            .attr('class', 'map-info-section');
            
        mapSection.append('h3')
            .style('margin', '0 0 10px 0')
            .style('font-size', '0.9rem')
            .style('font-weight', '600')
            .style('color', '#333')
            .text('Current Map');
        
        // Matchup title (for compatibility) - hidden
        this.matchupTitle = mapSection.append('div')
            .attr('class', 'matchup-title')
            .style('display', 'none');
            
        // Current game indicator - hidden
        this.currentGameIndicator = mapSection.append('div')
            .attr('class', 'current-game-indicator')
            .style('display', 'none');
            
        // Map title with colored background
        this.currentMapTitle = mapSection.append('div')
            .attr('class', 'current-map-title')
            .style('font-size', '1.2rem')
            .style('font-weight', '600')
            .style('text-align', 'center')
            .style('padding', '10px 16px')
            .style('background', '#2E86AB')
            .style('color', 'white')
            .style('border-radius', '8px')
            .style('box-shadow', '0 2px 8px rgba(0,0,0,0.1)')
            .text('E-DISTRICT');
    }
    
    setupMapImageArea() {
        const imageSection = this.collapsibleContent.append('div')
            .attr('class', 'map-image-section');
            
        imageSection.append('h3')
            .style('margin', '0 0 10px 0')
            .style('font-size', '0.9rem')
            .style('font-weight', '600')
            .style('color', '#333')
            .text('Map Preview');
            
        this.mapImageArea = imageSection.append('div')
            .attr('class', 'map-image-area')
            .style('width', '100%')
            .style('height', '100px')
            .style('background', '#f8f9fa')
            .style('border-radius', '8px')
            .style('border', '2px dashed #ddd')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'center')
            .style('color', '#666')
            .style('font-size', '0.8rem')
            .text('📍 Map Image Area');
    }

    setupControls() {
        // Remove any existing controls first (defensive)
        this.collapsibleContent.selectAll('.controls-section').remove();
        
        // Controls container
        const controlsSection = this.collapsibleContent.append('div')
            .attr('class', 'controls-section');
            
        controlsSection.append('h3')
            .style('margin', '0 0 10px 0')
            .style('font-size', '0.9rem')
            .style('font-weight', '600')
            .style('color', '#333')
            .text('Controls');
        
        // Slider
        this.slider = controlsSection.append('input')
            .attr('type', 'range')
            .attr('min', 1)
            .attr('max', 6)
            .attr('value', 1)
            .attr('class', 'game-slider')
            .style('width', '100%')
            .style('margin', '10px 0')
            .on('input', (event) => {
                this.currentGameIndex = +event.target.value;
                this.updateChart();
            });
        
        // Buttons
        this.buttonContainer = controlsSection.append('div')
            .style('display', 'flex')
            .style('gap', '10px')
            .style('margin-top', '15px');
        
        this.playButton = this.buttonContainer.append('button')
            .text('Play')
            .attr('class', 'control-button')
            .style('flex', '1')
            .style('padding', '10px 16px')
            .style('background', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)')
            .style('color', 'white')
            .style('border', 'none')
            .style('border-radius', '8px')
            .style('cursor', 'pointer')
            .style('font-weight', '600')
            .style('transition', 'all 0.3s ease')
            .on('click', () => this.togglePlayback());
        
        this.restartButton = this.buttonContainer.append('button')
            .text('Restart')
            .attr('class', 'control-button')
            .style('flex', '1')
            .style('padding', '10px 16px')
            .style('background', 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)')
            .style('color', '#333')
            .style('border', 'none')
            .style('border-radius', '8px')
            .style('cursor', 'pointer')
            .style('font-weight', '600')
            .style('transition', 'all 0.3s ease')
            .on('click', () => this.restart());
    }

    applyStyles() {
        // Add CSS for 3D effects and animations with dark theme
        const style = document.createElement('style');
        style.textContent = `
            .chart-container {
                font-family: 'Inter', sans-serif;
                color: #f1f5f9;
            }
            
            .control-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(217, 119, 6, 0.3);
            }
            
            .game-slider {
                -webkit-appearance: none;
                appearance: none;
                height: 8px;
                background: linear-gradient(90deg, #374151 0%, #4b5563 100%);
                border-radius: 4px;
                outline: none;
                border: 1px solid #6b7280;
            }
            
            .game-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 4px 8px rgba(0,0,0,0.4);
                transition: all 0.3s ease;
                border: 2px solid #1f2937;
            }
            
            .game-slider::-webkit-slider-thumb:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 12px rgba(217, 119, 6, 0.5);
            }
            
            .game-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid #1f2937;
                box-shadow: 0 4px 8px rgba(0,0,0,0.4);
            }
            
            .bar-3d {
                filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
                transition: all 0.3s ease;
            }
            
            .bar-3d:hover {
                filter: drop-shadow(0 6px 12px rgba(0,0,0,0.5));
                transform: translateY(-1px);
            }
            
            .bar-shine {
                filter: brightness(1.2) drop-shadow(0 4px 8px rgba(217, 119, 6, 0.3));
            }
            
            .team-label {
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
                transition: all 0.3s ease;
                fill: #f1f5f9 !important;
            }
            
            .ranking-number {
                fill: #d97706 !important;
                font-weight: bold;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
            }
            
            .legend-item {
                transition: all 0.3s ease;
                color: #f1f5f9;
            }
            
            .legend-item:hover {
                transform: translateX(3px);
                color: #fbbf24;
            }
            
            .map-sequence-item {
                transition: all 0.3s ease;
                border-radius: 8px;
                padding: 8px;
                margin: 4px 0;
                background: rgba(217, 119, 6, 0.05);
                color: #f1f5f9;
            }
            
            .map-sequence-item:hover {
                background: rgba(217, 119, 6, 0.1);
                transform: translateX(3px);
            }
            
            .map-sequence-item.current-game {
                background: rgba(217, 119, 6, 0.2);
                border: 2px solid rgba(217, 119, 6, 0.5);
                transform: translateX(5px);
                color: #fbbf24;
            }
            
            /* Dark theme for axes */
            .axis text {
                fill: #d1d5db !important;
            }
            
            .axis line, .axis path {
                stroke: #6b7280 !important;
            }
            
            .axis .domain {
                stroke: #d97706 !important;
                stroke-width: 2px !important;
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
        
        // Update SVG dimensions
        if (this.svg) {
            const totalWidth = this.width + this.margin.left + this.margin.right;
            const totalHeight = this.height + this.margin.top + this.margin.bottom;
            
            this.svg
                .attr('width', totalWidth)
                .attr('height', totalHeight)
                .attr('viewBox', `0 0 ${totalWidth} ${totalHeight}`);
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
        
        // Create game number buttons
        for (let i = 1; i <= this.maxGames; i++) {
            const isCurrentGame = i === this.currentGameIndex;
            const mapForGame = this.getMapForGame(i);
            const mapColor = this.getMapColor(mapForGame, i); // Pass game number for unified coloring
            
            this.gameNumbersContainer.append('div')
                .attr('class', 'game-number')
                .style('width', '40px')
                .style('height', '40px')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('justify-content', 'center')
                .style('border-radius', '8px')
                .style('font-weight', '600')
                .style('cursor', 'pointer')
                .style('transition', 'all 0.3s ease')
                .style('background', isCurrentGame ? mapColor : '#f8f9fa')
                .style('color', isCurrentGame ? 'white' : '#666')
                .style('border', isCurrentGame ? `2px solid ${mapColor}` : '2px solid #ddd')
                .style('box-shadow', isCurrentGame ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)')
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
                            .style('background', '#f8f9fa')
                            .style('color', '#666')
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
        
        // Update axes
        this.xAxisGroup.call(d3.axisBottom(this.xScale));
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
        
        // Position team groups
        allTeamGroups
            .transition()
            .duration(this.config.transitionDuration)
            .attr('transform', d => `translate(0, ${this.yScale(d.team)})`);
        
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
            
            // Add rectangles for game segments with rounded corners
            segmentsEnter.append('rect')
                .attr('class', 'segment-bar')
                .attr('height', this.yScale.bandwidth())
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
                .attr('height', this.yScale.bandwidth())
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
        
        // Update button text only if button exists
        if (this.playButton) {
            this.playButton.text(this.isPlaying ? 'Pause' : 'Play');
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
            
            // Update button text only if button exists
            if (this.playButton) {
                this.playButton.text('Play');
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
            .attr('x', -240)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', '700')
            .style('fill', '#d97706');
        
        // Add team logo placeholder (circle with icon)
        teamEntriesEnter.append('circle')
            .attr('class', 'team-logo')
            .attr('r', 14)
            .attr('cx', -200)
            .style('fill', 'rgba(217, 119, 6, 0.1)')
            .style('stroke', '#d97706')
            .style('stroke-width', '2px');
        
        // Add trophy icon inside the circle
        teamEntriesEnter.append('text')
            .attr('class', 'team-icon')
            .attr('x', -200)
            .attr('y', 0)
            .attr('dy', '0.35em')
            .style('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', '#d97706')
            .text('🏆');
        
        // Add team name label
        teamEntriesEnter.append('text')
            .attr('class', 'team-label')
            .attr('x', -175)
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
}

// Export for use in other modules
window.ChartEngine = ChartEngine; 