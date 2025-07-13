<template>
  <div v-if="maxGames > 0" 
       ref="actionPanel"
       class="enhanced-action-panel tournament-controls"
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
                 :value="currentGame"
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
                    :key="`game-${game}-${maxGames}`"
                    @click="toggleGameFilter(game)"
                    class="game-filter-btn"
                    :class="{ 
                      active: selectedGames.includes(game),
                      current: game === currentGame 
                    }"
                    :style="getGameButtonStyle(game)"
                    :data-tooltip="getGameTooltip(game)">
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
          <button @click="exportData" class="export-btn">
            📊 Export CSV
          </button>
        </div>
        <!-- Legend Toggle -->
        <div class="control-section">
          <label class="section-label">Chart Legend</label>
          <button @click="toggleLegend" class="legend-toggle-btn">
                            {{ isLegendVisible ? 'Hide Legend' : 'Show Legend' }}
          </button>
        </div>
        
        <!-- Animation Speed Controls -->
        <div class="control-section">
          <label class="section-label">Animation Speed</label>
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
</template>

<script>
import { useTournamentStore } from '../stores/tournament.js' // Import the store
import { mapState, mapActions } from 'pinia' // Import Pinia helpers
import { GSAPDraggableManager } from '../utils/GSAPDraggableManager.js'

