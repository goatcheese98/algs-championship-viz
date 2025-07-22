<template>
  <div v-if="maxGames > 0" 
       ref="actionPanel"
       class="action-panel"
       :class="{ expanded: level1Expanded }">
    
    <div class="panel-header">
      <div class="panel-title">
        <button class="btn btn-icon btn-primary" @click="togglePanel" @mousedown.stop" title="Toggle advanced controls">
          {{ level1Expanded ? '−' : '+' }}
        </button>
        <span class="title-text">Controls</span>
      </div>
      <div class="panel-controls">
      </div>
    </div>

    <!-- Always visible: Game Progress and Controls -->
    <div class="compact-status">
      <!-- Game Progress (always visible) -->
      <div class="flex flex-col gap-1.5 mb-4">
        <label class="text-xs text-gray-400 font-medium">Game Progress: {{ displayedProgress }} / {{ maxGames }}</label>
        <div class="flex items-center gap-1.5">
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

      <!-- Bento Box Container for Map + Controls -->
      <div class="bento-controls-container">
        <!-- Current Map Info -->
        <div class="map-badge flex items-center gap-2 p-3 rounded-xl font-semibold text-white shadow-md transition-all" 
             :style="getCurrentMapStyle()"
             @mouseenter="showCurrentMapTooltip"
             @mousemove="updateTooltipPosition"
             @mouseleave="hideMapTooltip"
             style="cursor: pointer;">
          <template v-if="getCurrentMapImageUrl() && currentMap">
            <img :src="getCurrentMapImageUrl()" 
                 :alt="currentMap"
                 class="map-icon-image"
                 loading="lazy"
                 decoding="async"
                 @load="handleMapImageLoad"
                 @error="handleMapImageError"
                 @mouseenter="showCurrentMapTooltip"
                 @mousemove="updateTooltipPosition"
                 @mouseleave="hideMapTooltip">
          </template>
          <span v-else class="map-icon">🗺️</span>
        </div>

        <!-- Quick Controls (Play/Reset) -->
        <div class="control-buttons">
          <button @click="togglePlayback" class="btn btn-md btn-success">
            {{ isPlaying ? 'Pause' : 'Play' }}
          </button>
          <button @click="restart" class="btn btn-md btn-danger">
            Reset
          </button>
        </div>
      </div>

      <!-- Level 1 Expansion Toggle -->
      <div class="expansion-toggle-container">
        <button @click="toggleLevel1" class="expansion-toggle-btn">
          <svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
               :style="{ transform: level1Expanded ? 'rotate(180deg)' : 'rotate(0deg)' }">
            <path d="m6 9 6 6 6-6"/>
          </svg>
          <span>Game Filters</span>
        </button>
      </div>
    </div>

    <!-- Level 1: Game Filter Controls -->
    <transition name="slide-down">
      <div v-if="level1Expanded" class="level1-controls-container" @mousedown.stop>
        <div class="filter-buttons-container">
          <div class="text-2xs text-gray-400 opacity-80 text-center mb-3">Click to filter | X to clear</div>
          <div class="flex flex-wrap justify-center gap-2">
            <button v-for="item in filterButtons" 
                    :key="item.id"
                    @click="item.type === 'game' ? toggleGameFilter(item.value) : resetGameFilter()"
                    @mouseenter="item.type === 'game' ? showFilterTooltip($event, item.value) : showClearTooltip($event)"
                    @mouseleave="hideFilterTooltip"
                    :class="['btn', 'btn-sm', {
                      'btn-active': item.type === 'game' && selectedGames.includes(item.value),
                      'btn-primary': item.type === 'game' && item.value === currentGame,
                      'btn-danger': item.type === 'clear'
                    }]"
                    :style="item.type === 'game' ? getGameButtonStyle(item.value) : getClearButtonStyle()">
              {{ item.label }}
            </button>
          </div>
        </div>
        
        <!-- Level 2 Expansion Toggle -->
        <div class="expansion-toggle-container level2-toggle">
          <button @click="toggleLevel2" class="expansion-toggle-btn">
            <svg class="expand-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" 
                 :style="{ transform: level2Expanded ? 'rotate(180deg)' : 'rotate(0deg)' }">
              <path d="m6 9 6 6 6-6"/>
            </svg>
            <span>Advanced Controls</span>
          </button>
        </div>
      </div>
    </transition>

    <!-- Level 2: Advanced Controls (Export, Legend, Animation Speed) -->
    <transition name="slide-down">
      <div v-if="level1Expanded && level2Expanded" class="level2-controls-container" @mousedown.stop>
        
        <!-- Export & Legend Controls (Same Row) -->
        <div class="controls-section">
          <label class="controls-section-label">Export Data & Chart Legend</label>
          <div class="controls-row">
            <button @click="exportData" class="expanded-control-btn">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span>Export CSV</span>
            </button>
            <button @click="toggleLegend" class="expanded-control-btn">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 2v20l3-2 3 2V2z"/>
              </svg>
              <span>{{ isLegendVisible ? 'Hide' : 'Show' }} Legend</span>
            </button>
          </div>
        </div>
        
        <!-- Animation Speed Controls -->
        <div class="controls-section">
          <label class="controls-section-label">Animation Speed</label>
          <div class="controls-row">
            <button 
              @click="setAnimationSpeed('slow')" 
              :class="['expanded-control-btn', 'speed-btn', { 'active': animationSpeed === 'slow' }]"
            >
              Slow
            </button>
            <button 
              @click="setAnimationSpeed('medium')" 
              :class="['expanded-control-btn', 'speed-btn', { 'active': animationSpeed === 'medium' }]"
            >
              Medium
            </button>
            <button 
              @click="setAnimationSpeed('fast')" 
              :class="['expanded-control-btn', 'speed-btn', { 'active': animationSpeed === 'fast' }]"
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
import { getMapImageUrl } from '../data/tournaments'
import { tooltipManager } from '../utils/TooltipManager.js' // Import unified tooltip system

