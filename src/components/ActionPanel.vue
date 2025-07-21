<template>
  <div v-if="maxGames > 0" 
       ref="actionPanel"
       class="enhanced-action-panel"
       :class="{ expanded: panelExpanded }">
    
    <div class="panel-header">
      <div class="panel-title">
        <button class="btn btn-icon btn-primary" @click="togglePanel" @mousedown.stop" title="Toggle advanced controls">
          {{ panelExpanded ? '−' : '+' }}
        </button>
        <span class="title-text">Controls</span>
      </div>
      <div class="panel-controls">
        <span class="drag-handle">⋮⋮</span>
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
          <span class="map-name" @mouseenter="showCurrentMapTooltip" @mousemove="updateTooltipPosition" @mouseleave="hideMapTooltip">{{ currentMap || 'Loading...' }}</span>
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

      <!-- Game Filter Controls Container -->
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
    </div>

    <!-- Expanded Controls (Advanced Features) -->
    <transition name="slide-down">
      <div v-if="panelExpanded" class="flex flex-col gap-6 pt-4 border-t border-white/10 mt-4" @mousedown.stop>
        <!-- Export Controls -->
        <div class="flex flex-col gap-3">
          <label class="text-xs text-primary font-medium">Export Data</label>
          <button @click="exportData" class="btn btn-md btn-success btn-full">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7,10 12,15 17,10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            <span>Export CSV</span>
          </button>
        </div>
        <!-- Legend Toggle -->
        <div class="flex flex-col gap-3">
          <label class="text-xs text-primary font-medium">Chart Legend</label>
          <button @click="toggleLegend" class="btn btn-md btn-purple btn-full">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 2v20l3-2 3 2V2z"/>
            </svg>
            <span>{{ isLegendVisible ? 'Hide' : 'Show' }} Legend</span>
          </button>
        </div>
        
        <!-- Animation Speed Controls -->
        <div class="flex flex-col gap-3">
          <label class="text-xs text-primary font-medium">Animation Speed</label>
          <div class="flex gap-3 justify-center">
            <button 
              @click="setAnimationSpeed('slow')" 
              :class="['btn', 'btn-sm', { 'btn-active': animationSpeed === 'slow' }]"
            >
              Slow
            </button>
            <button 
              @click="setAnimationSpeed('medium')" 
              :class="['btn', 'btn-sm', { 'btn-active': animationSpeed === 'medium' }]"
            >
              Medium
            </button>
            <button 
              @click="setAnimationSpeed('fast')" 
              :class="['btn', 'btn-sm', { 'btn-active': animationSpeed === 'fast' }]"
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
      if (!this.mapTooltip) {
        this.createMapTooltip();
      }
      
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
      
      // Create tooltip content - simplified
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
      
      // Use client coordinates for accurate positioning
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      
      // Position tooltip to the right of cursor (like bar graph tooltips)
      const tooltipX = mouseX + 15; // 15px to the right of cursor
      const tooltipY = mouseY; // At cursor level (top-left corner positioning)
      
      // Simple bounds checking
      this.mapTooltip.style.left = Math.max(10, Math.min(tooltipX, window.innerWidth - 320)) + 'px';
      this.mapTooltip.style.top = Math.max(10, tooltipY) + 'px';
    },
    
    updateTooltipPosition(event) {
      if (!this.mapTooltip || this.mapTooltip.style.visibility === 'hidden') {
        return;
      }
      
      // Use client coordinates for accurate positioning
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      
      // Position tooltip to the right of cursor (like bar graph tooltips)
      const tooltipX = mouseX + 15; // 15px to the right of cursor
      const tooltipY = mouseY; // At cursor level (top-left corner positioning)
      
      // Simple bounds checking
      this.mapTooltip.style.left = Math.max(10, Math.min(tooltipX, window.innerWidth - 320)) + 'px';
      this.mapTooltip.style.top = Math.max(10, tooltipY) + 'px';
    },
    
    hideMapTooltip() {
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
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 8px;
        padding: 12px 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 0 16px rgba(239, 68, 68, 0.1);
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
    
    showFilterTooltip(event, gameNum) {
      if (!this.filterTooltip) {
        this.createFilterTooltip();
      }
      
      const mapName = this.getGameTooltip(gameNum);
      
      this.filterTooltip.innerHTML = `
        <div style="font-weight: 600; color: #ef4444; margin-bottom: 4px;">
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
        <div style="font-weight: 600; color: #ef4444;">
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
    },

    isMobileDevice() {
      return window.innerWidth <= 768;
    }
  }
}
</script> 