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
        <div ref="championshipLogo" class="championship-logo">
          <span ref="logoIcon" class="logo-icon">🏆</span>
          <div ref="logoParticles" class="logo-particles"></div>
        </div>
        
        <!-- Main Title -->
        <div ref="championshipTitle" class="championship-title">
          <h1 ref="titleMain" class="title-main">{{ isYear5Tournament ? 'ALGS Year 5 Open' : 'ALGS Year 4 Championship' }}</h1>
        </div>
        
        <!-- Tournament Details (Horizontal) -->
        <div ref="tournamentInfo" class="tournament-info-horizontal">
          <div ref="infoItem1" class="info-item">
            <span ref="infoIcon1" class="info-icon">{{ isYear5Tournament ? '🌍' : '📍' }}</span>
            <span ref="infoText1" class="info-text">{{ isYear5Tournament ? 'Global Tournament' : 'Sapporo, Japan' }}</span>
          </div>
          <div ref="infoSeparator1" class="info-separator">•</div>
          <div ref="infoItem2" class="info-item">
            <span ref="infoIcon2" class="info-icon">📅</span>
            <span ref="infoText2" class="info-text">{{ isYear5Tournament ? 'Split 1 - 2025' : 'Jan 29 - Feb 2, 2025' }}</span>
          </div>
          <div ref="infoSeparator2" class="info-separator">•</div>
          <div ref="infoItem3" class="info-item">
            <span ref="infoIcon3" class="info-icon">⚔️</span>
            <span ref="infoText3" class="info-text">{{ isYear5Tournament ? '6 Tournament Rounds' : '40 Teams' }}</span>
          </div>
        </div>
        
        <!-- Navigation Links -->
        <div class="nav-links">
          <a href="index.html" class="nav-link">🏠 ALGS Dashboard</a>
          <a v-if="isYear5Tournament" href="year_4_championship.html" class="nav-link">🏆 Year 4 Champions</a>
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
          <!-- Optimized Vue.js + GSAP Chart Loading Animation -->
          <div ref="chartLoadingContainer" class="chart-loading-container">
            
            <!-- Central Glow Effect -->
            <div ref="centralGlow" class="central-glow"></div>
            
            <!-- Animated Chart Bars -->
            <div class="chart-bars-container">
              <div ref="chartBar1" class="chart-bar chart-bar-1"></div>
              <div ref="chartBar2" class="chart-bar chart-bar-2"></div>
              <div ref="chartBar3" class="chart-bar chart-bar-3"></div>
              <div ref="chartBar4" class="chart-bar chart-bar-4"></div>
              <div ref="chartBar5" class="chart-bar chart-bar-5"></div>
              
              <!-- Connecting Line -->
              <div ref="connectingLine" class="connecting-line"></div>
            </div>
            
            <!-- Rotating Outer Ring -->
            <div ref="outerRing" class="outer-ring">
              <div class="ring-circle"></div>
              <div class="ring-dot ring-dot-1"></div>
              <div class="ring-dot ring-dot-2"></div>
            </div>
            
            <!-- Inner Rotating Ring -->
            <div ref="innerRing" class="inner-ring">
              <div class="inner-ring-circle"></div>
              <div class="inner-ring-dot"></div>
            </div>
            
            <!-- Roaming Circles -->
            <div ref="roamingCircle1" class="roaming-circle roaming-circle-1"></div>
            <div ref="roamingCircle2" class="roaming-circle roaming-circle-2"></div>
            <div ref="roamingCircle3" class="roaming-circle roaming-circle-3"></div>
            <div ref="roamingCircle4" class="roaming-circle roaming-circle-4"></div>
            

            
            <!-- Scanning Effect -->
            <div ref="scanningLine" class="scanning-line"></div>
            
            <!-- Main Content -->
            <div class="loading-content">
              <h3 ref="mainHeading" class="loading-heading">
                Select a matchup to view the interactive chart
              </h3>
              <div class="loading-text-container">
                <p ref="subText1" class="loading-text">
                  Choose from the tournament matchups above to see detailed race charts with game-by-game progression.
                </p>
              </div>
            </div>
            
            <!-- Accent Line -->
            <div ref="accentLine" class="accent-line"></div>
            
            <!-- Corner Accents -->
            <div class="corner-accent corner-accent-tl"></div>
            <div class="corner-accent corner-accent-tr"></div>
            <div class="corner-accent corner-accent-bl"></div>
            <div class="corner-accent corner-accent-br"></div>
            
            <!-- Floating Data Points -->
            <div ref="floatingDot1" class="floating-dot floating-dot-1"></div>
            <div ref="floatingDot2" class="floating-dot floating-dot-2"></div>
            <div ref="floatingDot3" class="floating-dot floating-dot-3"></div>
            <div ref="floatingDot4" class="floating-dot floating-dot-4"></div>
            
          </div>
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
                    <span class="drag-handle">⋮⋮</span>
                    Controls
                  </div>
                  <button class="expand-btn" @click="togglePanel" @mousedown.stop>
                    {{ panelExpanded ? '−' : '+' }}
                  </button>
                </div>

                <!-- Always visible: Game Progress and Controls -->
                <div class="compact-status">
                  <!-- Game Progress (always visible) -->
                  <div class="game-progress-section">
                    <label class="section-label">Game Progress: {{ displayedProgress }} / {{ maxGames }}</label>
                    <div class="progress-container">
                      <span class="progress-value">0</span>
                      <input type="range" 
                             :min="0" 
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

                  <!-- Game Filter Controls (merged with progress) -->
                  <div class="filter-controls">
                    <div class="filter-row">
                      <div class="game-filter-buttons">
                        <button v-for="game in maxGames" 
                                :key="game"
                                @click="toggleGameFilter(game)"
                                class="game-filter-btn"
                                :class="{ 
                                  active: selectedGames.includes(game),
                                  current: game === currentGame 
                                }"
                                :style="getGameButtonStyle(game)"
                                :title="getGameTooltip(game)">
                          {{ game }}
                        </button>
                      </div>
                        <button @click="resetGameFilter" class="reset-filter-btn">
                        ✕
                        </button>
                      </div>
                    <div class="filter-action-label">Apply Filter</div>
                    </div>

                  <!-- Current Map Info -->
                  <div class="current-map-display">
                    <div class="map-badge" :style="getCurrentMapStyle()">
                      <span class="map-icon">🗺️</span>
                      <span class="map-name">{{ currentMap || 'Loading...' }}</span>
                    </div>
                  </div>

                  <!-- Quick Controls (Play/Reset) - Moved below map badge -->
                  <div class="quick-controls">
                    <button @click="togglePlayback" class="control-btn play-btn">
                      {{ isPlaying ? 'Pause' : 'Play' }}
                    </button>
                    <button @click="restart" class="control-btn">
                      Reset
                    </button>
                  </div>
                </div>

                <!-- Expanded Controls (Export Only) -->
                <transition name="slide-down">
                  <div v-if="panelExpanded" class="expanded-controls" @mousedown.stop>
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
import { ChartEngine } from '../chart/ChartEngine.js'
import { useTeamConfig } from '../composables/useTeamConfig.js'

