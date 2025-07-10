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
          <h1 ref="titleMain" class="title-main">ALGS Year 4 Championship</h1>
        </div>
        
        <!-- Tournament Details (Horizontal) -->
        <div ref="tournamentInfo" class="tournament-info-horizontal">
          <div ref="infoItem1" class="info-item">
            <span ref="infoIcon1" class="info-icon">📍</span>
            <span ref="infoText1" class="info-text">Sapporo, Japan</span>
          </div>
          <div ref="infoSeparator1" class="info-separator">•</div>
          <div ref="infoItem2" class="info-item">
            <span ref="infoIcon2" class="info-icon">📅</span>
            <span ref="infoText2" class="info-text">Jan 29 - Feb 2, 2025</span>
          </div>
          <div ref="infoSeparator2" class="info-separator">•</div>
          <div ref="infoItem3" class="info-item">
            <span ref="infoIcon3" class="info-icon">⚔️</span>
            <span ref="infoText3" class="info-text">40 Teams</span>
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
          <!-- Optimized Interactive SVG Animation -->
          <div class="matchup-instructions-container">
            <svg viewBox="0 0 600 400" class="matchup-instructions-svg">
              <defs>
                <!-- Gradients matching the dashboard theme -->
                <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
                  <stop offset="50%" style="stop-color:#2a2a2a;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
                </linearGradient>
                
                <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#ff8c42;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#ffb366;stop-opacity:1" />
                </linearGradient>
                
                <linearGradient id="subtleOrange" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#ff8c42;stop-opacity:0.6" />
                  <stop offset="100%" style="stop-color:#ffb366;stop-opacity:0.3" />
                </linearGradient>
                
                <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" style="stop-color:#ff8c42;stop-opacity:0.3" />
                  <stop offset="70%" style="stop-color:#ff8c42;stop-opacity:0.1" />
                  <stop offset="100%" style="stop-color:#ff8c42;stop-opacity:0" />
                </radialGradient>
                
                <!-- Filters -->
                <filter id="softGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                
                <filter id="textGlow">
                  <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <!-- Background with subtle texture -->
              <rect width="600" height="400" fill="url(#bgGradient)" rx="8"/>
              
              <!-- Central focus area -->
              <circle cx="300" cy="180" r="80" fill="url(#centerGlow)">
                <animate attributeName="r" values="80;90;80" dur="6s" repeatCount="indefinite"/>
              </circle>
              
              <!-- Main chart icon area -->
              <g transform="translate(300,150)">
                <!-- Stylized chart bars -->
                <rect x="-25" y="5" width="6" height="15" fill="url(#orangeGradient)" rx="2" opacity="0.8">
                  <animate attributeName="height" values="15;25;15" dur="3s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="5;-5;5" dur="3s" repeatCount="indefinite"/>
                </rect>
                <rect x="-12" y="3" width="6" height="17" fill="url(#orangeGradient)" rx="2" opacity="0.9">
                  <animate attributeName="height" values="17;27;17" dur="3.5s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="3;-7;3" dur="3.5s" repeatCount="indefinite"/>
                </rect>
                <rect x="0" y="0" width="6" height="20" fill="url(#orangeGradient)" rx="2">
                  <animate attributeName="height" values="20;30;20" dur="4s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="0;-10;0" dur="4s" repeatCount="indefinite"/>
                </rect>
                <rect x="12" y="4" width="6" height="16" fill="url(#orangeGradient)" rx="2" opacity="0.9">
                  <animate attributeName="height" values="16;26;16" dur="3.2s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="4;-6;4" dur="3.2s" repeatCount="indefinite"/>
                </rect>
                <rect x="24" y="8" width="6" height="12" fill="url(#orangeGradient)" rx="2" opacity="0.8">
                  <animate attributeName="height" values="12;22;12" dur="2.8s" repeatCount="indefinite"/>
                  <animate attributeName="y" values="8;-2;8" dur="2.8s" repeatCount="indefinite"/>
                </rect>
                
                <!-- Connecting line -->
                <path d="M -20,12 Q -8,9 0,8 Q 8,7 16,11 Q 24,15 28,13" 
                      fill="none" stroke="url(#subtleOrange)" stroke-width="2" opacity="0.6">
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="4s" repeatCount="indefinite"/>
                </path>
              </g>
              
              <!-- Rotating outer ring -->
              <g transform-origin="300 180">
                <animateTransform attributeName="transform" type="rotate" values="0 300 180;360 300 180" dur="20s" repeatCount="indefinite"/>
                <circle cx="300" cy="180" r="60" fill="none" stroke="#ff8c42" stroke-width="1" opacity="0.4"/>
                <circle cx="300" cy="120" r="2" fill="#ff8c42" opacity="0.6"/>
                <circle cx="360" cy="180" r="2" fill="#ff8c42" opacity="0.6"/>
              </g>
              
              <!-- Main heading -->
              <text x="300" y="260" text-anchor="middle" fill="url(#orangeGradient)" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="600" filter="url(#textGlow)">
                Select a matchup to view the interactive chart
              </text>
              
              <!-- Secondary text -->
              <text x="300" y="285" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="13" opacity="0.8">
                Choose from the tournament matchups above to see detailed race charts
              </text>
              <text x="300" y="305" text-anchor="middle" fill="#888" font-family="Inter, Arial, sans-serif" font-size="13" opacity="0.8">
                with game-by-game progression.
              </text>
              
              <!-- Accent line -->
              <rect x="200" y="330" width="200" height="1" fill="url(#subtleOrange)">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite"/>
              </rect>
              
              <!-- Corner accents -->
              <g transform="translate(50,50)" opacity="0.3">
                <rect x="0" y="0" width="15" height="2" fill="#ff8c42"/>
                <rect x="0" y="0" width="2" height="15" fill="#ff8c42"/>
              </g>
              
              <g transform="translate(535,50)" opacity="0.3">
                <rect x="0" y="0" width="15" height="2" fill="#ff8c42"/>
                <rect x="13" y="0" width="2" height="15" fill="#ff8c42"/>
              </g>
              
              <!-- Floating data points -->
              <g opacity="0.4">
                <circle cx="150" cy="100" r="1" fill="#ff8c42">
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite"/>
                </circle>
                <circle cx="450" cy="300" r="1" fill="#ffb366">
                  <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2.5s" repeatCount="indefinite"/>
                </circle>
                <circle cx="100" cy="250" r="1" fill="#ff8c42">
                  <animate attributeName="opacity" values="0.2;0.6;0.2" dur="4s" repeatCount="indefinite"/>
                </circle>
                <circle cx="500" cy="130" r="1" fill="#ffb366">
                  <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3.5s" repeatCount="indefinite"/>
                </circle>
              </g>
            </svg>
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
      currentGame: 0,  // Start at 0 to show initial state
      maxGames: 6,
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
      
      // Set initial states for all elements
      gsap.set([this.$refs.championshipLogo, this.$refs.championshipTitle, this.$refs.tournamentInfo, '.nav-links'], {
        opacity: 0,
        y: 50,
        scale: 0.8,
        filter: 'blur(5px)'
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
      
      // 3. Tournament Info with staggered morphing animations
      masterTimeline
        .to(this.$refs.tournamentInfo, {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power2.out'
        }, '-=0.3');
      
      // 4. Individual info items with 3D flip effects
      masterTimeline
        .to([this.$refs.infoItem1, this.$refs.infoItem2, this.$refs.infoItem3], {
          opacity: 1,
          x: 0,
          scale: 1,
          rotationY: 0,
          duration: 0.8,
          ease: 'back.out(1.7)',
          stagger: 0.15
        }, '-=0.4')
        .to([this.$refs.infoIcon1, this.$refs.infoIcon2, this.$refs.infoIcon3], {
          scale: 1.3,
          rotation: 10,
          duration: 0.3,
          ease: 'elastic.out(1, 0.3)',
          stagger: 0.1,
          yoyo: true,
          repeat: 1
        }, '-=0.6');
      
      // 5. Separators with spin animation
      masterTimeline
        .to([this.$refs.infoSeparator1, this.$refs.infoSeparator2], {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.5,
          ease: 'back.out(2)',
          stagger: 0.1
        }, '-=0.8');
      
      // 6. Navigation links
      masterTimeline
        .to('.nav-links', {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.5,
          ease: 'power2.out'
        }, '-=0.3');
      
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
        
        // Initialize chart engine with matchup data
        const csvPath = `data/${this.selectedMatchup}_points.csv`;
        await this.chartEngine.initialize(csvPath);
        
        // Update game state
        this.maxGames = this.chartEngine.maxGames || 6;
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
      if (this.chartEngine) {
        this.maxGames = this.chartEngine.maxGames || 6;
      }
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
      if (!this.chartEngine || !this.chartEngine.dataManager) return {};
      
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
      if (!this.chartEngine || !this.chartEngine.dataManager) return `Game ${gameNum}`;
      
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
      if (!this.chartEngine || !this.chartEngine.dataManager) return {};
      
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
    }
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
    if (this.draggableInstance && GSAPDraggableManager) {
      GSAPDraggableManager.destroyAll();
    }
  }
}
</script>

<!-- No scoped styles needed as the CSS is already in championship.css --> 