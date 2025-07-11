<template>
  <div v-if="chartEngine || maxGames > 0" 
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
                    :key="`game-${game}-${maxGames}`"
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
        <!-- Legend Toggle -->
        <div class="control-section">
          <label class="section-label">Chart Legend</label>
          <button @click="toggleLegend" class="legend-toggle-btn">
            {{ legendVisible ? 'Hide Legend' : 'Show Legend' }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { GSAPDraggableManager } from '../utils/GSAPDraggableManager.js'

export default {
  name: 'ActionPanel',
  
  props: {
    chartEngine: {
      type: Object,
      default: null
    },
    selectedMatchup: {
      type: String,
      default: ''
    },
    maxGames: {
      type: Number,
      default: 6
    },
    isPlaying: {
      type: Boolean,
      default: false
    }
  },
  
  emits: [
    'game-changed',
    'play-toggled', 
    'restart-requested',
    'game-filter-changed',
    'export-requested',
    'legend-toggled'
  ],
  
  data() {
    return {
      // Panel state
      panelExpanded: false,
      
      // Game state
      currentGame: 0,
      currentMap: '',
      manualSliderControl: false,
      
      // Filter state
      selectedGames: [],
      
      // Legend state
      legendVisible: false,
      
      // GSAP draggable instance
      draggableInstance: null
    }
  },
  
  computed: {
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
    chartEngine(newEngine, oldEngine) {
      if (newEngine && newEngine !== oldEngine) {
        this.$nextTick(() => {
          this.initDraggable();
          this.updateCurrentMap();
        });
      }
    },
    
    // Watch for changes in maxGames to update controls
    maxGames(newMaxGames, oldMaxGames) {
      console.log(`🎮 ActionPanel: maxGames watcher triggered - from ${oldMaxGames} to ${newMaxGames}`);
      console.log(`🎮 ActionPanel: Component state:`, {
        selectedMatchup: this.selectedMatchup,
        chartEngine: !!this.chartEngine,
        currentGame: this.currentGame
      });
      
      if (newMaxGames !== oldMaxGames) {
        console.log(`🎮 ActionPanel: maxGames changed from ${oldMaxGames} to ${newMaxGames}`);
        
        // Reset current game if it exceeds the new max
        if (this.currentGame > newMaxGames) {
          console.log(`🎮 ActionPanel: Resetting currentGame from ${this.currentGame} to 0`);
          this.currentGame = 0;
          this.$emit('game-changed', this.currentGame);
        }
        
        // Force update the component to reflect new maxGames
        this.$forceUpdate();
        
        // Update draggable constraints if it exists
        if (this.draggableInstance) {
          this.$nextTick(() => {
            this.updateDraggableConstraints();
          });
        }
      }
    },
    
    // Watch for external game changes
    'chartEngine.currentGameIndex'() {
      if (this.chartEngine && !this.manualSliderControl) {
        const engineGameIndex = this.chartEngine.currentGameIndex !== undefined ? this.chartEngine.currentGameIndex : 0;
        if (Math.abs(this.currentGame - engineGameIndex) > 0) {
          this.currentGame = engineGameIndex;
          this.updateCurrentMap();
        }
      }
    }
  },
  
  mounted() {
    // Initialize draggable when component mounts
    this.$nextTick(() => {
      this.initDraggable();
    });
    
    // Set up periodic sync with chart engine
    this.syncInterval = setInterval(() => {
      if (this.chartEngine) {
        const engineGameIndex = this.chartEngine.currentGameIndex !== undefined ? this.chartEngine.currentGameIndex : 0;
        
        if (Math.abs(this.currentGame - engineGameIndex) > 0 && !this.manualSliderControl) {
          this.currentGame = engineGameIndex;
        }
        
        this.updateCurrentMap();
      }
    }, 300);
  },
  
  beforeUnmount() {
    // Cleanup sync interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
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
    
    async updateGameFromSlider() {
      this.currentGame = Math.min(Math.max(0, this.currentGame), this.maxGames);
      this.$emit('game-changed', this.currentGame);
      this.updateCurrentMap();
      
      // Reset filters when dragging back to initial state (game 0)
      if (this.currentGame === 0 && this.selectedGames.length > 0) {
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
    
    togglePlayback() {
      this.$emit('play-toggled');
    },
    
    restart() {
      this.currentGame = 0;
      this.updateCurrentMap();
      this.$emit('restart-requested');
    },
    
    updateCurrentMap() {
      if (this.chartEngine && this.chartEngine.dataManager) {
        // Get current map from data manager
        const currentGameIndex = this.chartEngine.currentGameIndex || this.currentGame;
        this.currentMap = this.chartEngine.dataManager.getMapForGame(currentGameIndex);
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
          this.$emit('game-changed', this.currentGame);
        }
      }
      
      // Emit filter change event
      this.$emit('game-filter-changed', { 
        games: this.selectedGames, 
        action: wasSelected ? 'remove' : 'add',
        gameNum 
      });
    },
    
    async resetGameFilter() {
      console.log('🔄 Resetting game filter and returning to initial state');
      this.selectedGames = [];
      
      // Reset to initial state when clearing filters
      this.currentGame = 0;
      this.updateCurrentMap();
      
      this.$emit('game-filter-changed', { games: [], action: 'clear' });
      this.$emit('game-changed', 0);
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
      this.$emit('export-requested', this.selectedMatchup);
    },

    toggleLegend() {
      this.legendVisible = !this.legendVisible;
      this.$emit('legend-toggled', this.legendVisible);
    },
    
    // Mobile detection utility
    isMobileDevice() {
      return window.innerWidth <= 768;
    }
  }
}
</script> 