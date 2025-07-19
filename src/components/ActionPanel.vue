<template>
  <div v-if="maxGames > 0" 
       ref="actionPanel"
       class="enhanced-action-panel"
       :class="{ expanded: panelExpanded }">
    
    <div class="panel-header">
      <div class="panel-title">
        <button class="expand-btn" @click="togglePanel" @mousedown.stop" title="Toggle advanced controls">
          {{ panelExpanded ? '−' : '+' }}
        </button>
        <div class="section-icon">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </div>
        <span class="title-text">Controls</span>
      </div>
      <div class="panel-controls">
        <span class="drag-handle">⋮⋮</span>
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
        <div class="filter-action-label">Click to filter | X to clear</div>
        <div class="game-filter-grid">
          <button v-for="item in filterButtons" 
                  :key="item.id"
                  @click="item.type === 'game' ? toggleGameFilter(item.value) : resetGameFilter()"
                  @mouseenter="item.type === 'game' ? showFilterTooltip($event, item.value) : showClearTooltip($event)"
                  @mouseleave="hideFilterTooltip"
                  :class="['game-filter-btn', {
                    active: item.type === 'game' && selectedGames.includes(item.value),
                    current: item.type === 'game' && item.value === currentGame
                  }]"
                  :style="item.type === 'game' ? getGameButtonStyle(item.value) : getClearButtonStyle()">
            {{ item.label }}
          </button>
        </div>
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
    'export-requested'
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
      
      // Filter tooltip
      filterTooltip: null,
      
      // Map tooltip
      mapTooltip: null,
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
    
    // Clean up filter tooltip
    if (this.filterTooltip) {
      this.filterTooltip.remove();
      this.filterTooltip = null;
    }
    
    // Clean up map tooltip
    if (this.mapTooltip) {
      this.mapTooltip.remove();
      this.mapTooltip = null;
    }
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
    togglePanel() {
      this.panelExpanded = !this.panelExpanded;
      
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
      
      if (this.isMobileDevice()) {
        console.log('📱 Mobile device detected - skipping draggable initialization');
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
      
      const baseStyle = {
        background: `linear-gradient(135deg, ${gameColor} 0%, ${this.adjustColor(gameColor, -10)} 100%)`,
        border: `2px solid ${gameColor}`,
        color: '#ffffff'
      };
      
      if (isCurrent) {
        return {
          ...baseStyle,
          boxShadow: `0 0 8px ${gameColor}60, 0 2px 4px rgba(0,0,0,0.3)`
        };
      } else if (isActive) {
        return {
          ...baseStyle,
          boxShadow: `0 0 12px ${gameColor}60, 0 0 20px ${gameColor}40`,
          transform: 'scale(1.15)'
        };
      } else {
        return baseStyle;
      }
    },
    
    getClearButtonStyle() {
      return {
        background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
        border: '2px solid #dc2626',
        color: '#ffffff'
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
      
      
      let imageUrl = mapImages[mapName];
      if (!imageUrl && mapName) {
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
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout);
      }
      
      this.tooltipTimeout = setTimeout(() => {
        if (this.currentMap === 'Initial State' || !this.currentMap) {
          return;
        }
        
        if (!this.mapTooltip) {
          this.createMapTooltip();
        }
        
        let mapName = this.currentMap;
        if (mapName && mapName.includes(' - ')) {
          mapName = mapName.split(' - ')[1];
        }
        
        const imageUrl = this.getMapImageUrl(mapName);
        console.log('Current map tooltip - mapName:', mapName, 'imageUrl:', imageUrl);
        
        if (imageUrl && mapName) {
          // Create tooltip content with large image preview
          this.mapTooltip.innerHTML = `
            <div style="margin-bottom: 12px;">
              <div style="font-weight: 600; color: #ff8c42; font-size: 16px; margin-bottom: 8px;">
                Current Map
              </div>
              <div style="font-weight: 500; color: #ffffff; font-size: 15px;">
                ${mapName}
              </div>
            </div>
            <div style="border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);">
              <img src="${imageUrl}" 
                   alt="${mapName}" 
                   style="width: 100%; height: 180px; object-fit: cover; display: block;"
                   onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
              <div style="display: none; height: 180px; background: rgba(75, 85, 99, 0.3); align-items: center; justify-content: center; font-size: 48px;">
                🗺️
              </div>
            </div>
          `;
          
          this.mapTooltip.style.visibility = 'visible';
          
          // Get the actual element bounds
          const element = event.currentTarget;
          const elementRect = element.getBoundingClientRect();
          const tooltipWidth = 320; // width of tooltip
          
          // Position tooltip above the map badge
          const tooltipX = elementRect.left + (elementRect.width / 2);
          const tooltipY = elementRect.top - 20; // 20px above the element
          
          // Ensure tooltip stays within viewport
          const minX = tooltipWidth / 2 + 20;
          const maxX = window.innerWidth - (tooltipWidth / 2) - 20;
          const clampedX = Math.max(minX, Math.min(tooltipX, maxX));
          const clampedY = Math.max(20, tooltipY);
          
          // Apply positioning
          this.mapTooltip.style.left = clampedX + 'px';
          this.mapTooltip.style.top = clampedY + 'px';
        }
      }, 300); // Slightly longer delay for map tooltip
    },
    
    hideMapTooltip() {
      if (this.tooltipTimeout) {
        clearTimeout(this.tooltipTimeout);
        this.tooltipTimeout = null;
      }
      if (this.mapTooltip) {
        this.mapTooltip.style.visibility = 'hidden';
      }
    },
    
    createFilterTooltip() {
      if (this.filterTooltip) {
        this.filterTooltip.remove();
      }
      
      this.filterTooltip = document.createElement('div');
      this.filterTooltip.className = 'filter-tooltip';
      this.filterTooltip.style.cssText = `
        position: fixed;
        visibility: hidden;
        background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 140, 66, 0.3);
        border-radius: 8px;
        padding: 12px 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(255, 140, 66, 0.1);
        color: #ffffff;
        font-family: Inter, system-ui, sans-serif;
        font-size: 13px;
        font-weight: 500;
        line-height: 1.4;
        pointer-events: none;
        z-index: 10000;
        max-width: 200px;
        text-align: left;
        transform: translateX(-50%);
      `;
      
      document.body.appendChild(this.filterTooltip);
      return this.filterTooltip;
    },
    
    createMapTooltip() {
      if (this.mapTooltip) {
        this.mapTooltip.remove();
      }
      
      this.mapTooltip = document.createElement('div');
      this.mapTooltip.className = 'map-tooltip';
      this.mapTooltip.style.cssText = `
        position: fixed;
        visibility: hidden;
        background: linear-gradient(135deg, rgba(26, 26, 26, 0.95) 0%, rgba(42, 42, 42, 0.95) 100%);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(217, 119, 6, 0.3);
        border-radius: 12px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(217, 119, 6, 0.1);
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
        transform: translateX(-50%);
      `;
      
      document.body.appendChild(this.mapTooltip);
      return this.mapTooltip;
    },
    
    showFilterTooltip(event, gameNum) {
      if (!this.filterTooltip) {
        this.createFilterTooltip();
      }
      
      const mapName = this.getGameTooltip(gameNum);
      
      this.filterTooltip.innerHTML = `
        <div style="font-weight: 600; color: #ff8c42; margin-bottom: 4px;">
          Game ${gameNum}
        </div>
        <div style="color: #e5e7eb;">
          ${mapName}
        </div>
      `;
      
      this.filterTooltip.style.visibility = 'visible';
      
      // Get the actual button element bounds
      const button = event.currentTarget;
      const buttonRect = button.getBoundingClientRect();
      const tooltipWidth = 200; // max-width of tooltip
      
      // Center tooltip above the button using more precise positioning
      const tooltipX = buttonRect.left + (buttonRect.width / 2);
      const tooltipY = buttonRect.top - 60; // 60px above the button so numbers remain visible
      
      // Ensure tooltip stays within viewport with better bounds checking
      const minX = tooltipWidth / 2 + 15;
      const maxX = window.innerWidth - (tooltipWidth / 2) - 15;
      const clampedX = Math.max(minX, Math.min(tooltipX, maxX));
      const clampedY = Math.max(15, tooltipY);
      
      // Apply positioning with fixed positioning for accurate placement
      this.filterTooltip.style.left = clampedX + 'px';
      this.filterTooltip.style.top = clampedY + 'px';
    },
    
    showClearTooltip(event) {
      if (!this.filterTooltip) {
        this.createFilterTooltip();
      }
      
      this.filterTooltip.innerHTML = `
        <div style="font-weight: 600; color: #ff8c42;">
          Clear Filters
        </div>
        <div style="color: #e5e7eb; margin-top: 4px;">
          Remove all game filters and reset view
        </div>
      `;
      
      this.filterTooltip.style.visibility = 'visible';
      
      // Get the actual button element bounds  
      const button = event.currentTarget;
      const buttonRect = button.getBoundingClientRect();
      const tooltipWidth = 200; // max-width of tooltip
      
      // Center tooltip above the button using more precise positioning
      const tooltipX = buttonRect.left + (buttonRect.width / 2);
      const tooltipY = buttonRect.top - 60; // 60px above the button so numbers remain visible
      
      // Ensure tooltip stays within viewport with better bounds checking
      const minX = tooltipWidth / 2 + 15;
      const maxX = window.innerWidth - (tooltipWidth / 2) - 15;
      const clampedX = Math.max(minX, Math.min(tooltipX, maxX));
      const clampedY = Math.max(15, tooltipY);
      
      // Apply positioning with fixed positioning for accurate placement
      this.filterTooltip.style.left = clampedX + 'px';
      this.filterTooltip.style.top = clampedY + 'px';
    },
    
    hideFilterTooltip() {
      if (this.filterTooltip) {
        this.filterTooltip.style.visibility = 'hidden';
      }
    },
    
    
    handleImageError() {
      this.$emit('hide-map-tooltip');
    },
    
    adjustColor(hexColor, percent) {
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
    
    getCurrentMapStyle() {
      let mapColor = '#ef4444';
      let mapName = this.currentMap || 'Loading...';
      
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

    isMobileDevice() {
      return window.innerWidth <= 768;
    }
  }
}
</script> 