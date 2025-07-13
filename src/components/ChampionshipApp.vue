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
              <InteractiveRaceChart
                :data="processedChartData"
                :currentGame="currentGame"
                :teamConfig="teamConfig"
                :maxGames="maxGames"
                :isFiltered="isFiltered"
                :filteredGameIndices="filteredGameIndices"
                :isLegendVisible="isLegendVisible"
                :animationSpeed="animationSpeed"
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
              :selected-matchup="selectedMatchup"
              :max-games="maxGames"
              :is-playing="isPlaying"
              :current-game="currentGame"
              :current-map="currentMap"
              :chart-data="processedChartData"
              @game-changed="handleGameChanged"
              @play-toggled="handlePlayToggled"
              @restart-requested="handleRestartRequested"
              @game-filter-changed="handleGameFilterChanged"
              @export-requested="handleExportRequested"
              @legend-toggled="handleLegendToggled"
              @animation-speed-changed="handleAnimationSpeedChanged"
            />
          </div>
                </transition>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
import { useTeamConfig } from '../composables/useTeamConfig.js'
import TournamentSelector from './TournamentSelector.vue'
import ActionPanel from './ActionPanel.vue'
import InteractiveRaceChart from './InteractiveRaceChart.vue'
// Import map coloring logic for proper color assignment
import { getMapColorByOccurrence, calculateMapOccurrence } from '../chart/MapColoringLogic.js'
import { getMapSequence } from '../chart/MapSequenceData.js'

