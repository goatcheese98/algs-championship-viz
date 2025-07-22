<template>
  <div id="app">
    
    <header class="tournament-header">
      <div class="header-background">
        <div class="glow-orb glow-orb-1"></div>
        <div class="glow-orb glow-orb-2"></div>
        <div class="glow-orb glow-orb-3"></div>
        <div class="header-grid-pattern"></div>
      </div>
      
      <div class="header-content">
        <div class="header-top">
          <div class="header-branding">
            <div ref="championshipLogo" class="championship-logo">
              <div ref="logoIcon" class="logo-icon apex-logo">
                <object data="/src/assets/svg/apex-logo.svg" 
                        type="image/svg+xml" 
                        class="apex-logo-svg">
                  <img src="/src/assets/svg/apex-logo.svg" 
                       alt="ALGS Apex Logo" 
                       class="apex-logo-fallback" />
                </object>
              </div>
              <div ref="logoParticles" class="logo-particles"></div>
            </div>
            
            <div class="brand-info">
              <div class="brand-subtitle">Apex Legends Global Series</div>
              <div class="tournament-status">
                <span class="status-indicator ended"></span>
                <span class="status-text">Tournament Ended</span>
              </div>
              <div ref="championshipTitle" class="championship-title">
                <h1 ref="titleMain" class="title-main">
                  {{ isEwc2025Tournament ? '' : (isYear5Tournament ? 'ALGS Year 5 Open' : '') }}
                </h1>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <div ref="tournamentInfo" class="tournament-info-inline">
              <div ref="infoItem1" class="tournament-header-card">
                <div class="info-icon-container">
                  <span ref="infoIcon1" class="info-icon">
                    {{ isEwc2025Tournament ? '🏆' : (isYear5Tournament ? '🌍' : '📍') }}
                  </span>
                </div>
                <div class="info-content">
                  <div class="info-label">Event</div>
                  <div ref="infoText1" class="info-value">
                    {{ isEwc2025Tournament ? 'Championship Tournament' : (isYear5Tournament ? 'Global Tournament' : 'Sapporo, Japan') }}
                  </div>
                </div>
              </div>

              <div ref="infoItem2" class="tournament-header-card">
                <div class="info-icon-container">
                  <span ref="infoIcon2" class="info-icon">📅</span>
                </div>
                <div class="info-content">
                  <div class="info-label">Schedule</div>
                  <div ref="infoText2" class="info-value">
                    {{ isEwc2025Tournament ? 'Day 1 - Group A' : (isYear5Tournament ? 'Split 1 - 2025' : 'Jan 29 - Feb 2, 2025') }}
                  </div>
                </div>
              </div>

              <div ref="infoItem3" class="tournament-header-card">
                <div class="info-icon-container">
                  <span ref="infoIcon3" class="info-icon">⚔️</span>
                </div>
                <div class="info-content">
                  <div class="info-label">Format</div>
                  <div ref="infoText3" class="info-value">
                    {{ isEwc2025Tournament ? '20 Teams' : (isYear5Tournament ? '6 Tournament Rounds' : '40 Teams') }}
                  </div>
                </div>
              </div>
            </div>
            
            <nav class="header-nav">
              <router-link to="/" class="tournament-nav-button">
                <span class="tournament-text">Dashboard</span>
              </router-link>
              <router-link v-if="isYear5Tournament" to="/tournament/year-4-championship" class="tournament-nav-button">
                <span class="tournament-text">Year 4</span>
              </router-link>
              <router-link v-if="isEwc2025Tournament" to="/tournament/year-4-championship" class="tournament-nav-button">
                <span class="tournament-text">Year 4</span>
              </router-link>
              <router-link v-if="isEwc2025Tournament" to="/tournament/year-5-open" class="tournament-nav-button">
                <span class="tournament-text">Year 5</span>
              </router-link>
            </nav>
          </div>
        </div>
      </div>
    </header>

    <!-- Tournament Selector (outside grid) -->
    <TournamentSelector
      ref="tournamentSelector"
      :is-year5-tournament="isYear5Tournament"
      :is-ewc2025-tournament="isEwc2025Tournament"
      :loaded-matchups="loadedMatchups"
      :loading-matchups="loadingMatchups"
      style="display: none;"
    />
    
    <div class="main-layout bento-grid">
      <!-- Left Column: Tournament Controls -->
      <div class="left-column" :class="{ 'adjust-controls-layout': shouldAdjustControlsLayout }">
        
        <div class="dashboard-panel" :class="{ 'has-collapsed-sections': hasCollapsedSections }">
          
          
          <div class="dashboard-header">
            <div class="dashboard-main">
              <div ref="dashboardTitle" class="dashboard-title-enhanced">
                <span ref="dashboardText" class="dashboard-text">Tournament Dashboard</span>
                <div ref="dashboardGlow" class="dashboard-glow"></div>
              </div>
            </div>
          </div>
          
          
          <div class="dashboard-section">
            <div class="section-header" @click="toggleTournamentDays">
              <div class="section-main">
                <div class="section-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <span class="section-title">Tournament Days</span>
              </div>
              <div class="collapse-icon">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                     :style="{ transform: tournamentDaysCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
            <transition name="slide-down">
              <div v-show="!tournamentDaysCollapsed" class="section-content">
                <div class="algs-day-cards">
                  <div v-for="day in tournamentDays" 
                       :key="day.id"
                       :class="['algs-day-card', { active: selectedDay === day.id }]"
                       @click="setDay(day.id)"
                       :title="day.name">
                    {{ day.name }}
                  </div>
                </div>
              </div>
            </transition>
          </div>

          
          <div class="dashboard-section">
            <div class="section-header" @click="toggleMatchups">
              <div class="section-main">
                <div class="section-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <span class="section-title">Matchups</span>
              </div>
              <div class="collapse-icon">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                     :style="{ transform: matchupsCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }">
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </div>
            </div>
            <transition name="slide-down">
              <div v-show="!matchupsCollapsed" class="section-content">
                <div class="algs-matchup-list">
                  <div v-for="matchup in currentDayMatchups" 
                       :key="matchup.id"
                       :class="['algs-sidebar-matchup', { active: selectedMatchup === matchup.id }]"
                       @click="handleMatchupSelect(matchup.id)"
                       :title="matchup.description">
                    <span class="matchup-name">{{ matchup.title }}</span>
                    <span class="matchup-games">{{ matchup.games === 'auto' ? '' : matchup.games + 'G' }}</span>
                  </div>
                </div>
              </div>
            </transition>
          </div>
          
        </div>
      </div>
      
      <!-- Right Column: Chart Visualization -->
      <div class="chart-container" :class="{ compressed: isChartCompressed }">
        
        <div class="chart-title-section" v-if="selectedMatchup">
          <div class="chart-title-accent"></div>
          <div class="chart-title-corners"></div>
          <div class="chart-title-container">
            <div class="chart-title-main">
              <h2 class="chart-title">{{ dynamicChartTitle }}</h2>
              <div class="chart-subtitle" v-if="dynamicChartSubtitle">{{ dynamicChartSubtitle }}</div>
            </div>
            
            <!-- Chart View Toggle Button -->
            <div class="chart-view-toggle">
              <button @click="toggleChartView" 
                      class="view-toggle-btn"
                      :title="isChartCompressed ? 'Expand Chart View' : 'Compress Chart View'">
                <div class="toggle-icon">
                  <svg v-if="isChartCompressed" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15,3 21,3 21,9"></polyline>
                    <polyline points="9,21 3,21 3,15"></polyline>
                    <line x1="21" y1="3" x2="14" y2="10"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="4,14 10,14 10,20"></polyline>
                    <polyline points="20,10 14,10 14,4"></polyline>
                    <line x1="14" y1="10" x2="21" y2="3"></line>
                    <line x1="3" y1="21" x2="10" y2="14"></line>
                  </svg>
                </div>
                <span class="toggle-label">{{ isChartCompressed ? 'EXPAND' : 'COMPRESS' }}</span>
              </button>
            </div>
          </div>
        </div>
        
        <transition name="chart-fade" mode="out-in">
          
          <!-- Loading State -->
          <div v-if="!selectedMatchup" key="loading" ref="chartLoadingContainer" class="chart-loading-container">
            
            <div ref="centralGlow" class="central-glow"></div>
            
            <div class="chart-bars-container">
              <div ref="chartBar1" class="chart-bar chart-bar-1"></div>
              <div ref="chartBar2" class="chart-bar chart-bar-2"></div>
              <div ref="chartBar3" class="chart-bar chart-bar-3"></div>
              <div ref="chartBar4" class="chart-bar chart-bar-4"></div>
              <div ref="chartBar5" class="chart-bar chart-bar-5"></div>
              
              <div ref="connectingLine" class="connecting-line"></div>
            </div>
            
            <div ref="outerRing" class="outer-ring">
              <div class="ring-circle"></div>
              <div class="ring-dot ring-dot-1"></div>
              <div class="ring-dot ring-dot-2"></div>
            </div>
            
            <div ref="innerRing" class="inner-ring">
              <div class="inner-ring-circle"></div>
              <div class="inner-ring-dot"></div>
            </div>
            
            <div ref="roamingCircle1" class="roaming-circle roaming-circle-1"></div>
            <div ref="roamingCircle2" class="roaming-circle roaming-circle-2"></div>
            <div ref="roamingCircle3" class="roaming-circle roaming-circle-3"></div>
            <div ref="roamingCircle4" class="roaming-circle roaming-circle-4"></div>
            
            <div ref="scanningLine" class="scanning-line"></div>
            
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
            
            <div ref="accentLine" class="accent-line"></div>
            
            <div class="corner-accent corner-accent-tl"></div>
            <div class="corner-accent corner-accent-tr"></div>
            <div class="corner-accent corner-accent-bl"></div>
            <div class="corner-accent corner-accent-br"></div>
            
            <div ref="floatingDot1" class="floating-dot floating-dot-1"></div>
            <div ref="floatingDot2" class="floating-dot floating-dot-2"></div>
            <div ref="floatingDot3" class="floating-dot floating-dot-3"></div>
            <div ref="floatingDot4" class="floating-dot floating-dot-4"></div>
            
          </div>
          
          <!-- Chart State - Direct Component -->
          <div v-else key="chart" class="chart-component-container">
            <InteractiveRaceChart
              ref="interactiveChart"
              :class="{ compressed: isChartCompressed }"
              :teamConfig="teamConfig"
              :compressionFactor="isChartCompressed ? 0.8 : 1.0"
              style="width: 100%; height: 100%; min-height: 600px;"
            />
            
            <transition name="fade">
              <div v-if="isLoading" class="loading-overlay">
                <div class="loading-spinner"></div>
              </div>
            </transition>
          </div>
          
        </transition>
        
        <!-- Commentary Panel (independent, outside transition) -->
        <div v-if="selectedMatchup" class="commentary-panel" ref="commentarySection">
          <div class="panel-border">
            <div class="corner-accent top-left"></div>
            <div class="corner-accent top-right"></div>
            <div class="corner-accent bottom-left"></div>
            <div class="corner-accent bottom-right"></div>
          </div>
          
          <!-- Side by Side Content Layout -->
          <div class="commentary-layout">
            <!-- Left Side - Commentary Text with Inline Map Badge -->
            <div class="commentary-content">
              <div class="commentary-with-badge">
                <div v-if="currentGame > 0" class="inline-map-badge" :style="getCurrentGameBadgeStyle()">
                  <div class="badge-glow"></div>
                  <span class="game-number">{{ currentGame }}</span>
                  <span class="divider">//</span>
                  <span class="game-map" 
                        @mouseenter="showCommentaryMapTooltip"
                        @mousemove="updateCommentaryTooltipPosition"
                        @mouseleave="hideCommentaryMapTooltip">{{ getCurrentMapName() }}</span>
                </div>
                <p class="commentary-text">{{ commentaryText }}</p>
              </div>
            </div>

            <!-- Right Side - Compact Dominance Containers -->
            <div class="dominance-containers" v-if="currentGame > 0">
              <!-- Current Dominance (Cumulative) -->
              <div class="dominance-compact current" v-if="getTopTeams().length > 0">
                <div class="dominance-header">
                  <span class="dominance-title">CURRENT DOMINANCE</span>
                </div>
                <div class="teams-compact">
                  <div v-for="(team, index) in getTopTeams().slice(0, 3)" 
                       :key="`current-${team.team}`" 
                       :class="['team-compact', `rank-${index + 1}`]">
                    <span class="rank">{{ index + 1 }}</span>
                    <span class="name">{{ team.team }}</span>
                    <span class="points">{{ team.totalPoints }}</span>
                  </div>
                </div>
              </div>

              <!-- Match Dominance (Single Game) -->
              <div class="dominance-compact match" v-if="getMatchTopTeams().length > 0">
                <div class="dominance-header">
                  <span class="dominance-title">MATCH DOMINANCE</span>
                </div>
                <div class="teams-compact">
                  <div v-for="(team, index) in getMatchTopTeams().slice(0, 3)" 
                       :key="`match-${team.team}`" 
                       :class="['team-compact', `rank-${index + 1}`]">
                    <span class="rank">{{ index + 1 }}</span>
                    <span class="name">{{ team.team }}</span>
                    <span class="points">{{ team.matchPoints }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ActionPanel positioned absolutely outside grid layout -->
    <ActionPanel
      v-if="selectedMatchup"
      :current-map="currentMap"
      @export-requested="exportData"
      :key="`action-panel-${selectedDay}-${selectedMatchup}`"
      class="action-panel-floating"
    />
    
  </div>
</template>

<script>
import { useTeamConfig } from '../composables/useTeamConfig.js'
import TournamentSelector from './TournamentSelector.vue'
import ActionPanel from './ActionPanel.vue'
import InteractiveRaceChart from './InteractiveRaceChart.vue'
import { useTournamentStore } from '../stores/tournament.js'
import { mapActions, mapState } from 'pinia'
import { gsap } from 'gsap'
import { createCommentary } from '../data/commentary.js'
import { getMapImageUrl } from '../data/tournaments'

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
      tournamentType: isEwc2025 ? 'ALGS Championship' : (isYear5 ? 'Year 5 Open' : 'Year 4 Championship')
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
      
      // Game selection state
      selectedGames: [],
      
      // ALGS Championship state
      isGroupStageActive: true,
      isBracketStageActive: false,
      isTeamsActive: false,
      championTeam: '',
      
      // Advanced controls state
      advancedControlsExpanded: false,
      
      // Collapsible sections state
      tournamentDaysCollapsed: false,
      matchupsCollapsed: false,
      
      // Debug collision detection
      collisionDebug: {
        dashboardRect: null,
        controlsRect: null,
        horizontalOverlap: false,
        verticallyRelated: false,
        isInOriginalPosition: false,
        shouldAffect: false
      },
      
      // Tournament days data
      tournamentDays: [],
      
      // ResizeObserver for dynamic positioning
      dashboardResizeObserver: null,
      
      // Chart view state
      isChartCompressed: false,
      
      // Dynamic height measurement for synchronized compression
      originalChartHeight: 0,
      originalSectionHeight: 0,
      compressionReduction: 0,
      nonChartContentHeight: 0,
      
      // Map tooltip for commentary section
      mapTooltip: null,
      
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
        // Note: Controls positioning now handled by CSS Grid layout
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
      this.adjustCommentaryWidth();
    },

    currentGame() {
      this.updateCurrentMap();
    },
    
    // Note: Controls positioning now handled by CSS Grid layout
    tournamentDays() {
      // Grid layout automatically handles positioning
    },

    // Watch for collapse changes to update collision detection
    hasCollapsedSections() {
      // Trigger collision detection when collapse state changes
      this.$nextTick(() => {
        this.isControlsInDashboardLane();
      });
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
    },
    
    // Dynamic chart title based on tournament day and matchup
    dynamicChartTitle() {
      if (!this.selectedDay || !this.selectedMatchup) return '';
      
      const currentDay = this.tournamentDays.find(day => day.id === this.selectedDay);
      const currentMatchup = this.currentDayMatchups.find(matchup => matchup.id === this.selectedMatchup);
      
      if (!currentDay || !currentMatchup) return '';
      
      // Format: "Day Name - Matchup Title"
      const dayName = currentDay.name;
      const matchupTitle = currentMatchup.title;
      
      return `${dayName} - ${matchupTitle}`;
    },
    
    // Dynamic chart subtitle with additional context
    dynamicChartSubtitle() {
      if (!this.selectedMatchup) return '';
      
      const currentMatchup = this.currentDayMatchups.find(matchup => matchup.id === this.selectedMatchup);
      if (!currentMatchup) return '';
      
      // Show tournament type only
      const tournamentType = this.isEwc2025Tournament ? '' : 
                             (this.isYear5Tournament ? 'ALGS Year 5 Open' : '');
      
      return tournamentType;
    },

    // Check if any sections are collapsed to adjust layout
    hasCollapsedSections() {
      return this.tournamentDaysCollapsed || this.matchupsCollapsed;
    },

    // Check if Controls panel should be affected by collapse (only if in same lane)
    shouldAdjustControlsLayout() {
      if (!this.hasCollapsedSections) return false;
      
      // Check if Controls panel is in its original position or overlapping with dashboard
      return this.isControlsInDashboardLane();
    },

    // Commentary functionality
    commentary() {
      return createCommentary(
        this.dynamicChartTitle,
        this.getTeamCount(),
        this.maxGames
      );
    },

    commentaryTitle() {
      return this.commentary.getTitle(this.currentGame);
    },

    commentaryText() {
      return this.commentary.getText(
        this.currentGame,
        this.getTopTeams(),
        this.getCurrentMapName()
      );
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
    
    // Auto-load first matchup on initial load
    this.autoLoadFirstMatchup();
    
    
    // Initialize professional header animations with GSAP
    this.initializeHeaderAnimations();
    
    // Initialize dashboard title animations
    this.initializeDashboardAnimations();
    
    // Initialize chart loading animation
    this.initializeChartLoadingAnimation();
    
    // Adjust commentary width to match chart
    this.adjustCommentaryWidth();
    
    // Add window resize listener for commentary width
    window.addEventListener('resize', this.adjustCommentaryWidth);
    
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
    
    // Filter out browser extension errors
    window.addEventListener('error', (event) => {
      if (event.message.includes('message channel closed') || 
          event.message.includes('listener indicated an asynchronous response')) {
        console.debug('🔧 Filtered browser extension error:', event.message);
        event.preventDefault();
        return false;
      }
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.message?.includes('message channel closed') ||
          event.reason?.message?.includes('listener indicated an asynchronous response')) {
        console.debug('🔧 Filtered browser extension promise rejection:', event.reason.message);
        event.preventDefault();
        return false;
      }
    });
  },
  
  methods: {
    ...mapActions(useTournamentStore, [
      'selectMatchup',
      'setPlaying',
      'setCurrentGame',
      'setDay',
      'setDayOnly',
      'setTournamentType',
      'fetchDataForMatchup',
      'resetPlayback',
      'toggleLegend',
      'setAnimationSpeed',
      'setGameFilter'
    ]),
    
    // ALGS Championship stage selection methods
    selectGroupStage() {
      this.isGroupStageActive = true;
      this.isBracketStageActive = false;
      this.isTeamsActive = false;
      console.log('📊 Selected Group Stage');
    },
    
    selectBracketStage() {
      this.isGroupStageActive = false;
      this.isBracketStageActive = true;
      this.isTeamsActive = false;
      console.log('🏆 Selected Bracket Stage');
    },
    
    selectTeams() {
      this.isGroupStageActive = false;
      this.isBracketStageActive = false;
      this.isTeamsActive = true;
      console.log('👥 Selected Teams');
    },
    
    // Set champion team for demonstration
    setChampionTeam(teamName) {
      this.championTeam = teamName;
      console.log('🏆 Champion team set:', teamName);
    },
    
    // Initialize tournament days data
    initializeTournamentDays() {
      this.tournamentDays = this.isEwc2025Tournament ? [
        {
          id: 'day1',
          name: 'Day 1',
          matchups: [{
            id: 'Day1-A',
            title: 'Group A',
            description: 'Day 1 Group A featuring 20 elite teams',
            games: 'auto'
          }]
        },
        {
          id: 'day2',
          name: 'Day 2',
          matchups: [{
            id: 'Day2-B',
            title: 'Group B',
            description: 'Day 2 Group B featuring 20 elite teams',
            games: 'auto'
          }]
        },
        {
          id: 'day3',
          name: 'Day 3',
          matchups: [{
            id: 'Day3-LastChance',
            title: 'Last Chance',
            description: 'Day 3 Last Chance featuring 20 elite teams',
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
          name: 'Day 1',
          matchups: [
            { id: 'AvsB', title: 'A vs B', description: 'Group A vs Group B matchup', games: 6 },
            { id: 'CvsD', title: 'C vs D', description: 'Group C vs Group D matchup', games: 6 },
            { id: 'BvsD', title: 'B vs D', description: 'Group B vs Group D matchup', games: 6 }
          ]
        },
        {
          id: 'day2',
          name: 'Day 2',
          matchups: [
            { id: 'AvsC', title: 'A vs C', description: 'Group A vs Group C matchup', games: 6 },
            { id: 'BvsC', title: 'B vs C', description: 'Group B vs Group C matchup', games: 6 },
            { id: 'AvsD', title: 'A vs D', description: 'Group A vs Group D matchup', games: 6 }
          ]
        },
        {
          id: 'day3',
          name: 'Day 3',
          matchups: [
            { id: 'ER1', title: 'Elimination R1', description: 'First elimination round', games: 8 }
          ]
        },
        {
          id: 'day4',
          name: 'Day 4',
          matchups: [
            { id: 'ER2', title: 'Elimination R2', description: 'Second elimination round', games: 8 },
            { id: 'WR1', title: 'Winners R1', description: 'Winners bracket final', games: 8 }
          ]
        }
      ];
    },
    
    
    // Handle matchup selection with proper data fetching
    async handleMatchupSelect(matchupId) {
      console.log('🎯 Handling matchup selection:', matchupId);
      
      try {
        // Clear any existing data first
        this.cleanupChart();
        
        // Select the matchup in the store (fetchDataForMatchup will be triggered by selectedMatchup watcher)
        await this.selectMatchup(matchupId);
        
        console.log('✅ Matchup selection completed:', {
          selectedMatchup: this.selectedMatchup
        });
        
        // Measure heights for compression after chart is loaded
        setTimeout(() => {
          this.measureOriginalHeights();
        }, 500); // Wait for chart to render fully
        
      } catch (error) {
        console.error('❌ Error handling matchup selection:', error);
      }
    },
    
    // Auto-load first available matchup
    autoLoadFirstMatchup() {
      console.log('🚀 Auto-loading first matchup...');
      
      // Use nextTick to ensure tournament days are fully initialized
      this.$nextTick(() => {
        if (this.tournamentDays && this.tournamentDays.length > 0) {
          // Get first day
          const firstDay = this.tournamentDays[0];
          console.log('📅 First day found:', firstDay.name);
          
          if (firstDay.matchups && firstDay.matchups.length > 0) {
            const firstMatchup = firstDay.matchups[0];
            console.log('⚔️ Auto-selecting first matchup:', firstMatchup.title);
            
            // Set day without clearing selectedMatchup to avoid double animation
            this.setDayOnly(firstDay.id);
            
            // Use a slight delay to ensure everything is ready, then select matchup
            setTimeout(() => {
              this.handleMatchupSelect(firstMatchup.id);
              // Note: Controls positioning now handled by CSS Grid layout
            }, 100);
          } else {
            console.warn('⚠️ No matchups found in first day');
          }
        } else {
          console.warn('⚠️ No tournament days available for auto-loading');
        }
      });
    },
    
    // Position controls panel below dashboard
    positionControlsPanel() {
      // Use multiple attempts to ensure DOM is fully rendered and positioned
      const attemptPositioning = () => {
        const dashboardPanel = document.querySelector('.dashboard-panel');
        const controlsPanel = document.querySelector('.standalone-controls');
        
        if (dashboardPanel && controlsPanel) {
          // Get dashboard position and dimensions
          const dashboardRect = dashboardPanel.getBoundingClientRect();
          const dashboardHeight = dashboardPanel.offsetHeight;
          const mainLayout = document.querySelector('.main-layout');
          const mainLayoutRect = mainLayout ? mainLayout.getBoundingClientRect() : { left: 0, top: 0 };
          
          // Calculate position directly below dashboard, centered
          const topPosition = dashboardHeight + 48; // 40px (main-layout padding) + 8px gap
          const dashboardLeft = dashboardRect.left - mainLayoutRect.left;
          
          // Force positioning immediately - centered with dashboard
          controlsPanel.style.position = 'absolute';
          controlsPanel.style.top = `${topPosition}px`;
          controlsPanel.style.left = `${dashboardLeft}px`; // Align with dashboard left edge
          controlsPanel.style.width = '280px'; // Match dashboard width exactly
          controlsPanel.style.zIndex = '1000';
          
          console.log('📍 Controls positioned below dashboard (centered):', {
            dashboardHeight,
            dashboardLeft,
            calculatedTop: topPosition,
            dashboardRect: dashboardRect,
            mainLayoutRect: mainLayoutRect
          });
          
          // Set up ResizeObserver to handle dynamic resizing
          if (!this.dashboardResizeObserver) {
            this.dashboardResizeObserver = new ResizeObserver(() => {
              const newDashboardRect = dashboardPanel.getBoundingClientRect();
              const newMainLayoutRect = mainLayout ? mainLayout.getBoundingClientRect() : { left: 0, top: 0 };
              const newDashboardHeight = dashboardPanel.offsetHeight;
              const newTopPosition = newDashboardHeight + 48;
              const newDashboardLeft = newDashboardRect.left - newMainLayoutRect.left;
              
              controlsPanel.style.top = `${newTopPosition}px`;
              controlsPanel.style.left = `${newDashboardLeft}px`;
              
              console.log('📍 Controls repositioned on resize:', {
                top: newTopPosition,
                left: newDashboardLeft
              });
            });
            this.dashboardResizeObserver.observe(dashboardPanel);
          }
          
          return true; // Successfully positioned
        }
        return false; // Failed to position
      };
      
      // Try positioning immediately
      if (!attemptPositioning()) {
        // If immediate positioning fails, try again after a short delay
        setTimeout(() => {
          if (!attemptPositioning()) {
            // Final attempt after DOM is definitely ready
            setTimeout(attemptPositioning, 200);
          }
        }, 50);
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
      
      // Wait for DOM to be ready
      this.$nextTick(() => {
        // Check if refs exist before animating
        const elementsToAnimate = [
          this.$refs.championshipLogo,
          this.$refs.championshipTitle,
          this.$refs.tournamentInfo
        ].filter(Boolean);
        
        if (elementsToAnimate.length === 0) {
          console.warn('⚠️ Header animation refs not found - skipping animations');
          return;
        }
        
        // Set initial states for elements that will be animated
        gsap.set(elementsToAnimate, {
          opacity: 0,
          y: 30,
          scale: 0.9
        });
        
        // Set specific states for individual info items (check if they exist)
        const infoItems = [
          this.$refs.infoItem1,
          this.$refs.infoItem2,
          this.$refs.infoItem3
        ].filter(Boolean);
        
        if (infoItems.length > 0) {
          gsap.set(infoItems, {
            opacity: 0,
            x: -20,
            scale: 0.95
          });
        }
        
        // Create simplified master timeline
        const masterTimeline = gsap.timeline();
        
        // 1. Championship Logo animation
        if (this.$refs.championshipLogo) {
          masterTimeline.to(this.$refs.championshipLogo, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.7)'
          });
        }
        
        // 2. Championship Title animation
        if (this.$refs.championshipTitle) {
          masterTimeline.to(this.$refs.championshipTitle, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
          }, '-=0.4');
        }
        
        // 3. Tournament Info animation
        if (this.$refs.tournamentInfo) {
          masterTimeline.to(this.$refs.tournamentInfo, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out'
          }, '-=0.3');
        }
        
        // 4. Individual info items animation
        if (infoItems.length > 0) {
          masterTimeline.to(infoItems, {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.1
          }, '-=0.3');
        }
        
        // 5. Setup continuous animations
        this.setupContinuousAnimations();
      });
    },
    
    setupContinuousAnimations() {
      // Only animate elements that exist
      if (this.$refs.logoIcon) {
        // Continuous logo glow effect
        gsap.to(this.$refs.logoIcon, {
          textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6)',
          duration: 2,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: -1
        });
      }
      
      // Subtle floating animation for info items (only if they exist)
      const infoItems = [
        this.$refs.infoItem1,
        this.$refs.infoItem2,
        this.$refs.infoItem3
      ].filter(Boolean);
      
      if (infoItems.length > 0) {
        gsap.to(infoItems, {
          y: -2,
          duration: 3,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: -1,
          stagger: 0.5
        });
      }
      
      // Particle animation for logo (only if it exists)
      if (this.$refs.logoParticles) {
        gsap.to(this.$refs.logoParticles, {
          opacity: 0.7,
          scale: 1.1,
          duration: 1.5,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: -1
        });
      }
    },

    // Dashboard Title Animations
    initializeDashboardAnimations() {
      console.log('🎮 Initializing dashboard title animations...');
      
      // Check if GSAP is available
      if (typeof gsap === 'undefined') {
        console.warn('⚠️ GSAP not available - dashboard animations disabled');
        return;
      }
      
      // Set initial state for dashboard title
      gsap.set(this.$refs.dashboardTitle, {
        opacity: 0,
        scale: 0.8,
        rotationX: -15,
        filter: 'blur(3px)'
      });
      
      gsap.set(this.$refs.dashboardText, {
        opacity: 0,
        y: 20,
        backgroundPosition: '-200% center'
      });
      
      gsap.set(this.$refs.dashboardGlow, {
        opacity: 0,
        scale: 0
      });
      
      // Create dashboard animation timeline
      const dashboardTimeline = gsap.timeline({ delay: 0.8 });
      
      // Animate dashboard container
      dashboardTimeline
        .to(this.$refs.dashboardTitle, {
          opacity: 1,
          scale: 1,
          rotationX: 0,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'back.out(1.7)'
        })
        .to(this.$refs.dashboardText, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out'
        }, '-=0.5')
        .to(this.$refs.dashboardText, {
          backgroundPosition: '200% center',
          duration: 2,
          ease: 'power2.inOut'
        }, '-=0.3')
        .to(this.$refs.dashboardGlow, {
          opacity: 0.6,
          scale: 1,
          duration: 0.6,
          ease: 'power2.out'
        }, '-=1');
      
      // Setup continuous dashboard effects
      this.setupDashboardContinuousEffects();
    },
    
    setupDashboardContinuousEffects() {
      // Continuous glow pulse
      gsap.to(this.$refs.dashboardGlow, {
        opacity: 0.3,
        scale: 1.1,
        duration: 2,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });
      
      // Subtle text shimmer effect
      gsap.to(this.$refs.dashboardText, {
        textShadow: '0 0 10px rgba(220, 38, 38, 0.8), 0 0 20px rgba(245, 158, 11, 0.4)',
        duration: 3,
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
    
    
    
    updateCurrentMap() {
      // Get map name from chart data based on current game
      if (this.currentGame === 0) {
        this.currentMap = 'Pre-game';
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

    // Commentary Methods
    getCurrentMapName() {
      if (this.currentGame === 0) return 'Pre-Game';
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const currentGameData = firstTeam.games.find(game => game.gameNumber === this.currentGame);
          if (currentGameData && currentGameData.map) {
            return currentGameData.map;
          }
        }
      }
      
      return `Game ${this.currentGame}`;
    },

    getCurrentGameBadgeStyle() {
      let gameColor = '#ef4444';
      
      if (this.processedChartData && this.processedChartData.length > 0 && this.currentGame > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const currentGameData = firstTeam.games.find(game => game.gameNumber === this.currentGame);
          if (currentGameData && currentGameData.color) {
            gameColor = currentGameData.color;
          }
        }
      }
      
      return {
        background: `linear-gradient(135deg, ${gameColor} 0%, ${this.adjustColor(gameColor, -20)} 100%)`,
        border: `2px solid ${gameColor}`,
        boxShadow: `0 0 15px ${gameColor}60, 0 4px 8px rgba(0,0,0,0.3)`
      };
    },

    getTeamCount() {
      return this.processedChartData ? this.processedChartData.length : 0;
    },

    getTopTeams() {
      if (!this.processedChartData || this.currentGame === 0) return [];
      
      return this.processedChartData
        .map(team => ({
          team: team.team,
          totalPoints: team.games?.slice(0, this.currentGame).reduce((sum, game) => sum + (game.points || 0), 0) || 0
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints);
    },

    getMatchTopTeams() {
      if (!this.processedChartData || this.currentGame === 0) return [];
      
      return this.processedChartData
        .map(team => {
          const currentGameData = team.games?.find(game => game.gameNumber === this.currentGame);
          return {
            team: team.team,
            matchPoints: currentGameData?.points || 0
          };
        })
        .filter(team => team.matchPoints > 0)
        .sort((a, b) => b.matchPoints - a.matchPoints);
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
    
    
    // Advanced controls toggle
    toggleAdvancedControls() {
      this.advancedControlsExpanded = !this.advancedControlsExpanded;
    },

    // Collapsible sections toggle
    toggleTournamentDays() {
      this.tournamentDaysCollapsed = !this.tournamentDaysCollapsed;
    },

    toggleMatchups() {
      this.matchupsCollapsed = !this.matchupsCollapsed;
    },

    // Check if Controls panel is in the same lane as Dashboard
    
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
    },

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

    stopAnimation() {
      if (this.animationInterval) {
        clearInterval(this.animationInterval);
        this.animationInterval = null;
      }
      this.setPlaying(false);
    },

    adjustCommentaryWidth() {
      this.$nextTick(() => {
        const commentaryElement = this.$refs.commentarySection;
        
        if (!commentaryElement || !this.selectedMatchup) {
          return; // No commentary panel to adjust when no matchup is selected
        }
        
        // Direct targeting of the chart SVG
        const chartElement = this.$el.querySelector('.algs-chart-svg') || 
                            this.$refs.interactiveChart?.$el?.querySelector('svg');
        
        if (chartElement) {
          const chartWidth = chartElement.getBoundingClientRect().width;
          console.log(`🎯 Adjusting commentary width to match chart: ${chartWidth}px`);
          commentaryElement.style.width = `${chartWidth}px`;
          commentaryElement.style.maxWidth = `${chartWidth}px`;
          commentaryElement.style.minWidth = `${chartWidth}px`;
        } else {
          console.warn('⚠️ Chart SVG element not found for width adjustment');
        }
      });
    },

    measureOriginalHeights() {
      this.$nextTick(() => {
        const chartSection = this.$el.querySelector('.chart-container');
        const chartSvg = this.$el.querySelector('.algs-chart-svg');
        
        console.log('🔍 Element check:', {
          chartSection: !!chartSection,
          chartSvg: !!chartSvg,
          isCompressed: this.isChartCompressed
        });
        
        if (chartSection && chartSvg && !this.isChartCompressed) {
          // Get more detailed measurements
          const chartTitleSection = this.$el.querySelector('.chart-title-section');
          const chartComponentContainer = this.$el.querySelector('.chart-component-container');
          
          this.originalSectionHeight = chartSection.getBoundingClientRect().height;
          this.originalChartHeight = chartSvg.getBoundingClientRect().height;
          
          // Calculate the non-chart content height (title section, padding, etc.)
          this.nonChartContentHeight = this.originalSectionHeight - this.originalChartHeight;
          
          // Calculate 20% reduction (80% of original = 20% reduction) 
          const compressedChartHeight = this.originalChartHeight * 0.8;
          this.compressionReduction = this.originalChartHeight - compressedChartHeight;
          
          console.log('📏 Detailed Height Analysis:', {
            chartSection: {
              element: 'chart-section',
              height: this.originalSectionHeight
            },
            chartTitleSection: {
              element: 'chart-title-section', 
              height: chartTitleSection ? chartTitleSection.getBoundingClientRect().height : 'not found'
            },
            chartComponentContainer: {
              element: 'chart-component-container',
              height: chartComponentContainer ? chartComponentContainer.getBoundingClientRect().height : 'not found'
            },
            chartSvg: {
              element: 'algs-chart-svg',
              height: this.originalChartHeight
            },
            calculations: {
              nonChartContentHeight: this.nonChartContentHeight,
              compressedChartHeight: compressedChartHeight,
              compressionReduction: this.compressionReduction,
              expectedCompressedSectionHeight: compressedChartHeight + this.nonChartContentHeight
            }
          });
          
          // Set CSS custom properties for dynamic compression
          this.setCSSCompressionProperties();
        }
      });
    },

    setCSSCompressionProperties() {
      const root = document.documentElement;
      const compressedChartHeight = this.originalChartHeight * 0.8;
      
      root.style.setProperty('--original-chart-height', `${this.originalChartHeight}px`);
      root.style.setProperty('--original-section-height', `${this.originalSectionHeight}px`);
      root.style.setProperty('--compressed-chart-height', `${compressedChartHeight}px`);
      root.style.setProperty('--compression-reduction', `${this.compressionReduction}px`);
      
      console.log('🎨 Simplified approach - letting layout naturally compress:', {
        originalChartHeight: this.originalChartHeight,
        compressedChartHeight: compressedChartHeight,
        reduction: this.compressionReduction
      });
    },

    toggleChartView() {
      this.isChartCompressed = !this.isChartCompressed;
      console.log(`📊 Chart view toggled: ${this.isChartCompressed ? 'COMPRESSED' : 'EXPANDED'}`);
      
      // Measure heights if not already done
      if (this.originalChartHeight === 0) {
        this.measureOriginalHeights();
      }
      
      // Trigger chart resize and width adjustment after view change
      this.$nextTick(() => {
        // Dispatch resize event to make chart recalculate dimensions
        window.dispatchEvent(new Event('resize'));
        
        // Adjust commentary width after chart resizes
        setTimeout(() => {
          this.adjustCommentaryWidth();
        }, 100);
      });
    },


    createCommentaryMapTooltip() {
      if (this.mapTooltip) {
        this.mapTooltip.remove();
      }
      
      this.mapTooltip = document.createElement('div');
      this.mapTooltip.className = 'commentary-map-tooltip';
      this.mapTooltip.style.cssText = `
        position: fixed;
        visibility: hidden;
        background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(239, 68, 68, 0.1);
        color: #ffffff;
        font-family: Inter, system-ui, sans-serif;
        font-size: 14px;
        font-weight: 500;
        line-height: 1.4;
        pointer-events: none;
        z-index: 10000;
        width: 320px;
        max-width: 320px;
        text-align: center;
      `;
      
      document.body.appendChild(this.mapTooltip);
      return this.mapTooltip;
    },

    showCommentaryMapTooltip(event) {
      if (!this.mapTooltip) {
        this.createCommentaryMapTooltip();
      }
      
      const currentMapName = this.getCurrentMapName();
      if (!currentMapName) {
        return;
      }
      
      let mapName = currentMapName;
      if (mapName && mapName.includes(' - ')) {
        mapName = mapName.split(' - ')[1];
      }
      
      const imageUrl = this.getMapImageUrl(mapName);
      
      if (!imageUrl) {
        return;
      }
      
      // Create tooltip content
      const isPreGame = mapName === 'Pre-game';
      const tooltipTitle = isPreGame ? 'Tournament Status' : 'Current Map';
      const tooltipSubtitle = isPreGame ? 'Pre-game Preparation' : mapName;
      
      this.mapTooltip.innerHTML = `
        <div style="margin-bottom: 8px;">
          <div style="font-weight: 600; color: #ef4444; font-size: 13px; margin-bottom: 4px;">
            ${tooltipTitle}
          </div>
          <div style="font-weight: 500; color: #ffffff; font-size: 12px;">
            ${tooltipSubtitle}
          </div>
        </div>
        <div style="border-radius: 6px; overflow: hidden;">
          <img src="${imageUrl}" 
               alt="${mapName}" 
               style="width: 100%; height: 80px; object-fit: cover; display: block;">
        </div>
      `;
      
      this.mapTooltip.style.visibility = 'visible';
      
      // Position tooltip to the right of cursor
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      
      const tooltipX = mouseX + 15; // 15px to the right of cursor
      const tooltipY = mouseY; // At cursor level
      
      // Simple bounds checking
      this.mapTooltip.style.left = Math.max(10, Math.min(tooltipX, window.innerWidth - 320)) + 'px';
      this.mapTooltip.style.top = Math.max(10, tooltipY) + 'px';
    },
    
    updateCommentaryTooltipPosition(event) {
      if (!this.mapTooltip || this.mapTooltip.style.visibility === 'hidden') {
        return;
      }
      
      // Update tooltip position based on mouse movement
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      
      const tooltipX = mouseX + 15; // 15px to the right of cursor
      const tooltipY = mouseY; // At cursor level
      
      // Simple bounds checking
      this.mapTooltip.style.left = Math.max(10, Math.min(tooltipX, window.innerWidth - 320)) + 'px';
      this.mapTooltip.style.top = Math.max(10, tooltipY) + 'px';
    },
    
    hideCommentaryMapTooltip() {
      if (this.mapTooltip) {
        this.mapTooltip.style.visibility = 'hidden';
      }
    }
  },
  
  beforeUnmount() {
    console.log('🧹 TournamentView beforeUnmount() called - cleaning up');
    
    // Stop any ongoing animation
    this.stopAnimation();
    
    // Remove window resize listener
    window.removeEventListener('resize', this.adjustCommentaryWidth);
    
    // Clean up chart
    this.cleanupChart();
    
    // Clean up ResizeObserver
    if (this.dashboardResizeObserver) {
      this.dashboardResizeObserver.disconnect();
      this.dashboardResizeObserver = null;
    }
    
    // Clean up map tooltip
    if (this.mapTooltip) {
      this.mapTooltip.remove();
      this.mapTooltip = null;
    }
  }
}
</script>

<style scoped>
/* Enhanced Gaming Commentary Panel - Main Container */
.commentary-panel {
  margin-top: 0;
  width: 100%;
  max-width: none;
  background: linear-gradient(135deg, 
    rgba(10, 10, 15, 0.98) 0%, 
    rgba(15, 15, 25, 0.98) 50%, 
    rgba(20, 20, 30, 0.98) 100%);
  border: 2px solid transparent;
  border-radius: 12px;
  backdrop-filter: blur(20px);
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 32px rgba(239, 68, 68, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
  padding: 12px 14px;
}

.commentary-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(239, 68, 68, 0.1) 50%, 
    transparent 70%);
  pointer-events: none;
  animation: scan-line 3s linear infinite;
}

@keyframes scan-line {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.panel-border {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.corner-accent {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(239, 68, 68, 0.6);
}

.corner-accent.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.corner-accent.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.corner-accent.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.corner-accent.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

/* Side by Side Layout */
.commentary-layout {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: nowrap;
  width: 100%;
  box-sizing: border-box;
}

.commentary-content {
  flex: 1;
  min-width: 0;
}

.commentary-with-badge {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inline-map-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid currentColor;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;
  align-self: flex-start;
  margin-bottom: 4px;
}

.inline-map-badge .badge-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent);
  animation: badge-shine 2s linear infinite;
}

@keyframes badge-shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

.inline-map-badge .game-number {
  font-weight: 900;
  text-shadow: 0 0 6px currentColor;
}

.inline-map-badge .divider {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 300;
}

.inline-map-badge .game-map {
  font-weight: 600;
  opacity: 0.95;
  cursor: pointer;
  transition: all 0.2s ease;
}

.inline-map-badge .game-map:hover {
  opacity: 1;
  text-shadow: 0 0 8px currentColor;
  transform: scale(1.02);
}

/* Responsive Design */
@media (max-width: 1100px) {
  .commentary-layout {
    flex-direction: column;
    gap: 10px;
  }
  
  .dominance-containers {
    flex-direction: row;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .dominance-containers {
    flex-direction: column;
    width: 100%;
  }
  
  .dominance-compact {
    min-width: 0;
    width: 100%;
  }
}

/* Dynamic text sizing based on container */
@media (min-width: 1200px) {
  .commentary-text {
    font-size: 14px;
    line-height: 1.6;
  }
}

@media (max-width: 800px) {
  .commentary-text {
    font-size: 12px;
    line-height: 1.4;
  }
}

.commentary-text {
  font-size: 13px;
  line-height: 1.5;
  color: #e5e7eb;
  margin: 0;
  font-weight: 400;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

/* Compact Dominance Containers - 50% Bigger */
.dominance-containers {
  display: flex;
  flex-direction: row;
  gap: 12px;
  flex-shrink: 0;
  flex-basis: auto;
}

.dominance-compact {
  flex: 1;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.6) 0%, 
    rgba(239, 68, 68, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 9px;
  padding: 9px 12px;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.dominance-compact::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    #ef4444, 
    transparent);
  animation: compact-glow 3s linear infinite;
}

@keyframes compact-glow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

.dominance-compact.current {
  border-color: rgba(16, 185, 129, 0.4);
}

.dominance-compact.current::before {
  background: linear-gradient(90deg, 
    transparent, 
    #10b981, 
    transparent);
}

.dominance-compact.match {
  border-color: rgba(251, 191, 36, 0.4);
}

.dominance-compact.match::before {
  background: linear-gradient(90deg, 
    transparent, 
    #fbbf24, 
    transparent);
}

.dominance-header {
  margin-bottom: 6px;
}

.dominance-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.9px;
  color: #ef4444;
  text-shadow: 0 0 6px rgba(239, 68, 68, 0.8);
}

.current .dominance-title {
  color: #10b981;
  text-shadow: 0 0 6px rgba(16, 185, 129, 0.8);
}

.match .dominance-title {
  color: #fbbf24;
  text-shadow: 0 0 6px rgba(251, 191, 36, 0.8);
}

.teams-compact {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.team-compact {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4.5px 6px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 4.5px;
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
  font-size: 13.5px;
}

.team-compact:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(1px);
}

.team-compact.rank-1 {
  border-left-color: #ffd700;
}

.team-compact.rank-2 {
  border-left-color: #c0c0c0;
}

.team-compact.rank-3 {
  border-left-color: #cd7f32;
}

.team-compact .rank {
  font-size: 12px;
  font-weight: 900;
  color: #ffffff;
  width: 15px;
  text-align: center;
  text-shadow: 0 0 4.5px currentColor;
}

.rank-1 .rank {
  color: #ffd700;
}

.rank-2 .rank {
  color: #c0c0c0;
}

.rank-3 .rank {
  color: #cd7f32;
}

.team-compact .name {
  flex: 1;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}

.team-compact .points {
  font-size: 13.5px;
  font-weight: 800;
  color: #10b981;
  text-shadow: 0 0 4.5px #10b981;
  min-width: 27px;
  text-align: right;
}

.leaderboard-compact {
  margin-top: 8px;
}

/* Chart Title Container Positioning */
.chart-title-container {
  position: relative;
}

/* Chart View Toggle Button */
.chart-view-toggle {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.view-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.2) 0%, 
    rgba(239, 68, 68, 0.1) 100%);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 6px;
  color: #ef4444;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.view-toggle-btn:hover {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.3) 0%, 
    rgba(239, 68, 68, 0.2) 100%);
  border-color: rgba(239, 68, 68, 0.6);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

