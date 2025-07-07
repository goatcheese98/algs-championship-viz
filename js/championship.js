// Enhanced GSAP Draggable System for Consistent Performance
const GSAPDraggableManager = {
    instances: new Map(),
    
    // Initialize GSAP dragging for a panel
    initializeDraggable(panelElement, options = {}) {
        const panelId = panelElement.id || 'enhanced-panel-' + Date.now();
        
        // Clean up existing instance
        this.destroyDraggable(panelId);
        
        console.log(`🎯 Initializing GSAP draggable for: ${panelId}`);
        
        try {
            // Register GSAP plugins
            gsap.registerPlugin(Draggable);
            
            // Enhanced trigger selection with fallback hierarchy
            let dragHandle = panelElement.querySelector('.panel-header, .enhanced-action-panel > div:first-child, .drag-handle');
            
            // If no specific handle found, use the panel itself but avoid interactive elements
            if (!dragHandle) {
                dragHandle = panelElement;
                console.log('⚠️ Using entire panel as drag handle - this might cause interaction issues');
            }
            
            console.log('🎯 Using drag handle:', dragHandle?.className || 'entire panel');
            
            // Create ultra-smooth GSAP draggable instance with enhanced configuration
            const draggableInstance = Draggable.create(panelElement, {
                type: "x,y",
                trigger: dragHandle,
                
                // Momentum and physics
                inertia: true,
                edgeResistance: 0.65,
                dragResistance: 0,
                
                // Advanced performance settings
                force3D: true,
                allowEventDefault: false,
                allowContextMenu: true,
                autoScroll: false,
                
                // Interaction filtering to avoid conflicts with buttons/inputs
                clickableTest: (element) => {
                    // Prevent dragging when clicking on interactive elements
                    return !element.closest('.control-btn, .progress-slider, .expand-btn, button, input, select, textarea, [data-no-drag]');
                },
                
                onPress: () => {
                    console.log('🎯 GSAP drag press detected');
                    // Immediate visual feedback on press
                    gsap.set(panelElement, { 
                        cursor: 'grabbing',
                        userSelect: 'none',
                        scale: 1.02,
                        zIndex: 9999
                    });
                },
                
                onDragStart: () => {
                    console.log('🎯 GSAP drag started');
                    // Enhanced visual feedback during drag
                    gsap.set(panelElement, { 
                        boxShadow: "0 25px 50px rgba(0,0,0,0.5), 0 0 30px rgba(217, 119, 6, 0.3)",
                        filter: "brightness(1.15) drop-shadow(0 0 10px rgba(217, 119, 6, 0.4))",
                        scale: 1.05
                    });
                },
                
                onDrag: () => {
                    // Minimal drag processing for maximum performance
                    // Just maintain the enhanced visual state
                },
                
                onDragEnd: () => {
                    console.log('📍 GSAP drag completed');
                    // Smooth transition back to normal state
                    gsap.to(panelElement, {
                        duration: 0.3,
                        ease: "power2.out",
                        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(217, 119, 6, 0.1)",
                        filter: "brightness(1)",
                        scale: 1,
                        cursor: 'grab',
                        userSelect: '',
                        zIndex: 1000
                    });
                },
                
                onRelease: () => {
                    console.log('📍 GSAP drag released');
                    // Ensure cursor returns to normal even on release without drag
                    gsap.set(panelElement, { 
                        cursor: 'grab',
                        userSelect: ''
                    });
                }
            })[0]; // Get first (and only) instance
            
            // Validate draggable instance creation
            if (!draggableInstance) {
                throw new Error('Failed to create GSAP Draggable instance');
            }
            
            // Set initial optimizations and accessibility
            gsap.set(panelElement, {
                cursor: 'grab',
                userSelect: 'none',
                willChange: 'transform',
                force3D: true, // Hardware acceleration
                transformOrigin: 'center center'
            });
            
            // Add data attributes for better interaction filtering
            panelElement.setAttribute('data-draggable', 'true');
            
            // Mark interactive elements to prevent drag conflicts
            const interactiveElements = panelElement.querySelectorAll('.control-btn, .progress-slider, .expand-btn, button, input, select, textarea');
            interactiveElements.forEach(el => el.setAttribute('data-no-drag', 'true'));
            
            // Store instance for cleanup
            const instance = {
                element: panelElement,
                gsapInstance: draggableInstance,
                cleanup: () => {
                    if (draggableInstance) {
                        draggableInstance.kill();
                    }
                    // Reset styles
                    gsap.set(panelElement, {
                        cursor: '',
                        userSelect: '',
                        willChange: '',
                        transform: '',
                        zIndex: '',
                        clearProps: 'all'
                    });
                }
            };
            
            this.instances.set(panelId, instance);
            console.log(`⚡ GSAP draggable initialized successfully for: ${panelId}`);
            
            return instance;
            
        } catch (error) {
            console.error('❌ Error initializing GSAP draggable:', error);
            return null;
        }
    },
    
    // Clean up draggable instance
    destroyDraggable(panelId) {
        if (this.instances.has(panelId)) {
            const instance = this.instances.get(panelId);
            if (instance && instance.cleanup) {
                instance.cleanup();
            }
            this.instances.delete(panelId);
            console.log(`🗑️ Cleaned up GSAP draggable: ${panelId}`);
        }
    },
    
    // Cleanup all instances
    destroyAll() {
        this.instances.forEach((instance, panelId) => {
            this.destroyDraggable(panelId);
        });
        console.log('🧹 All GSAP draggable instances cleaned up');
    },
    
    // Get status of all instances
    getStatus() {
        const status = {};
        this.instances.forEach((instance, panelId) => {
            status[panelId] = {
                active: !!instance,
                element: instance ? instance.element : null,
                gsapInstance: instance ? instance.gsapInstance : null
            };
        });
        return status;
    }
};