export default {
  name: 'ActionPanel',
  
  props: {
    currentMap: {
      type: String,
      default: ''
    }
  },
  
  emits: [
    'export-requested',
    'game-filter-changed'
  ],
  
  data() {
    return {
      // Panel state
      level1Expanded: false,  // First level: Filters
      level2Expanded: false,  // Second level: Export, Legend, Animation
      
      // Game state
      manualSliderControl: false,
      
      // Filter state
      selectedGames: [],
      
      // GSAP draggable instance
      draggableInstance: null,
    }
  },
  
  computed: {
    ...mapState(useTournamentStore, [
        'isLegendVisible', 
        'animationSpeed',
        'isPlaying',
        'currentGame', // ADD currentGame to mapped state
        'maxGames', // ADD maxGames from store
        'processedChartData', // ADD processedChartData from store
        'selectedMatchup' // ADD selectedMatchup from store
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
    },
    filterButtons() {
      const buttons = [];
      for (let i = 1; i <= this.maxGames; i++) {
        buttons.push({ id: `game-${i}`, type: 'game', value: i, label: i.toString() });
      }
      buttons.push({ id: 'clear-filter', type: 'clear', value: null, label: '✕' });
      return buttons;
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
    
    // Clean up unified tooltip system
    tooltipManager.destroyAll();
  },
  
  methods: {
    ...mapActions(useTournamentStore, [
        'toggleLegend', 
        'setAnimationSpeed',
        'togglePlayback',
        'setCurrentGame',
        'resetPlayback',
        'setGameFilter'
    ]),
    toggleLevel1() {
      this.level1Expanded = !this.level1Expanded;
      // Close level 2 when level 1 is closed
      if (!this.level1Expanded) {
        this.level2Expanded = false;
      }
    },
    toggleLevel2() {
      this.level2Expanded = !this.level2Expanded;
    },
    // Legacy method for backward compatibility
    togglePanel() {
      this.toggleLevel1();
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
      
      
      const panelElement = this.$refs.actionPanel;
      const panelId = panelElement.id || `action-panel-${Date.now()}`;
      
      if (!panelElement.id) {
        panelElement.id = panelId;
      }
      
      console.log('🚀 Initializing draggable for panel:', panelId);
      
      this.draggableInstance = GSAPDraggableManager.initializeDraggable(panelElement);
      
      if (this.draggableInstance) {
        console.log('✅ ActionPanel draggable initialized successfully');
      } else {
        console.warn('⚠️ ActionPanel draggable initialization failed');
      }
    },
    
    
    
    updateGameFromSlider(event) {
      const gameValue = Math.min(Math.max(0, parseInt(event.target.value)), this.maxGames);
      
      this.setCurrentGame(gameValue);
      
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
    
    restart() {
      this.resetPlayback();
    },
    

    
    async toggleGameFilter(gameNum) {
      const wasSelected = this.selectedGames.includes(gameNum);
      
      if (wasSelected) {
        this.selectedGames.splice(this.selectedGames.indexOf(gameNum), 1);
        console.log(`🎮 Removed game ${gameNum} from filter. Selected: [${this.selectedGames.join(', ')}]`);
      } else {
        this.selectedGames.push(gameNum);
        console.log(`🎮 Added game ${gameNum} to filter. Selected: [${this.selectedGames.join(', ')}]`);
        
        if (this.currentGame < this.maxGames) {
          console.log(`🎯 Auto-progressing to game ${this.maxGames} for filtering`);
          this.setCurrentGame(this.maxGames);
        }
      }
      
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
      this.setCurrentGame(0);
    },
    
    getGameButtonStyle(gameNum) {
      const isActive = this.selectedGames.includes(gameNum);
      const isCurrent = gameNum === this.currentGame;
      
      let gameColor = '#6366f1';
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const gameData = firstTeam.games.find(game => game.gameNumber === gameNum);
          if (gameData && gameData.color) {
            gameColor = gameData.color;
          }
        }
      }
      
      // Apply dynamic color to text with glow effect
      const baseStyle = {
        color: gameColor,
        textShadow: `0 0 8px ${gameColor}, 0 1px 2px rgba(0, 0, 0, 0.8)`
      };
      
      if (isCurrent) {
        return {
          ...baseStyle,
          textShadow: `0 0 12px ${gameColor}, 0 0 20px ${gameColor}60, 0 1px 2px rgba(0, 0, 0, 0.8)`,
          fontWeight: '700'
        };
      } else if (isActive) {
        return {
          ...baseStyle,
          textShadow: `0 0 16px ${gameColor}, 0 0 24px ${gameColor}80, 0 1px 2px rgba(0, 0, 0, 0.8)`,
          fontWeight: '700'
        };
      } else {
        return baseStyle;
      }
    },
    
    getClearButtonStyle() {
      // Apply red color to clear button text with glow
      return {
        color: '#dc2626',
        textShadow: '0 0 8px #dc2626, 0 1px 2px rgba(0, 0, 0, 0.8)',
        fontWeight: '700'
      };
    },
    
    getGameTooltip(gameNum) {
      let mapName = '';
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const gameData = firstTeam.games.find(game => game.gameNumber === gameNum);
          if (gameData && gameData.map) {
            mapName = gameData.map;
          }
        }
      }
      
      return mapName || `Game ${gameNum}`;
    },
    
    getMapImageUrl(mapName) {
      return getMapImageUrl(mapName)
    },
    
    getCurrentMapImageUrl() {
      let mapName = this.currentMap;
      if (mapName && mapName.includes(' - ')) {
        mapName = mapName.split(' - ')[1];
      }
      
      const imageUrl = this.getMapImageUrl(mapName);
      return imageUrl;
    },
    
    handleMapImageLoad(event) {
    },
    
    handleMapImageError(event) {
      event.target.style.display = 'none';
    },
    
    showMapTooltip(event, gameNum) {
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout);
      }
      
      this.tooltipTimeout = setTimeout(() => {
        const mapName = this.getGameTooltip(gameNum);
        const imageUrl = this.getMapImageUrl(mapName);
        
        if (imageUrl) {
          const rect = event.target.getBoundingClientRect();
          this.mapTooltip = {
            visible: true,
            x: rect.left - 80,
            y: rect.top - 120,
            mapName: mapName,
            imageUrl: imageUrl
          };
        }
      }, 200);
    },
    
    showCurrentMapTooltip(event) {
      if (!this.currentMap) {
        return;
      }
      
      let mapName = this.currentMap;
      if (mapName && mapName.includes(' - ')) {
        mapName = mapName.split(' - ')[1];
      }
      
      const imageUrl = this.getMapImageUrl(mapName);
      if (!imageUrl) {
        return;
      }
      
      // Use unified tooltip system
      const isPreGame = mapName === 'Pre-game';
      const subtitle = isPreGame ? 'Tournament Status' : 'Current Map';
      
      tooltipManager.showMapTooltip('current-map', event, {
        mapName: isPreGame ? 'Pre-game Preparation' : mapName,
        imageUrl,
        subtitle
      });
    },
    
    updateTooltipPosition(event) {
      // Update unified tooltip position
      tooltipManager.updateTooltipPosition('current-map', event);
    },
    
    hideMapTooltip() {
      // Hide unified tooltip
      tooltipManager.hideTooltip('current-map');
    },
    
    
    showFilterTooltip(event, gameNum) {
      const mapName = this.getGameTooltip(gameNum);
      
      // Use unified tooltip system with special positioning for filter buttons
      tooltipManager.showTooltip(`filter-${gameNum}`, event, {
        title: `Game ${gameNum}`,
        content: mapName,
        debounce: false,
        offset: { x: 0, y: -60 }, // Position above button
        position: 'above'
      });
    },
    
    showClearTooltip(event) {
      // Use unified tooltip system
      tooltipManager.showTooltip('clear-filter', event, {
        title: 'Clear Filters',
        content: 'Remove all game filters and reset view',
        debounce: false,
        offset: { x: 0, y: -60 }, // Position above button
        position: 'above'
      });
    },
    
    hideFilterTooltip() {
      // Hide all filter-related tooltips
      tooltipManager.hideTooltip('clear-filter');
      // Hide game-specific filter tooltips (they use filter-{gameNum} pattern)
      for (let i = 1; i <= this.maxGames; i++) {
        tooltipManager.hideTooltip(`filter-${i}`);
      }
    },
    
    
    
    getCurrentMapStyle() {
      let mapColor = '#ef4444';
      
      if (this.processedChartData && this.processedChartData.length > 0 && this.currentGame > 0) {
        const firstTeam = this.processedChartData[0];
        if (firstTeam && firstTeam.games) {
          const currentGameData = firstTeam.games.find(game => game.gameNumber === this.currentGame);
          if (currentGameData && currentGameData.color) {
            mapColor = currentGameData.color;
          }
        }
      }
      
      // Apply dynamic color to map badge text with glow
      return {
        color: mapColor,
        textShadow: `0 0 10px ${mapColor}, 0 0 20px ${mapColor}60, 0 1px 2px rgba(0, 0, 0, 0.8)`
      };
    },
    
    exportData() {
      this.$emit('export-requested', this.selectedMatchup);
    }

  }
}
</script>

