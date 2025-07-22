<template>
  <div
    v-if="maxGames > 0"
    ref="panelRef"
    class="action-panel"
    :class="panelClasses"
  >
    <!-- Panel Header -->
    <div class="panel-header">
      <div class="panel-title">
        <Button
          variant="primary"
          size="sm"
          :icon="level1Expanded ? '−' : '+'"
          @click="toggleLevel1"
        />
        <h3 class="title-text">Controls</h3>
      </div>
    </div>

    <!-- Always Visible: Game Progress -->
    <div class="panel-content">
      <div class="progress-section">
        <label class="progress-label">
          Game Progress: {{ displayedProgress }} / {{ maxGames }}
        </label>
        
        <Slider
          v-model="currentGameModel"
          :min="0"
          :max="maxGames"
          :disabled="isLoading"
          show-min-max
          tooltip
          @change="handleGameChange"
        />
      </div>

      <!-- Current Map Display -->
      <div class="map-section">
        <div 
          class="map-badge"
          :style="mapBadgeStyle"
          v-tooltip="currentMapTooltip"
        >
          <img
            v-if="currentMapImageUrl"
            :src="currentMapImageUrl"
            :alt="currentMap"
            class="map-image"
            loading="lazy"
            @error="handleImageError"
          />
          <span v-else class="map-icon">🗺️</span>
          <span class="map-name">{{ currentMapDisplay }}</span>
        </div>
      </div>

      <!-- Quick Controls -->
      <div class="quick-controls">
        <Button
          variant="success"
          @click="togglePlayback"
          :disabled="!canPlay"
          :icon="isPlaying ? '⏸️' : '▶️'"
        >
          {{ isPlaying ? 'Pause' : 'Play' }}
        </Button>
        
        <Button
          variant="danger"
          @click="resetPlayback"
          :disabled="isLoading"
          icon="🔄"
        >
          Reset
        </Button>
      </div>
    </div>

    <!-- Level 1: Game Filters -->
    <div v-if="level1Expanded" class="expansion-section">
      <div class="expansion-header">
        <Button
          variant="ghost"
          size="sm"
          :icon="level2Expanded ? '⏷' : '⏵'"
          @click="toggleLevel2"
        >
          Game Filters
        </Button>
      </div>
      
      <div class="filter-section">
        <p class="filter-help">
          Click games to filter | Selected games will be highlighted
        </p>
        
        <div class="filter-buttons">
          <Button
            v-for="gameNum in gameNumbers"
            :key="gameNum"
            :variant="getGameButtonVariant(gameNum)"
            size="sm"
            :style="getGameButtonStyle(gameNum)"
            @click="toggleGameFilter(gameNum)"
            v-tooltip="getGameTooltip(gameNum)"
          >
            {{ gameNum }}
          </Button>
          
          <Button
            v-if="hasSelectedGames"
            variant="danger"
            size="sm"
            @click="clearGameFilter"
            v-tooltip="'Clear all game filters'"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>

    <!-- Level 2: Advanced Controls -->
    <div v-if="level1Expanded && level2Expanded" class="expansion-section">
      <div class="controls-grid">
        <!-- Export & Legend -->
        <div class="control-group">
          <h4 class="group-title">Data & Display</h4>
          <div class="control-buttons">
            <Button
              variant="secondary"
              size="sm"
              icon="📊"
              @click="exportData"
              :disabled="!hasData"
            >
              Export CSV
            </Button>
            
            <Button
              variant="secondary" 
              size="sm"
              :icon="isLegendVisible ? '👁️' : '👁️‍🗨️'"
              @click="toggleLegend"
            >
              {{ isLegendVisible ? 'Hide' : 'Show' }} Legend
            </Button>
          </div>
        </div>

        <!-- Animation Speed -->
        <div class="control-group">
          <h4 class="group-title">Animation Speed</h4>
          <div class="speed-buttons">
            <Button
              v-for="speed in animationSpeeds"
              :key="speed"
              :variant="animationSpeed === speed ? 'primary' : 'ghost'"
              size="sm"
              @click="setAnimationSpeed(speed)"
              :class="{ 'active': animationSpeed === speed }"
            >
              {{ capitalizeFirst(speed) }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useTournamentStore, useUIStore } from '../../../stores'
import { Button, Slider } from '../../ui'
import { useTooltip, vTooltip } from '../../../composables'
import { getMapImageUrl } from '../../../data/tournaments'
import type { AnimationSpeed } from '../../../types'

// Props
interface Props {
  currentMap?: string
}

const props = withDefaults(defineProps<Props>(), {
  currentMap: ''
})

// Emits
interface Emits {
  'export-requested': [matchupId: string]
}

const emit = defineEmits<Emits>()

// Store integration
const tournamentStore = useTournamentStore()
const uiStore = useUIStore()