// Make manager globally available
window.GSAPDraggableManager = GSAPDraggableManager;

// Enhanced GSAP Draggable Initialization Function for Vue Components
function initializeEnhancedDraggable(panelRef) {
    if (!panelRef) {
        console.warn('Panel ref not available for GSAP draggable initialization');
        return null;
    }
    
    // Add unique ID if not present
    if (!panelRef.id) {
        panelRef.id = 'enhanced-panel-' + Math.random().toString(36).substr(2, 9);
    }
    
    const instance = GSAPDraggableManager.initializeDraggable(panelRef);
    
    if (instance) {
        console.log('⚡ Enhanced GSAP draggable initialized successfully');
    } else {
        console.error('❌ Failed to initialize GSAP draggable');
    }
    
    return instance;
}

// Global cleanup function
function cleanupAllDraggables() {
    if (window.GSAPDraggableManager) {
        window.GSAPDraggableManager.destroyAll();
    }
}

// Make functions globally available
window.initializeEnhancedDraggable = initializeEnhancedDraggable;
window.cleanupAllDraggables = cleanupAllDraggables;

// Vue.js Application
const ChampionshipApp = {
    data() {
        console.log('📋 ChampionshipApp data() called - Vue is initializing');
        return {
            // Tournament structure
            selectedDay: 'day1',
            tournamentDays: [
                {
                    id: 'day1',
                    name: 'Day 1 - Group Stages',
                    description: 'Initial group stage matchups determining bracket positions for the tournament. Teams compete across E-District, Storm Point, and World\'s Edge.',
                    matchups: [
                        {
                            id: 'AvsB',
                            title: 'Group A vs Group B',
                            description: 'Opening group stage matchup featuring teams from Groups A and B. 6 games across E-District (2), Storm Point (2), and World\'s Edge (2).',
                            teams: 20,
                            games: 6,
                            maps: 'E-District → Storm Point → World\'s Edge'
                        },
                        {
                            id: 'CvsD',
                            title: 'Group C vs Group D',
                            description: 'Second group stage matchup with teams from Groups C and D. Same map rotation as A vs B for fair competition.',
                            teams: 20,
                            games: 6,
                            maps: 'E-District → Storm Point → World\'s Edge'
                        },
                        {
                            id: 'BvsD',
                            title: 'Group B vs Group D',
                            description: 'Cross-group matchup between Groups B and D. Rotated map order starting with Storm Point for strategic variety.',
                            teams: 20,
                            games: 6,
                            maps: 'Storm Point → World\'s Edge → E-District'
                        }
                    ]
                },
                {
                    id: 'day2',
                    name: 'Day 2 - Cross Groups',
                    description: 'Cross-group matchups determining final bracket seeding. Advanced map rotations test team adaptability.',
                    matchups: [
                        {
                            id: 'AvsC',
                            title: 'Group A vs Group C',
                            description: 'Day 2 cross-group matchup between Groups A and C. 6 games with E-District focus.',
                            teams: 20,
                            games: 6,
                            maps: 'E-District → Storm Point → World\'s Edge'
                        },
                        {
                            id: 'BvsC',
                            title: 'Group B vs Group C',
                            description: 'Strategic cross-group battle between Groups B and C. Storm Point opening rotation.',
                            teams: 20,
                            games: 6,
                            maps: 'Storm Point → World\'s Edge → E-District'
                        },
                        {
                            id: 'AvsD',
                            title: 'Group A vs Group D',
                            description: 'Final day 2 matchup between Groups A and D. Classic E-District to World\'s Edge progression.',
                            teams: 20,
                            games: 6,
                            maps: 'E-District → Storm Point → World\'s Edge'
                        }
                    ]
                },
                {
                    id: 'day3',
                    name: 'Day 3 - Elimination Rounds',
                    description: 'High-stakes elimination rounds where teams fight for tournament survival. Extended 8-game series with diverse map pools.',
                    matchups: [
                        {
                            id: 'ER1',
                            title: 'Elimination Round 1',
                            description: 'First elimination round featuring 8 intense games. Heavy E-District focus with World\'s Edge finale.',
                            teams: 20,
                            games: 8,
                            maps: 'E-District (3) → Storm Point (2) → World\'s Edge (3)'
                        }
                    ]
                },
                {
                    id: 'day4',
                    name: 'Day 4 - Finals',
                    description: 'Championship finals featuring the ultimate competition. Winners and elimination rounds determine the ALGS Champion.',
                    matchups: [
                        {
                            id: 'ER2',
                            title: 'Elimination Round 2',
                            description: 'Second elimination round with 8 crucial games. Balanced map rotation for fair competition.',
                            teams: 20,
                            games: 8,
                            maps: 'Storm Point (2) → World\'s Edge (2) → E-District (2) → Mixed (2)'
                        },
                        {
                            id: 'WR1',
                            title: 'Winners Round 1',
                            description: 'Winners bracket final featuring the top teams. 8 games across all three maps for ultimate victory.',
                            teams: 20,
                            games: 8,
                            maps: 'World\'s Edge (2) → E-District (2) → Storm Point (2) → Mixed (2)'
                        }
                    ]
                }
            ],

            // Chart state
            selectedMatchup: '',
            chartEngine: null,
            isLoading: false,
            isPlaying: false,
            errorMessage: '',
            
            // Game state for enhanced panel
            currentGame: 1,
            maxGames: 6,
            currentMap: '',
            manualSliderControl: false,
            
            // Enhanced Action Panel (GSAP-optimized)
            panelExpanded: false,
            isDragging: false,
            selectedGames: [],
            
            // GSAP instances
            draggableInstance: null,
            
            // Status tracking
            loadedMatchups: new Set(),
            loadingMatchups: new Set()
        }
    },
    computed: {
        availableMatchups() {
            return this.tournamentDays.flatMap(day => 
                day.matchups.map(matchup => ({
                    value: matchup.id,
                    label: matchup.title
                }))
            );
        },
        
        currentDayMatchups() {
            const currentDay = this.tournamentDays.find(day => day.id === this.selectedDay);
            return currentDay ? currentDay.matchups : [];
        },
        
        currentDayInfo() {
            return this.tournamentDays.find(day => day.id === this.selectedDay) || {};
        }
    },
    mounted() {
        console.log('🎯 ChampionshipApp mounted() called - Vue component is ready');
        // Initialize professional header animations with GSAP
        this.initializeHeaderAnimations();
        
        // Initialize GSAP dragging when DOM is ready
        this.$nextTick(() => {
            this.initGSAPDraggable();
        });
        
        // Verify centralized draggable manager is available
        if (window.GSAPDraggableManager) {
            console.log('✅ Centralized GSAP Draggable Manager detected and ready');
        } else {
            console.warn('⚠️ GSAP Draggable Manager not available - dragging may not work properly');
        }
        
        // Set up periodic updates for game state
        this.gameStateInterval = setInterval(() => {
            if (this.chartEngine) {
                const engineGameIndex = this.chartEngine.currentGameIndex || 1;
                
                if (Math.abs(this.currentGame - engineGameIndex) > 0 && !this.manualSliderControl) {
                    this.currentGame = engineGameIndex;
                }
                
                this.isPlaying = this.chartEngine.isPlaying || false;
                this.updateCurrentMap();
                this.updateGameState();
            }
        }, 300);
    },
    methods: {
        // Professional Championship Header Animations
        initializeHeaderAnimations() {
            console.log('🎭 Initializing professional header animations...');
            
            // Animate championship title entrance
            gsap.fromTo('.title-main', {
                y: -50,
                opacity: 0,
                scale: 0.8
            }, {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 1.2,
                ease: "back.out(1.7)",
                delay: 0.3
            });
            
            // Additional animations...
            console.log('✨ Professional header animations initialized successfully');
        },

        selectDay(dayId) {
            this.selectedDay = dayId;
            this.selectedMatchup = '';
            
            if (window.chartManager) {
                window.chartManager.cleanup('vue-chart-container');
                console.log('🧹 Centralized chart cleanup completed for day switch');
            }
            
            this.chartEngine = null;
            this.currentGame = 1;
            this.maxGames = 6;
            this.currentMap = '';
            this.selectedGames = [];
            this.isPlaying = false;
            this.isLoading = false;
            this.errorMessage = '';
            
            this.loadedMatchups.clear();
            this.loadingMatchups.clear();
            
            console.log(`✅ Switched to ${dayId} with centralized management`);
        },
        
        selectMatchup(matchupId) {
            this.selectedMatchup = matchupId;
            this.loadMatchup();
        },
        
        getStatusClass(matchupId) {
            if (this.loadingMatchups.has(matchupId)) return 'status-loading';
            if (this.loadedMatchups.has(matchupId)) return 'status-loaded';
            return 'status-available';
        },
        
        getStatusText(matchupId) {
            if (this.loadingMatchups.has(matchupId)) return 'Loading...';
            if (this.loadedMatchups.has(matchupId)) return 'Loaded';
            return 'Available';
        },
        
        getMatchupTitle(matchupId) {
            const matchup = this.availableMatchups.find(m => m.value === matchupId);
            return matchup ? matchup.label : 'ALGS Championship Chart';
        },
        
        async loadMatchup() {
            if (!this.selectedMatchup) return;
            
            this.isLoading = true;
            this.loadingMatchups.add(this.selectedMatchup);
            this.errorMessage = '';
            
            try {
                console.log('🚀 Starting centralized chart loading for:', this.selectedMatchup);
                
                this.chartEngine = await window.chartManager.ensureChartEngine('vue-chart-container', {
                    transitionDuration: 1500,
                    holdDuration: 800
                });
                
                console.log('✅ ChartEngine ready via ChartManager');
                
                const csvFile = `data/${this.selectedMatchup}_points.csv`;
                await this.chartEngine.loadData(csvFile);
                
                await this.verifyChartRender();
                this.updateGameState();
                
                setTimeout(() => {
                    this.currentGame = this.chartEngine.currentGameIndex || 1;
                    this.updateCurrentMap();
                }, 200);
                
                this.loadedMatchups.add(this.selectedMatchup);
                
                console.log('🎉 Chart loaded successfully for', this.selectedMatchup);
                
            } catch (error) {
                console.error('💥 Error loading chart:', error);
                this.errorMessage = `Failed to load chart: ${error.message}`;
                this.showChartError(error);
                
            } finally {
                this.isLoading = false;
                this.loadingMatchups.delete(this.selectedMatchup);
            }
        },
        
        async verifyChartRender() {
            return new Promise((resolve, reject) => {
                let attempts = 0;
                const maxAttempts = 10;
                const checkInterval = 100;
                
                const checkRender = () => {
                    const container = document.getElementById('vue-chart-container');
                    if (container && container.children.length > 0) {
                        console.log('✅ Chart render verified');
                        resolve();
                        return;
                    }
                    
                    attempts++;
                    if (attempts >= maxAttempts) {
                        reject(new Error('Chart failed to render within expected time'));
                        return;
                    }
                    
                    setTimeout(checkRender, checkInterval);
                };
                
                checkRender();
            });
        },

        showChartError(error) {
            const chartContainer = document.getElementById('vue-chart-container');
            if (chartContainer) {
                chartContainer.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 400px; color: #ef4444; font-size: 1.2rem; text-align: center; padding: 20px;">
                        <div>
                            <div style="font-size: 3rem; margin-bottom: 10px;">⚠️</div>
                            <div style="font-weight: bold; margin-bottom: 10px;">Chart Loading Failed</div>
                            <div style="font-size: 1rem; margin-bottom: 15px; opacity: 0.9;">${error.message}</div>
                            <div style="font-size: 0.9rem; margin-bottom: 10px; opacity: 0.7;">Expected file: ${this.selectedMatchup}_points.csv</div>
                            <button onclick="location.reload()" style="background: #dc2626; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">
                                🔄 Reload Page
                            </button>
                        </div>
                    </div>
                `;
            }
        },

        // Enhanced Action Panel Methods
        togglePanel() {
            this.panelExpanded = !this.panelExpanded;
            
            if (this.$refs.actionPanel) {
                gsap.to(this.$refs.actionPanel, {
                    scale: this.panelExpanded ? 1.05 : 1,
                    duration: 0.3,
                    ease: "back.out(1.2)"
                });
            }
        },
        
        initGSAPDraggable() {
            if (!this.$refs.actionPanel) {
                console.warn('Action panel ref not available');
                return;
            }
            
            console.log('🔧 Initializing GSAP draggable...');
            this.draggableInstance = initializeEnhancedDraggable(this.$refs.actionPanel);
            
            if (this.draggableInstance) {
                console.log('⚡ GSAP draggable initialized successfully');
            } else {
                console.error('❌ Failed to initialize GSAP draggable');
            }
        },
        
        // Game control methods
        updateGameFromSlider() {
            if (this.chartEngine) {
                const gameIndex = parseInt(this.currentGame);
                this.chartEngine.currentGameIndex = gameIndex;
                this.chartEngine.updateChart();
                this.updateCurrentMap();
            }
        },

        startSliderControl() {
            this.manualSliderControl = true;
        },

        endSliderControl() {
            setTimeout(() => {
                this.manualSliderControl = false;
            }, 100);
        },
        
        togglePlayback() {
            if (this.chartEngine) {
                this.chartEngine.togglePlayback();
                this.isPlaying = this.chartEngine.isPlaying;
                
                setTimeout(() => {
                    this.currentGame = this.chartEngine.currentGameIndex || 1;
                    this.updateCurrentMap();
                }, 50);
            }
        },
        
        restart() {
            if (this.chartEngine) {
                this.chartEngine.restart();
                this.currentGame = 1;
                this.isPlaying = false;
                this.updateCurrentMap();
            }
        },

        updateCurrentMap() {
            if (this.chartEngine && this.selectedMatchup) {
                const mapSequence = window.MapSequences && window.MapSequences[this.selectedMatchup];
                if (mapSequence && mapSequence.maps) {
                    this.currentMap = mapSequence.maps[this.currentGame] || 'Unknown';
                } else {
                    this.currentMap = this.chartEngine.getCurrentMap();
                }
            }
        },

        updateGameState() {
            if (this.chartEngine && this.chartEngine.data) {
                const gameColumns = Object.keys(this.chartEngine.data[0] || {})
                    .filter(key => key.startsWith('Game') && key !== 'Game')
                    .length;
                this.maxGames = Math.max(gameColumns, 6);
                
                this.updateCurrentMap();
            }
        },

        // Game filtering methods
        toggleGameFilter(gameNum) {
            const index = this.selectedGames.indexOf(gameNum);
            if (index === -1) {
                this.selectedGames.push(gameNum);
            } else {
                this.selectedGames.splice(index, 1);
            }
            this.applyGameFilter();
        },
        
        resetGameFilter() {
            this.selectedGames = [];
            this.applyGameFilter();
        },
        
        applyGameFilter() {
            if (!this.chartEngine) return;
            
            if (this.selectedGames.length > 0) {
                this.chartEngine.filterByGames(this.selectedGames);
            } else {
                this.chartEngine.clearGameFilter();
            }
        },

        getGameButtonStyle(gameNum) {
            if (!this.chartEngine || !this.selectedMatchup) return {};
            
            const mapSequence = window.MapSequences && window.MapSequences[this.selectedMatchup];
            if (!mapSequence || !mapSequence.maps || !mapSequence.maps[gameNum]) {
                return {};
            }
            
            const mapName = mapSequence.maps[gameNum];
            
            let occurrenceCount = 0;
            for (let i = 1; i <= gameNum; i++) {
                if (mapSequence.maps[i] === mapName) {
                    occurrenceCount++;
                }
            }
            
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
            };
            
            const scheme = colorSchemes[mapName];
            const mapColor = (scheme && scheme[occurrenceCount]) ? scheme[occurrenceCount] : '#d97706';
            
            if (this.selectedGames.includes(gameNum)) {
                return {
                    backgroundColor: mapColor,
                    borderColor: mapColor,
                    color: 'white',
                    fontWeight: '700',
                    transform: 'scale(1.1)',
                    boxShadow: `0 0 10px ${mapColor}`
                };
            } else if (this.currentGame === gameNum) {
                return {
                    backgroundColor: `${mapColor}40`,
                    borderColor: mapColor,
                    color: mapColor,
                    fontWeight: '600'
                };
            }
            
            return {
                backgroundColor: 'rgba(75, 85, 99, 0.6)',
                borderColor: `${mapColor}60`,
                color: `${mapColor}cc`
            };
        },

        getCurrentMapStyle() {
            if (!this.selectedMatchup) return {};
            
            const mapSequence = window.MapSequences && window.MapSequences[this.selectedMatchup];
            if (!mapSequence || !mapSequence.maps) return {};
            
            const currentMapName = mapSequence.maps[this.currentGame];
            if (!currentMapName) return {};
            
            let occurrenceCount = 0;
            for (let i = 1; i <= this.currentGame; i++) {
                if (mapSequence.maps[i] === currentMapName) {
                    occurrenceCount++;
                }
            }
            
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
            };
            
            const scheme = colorSchemes[currentMapName];
            const backgroundColor = (scheme && scheme[occurrenceCount]) ? scheme[occurrenceCount] : 'hsl(45, 100%, 60%)';
            
            return {
                background: backgroundColor,
                borderColor: backgroundColor,
                color: 'white',
                fontWeight: '700',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.9)',
                boxShadow: 'none'
            };
        },

        exportData() {
            if (this.chartEngine) {
                this.chartEngine.exportData(this.selectedMatchup);
            }
        },

        async forceReloadChart() {
            if (!this.selectedMatchup) return;
            
            try {
                if (window.chartManager) {
                    this.chartEngine = await window.chartManager.refreshInstance('vue-chart-container');
                    await this.chartEngine.loadData(`data/${this.selectedMatchup}_points.csv`);
                    this.updateGameState();
                }
            } catch (error) {
                this.showChartError(error);
            }
        }
    },
    
    updated() {
        this.$nextTick(() => {
            if (this.$refs.actionPanel && !this.draggableInstance) {
                this.initGSAPDraggable();
            }
        });
    },
    
    beforeUnmount() {
        if (this.gameStateInterval) {
            clearInterval(this.gameStateInterval);
        }
        
        if (this.$refs.actionPanel && this.$refs.actionPanel.id && window.GSAPDraggableManager) {
            window.GSAPDraggableManager.destroyDraggable(this.$refs.actionPanel.id);
        }
        
        if (this.draggableInstance && this.draggableInstance.cleanup) {
            this.draggableInstance.cleanup();
        }
    }
};

// Export for use
window.ChampionshipApp = ChampionshipApp;

// Initialize Vue.js Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Vue.js Championship App...');
    
    // Check if Vue is available
    if (typeof Vue === 'undefined') {
        console.error('❌ Vue.js is not loaded! Please check your script tags.');
        return;
    }
    
    // Mount the Vue app to the #app element using CDN Vue
    const app = Vue.createApp(ChampionshipApp);
    
    // Mount the app
    try {
        app.mount('#app');
        console.log('✅ Vue.js Championship App mounted successfully!');
    } catch (error) {
        console.error('❌ Failed to mount Vue.js app:', error);
        
        // Fallback: try mounting after a short delay
        setTimeout(() => {
            try {
                const retryApp = Vue.createApp(ChampionshipApp);
                retryApp.mount('#app');
                console.log('✅ Vue.js Championship App mounted successfully on retry!');
            } catch (retryError) {
                console.error('❌ Failed to mount Vue.js app on retry:', retryError);
            }
        }, 100);
    }
});

// Alternative initialization for when DOM is already loaded
if (document.readyState === 'loading') {
    // Document is still loading, wait for DOMContentLoaded
    console.log('⏳ Waiting for DOM to finish loading...');
} else {
    // DOM is already loaded, initialize immediately
    console.log('✅ DOM already loaded, initializing Vue app...');
    
    if (typeof Vue !== 'undefined') {
        const app = Vue.createApp(ChampionshipApp);
        app.mount('#app');
        console.log('✅ Vue.js Championship App mounted successfully!');
    } else {
        console.error('❌ Vue.js is not available for immediate initialization');
    }
} 