<style scoped>
.action-panel {
  /* Compact draggable rectangle design */
  width: 220px;
  max-width: 220px;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.6) 100%);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-2xl);
  backdrop-filter: blur(6px);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.4),
    0 0 12px rgba(239, 68, 68, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(239, 68, 68, 0.25);
  cursor: move;
  position: absolute;
  z-index: 15000;
  pointer-events: auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.title-text {
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.compact-status {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.progress-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  border-radius: 3px;
  background: rgba(239, 68, 68, 0.2);
  outline: none;
  transition: all 0.2s ease;
}

.progress-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
  transition: all 0.2s ease;
}

.progress-slider::-webkit-slider-thumb:hover {
  background: var(--color-primary-dark);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.6);
}

.progress-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
  transition: all 0.2s ease;
}

.progress-value {
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  min-width: 24px;
  text-align: center;
}

.bento-controls-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.map-badge {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--spacing-2xl);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.map-badge:hover {
  border-color: rgba(239, 68, 68, 0.5);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
  transform: translateY(-2px);
}

.map-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.map-badge:hover::before {
  left: 100%;
}

/* Button styling improvements */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-medium);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  text-decoration: none;
  outline: none;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  padding: 0;
  font-size: 18px;
  font-weight: 700;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

.btn-primary:hover {
  background: var(--color-primary-dark);
  box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
}

/* Expansion Toggle Styling */
.expansion-toggle-container {
  margin-top: var(--spacing-sm);
  border-top: 1px solid rgba(239, 68, 68, 0.15);
  padding-top: var(--spacing-sm);
}

.level2-toggle {
  margin-top: var(--spacing-2xl);
  border-top: 1px solid rgba(239, 68, 68, 0.1);
}

.expansion-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.expansion-toggle-btn:hover {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--color-text-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
}

.expand-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

/* Level containers */
.level1-controls-container,
.level2-controls-container {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: rgba(15, 23, 42, 0.3);
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.1);
}

.level2-controls-container {
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(239, 68, 68, 0.15);
}

</style> 