.view-toggle-btn:active {
  transform: translateY(0);
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
}

.toggle-icon {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon svg {
  width: 100%;
  height: 100%;
  color: currentColor;
}

.toggle-label {
  font-size: 10px;
  font-weight: 700;
  text-shadow: 0 0 4px rgba(239, 68, 68, 0.6);
}

/* Ultra-simplified chart section layout */
.chart-container-section {
  display: flex;
  flex-direction: column;
}

.chart-loading-container {
  flex: 1;
}

/* Chart component container */
.chart-component-container {
  flex: 1;
  position: relative;
  width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  transition: height 0.5s ease-out;
  pointer-events: none; /* Allow clicks to pass through to action panel */
}

/* When compressed, allow the container to shrink */
.compressed .chart-component-container {
  flex: none;
  min-height: 0;
}

/* Direct compression on InteractiveRaceChart component - 20% reduction (400px → 320px) */
.interactive-race-chart {
  width: 100%;
  height: 100%;
  transition: height 0.5s ease-out;
}

.interactive-race-chart.compressed {
  height: 320px;
  max-height: 320px;
  overflow: hidden;
}

.chart-component-container:has(.compressed) {
  height: 320px;
  max-height: 320px;
}

/* Floating Action Panel - positioned absolutely outside grid layout */
.action-panel-floating {
  position: fixed !important;
  top: 50px !important;
  right: 20px !important;
  z-index: 99999 !important;
  pointer-events: auto !important;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%) !important;
  border: 2px solid rgba(239, 68, 68, 0.5) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(12px) !important;
}