export default {
  name: 'ChampionshipApp',
  
  setup() {
    // Initialize team configuration composable
    const teamConfig = useTeamConfig();
    
    // Return for template usage
    return {
      teamConfig
    };
  },
  
  data() {
    console.log('📋 ChampionshipApp data() called - Vue is initializing');
    
    // Detect tournament type from URL
    const currentPath = window.location.pathname;
    const isYear5 = currentPath.includes('year_5_open') || currentPath.includes('year5');
    
    console.log('🎯 Tournament Detection:', {
      currentPath,
      isYear5: isYear5,
      tournamentType: isYear5 ? 'Year 5 Open' : 'Year 4 Championship'
    });
    
    return {
      // Tournament detection
      isYear5Tournament: isYear5,
      
      // Tournament structure
      selectedDay: 'day1',
      tournamentDays: isYear5 ? [
        // ========================================
        // YEAR 5 OPEN TOURNAMENT STRUCTURE
        // ========================================
        {
          id: 'day1',
          name: 'Day 1 - Winners Round 1',
          description: 'Year 5 Open Winners Round 1 featuring 6 tournament rounds. All rounds use the same map rotation: E-District (2) → Storm Point (2) → World\'s Edge (2).',
          matchups: [
            {
              id: 'Day1-WinnersRound1-1',
              title: 'Winners Round 1 #1',
              description: 'First round of Winners Round 1. 6 games with E-District opening sequence.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'Day1-WinnersRound1-2',
              title: 'Winners Round 1 #2',
              description: 'Second round of Winners Round 1. Consistent map rotation pattern.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'Day1-WinnersRound1-3',
              title: 'Winners Round 1 #3',
              description: 'Third round of Winners Round 1. Standard 6-game format.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'Day1-WinnersRound1-4',
              title: 'Winners Round 1 #4',
              description: 'Fourth round of Winners Round 1. Maintaining competitive balance.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'Day1-WinnersRound1-5',
              title: 'Winners Round 1 #5',
              description: 'Fifth round of Winners Round 1. Continued tournament progression.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            },
            {
              id: 'Day1-WinnersRound1-6',
              title: 'Winners Round 1 #6',
              description: 'Final round of Winners Round 1. Concluding the first day of competition.',
              teams: 20,
              games: 6,
              maps: 'E-District → Storm Point → World\'s Edge'
            }
          ]
        }
      ] : [
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
      currentGame: 0,  // Start at 0 to show initial state
      currentMap: '',
      manualSliderControl: false,
      
      // Enhanced Action Panel (GSAP-optimized)
      panelExpanded: false,
      selectedGames: [],
      
      // GSAP instances
      draggableInstance: null,
      
      // Status tracking
      loadedMatchups: new Set(),
      loadingMatchups: new Set(),
      
      // Sync interval for animation
      syncInterval: null
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
    },
    
    displayedProgress() {
      // Ensure progress is always within valid range (0 to maxGames)
      return Math.min(Math.max(0, this.currentGame), this.maxGames);
    },
    
    /**
     * Dynamic maxGames based on selected matchup
     * Year 4: 6 or 8 games depending on tournament round
     * Year 5: 6 games for all rounds
     */
    maxGames() {
      if (!this.selectedMatchup) {
        return this.isYear5Tournament ? 6 : 6; // Default to 6 for both when no matchup selected
      }
      
      // Find the selected matchup and return its game count
      for (const day of this.tournamentDays) {
        const matchup = day.matchups.find(m => m.id === this.selectedMatchup);
        if (matchup) {
          console.log(`🎮 Matchup ${this.selectedMatchup} has ${matchup.games} games`);
          return matchup.games;
        }
      }
      
      // Fallback based on tournament type
      return this.isYear5Tournament ? 6 : 8;
    }
  },
  
  mounted() {
    console.log('🎯 ChampionshipApp mounted() called - Vue component is ready');
    
    // Initialize professional header animations with GSAP
    this.initializeHeaderAnimations();
    
    // Initialize chart loading animation
    this.initializeChartLoadingAnimation();
    
    // Initialize GSAP dragging when DOM is ready (desktop only)
    this.$nextTick(() => {
      this.initializeDraggableSystem();
    });
    
    // Add window resize handler for mobile optimization
    window.addEventListener('resize', this.handleResize);
    
    // Verify centralized draggable manager is available
    if (GSAPDraggableManager) {
      console.log('✅ Centralized GSAP Draggable Manager detected and ready');
    } else {
      console.warn('⚠️ GSAP Draggable Manager not available - dragging may not work properly');
    }
    
    // Set up periodic updates for game state
    this.gameStateInterval = setInterval(() => {
      if (this.chartEngine) {
        const engineGameIndex = this.chartEngine.currentGameIndex !== undefined ? this.chartEngine.currentGameIndex : 1;
        
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
      console.log('🎭 Initializing sophisticated header animations...');
      
      // Check if GSAP is available
      if (typeof gsap === 'undefined') {
        console.warn('⚠️ GSAP not available - header animations disabled');
        return;
      }
      
      // Set initial states for elements that will be animated (exclude nav-links)
      gsap.set([this.$refs.championshipLogo, this.$refs.championshipTitle, this.$refs.tournamentInfo], {
        opacity: 0,
        y: 50,
        scale: 0.8,
        filter: 'blur(5px)'
      });
      
      // Keep nav-links visible at all times - no animation
      gsap.set('.nav-links', {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)'
      });
      
      // Set specific states for individual info items
      gsap.set([this.$refs.infoItem1, this.$refs.infoItem2, this.$refs.infoItem3], {
        opacity: 0,
        x: -30,
        scale: 0.9,
        rotationY: 15
      });
      
      gsap.set([this.$refs.infoSeparator1, this.$refs.infoSeparator2], {
        opacity: 0,
        scale: 0,
        rotation: 180
      });
      
      // Create sophisticated master timeline
      const masterTimeline = gsap.timeline();
      
      // 1. Championship Logo with bounce and particles
      masterTimeline
        .to(this.$refs.championshipLogo, {
        opacity: 1,
        y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'elastic.out(1, 0.6)'
        })
        .to(this.$refs.logoIcon, {
          rotation: 360,
          duration: 0.8,
          ease: 'power2.out'
        }, '-=0.6')
        .to(this.$refs.logoParticles, {
          opacity: 1,
          scale: 1.2,
          duration: 0.4,
          ease: 'power2.out'
        }, '-=0.4');
      
      // 2. Championship Title with typewriter effect
      masterTimeline
        .to(this.$refs.championshipTitle, {
        opacity: 1,
        y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.8,
          ease: 'power3.out'
        }, '-=0.4')
        .to(this.$refs.titleMain, {
          backgroundPosition: '200% center',
          duration: 2,
          ease: 'power2.inOut'
        }, '-=0.2');
      
      // 3. Tournament Info with faster staggered morphing animations (half the delay)
      masterTimeline
        .to(this.$refs.tournamentInfo, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
        duration: 0.6,
        ease: 'power2.out'
        }, '-=0.15'); // Reduced from -=0.3 to -=0.15 for faster animation
      
      // 4. Individual info items with 3D flip effects (also faster)
      masterTimeline
        .to([this.$refs.infoItem1, this.$refs.infoItem2, this.$refs.infoItem3], {
        opacity: 1,
          x: 0,
          scale: 1,
          rotationY: 0,
          duration: 0.8,
          ease: 'back.out(1.7)',
          stagger: 0.15
        }, '-=0.2') // Reduced from -=0.4 to -=0.2 for faster animation
        .to([this.$refs.infoIcon1, this.$refs.infoIcon2, this.$refs.infoIcon3], {
          scale: 1.3,
          rotation: 10,
          duration: 0.3,
          ease: 'elastic.out(1, 0.3)',
          stagger: 0.1,
          yoyo: true,
          repeat: 1
        }, '-=0.6');
      
      // 5. Separators with spin animation (faster)
      masterTimeline
        .to([this.$refs.infoSeparator1, this.$refs.infoSeparator2], {
          opacity: 1,
          scale: 1,
          rotation: 0,
        duration: 0.5,
          ease: 'back.out(2)',
          stagger: 0.1
        }, '-=0.4'); // Reduced from -=0.8 to -=0.4 for faster animation
      
      // 6. Navigation links - removed from animation, stays visible
      
      // 7. Continuous subtle animations
      this.setupContinuousAnimations();
    },
    
    setupContinuousAnimations() {
      // Continuous logo glow effect
      gsap.to(this.$refs.logoIcon, {
        textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)',
        duration: 2,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });
      
      // Subtle floating animation for info items
      gsap.to([this.$refs.infoItem1, this.$refs.infoItem2, this.$refs.infoItem3], {
        y: -3,
        duration: 3,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.5
      });
      
      // Gentle rotation for separators
      gsap.to([this.$refs.infoSeparator1, this.$refs.infoSeparator2], {
        rotation: 10,
        duration: 4,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.2
      });
      
      // Particle animation for logo
      gsap.to(this.$refs.logoParticles, {
        opacity: 0.7,
        scale: 1.1,
        duration: 1.5,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });
    },

    // Vue.js + GSAP Chart Loading Animation
    initializeChartLoadingAnimation() {
      console.log('📊 Initializing chart loading animations...');
      
      // Check if GSAP is available
      if (typeof gsap === 'undefined') {
        console.warn('⚠️ GSAP not available - chart loading animations disabled');
        return;
      }
      
      // Wait for refs to be available
      this.$nextTick(() => {
        // Central glow pulsing animation - optimized for performance
        if (this.$refs.centralGlow) {
          gsap.to(this.$refs.centralGlow, {
            scale: 1.125,
            duration: 3,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
            force3D: true
          });
        }
        
        // Chart bars animation - optimized with transform3d
        const chartBars = [
          this.$refs.chartBar1,
          this.$refs.chartBar2,
          this.$refs.chartBar3,
          this.$refs.chartBar4,
          this.$refs.chartBar5
        ].filter(Boolean);
        
        if (chartBars.length > 0) {
          chartBars.forEach((bar, index) => {
            const originalHeight = parseInt(getComputedStyle(bar).height);
            const animationHeight = originalHeight * 1.8; // Increased amplitude
            
            gsap.to(bar, {
              scaleY: 1.8,
              duration: 1.0 + (index * 0.15), // Faster, more varied timing
              ease: "power2.inOut",
              repeat: -1,
              yoyo: true,
              delay: index * 0.08,
              force3D: true,
              transformOrigin: "bottom"
            });
          });
        }
        
        // Connecting line opacity animation
        if (this.$refs.connectingLine) {
          gsap.to(this.$refs.connectingLine, {
            opacity: 0.9,
            duration: 2.5,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true
          });
        }
        
        // Outer ring rotation - optimized
        if (this.$refs.outerRing) {
          gsap.to(this.$refs.outerRing, {
            rotation: 360,
            duration: 20,
            ease: "none",
            repeat: -1,
            force3D: true,
            transformOrigin: "center"
          });
        }
        
        // Inner ring rotation - counter-clockwise
        if (this.$refs.innerRing) {
          gsap.to(this.$refs.innerRing, {
            rotation: -360,
            duration: 15,
            ease: "none",
            repeat: -1,
            force3D: true,
            transformOrigin: "center"
          });
        }
        
        // Roaming circles animation - smooth orbital movement
        const roamingCircles = [
          this.$refs.roamingCircle1,
          this.$refs.roamingCircle2,
          this.$refs.roamingCircle3,
          this.$refs.roamingCircle4
        ].filter(Boolean);
        
        if (roamingCircles.length > 0) {
          roamingCircles.forEach((circle, index) => {
            // Create orbital movement patterns
            const radius = 80 + (index * 15);
            const duration = 8 + (index * 2);
            const offset = (index * 90); // Distribute around circle
            
            gsap.to(circle, {
              rotation: 360,
              duration: duration,
              ease: "none",
              repeat: -1,
              force3D: true,
              transformOrigin: `${radius}px center`,
              delay: offset / 360 * duration
            });
          });
        }
        

        
        // Scanning line animation - vertical movement
        if (this.$refs.scanningLine) {
          gsap.to(this.$refs.scanningLine, {
            y: "100vh",
            duration: 8,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
            force3D: true
          });
        }
        
        // Text content fade in animation - staggered for better alignment
        const textElements = [
          this.$refs.mainHeading,
          this.$refs.subText1
        ].filter(Boolean);
        
        if (textElements.length > 0) {
          gsap.set(textElements, {
            opacity: 0,
            y: 30,
            force3D: true
          });
          
          gsap.to(textElements, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            stagger: 0.15,
            delay: 0.5,
            force3D: true
          });
        }
        
        // Accent line pulsing - enhanced
        if (this.$refs.accentLine) {
          gsap.to(this.$refs.accentLine, {
            opacity: 0.8,
            scaleX: 1.2,
            duration: 3,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
            force3D: true
          });
        }
        
        // Floating dots pulsing animation - improved performance
        const floatingDots = [
          this.$refs.floatingDot1,
          this.$refs.floatingDot2,
          this.$refs.floatingDot3,
          this.$refs.floatingDot4
        ].filter(Boolean);
        
        if (floatingDots.length > 0) {
          floatingDots.forEach((dot, index) => {
            gsap.to(dot, {
              opacity: 0.9,
              scale: 1.8,
              duration: 1.2 + (index * 0.25),
              ease: "power2.inOut",
              repeat: -1,
              yoyo: true,
              delay: index * 0.4,
              force3D: true
            });
          });
        }
        
        console.log('✨ Chart loading animations initialized successfully!');
      });
    },
    
    selectDay(dayId) {
      console.log('📅 Selected day:', dayId);
      this.selectedDay = dayId;
      
      // Clear selection when switching days
      this.selectedMatchup = '';
      this.chartEngine = null;
    },

    /**
     * Build CSV path based on tournament type and matchup ID
     * Year 4: year4champions/{matchupId}_points.csv
     * Year 5: year5champions/processed/{matchupId}-simple.csv
     */
    buildCsvPath(matchupId) {
      if (this.isYear5Tournament) {
        // Year 5 Open tournament paths
        return `year5champions/processed/${matchupId}-simple.csv`;
      } else {
        // Year 4 Championship paths (original format)
        return `year4champions/${matchupId}_points.csv`;
      }
    },

    /**
     * Get tournament-specific file format information
     */
    getTournamentInfo() {
      return {
        type: this.isYear5Tournament ? 'Year 5 Open' : 'Year 4 Championship',
        dataPath: this.isYear5Tournament ? 'year5champions/processed/' : 'year4champions/',
        fileFormat: this.isYear5Tournament ? '{matchupId}-simple.csv' : '{matchupId}_points.csv'
      };
    },
    
    async selectMatchup(matchupId) {
      console.log('🎯 Selected matchup:', matchupId);
      console.log('🏆 Tournament Info:', this.getTournamentInfo());
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
        
        // Cleanup existing chart engine
        if (this.chartEngine) {
          this.chartEngine.cleanup();
        }
        
        // Wait for DOM to be ready
        await this.$nextTick();
        
        // Additional safety check - ensure container exists
        await this.waitForContainer();
        
        // Initialize chart engine using new modular ChartEngine
        this.chartEngine = new ChartEngine('vue-chart-container', {
          debugMode: false,  // Optimized for production
          transitionDuration: 2500,  // Slower, more elegant animations
          enableAnimation: true,
          teamConfig: this.teamConfig  // Pass Vue composable to chart engine
        });
        
        // Initialize chart engine with tournament-specific matchup data
        const csvPath = this.buildCsvPath(this.selectedMatchup);
        console.log(`📂 Loading CSV for ${this.isYear5Tournament ? 'Year 5' : 'Year 4'}:`, csvPath);
        await this.chartEngine.initialize(csvPath);
        
        // Update game state  
        this.currentGame = this.chartEngine.currentGameIndex; // Should be 0 for initial state
        this.updateCurrentMap();
        
        // Mark as loaded
        this.loadedMatchups.add(this.selectedMatchup);
        this.loadingMatchups.delete(this.selectedMatchup);
        
        console.log('✅ Matchup loaded successfully');
        
        // Verify chart rendered
        await this.verifyChartRender();
        
        // Initialize draggable after chart is loaded and ready
        this.$nextTick(() => {
          setTimeout(() => {
            this.initGSAPDraggable();
          }, 200);
        });
        
      } catch (error) {
        console.error('❌ Error loading matchup:', error);
        this.showChartError(error);
        this.loadingMatchups.delete(this.selectedMatchup);
      } finally {
        this.isLoading = false;
      }
    },
    
    async waitForContainer() {
      // Wait for the container to be available in the DOM
      return new Promise((resolve, reject) => {
        const maxWait = 5000; // 5 seconds max wait
        const checkInterval = 50; // Check every 50ms
        let elapsed = 0;
        
        const checkContainer = () => {
          const container = document.getElementById('vue-chart-container');
          
          if (container) {
            console.log('✅ Container ready for ChartEngine');
            resolve();
            return;
          }
          
          elapsed += checkInterval;
          if (elapsed >= maxWait) {
            reject(new Error('Container not found after 5 seconds'));
            return;
          }
          
          setTimeout(checkContainer, checkInterval);
        };
        
        checkContainer();
      });
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
      console.log('🎯 Attempting to initialize GSAP draggable...');
      
      if (!this.$refs.actionPanel) {
        console.warn('⚠️ Action panel ref not available');
        return;
      }
      
      if (!GSAPDraggableManager) {
        console.warn('⚠️ GSAPDraggableManager not available');
        return;
      }
      
      const panelElement = this.$refs.actionPanel;
      const panelId = panelElement.id || `action-panel-${Date.now()}`;
      
      // Ensure panel has ID
      if (!panelElement.id) {
      panelElement.id = panelId;
      }
      
      console.log('🚀 Initializing draggable for panel:', panelId);
      console.log('📦 Panel element:', panelElement);
      console.log('🔧 GSAP available:', typeof window !== 'undefined' && !!window.gsap);
      console.log('🎯 Draggable available:', typeof window !== 'undefined' && !!window.Draggable);
      
      // Initialize ultra-performant draggable with new system
      this.draggableInstance = GSAPDraggableManager.initializeDraggable(panelElement);
      
      if (this.draggableInstance) {
        console.log('✅ Controls draggable initialized successfully');
        console.log('📊 Draggable instance:', this.draggableInstance);
      } else {
        console.warn('⚠️ Controls draggable initialization failed');
      }
      
      // Debug: Show all instances
      GSAPDraggableManager.debugInstances();
    },
    
    async updateGameFromSlider() {
      if (this.chartEngine) {
        await this.chartEngine.jumpToGame(this.currentGame);
        this.updateCurrentMap();
        
        // Reset filters when dragging back to initial state (game 0)
        if (this.currentGame === 0 && this.selectedGames.length > 0) {
          console.log('🔄 Progress bar dragged to 0, resetting filters');
          this.selectedGames = [];
          await this.chartEngine.clearFilter();
        }
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
    
    async playAnimation() {
      if (this.chartEngine) {
        this.isPlaying = true;
        // Resume from current position, not always from game 1
        const startGame = Math.max(1, this.currentGame || 1);
        console.log(`🎬 Starting animation from game ${startGame} (current: ${this.currentGame})`);
        
        // Set up sync interval to keep Vue component in sync with chart engine
        this.syncInterval = setInterval(() => {
          if (this.chartEngine && this.isPlaying) {
            this.currentGame = this.chartEngine.getCurrentGameIndex();
          }
        }, 100); // Sync every 100ms
        
        await this.chartEngine.playAnimation(startGame, this.maxGames, 3000);  // Slower playback: 3 seconds between games
        this.isPlaying = false;
        
        // Clear sync interval when animation ends
        if (this.syncInterval) {
          clearInterval(this.syncInterval);
          this.syncInterval = null;
        }
      }
    },

    async togglePlayback() {
      if (this.chartEngine) {
        if (this.isPlaying) {
          // True pause - stop animation and remember current position
          this.chartEngine.stopAnimation();
          this.isPlaying = false;
          this.currentGame = this.chartEngine.getCurrentGameIndex();
          console.log(`⏸️ Paused at game ${this.currentGame}`);
          
          // Clear sync interval when paused
          if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
          }
        } else {
          // Resume from current position
          await this.playAnimation();
        }
      }
    },
    
    async restart() {
      if (this.chartEngine) {
        this.chartEngine.stopAnimation();
        await this.chartEngine.jumpToGame(0);  // Reset to initial state
        this.currentGame = 0;
        this.isPlaying = false;
        this.updateCurrentMap();
      }
    },

    async jumpToInitialState() {
      if (this.chartEngine) {
        await this.chartEngine.jumpToGame(0);
        this.currentGame = 0;
        this.updateCurrentMap();
      }
    },
    
    updateCurrentMap() {
      if (this.chartEngine && this.chartEngine.dataManager) {
        // Get current map from data manager
        const currentGameIndex = this.chartEngine.currentGameIndex;
        this.currentMap = this.chartEngine.dataManager.getMapForGame(currentGameIndex);
      }
    },
    
    updateGameState() {
      // maxGames is now handled by computed property
      // No manual assignment needed
    },
    
    async toggleGameFilter(gameNum) {
      const wasSelected = this.selectedGames.includes(gameNum);
      
      if (wasSelected) {
        // If already selected, toggle it off
        this.selectedGames.splice(this.selectedGames.indexOf(gameNum), 1);
        console.log(`🎮 Removed game ${gameNum} from filter. Selected: [${this.selectedGames.join(', ')}]`);
      } else {
        // If not selected, add it to the selection (allow multiple)
        this.selectedGames.push(gameNum);
        console.log(`🎮 Added game ${gameNum} to filter. Selected: [${this.selectedGames.join(', ')}]`);
        
        // Auto-progress to max level when any filter is selected
        if (this.currentGame < this.maxGames) {
          console.log(`🎯 Auto-progressing to game ${this.maxGames} for filtering`);
          this.currentGame = this.maxGames;
          if (this.chartEngine) {
            await this.chartEngine.jumpToGame(this.maxGames);
          }
        }
        
        // Removed auto-expansion - filters work independently of panel state
      }
      
      // Apply filter with visual feedback
      await this.applyGameFilter();
      
      // If no filters are selected, allow going back to initial state
      if (this.selectedGames.length === 0) {
        console.log('🔄 No filters selected, allowing normal game progression');
      }
    },
    
    async resetGameFilter() {
      console.log('🔄 Resetting game filter and returning to initial state');
      this.selectedGames = [];
      
      // Reset to initial state when clearing filters
      this.currentGame = 0;
      if (this.chartEngine) {
        await this.chartEngine.jumpToGame(0);
      }
      
      await this.applyGameFilter();
      this.updateCurrentMap();
    },
    
    async applyGameFilter() {
      if (this.chartEngine) {
        if (this.selectedGames.length > 0) {
          console.log(`🎮 Applying filter for games: ${this.selectedGames.join(', ')}`);
          
          // Ensure we're at max game level for filtering
          if (this.currentGame < this.maxGames) {
            this.currentGame = this.maxGames;
            await this.chartEngine.jumpToGame(this.maxGames);
          }
          
          await this.chartEngine.filterByGames(this.selectedGames);
          
          // Update UI feedback
          this.updateCurrentMap();
          
          // Visual feedback for active filtering
          console.log(`✅ Filter applied successfully for ${this.selectedGames.length} games`);
        } else {
          console.log('🔄 Clearing game filter');
          await this.chartEngine.clearFilter();
        }
      }
    },
    
    getGameButtonStyle(gameNum) {
      // Add proper guards to prevent calling DataManager before data is loaded
      if (!this.chartEngine || !this.chartEngine.dataManager || !this.chartEngine.dataManager.data) {
        return {
          background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          border: '2px solid #6b7280',
          color: '#ffffff'
        };
      }
      
      const mapName = this.chartEngine.dataManager.getMapForGame(gameNum);
      const mapColor = this.chartEngine.dataManager.getMapColor(mapName, gameNum);
      
      const isActive = this.selectedGames.includes(gameNum);
      const isCurrent = gameNum === this.currentGame;
      
      // Base style: all buttons are colored with map colors by default
      const baseStyle = {
        background: `linear-gradient(135deg, ${mapColor} 0%, ${this.adjustColor(mapColor, -10)} 100%)`,
          border: `2px solid ${mapColor}`,
        color: '#ffffff'
        };
      
      // Add subtle glow effect only for current game during progress
      if (isCurrent) {
        return {
          ...baseStyle,
          boxShadow: `0 0 8px ${mapColor}60, 0 2px 4px rgba(0,0,0,0.3)`
        };
      } else if (isActive) {
        // Keep enhanced styling for selected filters
        return {
          ...baseStyle,
          boxShadow: `0 0 12px ${mapColor}60, 0 0 20px ${mapColor}40`,
          transform: 'scale(1.15)'
        };
      } else {
        // Default colored buttons
        return baseStyle;
      }
    },
    
    getGameTooltip(gameNum) {
      // Add proper guards to prevent calling DataManager before data is loaded
      if (!this.chartEngine || !this.chartEngine.dataManager || !this.chartEngine.dataManager.data) {
        return `Game ${gameNum}`;
      }
      
      const mapName = this.chartEngine.dataManager.getMapForGame(gameNum);
      return `Game ${gameNum}: ${mapName}`;
    },
    
    adjustColor(hexColor, percent) {
      // Simple color adjustment utility with null check
      if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
        return hexColor || '#dc2626'; // Return original or fallback color
      }
      
      const num = parseInt(hexColor.slice(1), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      
      return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1)}`;
    },
    
    getCurrentMapStyle() {
      // Add proper guards to prevent calling DataManager before data is loaded
      if (!this.chartEngine || !this.chartEngine.dataManager || !this.chartEngine.dataManager.data) {
        return {
          background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          border: '2px solid #6b7280',
          color: '#ffffff'
        };
      }
      
      const mapColor = this.chartEngine.dataManager.getMapColor(this.currentMap, this.currentGame);
      
      return {
        background: `linear-gradient(135deg, ${mapColor} 0%, ${this.adjustColor(mapColor, -20)} 100%)`,
        border: `2px solid ${mapColor}`,
        color: '#ffffff',
        boxShadow: `0 0 15px ${mapColor}60, 0 4px 8px rgba(0,0,0,0.3)`
      };
    },
    
    exportData() {
      if (this.chartEngine) {
        const csvContent = this.chartEngine.exportData(this.selectedMatchup);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.selectedMatchup}_export.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
      }
    },
    
    // Mobile detection utility
    isMobileDevice() {
      return window.innerWidth <= 768
    },
    
    // Initialize enhanced draggable system
    initializeDraggableSystem() {
      const panel = this.$refs.actionPanel
      if (!panel) return
      
      // Skip draggable initialization on mobile
      if (this.isMobileDevice()) {
        console.log('📱 Mobile device detected - skipping draggable initialization')
        return
      }
      
      // Only initialize draggable on desktop
      this.draggableManager = GSAPDraggableManager.initializeDraggable(panel, {
        onDragStart: () => {
          console.log('🎯 Drag started')
        },
        onDragEnd: () => {
          console.log('🎯 Drag ended')
        }
      })
      
      console.log('✅ Enhanced draggable system initialized')
    },
    
    // Handle window resize for mobile optimization
    handleResize() {
      // Re-initialize draggable system based on screen size
      this.$nextTick(() => {
        if (this.draggableManager && this.isMobileDevice()) {
          // Destroy draggable on mobile
          if (this.draggableManager.cleanup) {
            this.draggableManager.cleanup()
          }
          this.draggableManager = null
          console.log('📱 Destroyed draggable system for mobile')
        } else if (!this.draggableManager && !this.isMobileDevice()) {
          // Initialize draggable on desktop
          this.initializeDraggableSystem()
        }
      })
    },
  },
  
  beforeUnmount() {
    // Cleanup chart engine
    if (this.chartEngine) {
      this.chartEngine.cleanup();
    }
    
    // Cleanup game state interval
    if (this.gameStateInterval) {
      clearInterval(this.gameStateInterval);
    }
    
    // Cleanup sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Cleanup GSAP draggable
    if (this.draggableManager && GSAPDraggableManager) {
      if (this.draggableManager.cleanup) {
        this.draggableManager.cleanup();
      }
    }

    // Remove window resize listener
    window.removeEventListener('resize', this.handleResize);
  }
}
</script>

<!-- No scoped styles needed as the CSS is already in championship.css --> 