export default {
  name: 'ActionPanel',
  
  props: {
    selectedMatchup: {
      type: String,
      default: ''
    },
    maxGames: {
      type: Number,
      default: 6
    },
    // isPlaying prop is no longer needed - now comes from store
    // currentGame prop is no longer needed - now comes from store
    currentMap: {
      type: String,
      default: ''
    },
    chartData: {
      type: Array,
      default: () => []
    }
  },
  
  emits: [
    // 'game-changed', // REMOVE THIS EMIT
    // 'play-toggled', // REMOVE THIS EMIT
    // 'restart-requested', // REMOVE THIS EMIT
    // 'game-filter-changed', // REMOVE THIS EMIT
    'export-requested',
    // 'legend-toggled', // We no longer need to emit this
    // 'animation-speed-changed' // We no longer need to emit this
  ],
  
  data() {
    return {
      // Panel state
      panelExpanded: false,
      
      // Game state
      manualSliderControl: false,
      
      // Filter state
      selectedGames: [],
      
      // GSAP draggable instance
      draggableInstance: null,

      // animationSpeed: 'medium' // REMOVE THIS local state
    }
  },
  
  computed: {
    ...mapState(useTournamentStore, [
        'isLegendVisible', 
        'animationSpeed',
        'isPlaying',
        'currentGame' // ADD currentGame to mapped state
    ]),
    displayedProgress() {
      // Ensure progress is always within valid range (0 to maxGames)
      const progress = Math.min(Math.max(0, this.currentGame), this.maxGames);
      console.log(`🎯 ActionPanel: displayedProgress computed:`, {
        currentGame: this.currentGame,
        maxGames: this.maxGames,
        progress: progress
      });
      return progress;
    }
  },
  
  watch: {

    
    // Watch for changes in maxGames to update controls
    maxGames(newMaxGames, oldMaxGames) {
      console.log(`🎮 ActionPanel: maxGames watcher triggered - from ${oldMaxGames} to ${newMaxGames}`);
      
      if (newMaxGames !== oldMaxGames) {
        console.log(`🎮 ActionPanel: maxGames changed from ${oldMaxGames} to ${newMaxGames}`);
        
        // Clear any selected games that are out of bounds
        this.selectedGames = this.selectedGames.filter(game => game <= newMaxGames);
      }
    },

  },
  
  mounted() {
    // Initialize draggable when component mounts
    this.$nextTick(() => {
      this.initDraggable();
    });
  },
  
  beforeUnmount() {
    // Cleanup draggable - Use correct cleanup method
    if (this.draggableInstance) {
      if (this.draggableInstance.cleanup) {
        // Use instance's own cleanup method
        this.draggableInstance.cleanup();
      } else if (GSAPDraggableManager && this.$refs.actionPanel && this.$refs.actionPanel.id) {
        // Use manager's destroy method with panel ID
        GSAPDraggableManager.destroyDraggable(this.$refs.actionPanel.id);
      }
    }
  },
  
  methods: {
    ...mapActions(useTournamentStore, [
        'toggleLegend', 
        'setAnimationSpeed',
        'togglePlayback',
        'setCurrentGame',
        'resetPlayback',
        'setGameFilter' // ADD THIS mapped action
    ]),
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
    
    initDraggable() {
      console.log('🎯 Initializing ActionPanel draggable...');
      
      if (!this.$refs.actionPanel) {
        console.warn('⚠️ Action panel ref not available');
        return;
      }
      
      if (!GSAPDraggableManager) {
        console.warn('⚠️ GSAPDraggableManager not available');
        return;
      }
      
      // Skip draggable initialization on mobile
      if (this.isMobileDevice()) {
        console.log('📱 Mobile device detected - skipping draggable initialization');
        return;
      }
      
      const panelElement = this.$refs.actionPanel;
      const panelId = panelElement.id || `action-panel-${Date.now()}`;
      
      // Ensure panel has ID
      if (!panelElement.id) {
        panelElement.id = panelId;
      }
      
      console.log('🚀 Initializing draggable for panel:', panelId);
      
      // Initialize draggable with new system
      this.draggableInstance = GSAPDraggableManager.initializeDraggable(panelElement);
      
      if (this.draggableInstance) {
        console.log('✅ ActionPanel draggable initialized successfully');
      } else {
        console.warn('⚠️ ActionPanel draggable initialization failed');
      }
    },
    
    updateDraggableConstraints() {
      // For this implementation, we don't need to update constraints
      // since the draggable is for the panel, not the game controls
      // The game controls are handled through Vue reactivity
      console.log('🎮 Draggable constraints updated for maxGames:', this.maxGames);
    },
    
    updateGameFromSlider(event) {
      const gameValue = Math.min(Math.max(0, parseInt(event.target.value)), this.maxGames);
      
      // Update store directly for responsive UI feedback
      this.setCurrentGame(gameValue);
      
      // Reset filters when dragging back to initial state (game 0)
      if (gameValue === 0 && this.selectedGames.length > 0) {
        console.log('🔄 Progress bar dragged to 0, resetting filters');
        this.selectedGames = [];
        this.$emit('game-filter-changed', { games: [], action: 'clear' });
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
    
    // REMOVE the old togglePlayback method that emitted an event.
    // The new one is mapped from the store and will be called directly
    // by the @click handler in the template.
    
    restart() {
      this.resetPlayback(); // CHANGE to call store action
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
          this.setCurrentGame(this.maxGames);
        }
      }
      
      // CHANGE: Call the store action directly instead of emitting
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
      
      this.setGameFilter({ games: [], action: 'clear', maxGames: this.maxGames }); // CHANGE to call store action
      this.setCurrentGame(0); // Also reset game progress
    },
    
    getGameButtonStyle(gameNum) {
      const isActive = this.selectedGames.includes(gameNum);
      const isCurrent = gameNum === this.currentGame;
      
      // Get map color for this game from chart data
      let gameColor = '#6366f1'; // default fallback
      
      if (this.chartData && this.chartData.length > 0) {
        // Find the game data from the first team (all teams have same game sequence)
        const firstTeam = this.chartData[0];
        if (firstTeam && firstTeam.games) {
          const gameData = firstTeam.games.find(game => game.gameNumber === gameNum);
          if (gameData && gameData.color) {
            gameColor = gameData.color;
          }
        }
      }
      
      const baseStyle = {
        background: `linear-gradient(135deg, ${gameColor} 0%, ${this.adjustColor(gameColor, -10)} 100%)`,
        border: `2px solid ${gameColor}`,
        color: '#ffffff'
      };
      
      // Add subtle glow effect only for current game during progress
      if (isCurrent) {
        return {
          ...baseStyle,
          boxShadow: `0 0 8px ${gameColor}60, 0 2px 4px rgba(0,0,0,0.3)`
        };
      } else if (isActive) {
        // Keep enhanced styling for selected filters
        return {
          ...baseStyle,
          boxShadow: `0 0 12px ${gameColor}60, 0 0 20px ${gameColor}40`,
          transform: 'scale(1.15)'
        };
      } else {
        // Default colored buttons with map colors
        return baseStyle;
      }
    },
    
    getGameTooltip(gameNum) {
      // Get map name from chart data if available
      let mapName = '';
      
      if (this.chartData && this.chartData.length > 0) {
        const firstTeam = this.chartData[0];
        if (firstTeam && firstTeam.games) {
          const gameData = firstTeam.games.find(game => game.gameNumber === gameNum);
          if (gameData && gameData.map) {
            mapName = ` - ${gameData.map}`;
          }
        }
      }
      
      return `Game ${gameNum}${mapName}`;
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
      let mapColor = '#10b981'; // default fallback
      let mapName = this.currentMap || 'Loading...';
      
      // Get map color for current game from chart data
      if (this.chartData && this.chartData.length > 0 && this.currentGame > 0) {
        const firstTeam = this.chartData[0];
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
    
    exportData() {
      this.$emit('export-requested', this.selectedMatchup);
    },

    // REMOVE the old toggleLegend method that emitted an event.
    // The new one is mapped from the store and will be called directly
    // by the @click handler in the template.

    // REMOVE the old setAnimationSpeed method that emitted an event.
    // The new one is mapped from the store and will be called directly
    // by the @click handler in the template.
    
    // Mobile detection utility
    isMobileDevice() {
      return window.innerWidth <= 768;
    }
  }
}
</script> 