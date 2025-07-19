<template>
  <div v-if="maxGames > 0" 
       ref="actionPanel"
       class="enhanced-action-panel"
       :class="{ expanded: panelExpanded }">
    
    <div class="panel-header">
      <div class="panel-title">
        <span class="drag-handle">⋮⋮</span>
        <div class="section-icon">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <span class="title-text">Controls</span>
      </div>
      <div class="panel-controls">
        <button class="expand-btn" @click="togglePanel" @mousedown.stop" title="Toggle advanced controls">
          {{ panelExpanded ? '−' : '+' }}
        </button>
      </div>
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
        <div class="game-filter-grid">
          <button v-for="item in filterButtons" 
                  :key="item.id"
                  @click="item.type === 'game' ? toggleGameFilter(item.value) : resetGameFilter()"
                  @mouseenter="item.type === 'game' ? showMapTooltip($event, item.value) : null"
                  @mouseleave="hideMapTooltip"
                  :class="['game-filter-btn', {
                    active: item.type === 'game' && selectedGames.includes(item.value),
                    current: item.type === 'game' && item.value === currentGame
                  }]"
                  :style="item.type === 'game' ? getGameButtonStyle(item.value) : {}"
                  :title="item.type === 'game' ? getGameTooltip(item.value) : 'Clear Filters'">
            {{ item.label }}
          </button>
        </div>
        <div class="filter-action-label">Click to filter | X to clear</div>
      </div>

      <!-- Current Map Info -->
      <div class="current-map-display">
        <div class="map-badge" 
             :style="getCurrentMapStyle()"
             @mouseenter="showCurrentMapTooltip"
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
                 @mouseleave="hideMapTooltip">
          </template>
          <span v-else class="map-icon">🗺️</span>
          <span class="map-name" @mouseenter="showCurrentMapTooltip" @mouseleave="hideMapTooltip">{{ currentMap || 'Loading...' }}</span>
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

    <!-- Expanded Controls (Advanced Features) -->
    <transition name="slide-down">
      <div v-if="panelExpanded" class="expanded-controls" @mousedown.stop>
        <!-- Export Controls -->
        <div class="control-section">
          <label class="section-label">Export Data</label>
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
        <div class="control-section">
          <label class="section-label">Chart Legend</label>
          <button @click="toggleLegend" class="legend-toggle-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 2v20l3-2 3 2V2z"/>
            </svg>
            {{ isLegendVisible ? 'Hide' : 'Show' }} Legend
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
    currentMap: {
      type: String,
      default: ''
    }
  },
  
  emits: [
    'export-requested',
    'show-map-tooltip',
    'hide-map-tooltip'
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
      
      tooltipTimeout: null,
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
    
    // Clean up tooltip timeout
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
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
      
      if (this.processedChartData && this.processedChartData.length > 0) {
        // Find the game data from the first team (all teams have same game sequence)
        const firstTeam = this.processedChartData[0];
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
      const mapImages = {
        "World's Edge": 'https://cdn.mos.cms.futurecdn.net/MCKD8U49KzQ9UQE8X5BrQX-650-80.jpg.webp',
        "WORLD'S EDGE": 'https://cdn.mos.cms.futurecdn.net/MCKD8U49KzQ9UQE8X5BrQX-650-80.jpg.webp',
        'Storm Point': 'https://www.charlieintel.com/cdn-image/wp-content/uploads/2023/10/25/apex-legends-season-19-storm-point-poi-zeus-station.jpg?width=768&quality=60&format=auto',
        'STORM POINT': 'https://www.charlieintel.com/cdn-image/wp-content/uploads/2023/10/25/apex-legends-season-19-storm-point-poi-zeus-station.jpg?width=768&quality=60&format=auto',
        'Broken Moon': 'https://alegends.gg/wp-content/uploads/2025/07/apex-legends-broken-moon-bug.webp',
        'BROKEN MOON': 'https://alegends.gg/wp-content/uploads/2025/07/apex-legends-broken-moon-bug.webp',
        'E-district': 'https://images2.minutemediacdn.com/image/upload/c_crop,w_3835,h_2157,x_73,y_0/c_fill,w_1080,ar_16:9,f_auto,q_auto,g_auto/images%2FvoltaxMediaLibrary%2Fmmsport%2Fesports_illustrated%2F01j7vfeyaec7wr6e98w0.jpg',
        'E-District': 'https://images2.minutemediacdn.com/image/upload/c_crop,w_3835,h_2157,x_73,y_0/c_fill,w_1080,ar_16:9,f_auto,q_auto,g_auto/images%2FvoltaxMediaLibrary%2Fmmsport%2Fesports_illustrated%2F01j7vfeyaec7wr6e98w0.jpg',
        'E-DISTRICT': 'https://images2.minutemediacdn.com/image/upload/c_crop,w_3835,h_2157,x_73,y_0/c_fill,w_1080,ar_16:9,f_auto,q_auto,g_auto/images%2FvoltaxMediaLibrary%2Fmmsport%2Fesports_illustrated%2F01j7vfeyaec7wr6e98w0.jpg'
      };
      
      
      // Try direct match first, then normalized match
      let imageUrl = mapImages[mapName];
      if (!imageUrl && mapName) {
        // Try case-insensitive and normalized matching
        const normalizedMapName = mapName.toLowerCase().replace(/[^a-z]/g, '');
        const normalizedKeys = Object.keys(mapImages).reduce((acc, key) => {
          acc[key.toLowerCase().replace(/[^a-z]/g, '')] = mapImages[key];
          return acc;
        }, {});
        imageUrl = normalizedKeys[normalizedMapName];
      }
      
      return imageUrl || '';
    },
    
    getCurrentMapImageUrl() {
      // Extract just the map name from "Game X - MapName" format
      let mapName = this.currentMap;
      if (mapName && mapName.includes(' - ')) {
        mapName = mapName.split(' - ')[1];
      }
      
      const imageUrl = this.getMapImageUrl(mapName);
      return imageUrl;
    },
    
    handleMapImageLoad(event) {
      // Map image loaded successfully
    },
    
    handleMapImageError(event) {
      // Hide the image and show fallback emoji
      event.target.style.display = 'none';
    },
    
    showMapTooltip(event, gameNum) {
      // Clear any existing timeout
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout);
      }
      
      // Set a delay before showing tooltip
      this.tooltipTimeout = setTimeout(() => {
        const mapName = this.getGameTooltip(gameNum);
        const imageUrl = this.getMapImageUrl(mapName);
        
        if (imageUrl) {
          const rect = event.target.getBoundingClientRect();
          this.mapTooltip = {
            visible: true,
            x: rect.left - 80, // Offset to center over button
            y: rect.top - 120, // Position above button
            mapName: mapName,
            imageUrl: imageUrl
          };
        }
      }, 200); // 0.2 second delay
    },
    
    showCurrentMapTooltip(event) {
      // Clear any existing timeout
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout);
      }
      
      // Set a delay before showing tooltip
      this.tooltipTimeout = setTimeout(() => {
        // Don't show tooltip for initial state
        if (this.currentMap === 'Initial State' || !this.currentMap) {
          return;
        }
        
        // Extract just the map name from "Game X - MapName" format
        let mapName = this.currentMap;
        if (mapName && mapName.includes(' - ')) {
          mapName = mapName.split(' - ')[1];
        }
        
        const imageUrl = this.getMapImageUrl(mapName);
        console.log('Current map tooltip - mapName:', mapName, 'imageUrl:', imageUrl);
        
        if (imageUrl && mapName) {
          const rect = event.target.getBoundingClientRect();
          
          // Calculate tooltip position with screen bounds checking
          let tooltipX = rect.left + rect.width / 2 - 120; // Center tooltip over badge
          let tooltipY = rect.top - 150; // Position above badge
          
          // Ensure tooltip doesn't go off-screen
          const tooltipWidth = 280; // Match CSS max-width
          const tooltipHeight = 150; // Approximate tooltip height
          
          // Adjust X position if going off right edge
          if (tooltipX + tooltipWidth > window.innerWidth) {
            tooltipX = window.innerWidth - tooltipWidth - 10;
          }
          // Adjust X position if going off left edge
          if (tooltipX < 10) {
            tooltipX = 10;
          }
          
          // Adjust Y position if going off top edge
          if (tooltipY < 10) {
            tooltipY = rect.bottom + 10; // Show below badge instead
          }
          
          // Emit tooltip data to parent
          const tooltipData = {
            x: tooltipX,
            y: tooltipY,
            mapName: mapName,
            imageUrl: imageUrl
          };
          console.log('Emitting map tooltip:', tooltipData);
          this.$emit('show-map-tooltip', tooltipData);
        }
      }, 200); // 0.2 second delay
    },
    
    hideMapTooltip() {
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout);
        this.tooltipTimeout = null;
      }
      this.$emit('hide-map-tooltip');
    },
    
    
    handleImageError() {
      // Hide tooltip if image fails to load
      this.$emit('hide-map-tooltip');
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