export default {
  name: 'ChampionshipApp',
  
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
    console.log('📋 ChampionshipApp data() called - Vue is initializing');
    
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

      // Chart state
      selectedMatchup: '',
      selectedDay: 'day1', // Track current day for proper state management
      processedChartData: [],
      isLoading: false,
      isPlaying: false,
      errorMessage: '',
      
      // Game state for enhanced panel
      currentGame: 0,  // Start at 0 to show initial state
      currentMap: '',
      
      // Filtering state
      isFiltered: false,
      filteredGameIndices: [],
      isLegendVisible: false,
      
      // Status tracking
      loadedMatchups: new Set(),
      loadingMatchups: new Set(),
      
      // Animation intervals
      playInterval: null,
      gameStateInterval: null,

              // Animation speed state
        animationSpeed: 'medium' // Default to medium speed
    }
  },
  
  watch: {
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
  
  computed: {
    /**
     * Dynamic maxGames based on actual CSV data
     * This automatically detects game count from CSV headers, making it data-driven
     */
    maxGames() {
      console.log('�� Computing maxGames:', {
        hasProcessedData: !!(this.processedChartData && this.processedChartData.length > 0),
        dataLength: this.processedChartData?.length || 0,
        sampleTeamGames: this.processedChartData?.[0]?.games?.length || 0
      });
      
      // If we have processed chart data, get the actual game count from the data
      if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games && firstTeam.games.length > 0) {
          const dynamicGameCount = firstTeam.games.length;
          console.log('🎯 Using dynamic game count from chart data:', dynamicGameCount);
          return dynamicGameCount;
        }
      }
      
      // Fallback to static values based on tournament type and day
      const fallbackGameCount = this.isEwc2025Tournament ? 
        (this.selectedDay === 'day1' ? 10 : 
         this.selectedDay === 'day2' ? 9 : 
         this.selectedDay === 'day3' ? 6 : 6) :
        (this.isYear5Tournament ? 6 : 8);
      
      console.log('🎯 Using fallback game count:', fallbackGameCount, 'for', this.selectedDay);
      return fallbackGameCount;
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
      // Remove chartEngine dependency since we're handling state directly in Vue
      // The new animation system is handled via watchers and intervals
    }, 300);
    
    // Add debug method to global scope for troubleshooting
    window.debugChampionshipApp = () => {
      console.log('🔍 Championship App Debug Info:', {
        selectedDay: this.selectedDay,
        selectedMatchup: this.selectedMatchup,
        computedMaxGames: this.maxGames,
        isEwc2025Tournament: this.isEwc2025Tournament,
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

    handleGameChanged(gameIndex) {
      console.log('🎮 Game changed to:', gameIndex);
      
      // Stop any ongoing animation when user manually changes game
      if (this.isPlaying) {
        this.isPlaying = false; // This will trigger the watcher to stop animation
      }
      
      this.currentGame = gameIndex;
      this.updateCurrentMap();
      
      // Reset filters when dragging back to initial state (game 0)
      if (gameIndex === 0) {
        this.isFiltered = false;
        this.filteredGameIndices = [];
      }
    },

    handlePlayToggled() {
      this.isPlaying = !this.isPlaying;
      console.log(this.isPlaying ? '▶️ Playing' : '⏸️ Paused');
    },

    handleRestartRequested() {
      this.currentGame = 0;
      this.isPlaying = false;
      this.isFiltered = false;
      this.filteredGameIndices = [];
      this.updateCurrentMap();
      console.log('🔄 Restarted to initial state');
    },

    startAnimation() {
      console.log('🎬 Starting animation from game', this.currentGame);
      
      // Clear any existing animation
      this.stopAnimation();
      
      // If we're at the end, restart from game 1
      if (this.currentGame >= this.maxGames) {
        this.currentGame = 1;
      } else if (this.currentGame === 0) {
        // If at initial state, start from game 1
        this.currentGame = 1;
      }
      
      // Start the animation interval
      this.playInterval = setInterval(() => {
        if (this.currentGame < this.maxGames) {
          this.currentGame++;
          this.updateCurrentMap();
          console.log('🎮 Animation progressed to game', this.currentGame);
        } else {
          // Reached the end, stop playing
          console.log('🏁 Animation completed');
          this.isPlaying = false;
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

    handleGameFilterChanged(filterData) {
      const { games, action } = filterData;
      
      if (action === 'clear' || games.length === 0) {
        this.isFiltered = false;
        this.filteredGameIndices = [];
        console.log('🔄 Clearing game filter');
      } else {
        this.isFiltered = true;
        this.filteredGameIndices = [...games].sort((a, b) => a - b);
        console.log(`🎮 Applying filter for games: ${games.join(', ')}`);
        
        // Ensure we're at max game level for filtering
        if (this.currentGame < this.maxGames) {
          this.currentGame = this.maxGames;
        }
      }
      
      console.log('🎯 Game filter changed:', {
        action,
        games,
        isFiltered: this.isFiltered,
        filteredGameIndices: this.filteredGameIndices
      });
      
      this.updateCurrentMap();
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

    handleLegendToggled(visible) {
      console.log('🎨 Toggling chart legend:', visible ? 'ON' : 'OFF');
      this.isLegendVisible = visible;
    },

    handleAnimationSpeedChanged(speed) {
      console.log('🎬 Animation speed changed to:', speed);
      this.animationSpeed = speed;
      // You might want to update the animation interval based on the new speed
      // For now, we'll just log the change.
    },

    /**
     * Enhanced cleanup method with error handling and race condition prevention
     */


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
      
        // Log the expected maxGames for debugging (fallback values only)
        const expectedMaxGames = this.isEwc2025Tournament ? 
          (dayId === 'day1' ? 10 : 9) : 
          (this.isYear5Tournament ? 6 : 8);
        console.log('🎮 Expected maxGames for', dayId, ':', expectedMaxGames, '(fallback - actual will be dynamic from CSV)');
        
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
        this.currentGame = 0;
        this.isPlaying = false;
        this.errorMessage = '';
        this.loadingMatchups.clear();
        this.loadedMatchups.clear();
      }
    },

    /**
     * Build CSV path based on tournament type
     */
    buildCsvPath(matchupId) {
      if (this.isEwc2025Tournament) {
        return `/ewc2025/raw/${matchupId}.csv`;
      } else if (this.isYear5Tournament) {
        return `/year5champions/raw/${matchupId}.csv`;
      } else {
        return `/year4champions/raw/${matchupId}.csv`;
      }
    },

    /**
     * Get tournament-specific file format information
     */
    getTournamentInfo() {
      return {
        type: this.isEwc2025Tournament ? 'EWC 2025' : (this.isYear5Tournament ? 'Year 5 Open' : 'Year 4 Championship'),
        dataPath: this.isEwc2025Tournament ? 'ewc2025/raw/' : (this.isYear5Tournament ? 'year5champions/raw/' : 'year4champions/raw/'),
        fileFormat: '{matchupId}.csv'
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
        
        // Build CSV path for the selected matchup
        const csvPath = this.buildCsvPath(this.selectedMatchup);
        console.log(`📂 Loading CSV for ${this.isEwc2025Tournament ? 'EWC 2025' : (this.isYear5Tournament ? 'Year 5' : 'Year 4')}:`, csvPath);
        
        // Load and process raw CSV data
        const rawData = await this.loadCsvData(csvPath);
        this.processedChartData = await this.processRawDataForChart(rawData);
        
        console.log('🎯 ChampionshipApp: Processed chart data ready:', {
          teams: this.processedChartData.length,
          maxGames: this.maxGames,
          sampleTeam: this.processedChartData[0],
          currentGame: this.currentGame
        });
        
        // Reset game state  
        this.currentGame = 0;
        this.updateCurrentMap();
        
        // Mark as loaded
        this.loadedMatchups.add(this.selectedMatchup);
        this.loadingMatchups.delete(this.selectedMatchup);
        
        console.log('✅ Matchup loaded successfully', {
          dataLength: this.processedChartData.length,
          maxGames: this.maxGames
        });
        
      } catch (error) {
        console.error('❌ Error loading matchup:', error);
        this.showChartError(error);
        this.loadingMatchups.delete(this.selectedMatchup);
      } finally {
        this.isLoading = false;
      }
    },
    
    async loadCsvData(csvPath) {
      console.log('📂 Loading CSV data from:', csvPath);
      
      const response = await fetch(csvPath);
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      const rawData = d3.csvParse(csvText);
      
      console.log('✅ CSV loaded:', {
        path: csvPath,
        rows: rawData.length,
        columns: rawData.columns
      });
      
      return rawData;
    },
    
    async processRawDataForChart(rawData) {
      console.log('🔄 Processing raw data for chart...');
      
      // Transform raw data to bifurcated format if needed
      const processedData = this.transformRawDataToWide(rawData);
      
      // Extract game columns and determine max games
      this.extractGameColumns(processedData);
      
      // Pre-compute game-by-game data for all teams
      const chartData = this.preComputeGameData(processedData);
      
      console.log('✅ Data processed for chart:', {
        teams: chartData.length,
        maxGames: this.maxGames,
        sampleTeam: chartData[0]
      });
      
      return chartData;
    },
    
    transformRawDataToWide(rawData) {
      console.log('🔄 Transforming raw data to wide format...');
      
      // ALGS placement-to-points conversion map
      const placementPointsMap = {
        '1': 12, '2': 9, '3': 7, '4': 5, '5': 4,
        '6': 3, '7': 3, '8': 2, '9': 2, '10': 2,
        '11': 1, '12': 1, '13': 1, '14': 1, '15': 1,
        '16': 0, '17': 0, '18': 0, '19': 0, '20': 0
      };
      
      const teamsData = {};
      
      // Process each row from raw data
      rawData.forEach(row => {
        const teamName = row.Team;
        const gameNumber = parseInt(row.Game);
        const placement = row.Placement;
        const kills = parseInt(row.Kills) || 0;
        
        // Initialize team if not exists
        if (!teamsData[teamName]) {
          teamsData[teamName] = {
            Team: teamName,
            'Overall Points': 0
          };
        }
        
        // Get placement points from lookup table
        const placementPoints = placementPointsMap[placement] || 0;
        
        // Create property names for this game
        const placementProp = `Game ${gameNumber} P`;
        const killsProp = `Game ${gameNumber} K`;
        
        // Assign the points
        teamsData[teamName][placementProp] = placementPoints;
        teamsData[teamName][killsProp] = kills;
        
        // Update overall points
        teamsData[teamName]['Overall Points'] += placementPoints + kills;
      });
      
      // Convert to array and sort by overall points (descending)
      const transformedData = Object.values(teamsData).sort((a, b) => b['Overall Points'] - a['Overall Points']);
      
      console.log('✅ Raw data transformed:', {
        originalRows: rawData.length,
        transformedTeams: transformedData.length
      });
      
      return transformedData;
    },
    
    extractGameColumns(data) {
      if (!data || data.length === 0) return;
      
      const firstTeam = data[0];
      this.gameColumns = Object.keys(firstTeam).filter(col => 
        col.startsWith('Game ') && col.endsWith(' P')
      );
      
      this.maxGames = this.gameColumns.length;
      console.log('🎮 Extracted game columns:', this.gameColumns, 'Max games:', this.maxGames);
    },
    
    preComputeGameData(data) {
      console.log('⚡ Pre-computing game-by-game data...');
      
      // Get map sequence for the current matchup
      const mapSequence = getMapSequence(this.selectedMatchup);
      console.log('🗺️ Using map sequence for', this.selectedMatchup, ':', mapSequence);
      
      const chartData = data.map(team => {
        const games = [];
        let cumulativeScore = 0;
        
        for (let gameNum = 1; gameNum <= this.maxGames; gameNum++) {
          const placementPoints = team[`Game ${gameNum} P`] || 0;
          const kills = team[`Game ${gameNum} K`] || 0;
          const gamePoints = placementPoints + kills;
          
          // Get map name and color for this game
          const mapName = mapSequence?.maps?.[gameNum] || 'Unknown';
          const occurrenceCount = calculateMapOccurrence(mapName, gameNum, mapSequence);
          const gameColor = getMapColorByOccurrence(mapName, occurrenceCount);
          
          games.push({
            gameNumber: gameNum,
            placementPoints,
            kills,
            points: gamePoints,
            startX: cumulativeScore,
            map: mapName,
            color: gameColor
          });
          
          cumulativeScore += gamePoints;
        }
        
        return {
          team: team.Team,
          games,
          totalScore: cumulativeScore,
          cumulativeScore: cumulativeScore
        };
      });
      
      // Sort by total score descending
      chartData.sort((a, b) => b.totalScore - a.totalScore);
      
      return chartData;
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
      console.log('🧹 ChampionshipApp: Cleaning up chart resources');
      
      try {
        // Clear chart data
        this.processedChartData = [];
        this.currentGame = 0;
        this.currentMap = '';
        this.isPlaying = false;
        this.isFiltered = false;
        this.filteredGameIndices = [];
        this.isLegendVisible = false;
        
        // Stop any ongoing animation
        this.stopAnimation();
        
        console.log('✅ Chart cleanup completed successfully');
      } catch (error) {
        console.warn('⚠️ Error during chart cleanup:', error);
      }
    }
  },
  
  beforeUnmount() {
    console.log('🧹 ChampionshipApp beforeUnmount() called - cleaning up');
    
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