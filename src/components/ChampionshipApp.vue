<template>
  <div id="app">
    <!-- Enhanced Professional Championship Header -->
    <div class="championship-header">
      <div class="header-background">
        <div class="glow-orb glow-orb-1"></div>
        <div class="glow-orb glow-orb-2"></div>
        <div class="glow-orb glow-orb-3"></div>
      </div>
      
      <div class="header-content">
        <!-- Championship Icon -->
        <div class="championship-logo">
          <span class="logo-icon">🏆</span>
          <div class="logo-particles"></div>
        </div>
        
        <!-- Main Title -->
        <div class="championship-title">
          <h1 class="title-main">ALGS Year 4 Championship</h1>
        </div>
        
        <!-- Tournament Details (Horizontal) -->
        <div class="tournament-info-horizontal">
          <div class="info-item">
            <span class="info-icon">📍</span>
            <span class="info-text">Sapporo, Japan</span>
          </div>
          <div class="info-separator">•</div>
          <div class="info-item">
            <span class="info-icon">📅</span>
            <span class="info-text">Jan 29 - Feb 2, 2025</span>
          </div>
          <div class="info-separator">•</div>
          <div class="info-item">
            <span class="info-icon">⚔️</span>
            <span class="info-text">40 Teams</span>
          </div>
        </div>
        
        <!-- Navigation Links -->
        <div class="nav-links">
          <a href="index.html" class="nav-link">🏠 ALGS Dashboard</a>
        </div>
      </div>
    </div>

    <div class="mega-container">
      <!-- Tournament Overview Section -->
      <div class="tournament-overview">
        <div class="overview-header">
          <h1 class="overview-title">Tournament Overview</h1>
          <div class="day-selector">
            <button 
              v-for="day in tournamentDays" 
              :key="day.id"
              :class="['day-tab', { active: selectedDay === day.id }]"
              @click="selectDay(day.id)"
            >
              {{ day.name }}
            </button>
          </div>
        </div>

        <transition name="fade" mode="out-in">
          <div :key="selectedDay" class="day-content active">
            <p style="color: #cbd5e1; margin-bottom: 20px;">{{ currentDayInfo.description }}</p>
            
            <div class="matchups-grid">
              <div 
                v-for="matchup in currentDayMatchups" 
                :key="matchup.id"
                :class="['matchup-card', { selected: selectedMatchup === matchup.id }]"
                @click="selectMatchup(matchup.id)"
              >
                <div class="matchup-header">
                  <h3 class="matchup-title">{{ matchup.title }}</h3>
                  <span :class="['matchup-status', getStatusClass(matchup.id)]">
                    {{ getStatusText(matchup.id) }}
                  </span>
                </div>
                <p class="matchup-info">{{ matchup.description }}</p>
                <div class="matchup-stats">
                  <div class="stat-item">
                    <span>👥</span>
                    <span>{{ matchup.teams }} Teams</span>
                  </div>
                  <div class="stat-item">
                    <span>🎮</span>
                    <span>{{ matchup.games }} Games</span>
                  </div>
                  <div class="stat-item">
                    <span>🗺️</span>
                    <span>{{ matchup.maps }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- Chart Section -->
      <div class="chart-section">
        <div v-if="!selectedMatchup" class="no-selection">
          <div class="no-selection-icon">📊</div>
          <h3>Select a matchup to view the interactive chart</h3>
          <p>Choose from the tournament matchups above to see detailed race charts with game-by-game progression.</p>
        </div>

        <template v-else>
          <div class="chart-display">
            <!-- Chart Container with proper ID for ChartEngine -->
            <div class="chart-header">
              <h3 class="chart-title">{{ getMatchupTitle(selectedMatchup) }}</h3>
              <div class="chart-info">
                <span v-if="currentMap">Map: {{ currentMap }}</span>
                <span v-if="maxGames">Games: {{ maxGames }}</span>
              </div>
            </div>
            
            <div class="chart-area">
              <div id="vue-chart-container"></div>
              <transition name="fade">
                <div v-if="isLoading" class="loading-overlay">
                  <div class="loading-spinner"></div>
                </div>
              </transition>

              <!-- Enhanced GSAP-powered Draggable Action Panel -->
              <div v-if="chartEngine" 
                   ref="actionPanel"
                   class="enhanced-action-panel"
                   :class="{ expanded: panelExpanded }">
                
                <div class="panel-header">
                  <div class="panel-title">
                    <span class="drag-handle">⋮⋮ Drag Anywhere ⋮⋮</span>
                    Enhanced Controls
                  </div>
                  <button class="expand-btn" @click="togglePanel" @mousedown.stop>
                    {{ panelExpanded ? '−' : '+' }}
                  </button>
                </div>

                <!-- Always visible: Game Progress and Controls -->
                <div class="compact-status">
                  <!-- Game Progress (always visible) -->
                  <div class="game-progress-section">
                    <label class="section-label">Game Progress: {{ currentGame }} / {{ maxGames }}</label>
                    <div class="progress-container">
                      <span class="progress-value">{{ currentGame }}</span>
                      <input type="range" 
                             :min="1" 
                             :max="maxGames" 
                             v-model.number="currentGame"
                             @input="updateGameFromSlider"
                             @change="updateGameFromSlider"
                             @mousedown="startSliderControl"
                             @mouseup="endSliderControl"
                             @touchstart="startSliderControl"
                             @touchend="endSliderControl"
                             class="progress-slider">
                      <span class="progress-value">{{ maxGames }}</span>
                    </div>
                  </div>

                  <!-- Quick Controls (Play/Reset) -->
                  <div class="quick-controls">
                    <button @click="togglePlayback" class="control-btn play-btn">
                      {{ isPlaying ? 'Pause' : 'Play' }}
                    </button>
                    <button @click="restart" class="control-btn">
                      Reset
                    </button>
                  </div>

                  <!-- Current Map Info -->
                  <div class="current-map-display">
                    <div class="map-badge" :style="getCurrentMapStyle()">
                      <span class="map-icon">🗺️</span>
                      <span class="map-name">{{ currentMap || 'Loading...' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Expanded Controls (Game Filtering & Export) -->
                <transition name="slide-down">
                  <div v-if="panelExpanded" class="expanded-controls" @mousedown.stop>
                    <!-- Game Filtering -->
                    <div class="control-section">
                      <label class="section-label">🎮 Game {{ currentGame }} / {{ maxGames }}</label>
                      <div class="game-filter-buttons">
                        <button v-for="game in maxGames" 
                                :key="game"
                                @click="toggleGameFilter(game)"
                                class="game-filter-btn"
                                :class="{ 
                                  active: selectedGames.includes(game),
                                  current: game === currentGame 
                                }"
                                :style="getGameButtonStyle(game)">
                          {{ game }}
                        </button>
                      </div>
                      <div class="filter-action-buttons">
                        <button @click="resetGameFilter" class="reset-filter-btn">
                          Clear
                        </button>
                      </div>
                    </div>

                    <!-- Export Controls -->
                    <div class="control-section">
                      <label class="section-label">Export Data</label>
                      <button @click="exportData" :disabled="!chartEngine" class="export-btn">
                        📊 Export CSV
                      </button>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { GSAPDraggableManager } from '../utils/GSAPDraggableManager.js'

export default {
  name: 'ChampionshipApp',
  
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
    if (GSAPDraggableManager) {
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
      
      // Check if GSAP is available
      if (typeof gsap === 'undefined') {
        console.warn('⚠️ GSAP not available - header animations disabled');
        return;
      }
      
      // Set initial states
      gsap.set(['.championship-logo', '.championship-title', '.tournament-info-horizontal', '.nav-links'], {
        opacity: 0,
        y: 30
      });
      
      // Animate elements in sequence
      const tl = gsap.timeline();
      
      tl.to('.championship-logo', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      })
      .to('.championship-title', {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      }, '-=0.3')
      .to('.tournament-info-horizontal', {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out'
      }, '-=0.2')
      .to('.nav-links', {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
      }, '-=0.1');
    },
    
    selectDay(dayId) {
      console.log('📅 Selected day:', dayId);
      this.selectedDay = dayId;
      
      // Clear selection when switching days
      this.selectedMatchup = '';
      this.chartEngine = null;
    },
    
    async selectMatchup(matchupId) {
      console.log('🎯 Selected matchup:', matchupId);
      this.selectedMatchup = matchupId;
      await this.loadMatchup();
    },
    
    getStatusClass(matchupId) {
      if (this.loadedMatchups.has(matchupId)) return 'loaded';
      if (this.loadingMatchups.has(matchupId)) return 'loading';
      return 'available';
    },
    
    getStatusText(matchupId) {
      if (this.loadedMatchups.has(matchupId)) return 'Loaded';
      if (this.loadingMatchups.has(matchupId)) return 'Loading...';
      return 'Available';
    },
    
    getMatchupTitle(matchupId) {
      const matchup = this.tournamentDays.flatMap(day => day.matchups).find(m => m.id === matchupId);
      return matchup ? matchup.title : 'Unknown Matchup';
    },
    
    async loadMatchup() {
      if (!this.selectedMatchup) return;
      
      this.isLoading = true;
      this.loadingMatchups.add(this.selectedMatchup);
      
      try {
        console.log('📊 Loading matchup:', this.selectedMatchup);
        
        // Initialize chart engine
        this.chartEngine = await window.chartManager.ensureChartEngine('vue-chart-container');
        
        // Render chart with selected matchup
        await this.chartEngine.renderChart({
          matchup: this.selectedMatchup
        });
        
        // Update game state
        this.maxGames = this.chartEngine.maxGames || 6;
        this.currentGame = this.chartEngine.currentGameIndex || 1;
        this.updateCurrentMap();
        
        // Mark as loaded
        this.loadedMatchups.add(this.selectedMatchup);
        this.loadingMatchups.delete(this.selectedMatchup);
        
        console.log('✅ Matchup loaded successfully');
        
        // Verify chart rendered
        await this.verifyChartRender();
        
      } catch (error) {
        console.error('❌ Error loading matchup:', error);
        this.showChartError(error);
        this.loadingMatchups.delete(this.selectedMatchup);
      } finally {
        this.isLoading = false;
      }
    },
    
    async verifyChartRender() {
      // Add a small delay to ensure chart is fully rendered
      return new Promise(resolve => {
        const checkRender = () => {
          const container = document.getElementById('vue-chart-container');
          if (container && container.children.length > 0) {
            console.log('✅ Chart render verified');
            resolve();
          } else {
            console.log('⏳ Waiting for chart render...');
            setTimeout(checkRender, 100);
          }
        };
        checkRender();
      });
    },
    
    showChartError(error) {
      this.errorMessage = error.message;
      console.error('Chart error:', error);
      
      // Show error in chart container
      const container = document.getElementById('vue-chart-container');
      if (container) {
        container.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            height: 400px;
            color: #fca5a5;
            font-size: 1.2rem;
            text-align: center;
            background: rgba(220, 38, 38, 0.1);
            border: 1px solid #dc2626;
            border-radius: 8px;
            padding: 20px;
            margin: 20px;
          ">
            <div>
              <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
              <div>Failed to load chart: ${error.message}</div>
              <div style="font-size: 0.9rem; margin-top: 10px; opacity: 0.8;">
                Try refreshing the page or selecting a different matchup
              </div>
            </div>
          </div>
        `;
      }
    },
    
    togglePanel() {
      this.panelExpanded = !this.panelExpanded;
      
      // Animate panel expansion
      if (typeof gsap !== 'undefined') {
        if (this.panelExpanded) {
          gsap.to(this.$refs.actionPanel, {
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      }
    },
    
    initGSAPDraggable() {
      if (!this.$refs.actionPanel || !GSAPDraggableManager) return;
      
      const panelElement = this.$refs.actionPanel;
      const panelId = panelElement.id || `action-panel-${Date.now()}`;
      panelElement.id = panelId;
      
      // Initialize draggable with GSAP manager
      this.draggableInstance = GSAPDraggableManager.initializeDraggable(panelElement, {
        onDrag: () => this.isDragging = true,
        onDragEnd: () => {
          setTimeout(() => this.isDragging = false, 100);
        }
      });
    },
    
    updateGameFromSlider() {
      if (this.chartEngine) {
        this.chartEngine.currentGameIndex = this.currentGame;
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
      if (this.chartEngine) {
        this.currentMap = this.chartEngine.getCurrentMap();
      }
    },
    
    updateGameState() {
      if (this.chartEngine) {
        this.maxGames = this.chartEngine.maxGames || 6;
      }
    },
    
    toggleGameFilter(gameNum) {
      const index = this.selectedGames.indexOf(gameNum);
      if (index > -1) {
        this.selectedGames.splice(index, 1);
      } else {
        this.selectedGames.push(gameNum);
      }
      this.applyGameFilter();
    },
    
    resetGameFilter() {
      this.selectedGames = [];
      this.applyGameFilter();
    },
    
    applyGameFilter() {
      if (this.chartEngine) {
        if (this.selectedGames.length > 0) {
          this.chartEngine.filterByGames(this.selectedGames);
        } else {
          this.chartEngine.clearGameFilter();
        }
      }
    },
    
    getGameButtonStyle(gameNum) {
      if (!this.chartEngine) return {};
      
      const mapName = this.chartEngine.getMapForGame(gameNum);
      const mapColor = this.chartEngine.getMapColor(mapName, gameNum);
      
      const isActive = this.selectedGames.includes(gameNum);
      const isCurrent = gameNum === this.currentGame;
      
      if (isActive) {
        return {
          background: `linear-gradient(135deg, ${mapColor} 0%, ${this.adjustColor(mapColor, 20)} 100%)`,
          border: `2px solid ${mapColor}`,
          color: '#ffffff',
          transform: 'scale(1.05)',
          boxShadow: `0 0 15px ${mapColor}80, 0 4px 8px rgba(0,0,0,0.3)`
        };
      } else if (isCurrent) {
        return {
          background: `linear-gradient(135deg, ${mapColor}40 0%, ${this.adjustColor(mapColor, -20)}40 100%)`,
          border: `2px solid ${mapColor}`,
          color: '#f1f5f9',
          boxShadow: `0 0 10px ${mapColor}60, 0 2px 4px rgba(0,0,0,0.2)`
        };
      } else {
        return {
          background: `linear-gradient(135deg, ${mapColor}20 0%, ${this.adjustColor(mapColor, -30)}20 100%)`,
          border: `1px solid ${mapColor}60`,
          color: '#cbd5e1',
          boxShadow: `0 0 5px ${mapColor}40`
        };
      }
    },
    
    adjustColor(color, percent) {
      // Simple color adjustment - convert HSL values
      const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (hslMatch) {
        const [, h, s, l] = hslMatch;
        const newL = Math.max(0, Math.min(100, parseInt(l) + percent));
        return `hsl(${h}, ${s}%, ${newL}%)`;
      }
      return color;
    },
    
    getCurrentMapStyle() {
      if (!this.currentMap || !this.chartEngine) {
        return {
          background: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
          border: '2px solid #4b5563',
          color: '#d1d5db'
        };
      }
      
      const mapColor = this.chartEngine.getMapColor(this.currentMap);
      return {
        background: `linear-gradient(135deg, ${mapColor} 0%, ${this.adjustColor(mapColor, -20)} 100%)`,
        border: `2px solid ${mapColor}`,
        color: '#ffffff',
        boxShadow: `0 0 15px ${mapColor}60, 0 4px 8px rgba(0,0,0,0.3)`
      };
    },
    
    exportData() {
      if (this.chartEngine) {
        this.chartEngine.exportData(this.selectedMatchup);
      }
    },
    
    async forceReloadChart() {
      if (this.selectedMatchup) {
        console.log('🔄 Force reloading chart...');
        
        // Clean up existing chart
        if (this.chartEngine) {
          window.chartManager.cleanup('vue-chart-container');
        }
        
        // Reload
        await this.loadMatchup();
      }
    }
  },
  
  updated() {
    // Ensure GSAP draggable is initialized after updates
    if (this.chartEngine && this.$refs.actionPanel && !this.draggableInstance) {
      this.$nextTick(() => {
        this.initGSAPDraggable();
      });
    }
  },
  
  beforeUnmount() {
    if (this.gameStateInterval) {
      clearInterval(this.gameStateInterval);
    }
    
    if (this.$refs.actionPanel && this.$refs.actionPanel.id && GSAPDraggableManager) {
      GSAPDraggableManager.destroyDraggable(this.$refs.actionPanel.id);
    }
    
    if (this.draggableInstance && this.draggableInstance.cleanup) {
      this.draggableInstance.cleanup();
    }
  }
}
</script>

<!-- No scoped styles needed as the CSS is already in championship.css --> 