/* Chart section - let it naturally size based on content */
.chart-container-section {
  display: flex;
  flex-direction: column;
}

/* When compressed, ensure no extra space */
.chart-container-section.compressed {
  /* Removed transition to eliminate second animation on page refresh */
}

.commentary-panel {
  flex-shrink: 0;
}

/* Subtle transition between loading and chart states */
.chart-fade-enter-active,
.chart-fade-leave-active {
  transition: opacity 0.3s ease;
}

.chart-fade-enter-from,
.chart-fade-leave-to {
  opacity: 0;
}

.leaderboard-compact h4 {
  font-size: 12px;
  font-weight: 600;
  color: #fbbf24;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.top-teams {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.top-team-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
  font-size: 12px;
}

.top-team-item .position {
  font-weight: 700;
  color: #ef4444;
  min-width: 16px;
}

.top-team-item .team-name {
  flex: 1;
  color: #e2e8f0;
  font-weight: 500;
}

.top-team-item .team-points {
  color: #4ade80;
  font-weight: 600;
}

.no-data {
  font-size: 12px;
  color: #94a3b8;
  font-style: italic;
}

/* =============================================================================
   TOURNAMENT HEADER - COMPREHENSIVE STYLING
   ============================================================================= */

.tournament-header {
  position: relative;
  width: 100%;
  background: linear-gradient(135deg, #1a0000 0%, #2d0000 25%, #4a0000 50%, #2d0000 75%, #1a0000 100%);
  border-bottom: 2px solid #dc2626;
  padding: var(--spacing-5xl) 0;
  margin-bottom: var(--spacing-5xl);
  overflow: hidden;
  box-shadow: 
    0 4px 20px rgba(220, 38, 38, 0.3),
    0 8px 40px rgba(0, 0, 0, 0.6);
}

.header-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.header-content {
  position: relative;
  z-index: 2;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--spacing-4xl);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-4xl);
}

