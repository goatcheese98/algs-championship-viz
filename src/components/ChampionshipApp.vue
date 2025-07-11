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
          <a href="index.html" class="nav-link">🏠 ALGS Dashboard</a>
          <a v-if="isYear5Tournament" href="year_4_championship.html" class="nav-link">🏆 Year 4 Champions</a>
          <a v-if="isEwc2025Tournament" href="year_4_championship.html" class="nav-link">🏆 Year 4 Championship</a>
          <a v-if="isEwc2025Tournament" href="year_5_open.html" class="nav-link">🌍 Year 5 Open</a>
        </div>
      </div>
    </div>

    <div class="mega-container">
      <!-- Tournament Selector Component -->
      <TournamentSelector
        ref="tournamentSelector"
        :is-year5-tournament="isYear5Tournament"
        :is-ewc2025-tournament="isEwc2025Tournament"
        :selected-matchup="selectedMatchup"
        :selected-day="selectedDay"
        :loaded-matchups="loadedMatchups"
        :loading-matchups="loadingMatchups"
        @matchup-selected="handleMatchupSelected"
        @day-changed="handleDayChanged"
      />

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

          <div v-else key="chart" class="chart-display">
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
            </div>

            <!-- Action Panel Component - Moved outside chart-area for full page dragging -->
            <ActionPanel
              :key="`action-panel-${selectedDay}-${selectedMatchup}`"
              :chart-engine="chartEngine"
              :selected-matchup="selectedMatchup"
              :max-games="maxGames"
              :is-playing="isPlaying"
              @game-changed="handleGameChanged"
              @play-toggled="handlePlayToggled"
              @restart-requested="handleRestartRequested"
              @game-filter-changed="handleGameFilterChanged"
              @export-requested="handleExportRequested"
              @legend-toggled="handleLegendToggled"
            />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ChartEngine } from '../chart/ChartEngine.js'
import { useTeamConfig } from '../composables/useTeamConfig.js'
import TournamentSelector from './TournamentSelector.vue'
import ActionPanel from './ActionPanel.vue'