const {
  isPlaying,
  currentGame,
  maxGames,
  animationSpeed,
  selectedGames,
  isFiltered,
  sortedSelectedGames,
  isGameSelected,
  canPlay,
  processedChartData,
  selectedMatchup,
  isLoading
} = storeToRefs(tournamentStore)

const {
  isLegendVisible,
  actionPanelLevel1Expanded: level1Expanded,
  actionPanelLevel2Expanded: level2Expanded
} = storeToRefs(uiStore)

// Local reactive state
const panelRef = ref<HTMLElement>()

// Tooltip composable
const tooltip = useTooltip()

/**
 * Two-way binding for current game slider
 */
const currentGameModel = computed({
  get: () => currentGame.value,
  set: (value: number) => {
    tournamentStore.setCurrentGame(value)
  }
})

/**
 * Display progress with bounds checking
 */
const displayedProgress = computed(() => {
  return Math.min(Math.max(0, currentGame.value), maxGames.value)
})

/**
 * Available animation speeds
 */
const animationSpeeds: AnimationSpeed[] = ['slow', 'medium', 'fast']

/**
 * Generate array of game numbers for filtering
 */
const gameNumbers = computed(() => {
  return Array.from({ length: maxGames.value }, (_, i) => i + 1)
})

/**
 * Check if any games are selected
 */
const hasSelectedGames = computed(() => selectedGames.value.length > 0)

/**
 * Check if there's data to export
 */
const hasData = computed(() => processedChartData.value.length > 0)

/**
 * Panel CSS classes
 */
const panelClasses = computed(() => ({
  'expanded': level1Expanded.value,
  'level2-expanded': level2Expanded.value,
  'has-data': hasData.value,
  'is-loading': isLoading.value
}))

/**
 * Current map display text
 */
const currentMapDisplay = computed(() => {
  if (!props.currentMap) return 'No Map Selected'
  
  // Extract map name from "Game X - MapName" format
  const mapName = props.currentMap.includes(' - ') 
    ? props.currentMap.split(' - ')[1] 
    : props.currentMap
    
  return mapName || 'Unknown Map'
})

/**
 * Current map image URL
 */
const currentMapImageUrl = computed(() => {
  const mapName = currentMapDisplay.value
  return getMapImageUrl(mapName)
})

/**
 * Current map tooltip configuration
 */
const currentMapTooltip = computed(() => ({
  content: `Current Map: ${currentMapDisplay.value}`,
  position: 'top' as const
}))

/**
 * Map badge styling based on current game color
 */
const mapBadgeStyle = computed(() => {
  let mapColor = '#ef4444'
  
  if (processedChartData.value.length > 0 && currentGame.value > 0) {
    const firstTeam = processedChartData.value[0]
    const currentGameData = firstTeam?.games.find(game => game.gameNumber === currentGame.value)
    if (currentGameData?.color) {
      mapColor = currentGameData.color
    }
  }
  
  return {
    '--map-color': mapColor,
    color: mapColor,
    borderColor: `${mapColor}40`,
    textShadow: `0 0 10px ${mapColor}60`
  }
})

/**
 * Toggle panel level 1 expansion
 */
function toggleLevel1(): void {
  uiStore.toggleActionPanelLevel1()
}

/**
 * Toggle panel level 2 expansion  
 */
function toggleLevel2(): void {
  uiStore.toggleActionPanelLevel2()
}

/**
 * Handle game change from slider
 */
function handleGameChange(value: number): void {
  console.log(`🎮 Game changed to: ${value}`)
  
  // Auto-clear filtering if returning to start
  if (value === 0 && hasSelectedGames.value) {
    tournamentStore.clearGameFilter()
  }
}

/**
 * Toggle playback state
 */
function togglePlayback(): void {
  tournamentStore.togglePlayback()
}

/**
 * Reset playback to beginning
 */
function resetPlayback(): void {
  tournamentStore.resetPlayback()
}

/**
 * Toggle game filter for specific game
 */
function toggleGameFilter(gameNum: number): void {
  tournamentStore.toggleGameFilter(gameNum)
  
  console.log(`🎯 Toggled filter for game ${gameNum}. Selected: [${sortedSelectedGames.value.join(', ')}]`)
}

/**
 * Clear all game filters
 */
function clearGameFilter(): void {
  tournamentStore.clearGameFilter()
}

/**
 * Toggle chart legend visibility
 */
function toggleLegend(): void {
  tournamentStore.toggleLegend()
}

/**
 * Set animation speed
 */
function setAnimationSpeed(speed: AnimationSpeed): void {
  tournamentStore.setAnimationSpeed(speed)
}

/**
 * Export chart data
 */
function exportData(): void {
  if (selectedMatchup.value) {
    emit('export-requested', selectedMatchup.value)
  }
}

/**
 * Get button variant for game filter button
 */
function getGameButtonVariant(gameNum: number) {
  if (gameNum === currentGame.value) return 'primary'
  if (isGameSelected.value(gameNum)) return 'success'
  return 'ghost'
}