.header-branding {
  display: flex;
  align-items: center;
  gap: var(--spacing-4xl);
}

.championship-logo {
  position: relative;
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 0 15px rgba(220, 38, 38, 0.8));
}

.apex-logo-svg,
.apex-logo-fallback {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.brand-subtitle {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-medium);
  color: #f1f5f9;
  opacity: 0.9;
}

.tournament-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}

.status-indicator.ended {
  background: #6b7280;
  animation: none;
}

.status-text {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: #d1d5db;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.championship-title {
  margin-top: var(--spacing-md);
}

.title-main {
  font-size: 2.5rem;
  font-weight: 900;
  background: linear-gradient(45deg, #dc2626, #ef4444, #f87171, #ef4444, #dc2626);
  background-size: 300% 300%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 20px rgba(220, 38, 38, 0.5);
  letter-spacing: -1px;
  margin: 0;
  animation: gradient-shift 4s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.header-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4xl);
  align-items: flex-end;
}

.tournament-info-inline {
  display: flex;
  gap: var(--spacing-2xl);
  flex-wrap: wrap;
}

.tournament-header-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
  padding: var(--spacing-2xl) var(--spacing-4xl);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.85) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(12px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  min-width: 160px;
}

.tournament-header-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.5), transparent);
  opacity: 0.8;
}

