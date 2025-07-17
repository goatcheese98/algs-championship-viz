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
          <h1 ref="titleMain" class="title-main">
            {{ isEwc2025Tournament ? 'EWC 2025' : (isYear5Tournament ? 'ALGS Year 5 Open' : 'ALGS Year 4 Championship') }}
          </h1>
        </div>
        
        <!-- Tournament Details (Horizontal) -->
        <div ref="tournamentInfo" class="tournament-info-horizontal">
          <div ref="infoItem1" class="info-item">
            <span ref="infoIcon1" class="info-icon">
              {{ isEwc2025Tournament ? '🏆' : (isYear5Tournament ? '🌍' : '📍') }}
            </span>
            <span ref="infoText1" class="info-text">
              {{ isEwc2025Tournament ? 'Esports World Cup' : (isYear5Tournament ? 'Global Tournament' : 'Sapporo, Japan') }}
            </span>
          </div>
          <div ref="infoSeparator1" class="info-separator">•</div>
          <div ref="infoItem2" class="info-item">
            <span ref="infoIcon2" class="info-icon">📅</span>
            <span ref="infoText2" class="info-text">
              {{ isEwc2025Tournament ? 'Day 1 - Group A' : (isYear5Tournament ? 'Split 1 - 2025' : 'Jan 29 - Feb 2, 2025') }}
            </span>
          </div>
          <div ref="infoSeparator2" class="info-separator">•</div>
          <div ref="infoItem3" class="info-item">
            <span ref="infoIcon3" class="info-icon">⚔️</span>
            <span ref="infoText3" class="info-text">
              {{ isEwc2025Tournament ? '20 Teams' : (isYear5Tournament ? '6 Tournament Rounds' : '40 Teams') }}
            </span>
          </div>
        </div>
        
        <!-- Navigation Links -->
        <div class="nav-links">
          <router-link to="/" class="nav-link">🏠 ALGS Dashboard</router-link>
          <router-link v-if="isYear5Tournament" to="/tournament/year-4-championship" class="nav-link">🏆 Year 4 Champions</router-link>
          <router-link v-if="isEwc2025Tournament" to="/tournament/year-4-championship" class="nav-link">🏆 Year 4 Championship</router-link>
          <router-link v-if="isEwc2025Tournament" to="/tournament/year-5-open" class="nav-link">🌍 Year 5 Open</router-link>
        </div>
      </div>
    </div>

    <div class="main-layout">
      <!-- Hidden Tournament Selector for routing and functionality -->
      <TournamentSelector
        ref="tournamentSelector"
        :is-year5-tournament="isYear5Tournament"
        :is-ewc2025-tournament="isEwc2025Tournament"
        :loaded-matchups="loadedMatchups"
        :loading-matchups="loadingMatchups"
        style="display: none;"
      />
      
      <!-- Dashboard Side Panel -->
      <div ref="dashboardPanel" class="dashboard-panel" 
           :class="{ expanded: panelExpanded, 'force-expanded': !isSmallWindow }"
           @mouseenter="expandPanel"
           @mouseleave="collapsePanel">
        
        <!-- Panel Header -->
        <div class="dashboard-header">
          <div class="dashboard-main">
            <div class="dashboard-icon" :title="panelExpanded ? 'Tournament Dashboard' : 'Dashboard'">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <div class="dashboard-title" v-show="panelExpanded">
              <span>Tournament Dashboard</span>
            </div>
          </div>
        </div>
        
        <!-- Tournament Selection -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="section-main">
              <div class="section-icon" :title="panelExpanded ? 'Tournament Days' : 'Select Tournament Day'">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <span class="section-title" v-show="panelExpanded">Tournament Days</span>
            </div>
            <div class="tournament-display" v-show="!panelExpanded && selectedMatchup">
              {{ getCurrentTournamentText() }}
            </div>
          </div>
          <div class="section-content" v-show="panelExpanded">
            <div class="day-tabs">
              <button v-for="day in tournamentDays" 
                      :key="day.id"
                      :class="['day-tab', { active: selectedDay === day.id }]"
                      @click="setDay(day.id)"
                      :title="day.name">
                {{ day.name.replace('Day ', 'D') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Matchup Selection -->
        <div class="dashboard-section">
          <div class="section-header">
            <div class="section-icon" :title="panelExpanded ? 'Matchups' : 'Select Matchup'">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <span class="section-title" v-show="panelExpanded">Matchups</span>
          </div>
          <div class="section-content" v-show="panelExpanded">
            <div class="matchup-list">
              <button v-for="matchup in currentDayMatchups" 
                      :key="matchup.id"
                      :class="['matchup-item', { active: selectedMatchup === matchup.id }]"
                      @click="handleMatchupSelect(matchup.id)"
                      :title="matchup.description">
                <span class="matchup-name">{{ matchup.title }}</span>
                <span class="matchup-games">{{ matchup.games === 'auto' ? 'Auto' : matchup.games + 'G' }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Game Controls & Filters Section -->
        <div v-if="selectedMatchup" class="dashboard-section">
          <div class="section-header">
            <div class="section-icon" :title="panelExpanded ? 'Game Controls & Filters' : 'Game Progress'">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="10,8 16,12 10,16 10,8"/>
              </svg>
            </div>
            <span class="section-title" v-show="panelExpanded">Game Controls & Filters</span>
          </div>
          <div class="section-content" v-show="panelExpanded">
            <!-- Game Progress Info -->
            <div class="progress-section">
              <div class="progress-info">
                <span class="progress-label">Game {{ currentGame || 0 }}/{{ maxGames || 0 }}</span>
                <div class="map-indicator" :title="currentMap || 'No map selected'">
                  <svg class="map-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6"/>
                    <line x1="8" y1="2" x2="8" y2="18"/>
                    <line x1="16" y1="6" x2="16" y2="22"/>
                  </svg>
                </div>
              </div>
              <input type="range" 
                     :min="0" 
                     :max="maxGames || 0" 
                     :value="currentGame || 0"
                     @input="updateGameFromSlider"
                     class="game-slider"
                     :title="`Game ${currentGame || 0} of ${maxGames || 0}`">
              <div class="game-actions-label">Click to jump to game | Double-click to filter</div>
            </div>

            <!-- Combined Game Controls Grid -->
            <div class="game-controls-grid">
              <div class="game-circles-container smart-grid" :style="getGridStyle()">
                <button v-for="game in (maxGames || 0)" 
                        :key="`game-${game}`"
                        @click="handleGameClick(game, $event)"
                        @dblclick="toggleGameFilter(game)"
                        :class="['game-circle', { 
                          active: currentGame === game && !selectedGames.includes(game),
                          filtered: selectedGames.includes(game),
                          passed: game < currentGame && !selectedGames.includes(game)
                        }]"
                        :style="getCircularGameStyle(game)"
                        :title="getGameTooltip(game)">
                  {{ game }}
                </button>
              </div>
              <div class="game-controls-actions">
                <button @click="resetGameFilter" class="reset-filter-btn" title="Clear all filters">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Current Map Display -->
            <div class="current-map-display">
              <div class="map-badge" :style="getCurrentMapStyle()">
                <span class="map-name">{{ currentMap || 'Loading...' }}</span>
              </div>
            </div>

            <!-- Playback Controls -->
            <div class="playback-section">
              <button @click="togglePlayback" 
                      class="control-button play-button"
                      :title="isPlaying ? 'Pause playback' : 'Start playback'">
                <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon v-if="!isPlaying" points="5,3 19,12 5,21 5,3"/>
                  <rect v-else x="6" y="4" width="4" height="16"/>
                  <rect v-else x="14" y="4" width="4" height="16"/>
                </svg>
              </button>
              <button @click="restart" 
                      class="control-button reset-button"
                      title="Reset to beginning">
                <svg class="control-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1,4 1,10 7,10"/>
                  <path d="M3.51,15A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3A9,9 0 0,0 4.5,4.5l0,0L1,4"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Advanced Controls Section -->
        <div v-if="selectedMatchup" class="dashboard-section">
          <div class="section-header">
            <div class="section-main">
              <div class="section-icon" :title="panelExpanded ? 'Advanced Controls' : 'Advanced'">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                </svg>
              </div>
              <span class="section-title" v-show="panelExpanded">Advanced Controls</span>
            </div>
            <button @click="toggleAdvancedControls" class="expand-btn" v-show="panelExpanded" :title="advancedControlsExpanded ? 'Collapse advanced controls' : 'Expand advanced controls'">
              {{ advancedControlsExpanded ? '−' : '+' }}
            </button>
          </div>
          <div class="section-content" v-show="panelExpanded">
            <transition name="slide-down">
              <div v-if="advancedControlsExpanded" class="advanced-controls">
                <!-- Export Controls -->
                <div class="control-group">
                  <label class="control-label">Export Data</label>
                  <button @click="exportData" class="export-btn">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7,10 12,15 17,10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export CSV
                  </button>
                </div>
                
                <!-- Legend Toggle -->
                <div class="control-group">
                  <label class="control-label">Chart Legend</label>
                  <button @click="toggleLegend" class="legend-toggle-btn">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 2v20l3-2 3 2V2z"/>
                    </svg>
                    {{ isLegendVisible ? 'Hide' : 'Show' }} Legend
                  </button>
                </div>
                
                <!-- Animation Speed Controls -->
                <div class="control-group">
                  <label class="control-label">Animation Speed</label>
                  <div class="speed-controls">
                    <button 
                      @click="setAnimationSpeed('slow')" 
                      :class="['speed-btn', { active: animationSpeed === 'slow' }]"
                    >
                      Slow
                    </button>
                    <button 
                      @click="setAnimationSpeed('medium')" 
                      :class="['speed-btn', { active: animationSpeed === 'medium' }]"
                    >
                      Medium
                    </button>
                    <button 
                      @click="setAnimationSpeed('fast')" 
                      :class="['speed-btn', { active: animationSpeed === 'fast' }]"
                    >
                      Fast
                    </button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
      
      <!-- Chart Section -->
      <div class="chart-section">
        <transition name="fade" mode="out-in">
          <div v-if="!selectedMatchup" key="loading" class="no-selection">
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
                  Choose from the tournament matchups in the side panel to see detailed race charts with game-by-game progression.
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

          <div v-else key="chart" class="chart-display">
            <!-- Chart Container with proper ID for ChartEngine -->
            <div class="chart-area">
              <InteractiveRaceChart
                :teamConfig="teamConfig"
              />
              <transition name="fade">
                <div v-if="isLoading" class="loading-overlay">
                  <div class="loading-spinner"></div>
                </div>
              </transition>
            </div>

            <!-- Action Panel Component - Moved outside chart-area for full page dragging -->
            <ActionPanel
              :key="`action-panel-${selectedDay}-${selectedMatchup}`"
              :current-map="currentMap"
              @export-requested="handleExportRequested"
            />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { useTeamConfig } from '../composables/useTeamConfig.js'
import TournamentSelector from './TournamentSelector.vue'
import ActionPanel from './ActionPanel.vue'
import InteractiveRaceChart from './InteractiveRaceChart.vue'
import { useTournamentStore } from '../stores/tournament.js'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'TournamentView',
  
  components: {
    TournamentSelector,
    ActionPanel,
    InteractiveRaceChart
  },
  
  props: {
    id: {
      type: String,
      required: true
    }
  },
  
  setup() {
    // Initialize team configuration composable
    const teamConfig = useTeamConfig();
    
    // Return for template usage
    return {
      teamConfig
    };
  },
  
  data() {
    console.log('📋 TournamentView data() called - Vue is initializing');
    
    // Detect tournament type from route parameter
    const tournamentId = this.id;
    const isYear5 = tournamentId === 'year-5-open';
    const isEwc2025 = tournamentId === 'ewc-2025';
    
    console.log('🎯 Tournament Detection:', {
      tournamentId,
      isYear5: isYear5,
      isEwc2025: isEwc2025,
      tournamentType: isEwc2025 ? 'EWC 2025' : (isYear5 ? 'Year 5 Open' : 'Year 4 Championship')
    });
    
    return {
      // Tournament detection
      isYear5Tournament: isYear5,
      isEwc2025Tournament: isEwc2025,

      // Simple UI state (non-data related)
      currentMap: '',
      
      // Status tracking for UI
      loadedMatchups: new Set(),
      loadingMatchups: new Set(),
      
      // Animation intervals
      playInterval: null,
      gameStateInterval: null,
      
      // Game selection state
      selectedGames: [],
      
      // Dashboard panel state
      panelExpanded: false,
      isSmallWindow: false,
      
      // Advanced controls state
      advancedControlsExpanded: false,
      
      // Tournament days data
      tournamentDays: []
    }
  },
  
  watch: {
    // Watch for route changes to update tournament type
    '$route'(newRoute, oldRoute) {
      console.log('🔄 Route changed:', { from: oldRoute.params.id, to: newRoute.params.id });
      
      if (newRoute.params.id !== oldRoute.params.id) {
        // Update tournament detection flags
        this.isYear5Tournament = newRoute.params.id === 'year-5-open';
        this.isEwc2025Tournament = newRoute.params.id === 'ewc-2025';
        
        // Set tournament type in store
        const tournamentType = this.isEwc2025Tournament ? 'ewc2025' : 
                               (this.isYear5Tournament ? 'year5' : 'year4');
        this.setTournamentType(tournamentType);
        
        // Re-initialize tournament days data
        this.initializeTournamentDays();
        
        // Clear existing selections
        this.cleanupChart();
        
        console.log('✅ Tournament type updated:', {
          tournamentType,
          isYear5: this.isYear5Tournament,
          isEwc2025: this.isEwc2025Tournament
        });
      }
    },
    
    // Watch for play/pause state changes to handle animation
    isPlaying: {
      handler(newIsPlaying, oldIsPlaying) {
        console.log('🎮 Play state changed:', { from: oldIsPlaying, to: newIsPlaying });
        
        if (newIsPlaying) {
          this.startAnimation();
        } else {
          this.stopAnimation();
        }
      },
      immediate: false
    },
    
    // Watch for matchup changes and fetch data from store
    selectedMatchup(newMatchup, oldMatchup) {
      console.log('📊 TournamentView: selectedMatchup changed:', { from: oldMatchup, to: newMatchup });
      if (newMatchup) {
        this.fetchDataForMatchup();
        this.updateCurrentMap();
      }
    },
    
    selectedDay() {
      this.cleanupChart();
    },
    
    maxGames(newMaxGames, oldMaxGames) {
      if (newMaxGames !== oldMaxGames) {
        console.log('🎮 TournamentView: maxGames changed from', oldMaxGames, 'to', newMaxGames);
      }
    },

    // Watch for data changes to update current map
    processedChartData() {
      this.updateCurrentMap();
    },

    currentGame() {
      this.updateCurrentMap();
    }
  },
  
  computed: {
    ...mapState(useTournamentStore, [
      'selectedMatchup',
      'selectedDay',
      'isPlaying',
      'currentGame',
      'processedChartData',
      'isLoading',
      'errorMessage',
      'maxGames',
      'isLegendVisible',
      'animationSpeed'
    ]),
    
    currentDayMatchups() {
      const currentDay = this.tournamentDays.find(day => day.id === this.selectedDay);
      return currentDay ? currentDay.matchups : [];
    }
  },
  
  mounted() {
    console.log('🎯 TournamentView mounted() called - Vue component is ready');
    
    // Set tournament type in store based on route
    const tournamentType = this.isEwc2025Tournament ? 'ewc2025' : 
                           (this.isYear5Tournament ? 'year5' : 'year4');
    this.setTournamentType(tournamentType);
    
    // Initialize tournament days data
    this.initializeTournamentDays();
    
    // Initialize window resize handling
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    
    // Set initial panel state - always expanded unless small window
    this.panelExpanded = !this.isSmallWindow;
    
    // Initialize professional header animations with GSAP
    this.initializeHeaderAnimations();
    
    // Initialize chart loading animation
    this.initializeChartLoadingAnimation();
    
    // Set up periodic updates for game state
    this.gameStateInterval = setInterval(() => {
      // Remove chartEngine dependency since we're handling state directly in Vue
      // The new animation system is handled via watchers and intervals
    }, 300);
    
    // Add debug method to global scope for troubleshooting
    window.debugTournamentView = () => {
      console.log('🔍 Tournament View Debug Info:', {
        selectedDay: this.selectedDay,
        selectedMatchup: this.selectedMatchup,
        computedMaxGames: this.maxGames,
        isEwc2025Tournament: this.isEwc2025Tournament,
        tournamentSelector: !!this.$refs.tournamentSelector,
        processedChartData: this.processedChartData?.length || 0
      });
    };
  },
  
  methods: {
    ...mapActions(useTournamentStore, [
      'selectMatchup',
      'setPlaying',
      'setCurrentGame',
      'setDay',
      'setTournamentType',
      'fetchDataForMatchup',
      'resetPlayback',
      'toggleLegend',
      'setAnimationSpeed',
      'setGameFilter'
    ]),
    
    // Initialize tournament days data
    initializeTournamentDays() {
      this.tournamentDays = this.isEwc2025Tournament ? [
        {
          id: 'day1',
          name: 'Day 1 - Group A',
          matchups: [{
            id: 'Day1-A',
            title: 'Group A',
            description: 'EWC 2025 Day 1 Group A featuring 20 elite teams',
            games: 'auto'
          }]
        },
        {
          id: 'day2',
          name: 'Day 2 - Group B',
          matchups: [{
            id: 'Day2-B',
            title: 'Group B',
            description: 'EWC 2025 Day 2 Group B featuring 20 elite teams',
            games: 'auto'
          }]
        },
        {
          id: 'day3',
          name: 'Day 3 - Last Chance',
          matchups: [{
            id: 'Day3-LastChance',
            title: 'Last Chance',
            description: 'EWC 2025 Day 3 Last Chance featuring 20 elite teams',
            games: 'auto'
          }]
        }
      ] : this.isYear5Tournament ? [
        {
          id: 'day1',
          name: 'Day 1 - Winners R1',
          matchups: [
            { id: 'Day1-WinnersRound1-1', title: 'Winners R1 #1', description: 'Year 5 Winners Round 1 #1', games: 6 },
            { id: 'Day1-WinnersRound1-2', title: 'Winners R1 #2', description: 'Year 5 Winners Round 1 #2', games: 6 },
            { id: 'Day1-WinnersRound1-3', title: 'Winners R1 #3', description: 'Year 5 Winners Round 1 #3', games: 6 },
            { id: 'Day1-WinnersRound1-4', title: 'Winners R1 #4', description: 'Year 5 Winners Round 1 #4', games: 6 },
            { id: 'Day1-WinnersRound1-5', title: 'Winners R1 #5', description: 'Year 5 Winners Round 1 #5', games: 6 },
            { id: 'Day1-WinnersRound1-6', title: 'Winners R1 #6', description: 'Year 5 Winners Round 1 #6', games: 6 }
          ]
        }
      ] : [
        {
          id: 'day1',
          name: 'Day 1 - Groups',
          matchups: [
            { id: 'AvsB', title: 'A vs B', description: 'Group A vs Group B matchup', games: 6 },
            { id: 'CvsD', title: 'C vs D', description: 'Group C vs Group D matchup', games: 6 },
            { id: 'BvsD', title: 'B vs D', description: 'Group B vs Group D matchup', games: 6 }
          ]
        },
        {
          id: 'day2',
          name: 'Day 2 - Cross Groups',
          matchups: [
            { id: 'AvsC', title: 'A vs C', description: 'Group A vs Group C matchup', games: 6 },
            { id: 'BvsC', title: 'B vs C', description: 'Group B vs Group C matchup', games: 6 },
            { id: 'AvsD', title: 'A vs D', description: 'Group A vs Group D matchup', games: 6 }
          ]
        },
        {
          id: 'day3',
          name: 'Day 3 - Elimination',
          matchups: [
            { id: 'ER1', title: 'Elimination R1', description: 'First elimination round', games: 8 }
          ]
        },
        {
          id: 'day4',
          name: 'Day 4 - Finals',
          matchups: [
            { id: 'ER2', title: 'Elimination R2', description: 'Second elimination round', games: 8 },
            { id: 'WR1', title: 'Winners R1', description: 'Winners bracket final', games: 8 }
          ]
        }
      ];
    },
    
    // Dashboard panel methods
    expandPanel() {
      if (this.isSmallWindow) {
        this.panelExpanded = true;
      }
    },
    
    collapsePanel() {
      if (this.isSmallWindow) {
        this.panelExpanded = false;
      }
    },
    
    // Window resize handler
    handleResize() {
      const wasSmallWindow = this.isSmallWindow;
      this.isSmallWindow = window.innerWidth < 1200; // Adjust breakpoint as needed
      
      // If transitioning from small to large window, ensure panel is expanded
      if (wasSmallWindow && !this.isSmallWindow) {
        this.panelExpanded = true;
      }
      // If transitioning from large to small window, collapse panel
      else if (!wasSmallWindow && this.isSmallWindow) {
        this.panelExpanded = false;
      }
    },
    
    // Handle matchup selection with proper data fetching
    async handleMatchupSelect(matchupId) {
      console.log('🎯 Handling matchup selection:', matchupId);
      
      try {
        // Clear any existing data first
        this.cleanupChart();
        
        // Select the matchup in the store
        await this.selectMatchup(matchupId);
        
        // Add a small delay to ensure store state is updated
        await this.$nextTick();
        
        // Trigger data fetching for the selected matchup
        await this.fetchDataForMatchup();
        
        console.log('✅ Matchup selection completed:', {
          selectedMatchup: this.selectedMatchup,
          hasData: !!(this.processedChartData && this.processedChartData.length > 0),
          maxGames: this.maxGames
        });
        
      } catch (error) {
        console.error('❌ Error handling matchup selection:', error);
      }
    },
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
    
    // Event handlers for child components - REMOVED DUPLICATE, see comprehensive version below

    // REMOVE the handleMatchupSelected method - now handled by watcher

    // REMOVE handleGameChanged and handleRestartRequested methods
    // These are now handled directly by the store actions

    startAnimation() {
      console.log('🎬 Starting animation from game', this.currentGame);
      
      // Clear any existing animation
      this.stopAnimation();
        
      // If we're at the end, restart from game 1
      if (this.currentGame >= this.maxGames) {
        this.setCurrentGame(1);
      } else if (this.currentGame === 0) {
        // If at initial state, start from game 1
        this.setCurrentGame(1);
      }
      
      // Start the animation interval
      this.playInterval = setInterval(() => {
        if (this.currentGame < this.maxGames) {
          this.setCurrentGame(this.currentGame + 1);
        this.updateCurrentMap();
          console.log('🎮 Animation progressed to game', this.currentGame);
        } else {
          // Reached the end, stop playing
          console.log('🏁 Animation completed');
          this.setPlaying(false); // Use the action to update the store
        }
      }, 3000); // 3 seconds per game - adjust speed as needed
    },

    stopAnimation() {
      if (this.playInterval) {
        clearInterval(this.playInterval);
        this.playInterval = null;
        console.log('⏸️ Animation stopped');
          }
    },

    // REMOVE the handleGameFilterChanged method entirely

    handleExportRequested(selectedMatchup) {
      console.log('📤 Export requested for:', selectedMatchup);
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        // Generate CSV content from processed chart data
        const csvContent = this.generateCSVContent(this.processedChartData, selectedMatchup);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedMatchup}_export.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
      } else {
        console.warn('⚠️ No chart data available for export');
      }
    },

    generateCSVContent(data, matchupName) {
      if (!data || data.length === 0) return '';
      
      // Create CSV header
      const maxGames = Math.max(...data.map(team => team.games?.length || 0));
      const headers = ['Team', 'Total Points'];
      for (let i = 1; i <= maxGames; i++) {
        headers.push(`Game ${i} Points`, `Game ${i} Map`);
        }
        
      // Create CSV rows
      const rows = [headers.join(',')];
      
      data.forEach(team => {
        const row = [team.team];
        
        // Calculate total points
        const totalPoints = team.games?.reduce((sum, game) => sum + (game.points || 0), 0) || 0;
        row.push(totalPoints);
        
        // Add game-by-game data
        for (let i = 1; i <= maxGames; i++) {
          const game = team.games?.find(g => g.gameNumber === i);
          row.push(game?.points || 0);
          row.push(game?.map || '');
        }
        
        rows.push(row.join(','));
      });
      
      return rows.join('\n');
    },

    // REMOVE the handleLegendToggled method entirely
    // handleLegendToggled(visible) {
    //   console.log('🎨 Toggling chart legend:', visible ? 'ON' : 'OFF');
    //   this.isLegendVisible = visible;
    // },

    // REMOVE the handleAnimationSpeedChanged method entirely

    /**
     * Enhanced cleanup method with error handling and race condition prevention
     */


    // REMOVE the handleDayChanged method - now handled by watcher


    
    getMatchupTitle(matchupId) {
      if (!this.$refs.tournamentSelector) return 'Unknown Matchup';
      
      const matchupInfo = this.$refs.tournamentSelector.getMatchupInfo(matchupId);
      return matchupInfo ? matchupInfo.title : 'Unknown Matchup';
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
    
    updateCurrentMap() {
      // Get map name from chart data based on current game
      if (this.currentGame === 0) {
        this.currentMap = 'Initial State';
      } else if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const currentGameData = firstTeam.games.find(game => game.gameNumber === this.currentGame);
          if (currentGameData && currentGameData.map) {
            this.currentMap = `Game ${this.currentGame} - ${currentGameData.map}`;
          } else {
            this.currentMap = `Game ${this.currentGame}`;
          }
        } else {
          this.currentMap = `Game ${this.currentGame}`;
          }
      } else {
        this.currentMap = `Game ${this.currentGame}`;
      }
    },

    async cleanupChart() {
      console.log('🧹 TournamentView: Cleaning up chart resources');
      
      try {
        // Reset UI state (data clearing is handled by the store)
        this.setCurrentGame(0);
        this.currentMap = '';
        this.setPlaying(false);
        
        // Stop any ongoing animation
        this.stopAnimation();
        
        console.log('✅ Chart cleanup completed successfully');
      } catch (error) {
        console.warn('⚠️ Error during chart cleanup:', error);
      }
    },
    
    // Add new methods for side panel game controls
    updateGameFromSlider(event) {
      const gameValue = Math.min(Math.max(0, parseInt(event.target.value)), this.maxGames);
      this.setCurrentGame(gameValue);
    },
    
    selectGame(gameNum) {
      // Set the current game to the selected game
      this.setCurrentGame(gameNum);
    },
    
    // Combined game click handler - jump to game or toggle filter
    handleGameClick(gameNum, event) {
      console.log('🎮 Game button clicked:', { gameNum, shiftKey: event?.shiftKey });
      
      if (event && event.shiftKey) {
        // Shift+click to toggle filter
        console.log('🎯 Toggling filter for game:', gameNum);
        this.toggleGameFilter(gameNum);
      } else {
        // Regular click to jump to game
        console.log('🎮 Jumping to game:', gameNum);
        this.selectGame(gameNum);
      }
    },
    
    togglePlayback() {
      this.setPlaying(!this.isPlaying);
    },
    
    restart() {
      this.resetPlayback();
    },
    
    getGameButtonStyle(gameNum) {
      const isActive = this.currentGame === gameNum;
      
      // Get map color for this game from chart data
      let gameColor = '#6366f1'; // default fallback
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const gameData = firstTeam.games.find(game => game.gameNumber === gameNum);
          if (gameData && gameData.color) {
            gameColor = gameData.color;
          }
        }
      }
      
      return {
        background: `linear-gradient(135deg, ${gameColor} 0%, ${this.adjustColor(gameColor, -10)} 100%)`,
        border: `2px solid ${gameColor}`,
        color: '#ffffff',
        boxShadow: isActive ? `0 0 8px ${gameColor}60, 0 2px 4px rgba(0,0,0,0.3)` : 'none',
        transform: isActive ? 'scale(1.05)' : 'scale(1)'
      };
    },
    
    // Circular game style with highlighting for current, filtered, and passed games
    getCircularGameStyle(gameNum) {
      const isCurrent = this.currentGame === gameNum;
      const isFiltered = this.selectedGames.includes(gameNum);
      const isPassed = gameNum < this.currentGame;
      
      // Get map color for this game from chart data
      let gameColor = '#6366f1'; // default fallback
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const gameData = firstTeam.games.find(game => game.gameNumber === gameNum);
          if (gameData && gameData.color) {
            gameColor = gameData.color;
          }
        }
      }
      
      // Base styles
      let baseStyles = {
        background: `linear-gradient(135deg, ${gameColor} 0%, ${this.adjustColor(gameColor, -10)} 100%)`,
        border: `2px solid ${gameColor}`,
        color: '#ffffff'
      };
      
      // Filtered games - unique visual style with inner glow
      if (isFiltered) {
        baseStyles.background = `radial-gradient(circle at center, ${gameColor} 0%, ${this.adjustColor(gameColor, -20)} 70%, ${this.adjustColor(gameColor, -40)} 100%)`;
        baseStyles.border = `3px solid ${gameColor}`;
        baseStyles.boxShadow = `inset 0 0 12px ${this.adjustColor(gameColor, 30)}, 0 0 16px ${gameColor}60`;
        baseStyles.transform = 'scale(1.05)';
        baseStyles.position = 'relative';
      }
      // Current game highlighting (only if not filtered)
      else if (isCurrent) {
        baseStyles.boxShadow = `0 0 12px ${gameColor}80, 0 0 24px ${gameColor}40`;
        baseStyles.transform = 'scale(1.15)';
        baseStyles.zIndex = '10';
      }
      // Passed games highlighting
      else if (isPassed) {
        baseStyles.opacity = '0.7';
        baseStyles.background = `linear-gradient(135deg, ${this.adjustColor(gameColor, -20)} 0%, ${this.adjustColor(gameColor, -30)} 100%)`;
        baseStyles.border = `2px solid ${this.adjustColor(gameColor, -15)}`;
      }
      // Future games (default state)
      else {
        baseStyles.opacity = '0.6';
        baseStyles.background = `linear-gradient(135deg, ${this.adjustColor(gameColor, -40)} 0%, ${this.adjustColor(gameColor, -50)} 100%)`;
        baseStyles.border = `2px solid ${this.adjustColor(gameColor, -35)}`;
      }
      
      return baseStyles;
    },
    
    adjustColor(hexColor, percent) {
      // Simple color adjustment utility
      if (!hexColor || typeof hexColor !== 'string' || !hexColor.startsWith('#')) {
        return hexColor || '#dc2626';
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
    
    // Smart grid layout based on number of games
    getGridStyle() {
      const totalGames = this.maxGames || 0;
      if (totalGames === 0) return {};
      
      // Calculate optimal rows and columns
      const cols = Math.ceil(Math.sqrt(totalGames));
      const rows = Math.ceil(totalGames / cols);
      
      return {
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gap: '6px'
      };
    },
    
    // Get current tournament display text
    getCurrentTournamentText() {
      if (!this.selectedMatchup) return '';
      
      // Get matchup info from tournament selector
      const matchupInfo = this.$refs.tournamentSelector?.getMatchupInfo(this.selectedMatchup);
      if (!matchupInfo) return '';
      
      // Format based on tournament type
      if (this.isEwc2025Tournament) {
        if (this.selectedMatchup.includes('Day1')) return 'T1 Group A';
        if (this.selectedMatchup.includes('Day2')) return 'T2 Group B';
        if (this.selectedMatchup.includes('Day3')) return 'T3 Last Chance';
      } else if (this.isYear5Tournament) {
        return 'T1 Winners R1';
      } else {
        // Year 4 tournament
        if (this.selectedMatchup.includes('ER1')) return 'T3 Elimination R1';
        if (this.selectedMatchup.includes('ER2')) return 'T4 Elimination R2';
        if (this.selectedMatchup.includes('WR1')) return 'T4 Winners R1';
        if (this.selectedDay === 'day1') return 'T1 Group Stage';
        if (this.selectedDay === 'day2') return 'T2 Cross Groups';
      }
      
      return 'Tournament';
    },
    
    // Game filter methods
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
          this.setCurrentGame(this.maxGames);
        }
      }
      
      // Call the store action
      this.setGameFilter({ 
        games: this.selectedGames, 
        action: wasSelected ? 'remove' : 'add',
        gameNum,
        maxGames: this.maxGames
      });
    },
    
    resetGameFilter() {
      console.log('🔄 Resetting game filter and returning to initial state');
      this.selectedGames = [];
      
      this.setGameFilter({ games: [], action: 'clear', maxGames: this.maxGames });
      this.setCurrentGame(0); // Also reset game progress
    },
    
    getGameTooltip(gameNum) {
      // Get map name from chart data if available
      let mapName = '';
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const gameData = firstTeam.games.find(game => game.gameNumber === gameNum);
          if (gameData && gameData.map) {
            mapName = ` - ${gameData.map}`;
          }
        }
      }
      
      return `Game ${gameNum}${mapName}`;
    },
    
    getCurrentMapStyle() {
      let mapColor = '#10b981'; // default fallback
      
      // Get map color for current game from chart data
      if (this.processedChartData && this.processedChartData.length > 0 && this.currentGame > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const currentGameData = firstTeam.games.find(game => game.gameNumber === this.currentGame);
          if (currentGameData && currentGameData.color) {
            mapColor = currentGameData.color;
          }
        }
      }
      
      return {
        background: `linear-gradient(135deg, ${mapColor} 0%, ${this.adjustColor(mapColor, -20)} 100%)`,
        border: `2px solid ${mapColor}`,
        color: '#ffffff',
        boxShadow: `0 0 15px ${mapColor}60, 0 4px 8px rgba(0,0,0,0.3)`
      };
    },
    
    // Advanced controls toggle
    toggleAdvancedControls() {
      this.advancedControlsExpanded = !this.advancedControlsExpanded;
    },
    
    // Export data handler
    exportData() {
      if (this.processedChartData && this.processedChartData.length > 0) {
        const selectedMatchup = this.selectedMatchup;
        
        // Generate CSV content from processed chart data
        const csvContent = this.generateCSVContent(this.processedChartData, selectedMatchup);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedMatchup}_export.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
      } else {
        console.warn('⚠️ No chart data available for export');
      }
    }
  },
  
  beforeUnmount() {
    console.log('🧹 TournamentView beforeUnmount() called - cleaning up');
    
    // Remove window resize listener
    window.removeEventListener('resize', this.handleResize);
    
    // Stop any ongoing animation
    this.stopAnimation();
    
    // Clear game state interval
    if (this.gameStateInterval) {
      clearInterval(this.gameStateInterval);
      this.gameStateInterval = null;
    }
    
    // Clear any sync intervals if they exist
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    // Clean up chart
    this.cleanupChart();
  }
}
</script>

<!-- No scoped styles needed as the CSS is already in championship.css --> 