/**
 * Get styling for game filter button
 */
function getGameButtonStyle(gameNum: number) {
  let gameColor = '#6366f1'
  
  if (processedChartData.value.length > 0) {
    const firstTeam = processedChartData.value[0]
    const gameData = firstTeam?.games.find(game => game.gameNumber === gameNum)
    if (gameData?.color) {
      gameColor = gameData.color
    }
  }
  
  const isActive = isGameSelected.value(gameNum)
  const isCurrent = gameNum === currentGame.value
  
  return {
    '--game-color': gameColor,
    color: gameColor,
    textShadow: isActive || isCurrent 
      ? `0 0 12px ${gameColor}80` 
      : `0 0 6px ${gameColor}40`
  }
}

/**
 * Get tooltip for game button
 */
function getGameTooltip(gameNum: number): string {
  let mapName = `Game ${gameNum}`
  
  if (processedChartData.value.length > 0) {
    const firstTeam = processedChartData.value[0]
    const gameData = firstTeam?.games.find(game => game.gameNumber === gameNum)
    if (gameData?.map) {
      mapName = `Game ${gameNum}: ${gameData.map}`
    }
  }
  
  return mapName
}

/**
 * Handle image loading errors
 */
function handleImageError(event: Event): void {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}

/**
 * Capitalize first letter
 */
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Initialize draggable functionality on mount
onMounted(async () => {
  await nextTick()
  // TODO: Initialize GSAP draggable if needed
  console.log('🎛️ ActionPanel mounted')
})

// Cleanup on unmount
onUnmounted(() => {
  // TODO: Cleanup draggable
  console.log('🎛️ ActionPanel unmounted')
})
</script>

<style scoped>
.action-panel {
  @apply w-80 bg-slate-800 border border-slate-600 rounded-xl p-4;
  @apply backdrop-blur-md shadow-2xl;
  @apply transition-all duration-300;
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1000;
  cursor: move;
}

.action-panel.expanded {
  @apply w-96;
}

.action-panel.is-loading {
  @apply opacity-75 pointer-events-none;
}

.panel-header {
  @apply flex items-center gap-3 mb-4 pb-3 border-b border-slate-700;
}

.panel-title {
  @apply flex items-center gap-2;
}

.title-text {
  @apply text-lg font-semibold text-white;
}

.panel-content {
  @apply space-y-4;
}

.progress-section {
  @apply space-y-2;
}

.progress-label {
  @apply text-sm font-medium text-slate-300;
}

.map-section {
  @apply py-2;
}

.map-badge {
  @apply flex items-center gap-3 p-3 bg-slate-700 border rounded-lg;
  @apply transition-all duration-200;
  border-color: var(--map-color, #ef4444);
  background: linear-gradient(135deg, var(--map-color, #ef4444)10, transparent);
}

.map-image {
  @apply w-8 h-8 rounded object-cover;
}

.map-icon {
  @apply text-2xl;
}

.map-name {
  @apply font-medium text-white;
}

.quick-controls {
  @apply flex gap-2;
}

.expansion-section {
  @apply mt-4 pt-4 border-t border-slate-700 space-y-4;
}

.expansion-header {
  @apply flex items-center;
}

.filter-section {
  @apply space-y-3;
}

.filter-help {
  @apply text-xs text-slate-400 text-center;
}

.filter-buttons {
  @apply flex flex-wrap gap-2 justify-center;
}

.controls-grid {
  @apply grid grid-cols-1 gap-4;
}

.control-group {
  @apply space-y-2;
}

.group-title {
  @apply text-sm font-medium text-slate-300;
}

.control-buttons,
.speed-buttons {
  @apply flex gap-2 flex-wrap;
}

/* Custom button styles for games */
.filter-buttons button {
  min-width: 2.5rem;
}

/* Animation for panel state changes */
.action-panel {
  transition: width 0.3s ease, opacity 0.2s ease;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .action-panel {
    @apply relative top-0 right-0 w-full max-w-none mb-6;
    position: relative;
  }
  
  .action-panel.expanded {
    @apply w-full;
  }
}

@media (max-width: 640px) {
  .controls-grid {
    @apply grid-cols-1;
  }
  
  .quick-controls,
  .control-buttons,
  .speed-buttons {
    @apply flex-col;
  }
}

/* Focus states for accessibility */
.action-panel:focus-within {
  @apply ring-2 ring-red-500 ring-opacity-50;
}

/* Custom scrollbar for long filter lists */
.filter-buttons::-webkit-scrollbar {
  @apply w-2;
}

.filter-buttons::-webkit-scrollbar-track {
  @apply bg-slate-700 rounded;
}

.filter-buttons::-webkit-scrollbar-thumb {
  @apply bg-slate-500 rounded hover:bg-slate-400;
}
</style>