.info-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.info-icon {
  font-size: 16px;
  filter: grayscale(0.2);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  color: rgba(239, 68, 68, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  white-space: nowrap;
}

/* Responsive design */
@media (max-width: 1200px) {
  .tournament-info-inline {
    flex-direction: column;
    align-items: stretch;
  }
  
  .tournament-header-card {
    min-width: auto;
  }
}

@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-4xl);
  }
  
  .header-branding {
    justify-content: center;
  }
  
  .header-actions {
    align-items: center;
  }
  
  .title-main {
    font-size: 2rem;
  }
  
  .tournament-info-inline {
    flex-direction: row;
    justify-content: center;
  }
}

/* =============================================================================
   TOURNAMENT SELECTION UI - MISSING STYLES
   ============================================================================= */

.dashboard-panel {
  padding: var(--spacing-4xl);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.8) 100%);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(8px);
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.dashboard-header {
  margin-bottom: var(--spacing-5xl);
  text-align: center;
}

.dashboard-title-enhanced {
  position: relative;
  display: inline-block;
}

.dashboard-text {
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.dashboard-section {
  margin-bottom: var(--spacing-5xl);
  border-radius: var(--radius-lg);
  background: rgba(15, 23, 42, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4xl);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.section-header:hover {
  background: rgba(239, 68, 68, 0.05);
}

.section-main {
  display: flex;
  align-items: center;
  gap: var(--spacing-2xl);
}

.section-icon {
  width: 24px;
  height: 24px;
  color: rgba(239, 68, 68, 0.8);
}

.section-icon .icon {
  width: 100%;
  height: 100%;
}

.section-title {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.collapse-icon {
  width: 20px;
  height: 20px;
  color: rgba(239, 68, 68, 0.6);
  transition: transform 0.3s ease;
}

.collapse-icon .icon {
  width: 100%;
  height: 100%;
}

.section-content {
  padding: 0 var(--spacing-4xl) var(--spacing-4xl);
  overflow: hidden;
}

.algs-day-cards {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
}

.algs-day-card {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: var(--spacing-lg) var(--spacing-2xl);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.algs-day-card:hover {
  border-color: rgba(239, 68, 68, 0.6);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 1) 100%);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

.algs-day-card.active {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 100%);
  border-color: var(--color-primary);
  color: var(--color-primary);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(239, 68, 68, 0.2);
}

.algs-matchup-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin: var(--spacing-lg) 0;
}

.algs-sidebar-matchup {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2xl);
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.6) 0%, rgba(30, 41, 59, 0.7) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.algs-sidebar-matchup:hover {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%);
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 0 2px 12px rgba(239, 68, 68, 0.1);
  transform: translateX(4px);
}

.algs-sidebar-matchup.active {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
  border-color: var(--color-primary);
  box-shadow: 0 2px 12px rgba(239, 68, 68, 0.3);
}

.matchup-name {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  flex: 1;
}

.matchup-games {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  color: rgba(239, 68, 68, 0.8);
  background: rgba(239, 68, 68, 0.1);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Transition animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  max-height: 500px;
  opacity: 1;
  transform: translateY(0);
}
</style>

 