export default {
  name: 'ChampionshipApp',
  
  components: {
    TournamentSelector,
    ActionPanel
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
    console.log('📋 ChampionshipApp data() called - Vue is initializing');
    
    // Detect tournament type from URL
    const currentPath = window.location.pathname;
    const isYear5 = currentPath.includes('year_5_open') || currentPath.includes('year5');
    const isEwc2025 = currentPath.includes('ewc_2025') || currentPath.includes('ewc2025');
    
    console.log('🎯 Tournament Detection:', {
      currentPath,
      isYear5: isYear5,
      isEwc2025: isEwc2025,
      tournamentType: isEwc2025 ? 'EWC 2025' : (isYear5 ? 'Year 5 Open' : 'Year 4 Championship')
    });
    
    return {
      // Tournament detection
      isYear5Tournament: isYear5,
      isEwc2025Tournament: isEwc2025,

      // Chart state
      selectedMatchup: '',
      selectedDay: 'day1', // Track current day for proper state management
      chartEngine: null,
      isLoading: false,
      isPlaying: false,
      errorMessage: '',
      
      // Game state for enhanced panel
      currentGame: 0,  // Start at 0 to show initial state
      currentMap: '',
      
      // Status tracking
      loadedMatchups: new Set(),
      loadingMatchups: new Set(),
      
      // Sync interval for animation
      syncInterval: null
    }
  },
  
  computed: {
    /**
     * Dynamic maxGames based on selected matchup and current day
     * Year 4: 6 or 8 games depending on tournament round
     * Year 5: 6 games for all rounds
     * EWC 2025: 10 games for Group A (Day 1), 7 games for Group B (Day 2)
     */
    maxGames() {
      console.log('🎮 Computing maxGames:', {
        selectedMatchup: this.selectedMatchup,
        selectedDay: this.selectedDay,
        isEwc2025Tournament: this.isEwc2025Tournament,
        hasSelector: !!this.$refs.tournamentSelector
      });
      
      // If we have a selected matchup, get its specific game count
      if (this.selectedMatchup && this.$refs.tournamentSelector) {
        const matchupInfo = this.$refs.tournamentSelector.getMatchupInfo(this.selectedMatchup);
        if (matchupInfo) {
          console.log(`🎮 Matchup ${this.selectedMatchup} has ${matchupInfo.games} games`);
          return matchupInfo.games;
        }
      }
      
      // For EWC 2025, provide day-specific defaults even when no matchup is selected
      if (this.isEwc2025Tournament) {
        if (this.selectedDay === 'day1') {
          console.log('🎮 EWC 2025 Day 1 - returning 10 games');
          return 10; // Day 1 Group A has 10 games
        } else if (this.selectedDay === 'day2') {
          console.log('🎮 EWC 2025 Day 2 - returning 7 games');
          return 7;  // Day 2 Group B has 7 games
        }
        console.log('🎮 EWC 2025 fallback - returning 10 games');
        return 10; // Default fallback
      }
      
      // For Year 5 and Year 4, return consistent defaults
      const result = this.isYear5Tournament ? 6 : 8;
      console.log(`🎮 Tournament default - returning ${result} games`);
      return result;
    }
  },
  
  watch: {
    selectedDay(newDay, oldDay) {
      if (newDay !== oldDay) {
        console.log('📅 ChampionshipApp: selectedDay changed from', oldDay, 'to', newDay);
        console.log('🎮 New computed maxGames:', this.maxGames);
      }
    },
    
    maxGames(newMaxGames, oldMaxGames) {
      if (newMaxGames !== oldMaxGames) {
        console.log('🎮 ChampionshipApp: maxGames changed from', oldMaxGames, 'to', newMaxGames);
      }
    }
  },
  
  mounted() {
    console.log('🎯 ChampionshipApp mounted() called - Vue component is ready');
    
    // Initialize professional header animations with GSAP
    this.initializeHeaderAnimations();
    
    // Initialize chart loading animation
    this.initializeChartLoadingAnimation();
    
    // Set up periodic updates for game state
    this.gameStateInterval = setInterval(() => {
      if (this.chartEngine) {
        const engineGameIndex = this.chartEngine.currentGameIndex !== undefined ? this.chartEngine.currentGameIndex : 1;
        
        if (Math.abs(this.currentGame - engineGameIndex) > 0) {
          this.currentGame = engineGameIndex;
        }
        
        this.isPlaying = this.chartEngine.isPlaying || false;
        this.updateCurrentMap();
      }
    }, 300);
    
    // Add debug method to global scope for troubleshooting
    window.debugChampionshipApp = () => {
      console.log('🔍 Championship App Debug Info:', {
        selectedDay: this.selectedDay,
        selectedMatchup: this.selectedMatchup,
        computedMaxGames: this.maxGames,
        isEwc2025Tournament: this.isEwc2025Tournament,
        chartEngine: !!this.chartEngine,
        tournamentSelector: !!this.$refs.tournamentSelector
      });
    };
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
    
    // Event handlers for child components - REMOVED DUPLICATE, see comprehensive version below

    async handleMatchupSelected(matchupId) {
      console.log('🎯 Matchup selected:', matchupId);
      console.log('🏆 Tournament Info:', this.getTournamentInfo());
      this.selectedMatchup = matchupId;
      await this.loadMatchup();
    },

    async handleGameChanged(gameIndex) {
      console.log('🎮 Game changed to:', gameIndex);
      this.currentGame = gameIndex;
      if (this.chartEngine) {
        await this.chartEngine.jumpToGame(gameIndex);
        this.updateCurrentMap();
        
        // Reset filters when dragging back to initial state (game 0)
        if (gameIndex === 0) {
          await this.chartEngine.clearFilter();
        }
      }
    },

    async handlePlayToggled() {
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

    async handleRestartRequested() {
      if (this.chartEngine) {
        this.chartEngine.stopAnimation();
        await this.chartEngine.jumpToGame(0);  // Reset to initial state
        this.currentGame = 0;
        this.isPlaying = false;
        this.updateCurrentMap();
      }
    },

    async handleGameFilterChanged(filterData) {
      if (this.chartEngine) {
        const { games, action } = filterData;
        
        if (action === 'clear' || games.length === 0) {
          console.log('🔄 Clearing game filter');
          await this.chartEngine.clearFilter();
        } else {
          console.log(`🎮 Applying filter for games: ${games.join(', ')}`);
          
          // Ensure we're at max game level for filtering
          if (this.currentGame < this.maxGames) {
            this.currentGame = this.maxGames;
            await this.chartEngine.jumpToGame(this.maxGames);
          }
          
          await this.chartEngine.filterByGames(games);
        }
        
        this.updateCurrentMap();
      }
    },

    handleExportRequested(selectedMatchup) {
      if (this.chartEngine) {
        const csvContent = this.chartEngine.exportData(selectedMatchup);
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedMatchup}_export.csv`;
        a.click();
        
        URL.revokeObjectURL(url);
      }
    },

    handleLegendToggled(visible) {
      if (this.chartEngine && this.chartEngine.renderer) {
        console.log('🎨 Toggling chart legend:', visible ? 'ON' : 'OFF');
        this.chartEngine.renderer.renderLegend(visible, this.chartEngine.dataManager);
      }
    },

    /**
     * Enhanced cleanup method with error handling and race condition prevention
     */
    async cleanupChart() {
      console.log('🧹 Starting enhanced chart cleanup...');
      
      try {
        // Stop any ongoing animations
        if (this.chartEngine) {
          this.chartEngine.stopAnimation();
        }
        
        // Clear sync interval
        if (this.syncInterval) {
          clearInterval(this.syncInterval);
          this.syncInterval = null;
        }
        
        // Clear game state interval
        if (this.gameStateInterval) {
          clearInterval(this.gameStateInterval);
          this.gameStateInterval = null;
        }
        
        // Cleanup chart engine with proper error handling
        if (this.chartEngine) {
          await this.chartEngine.cleanup();
          this.chartEngine = null;
        }
        
        // COMPLETELY clear chart container to prevent DOM conflicts
        const container = document.getElementById('vue-chart-container');
        if (container && container.parentNode) {
          container.innerHTML = '';
          // Remove any remaining event listeners
          container.removeAttribute('style');
        }
        
        // Reset all state variables
        this.currentGame = 0;
        this.currentMap = '';
        this.isPlaying = false;
        this.errorMessage = '';
        this.isLoading = false;
        
        console.log('✅ Enhanced chart cleanup completed');
        
        // Ensure DOM is clean before proceeding
        await this.$nextTick();
        
      } catch (error) {
        console.warn('⚠️ Error during chart cleanup:', error);
        // Force cleanup even if there's an error
        this.chartEngine = null;
        this.currentGame = 0;
        this.isPlaying = false;
        this.isLoading = false;
        this.errorMessage = '';
        
        // Force clear container even on error
        const container = document.getElementById('vue-chart-container');
        if (container && container.parentNode) {
          container.innerHTML = '';
          container.removeAttribute('style');
        }
      }
    },

        /**
     * Handle day changes with proper cleanup
     */
    async handleDayChanged(dayId) {
      console.log('📅 Day changed to:', dayId);
      
      try {
        // IMMEDIATELY clear the selected matchup to show loading animation
        this.selectedMatchup = '';
        
        // Update selected day for proper state management
        this.selectedDay = dayId;
        
        // Log the expected maxGames for debugging
        const expectedMaxGames = this.isEwc2025Tournament ? 
          (dayId === 'day1' ? 10 : 7) : 
          (this.isYear5Tournament ? 6 : 8);
        console.log('🎮 Expected maxGames for', dayId, ':', expectedMaxGames);
        
        // Force Vue to re-render immediately
        await this.$nextTick();
        
        // Clean up chart and reset all states
        await this.cleanupChart();
        
        // Reset all chart-related state
        this.currentGame = 0;
        this.currentMap = '';
        this.isPlaying = false;
        this.errorMessage = '';
        
        // Clear loading/loaded states for a fresh start
        this.loadingMatchups.clear();
        this.loadedMatchups.clear();
        
        console.log('✅ Day change handled successfully - back to loading animation');
        
      } catch (error) {
        console.warn('⚠️ Error handling day change:', error);
        // Force reset state even on error
        this.selectedMatchup = '';
        this.selectedDay = dayId;
        this.chartEngine = null;
        this.currentGame = 0;
        this.isPlaying = false;
        this.errorMessage = '';
        this.loadingMatchups.clear();
        this.loadedMatchups.clear();
      }
    },

    /**
     * Build CSV path based on tournament type and matchup ID
     * Year 4: year4champions/{matchupId}_points.csv
     * Year 5: year5champions/processed/{matchupId}-simple.csv
     * EWC 2025: ewc2025/processed/{matchupId}-simple.csv
     */
    buildCsvPath(matchupId) {
      if (this.isEwc2025Tournament) {
        // EWC 2025 tournament paths
        return `ewc2025/processed/${matchupId}-simple.csv`;
      } else if (this.isYear5Tournament) {
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
        type: this.isEwc2025Tournament ? 'EWC 2025' : (this.isYear5Tournament ? 'Year 5 Open' : 'Year 4 Championship'),
        dataPath: this.isEwc2025Tournament ? 'ewc2025/processed/' : (this.isYear5Tournament ? 'year5champions/processed/' : 'year4champions/'),
        fileFormat: this.isEwc2025Tournament ? '{matchupId}-simple.csv' : (this.isYear5Tournament ? '{matchupId}-simple.csv' : '{matchupId}_points.csv')
      };
    },
    
    getMatchupTitle(matchupId) {
      if (!this.$refs.tournamentSelector) return 'Unknown Matchup';
      
      const matchupInfo = this.$refs.tournamentSelector.getMatchupInfo(matchupId);
      return matchupInfo ? matchupInfo.title : 'Unknown Matchup';
    },
    
    async loadMatchup() {
      if (!this.selectedMatchup) return;
      
      this.isLoading = true;
      this.loadingMatchups.add(this.selectedMatchup);
      
      try {
        console.log('📊 Loading matchup:', this.selectedMatchup);
        
        // Enhanced cleanup with error handling
        await this.cleanupChart();
        
        // Wait for DOM to be ready
        await this.$nextTick();
        
        // Additional safety check - ensure container exists
        await this.waitForContainer();
        
        // Initialize chart engine using new modular ChartEngine
        this.chartEngine = new ChartEngine('vue-chart-container', {
          debugMode: true,  // Enable debug mode to help identify issues
          transitionDuration: 2500,  // Slower, more elegant animations
          enableAnimation: true,
          teamConfig: this.teamConfig  // Pass Vue composable to chart engine
        });
        
        // Initialize chart engine with tournament-specific matchup data
        const csvPath = this.buildCsvPath(this.selectedMatchup);
        console.log(`📂 Loading CSV for ${this.isEwc2025Tournament ? 'EWC 2025' : (this.isYear5Tournament ? 'Year 5' : 'Year 4')}:`, csvPath);
        console.log('🎯 Full CSV path:', `public/${csvPath}`);
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
    
    updateCurrentMap() {
      if (this.chartEngine && this.chartEngine.dataManager) {
        // Get current map from data manager
        const currentGameIndex = this.chartEngine.currentGameIndex;
        this.currentMap = this.chartEngine.dataManager.getMapForGame(currentGameIndex);
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
  }
}
</script>

<!-- No scoped styles needed as the CSS is already in championship.css --> 