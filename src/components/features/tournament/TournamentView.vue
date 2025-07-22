<template>
  <div class="tournament-view">
    <!-- Tournament Selection Phase -->
    <div v-if="!hasSelectedTournament" class="selection-phase">
      <TournamentSelector />
    </div>

    <!-- Main Tournament Display -->
    <div v-else class="tournament-display">
      <!-- Tournament Header -->
      <div class="tournament-header">
        <div class="tournament-info">
          <h1 class="tournament-title">{{ tournamentDisplayName }}</h1>
          <p class="tournament-subtitle">
            {{ formatDay(selectedDay) }} - {{ currentMatchupName }}
          </p>
        </div>
        
        <div class="tournament-actions">
          <Button
            variant="ghost"
            size="sm"
            @click="changeSelection"
            icon="🔄"
          >
            Change Selection
          </Button>
          
          <Button
            v-if="hasData && !isLoading"
            variant="secondary"
            size="sm" 
            @click="refreshData"
            :loading="isRefreshing"
            icon="↻"
          >
            Refresh Data
          </Button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !hasData" class="loading-container">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <h3 class="loading-title">Loading Tournament Data</h3>
          <p class="loading-message">
            Fetching and processing data for {{ currentMatchupName }}...
          </p>
          <div class="loading-progress">
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: `${loadingProgress}%` }"
              ></div>
            </div>
            <span class="progress-text">{{ loadingProgress }}%</span>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage && !hasData" class="error-container">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h3 class="error-title">Failed to Load Tournament Data</h3>
          <p class="error-message">{{ errorMessage }}</p>
          <div class="error-actions">
            <Button
              variant="primary"
              @click="retryDataLoad"
              :loading="isLoading"
            >
              Retry
            </Button>
            <Button
              variant="ghost"
              @click="changeSelection"
            >
              Change Selection
            </Button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div v-else class="tournament-content">
        <!-- Chart Container -->
        <div class="chart-container">
          <div class="chart-wrapper">
            <!-- Chart will be rendered here -->
            <div ref="chartRef" class="chart-canvas">
              <!-- Placeholder for chart -->
              <div class="chart-placeholder">
                <div class="placeholder-content">
                  <div class="placeholder-icon">📊</div>
                  <h3 class="placeholder-title">Interactive Race Chart</h3>
                  <p class="placeholder-text">
                    Chart visualization will be rendered here
                  </p>
                  <div class="placeholder-stats">
                    <div class="stat">
                      <span class="stat-value">{{ teamCount }}</span>
                      <span class="stat-label">Teams</span>
                    </div>
                    <div class="stat">
                      <span class="stat-value">{{ maxGames }}</span>
                      <span class="stat-label">Games</span>
                    </div>
                    <div class="stat">
                      <span class="stat-value">{{ dataPointCount }}</span>
                      <span class="stat-label">Data Points</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Chart Legend -->
            <div v-if="isLegendVisible && hasData" class="chart-legend">
              <div class="legend-header">
                <h4 class="legend-title">Map Legend</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="toggleLegend"
                  icon="✕"
                />
              </div>
              <div class="legend-items">
                <div
                  v-for="legendItem in legendItems"
                  :key="legendItem.map"
                  class="legend-item"
                  :class="{ 'legend-item-hidden': !legendItem.visible }"
                >
                  <div 
                    class="legend-color"
                    :style="{ backgroundColor: legendItem.color }"
                  ></div>
                  <span class="legend-label">{{ legendItem.map }}</span>
                  <span class="legend-count">({{ legendItem.count }})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Panel -->
        <ActionPanel
          :current-map="currentMap"
          @export-requested="handleExportRequest"
        />

        <!-- Status Bar -->
        <div class="status-bar">
          <div class="status-left">
            <span class="status-item">
              <span class="status-label">Current Game:</span>
              <span class="status-value">{{ displayedProgress }} / {{ maxGames }}</span>
            </span>
            <span v-if="isFiltered" class="status-item">
              <span class="status-label">Filtered Games:</span>
              <span class="status-value">[{{ sortedSelectedGames.join(', ') }}]</span>
            </span>
          </div>
          
          <div class="status-right">
            <span class="status-item">
              <span class="status-label">Animation:</span>
              <span class="status-value">{{ animationSpeed }}</span>
            </span>
            <span class="status-item">
              <span class="status-label">Teams:</span>
              <span class="status-value">{{ teamCount }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useTournamentStore, useUIStore } from '../../../stores'
import { Button } from '../../ui'
import TournamentSelector from './TournamentSelector.vue'
import ActionPanel from '../controls/ActionPanel.vue'
import { exportChartDataToCsv } from '../../../api'
import type { ChartLegendItem, TournamentDay } from '../../../types'

// Store integration
const tournamentStore = useTournamentStore()
const uiStore = useUIStore()

const {
  selectedMatchup,
  selectedDay,
  tournamentDisplayName,
  processedChartData,
  isLoading,
  errorMessage,
  currentGame,
  maxGames,
  animationSpeed,
  selectedGames,
  sortedSelectedGames,
  isFiltered,
  isLegendVisible,
  progressPercentage
} = storeToRefs(tournamentStore)

// Local reactive state
const chartRef = ref<HTMLElement>()
const isRefreshing = ref(false)
const loadingProgress = ref(0)

/**
 * Check if tournament is selected
 */
const hasSelectedTournament = computed(() => 
  Boolean(selectedMatchup.value)
)

/**
 * Check if we have chart data
 */
const hasData = computed(() => 
  processedChartData.value.length > 0
)

/**
 * Display progress with bounds checking
 */
const displayedProgress = computed(() => 
  Math.min(Math.max(0, currentGame.value), maxGames.value)
)

/**
 * Current matchup name for display
 */
const currentMatchupName = computed(() => {
  // TODO: Get actual matchup name from data or configuration
  return selectedMatchup.value || 'Unknown Matchup'
})

/**
 * Current map based on game progress
 */
const currentMap = computed(() => {
  if (!hasData.value || currentGame.value === 0) {
    return 'Pre-game'
  }
  
  const firstTeam = processedChartData.value[0]
  const currentGameData = firstTeam?.games.find(game => 
    game.gameNumber === currentGame.value
  )
  
  return currentGameData?.map 
    ? `Game ${currentGame.value} - ${currentGameData.map}`
    : `Game ${currentGame.value}`
})

/**
 * Team count for statistics
 */
const teamCount = computed(() => processedChartData.value.length)

/**
 * Total data points for statistics
 */
const dataPointCount = computed(() => {
  return processedChartData.value.reduce(
    (total, team) => total + team.games.length, 
    0
  )
})

/**
 * Legend items for chart
 */
const legendItems = computed((): ChartLegendItem[] => {
  if (!hasData.value) return []
  
  const mapCounts = new Map<string, { color: string; count: number }>()
  
  // Count occurrences of each map
  processedChartData.value.forEach(team => {
    team.games.forEach(game => {
      const existing = mapCounts.get(game.map)
      if (existing) {
        existing.count++
      } else {
        mapCounts.set(game.map, {
          color: game.color,
          count: 1
        })
      }
    })
  })
  
  // Convert to legend items
  return Array.from(mapCounts.entries()).map(([map, data]) => ({
    map,
    color: data.color,
    count: data.count,
    visible: true
  }))
})

/**
 * Format day for display
 */
function formatDay(day: TournamentDay): string {
  const dayMap = {
    'day1': 'Day 1',
    'day2': 'Day 2',
    'day3': 'Day 3'
  }
  return dayMap[day]
}

/**
 * Change tournament selection
 */
function changeSelection(): void {
  tournamentStore.selectMatchup('')
  tournamentStore.resetPlayback()
}

/**
 * Refresh current data
 */
async function refreshData(): Promise<void> {
  if (!selectedMatchup.value) return
  
  isRefreshing.value = true
  try {
    await tournamentStore.loadMatchupData({ forceRefresh: true })
    
    uiStore.addNotification({
      type: 'success',
      title: 'Data Refreshed',
      message: 'Tournament data has been refreshed successfully',
      duration: 3000
    })
  } catch (error) {
    uiStore.addNotification({
      type: 'error',
      title: 'Refresh Failed',
      message: 'Failed to refresh tournament data',
      duration: 5000
    })
  } finally {
    isRefreshing.value = false
  }
}

/**
 * Retry data loading after error
 */
async function retryDataLoad(): Promise<void> {
  if (selectedMatchup.value) {
    await tournamentStore.loadMatchupData({ forceRefresh: true })
  }
}

/**
 * Toggle legend visibility
 */
function toggleLegend(): void {
  tournamentStore.toggleLegend()
}

/**
 * Handle data export request
 */
function handleExportRequest(matchupId: string): void {
  if (!hasData.value) {
    uiStore.addNotification({
      type: 'warning',
      title: 'No Data',
      message: 'No tournament data available to export',
      duration: 3000
    })
    return
  }
  
  try {
    // Get filtered data if games are selected
    const gamesToExport = isFiltered.value ? sortedSelectedGames.value : undefined
    const csvData = exportChartDataToCsv(processedChartData.value, gamesToExport)
    
    // Create and download CSV file
    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    const filename = `tournament-data-${matchupId}-${Date.now()}.csv`
    link.href = url
    link.download = filename
    link.click()
    
    window.URL.revokeObjectURL(url)
    
    uiStore.addNotification({
      type: 'success',
      title: 'Export Complete',
      message: `Tournament data exported as ${filename}`,
      duration: 4000
    })
    
    console.log(`📊 Exported tournament data: ${filename}`)
    
  } catch (error) {
    console.error('Failed to export data:', error)
    
    uiStore.addNotification({
      type: 'error',
      title: 'Export Failed',
      message: 'Failed to export tournament data',
      duration: 5000
    })
  }
}

// Simulate loading progress
watch(isLoading, (loading) => {
  if (loading) {
    loadingProgress.value = 0
    const progressInterval = setInterval(() => {
      loadingProgress.value += Math.random() * 20
      if (loadingProgress.value >= 95) {
        loadingProgress.value = 95
      }
    }, 200)
    
    // Clear interval when loading completes
    const stopWatching = watch(isLoading, (newLoading) => {
      if (!newLoading) {
        clearInterval(progressInterval)
        loadingProgress.value = 100
        setTimeout(() => {
          loadingProgress.value = 0
        }, 500)
        stopWatching()
      }
    })
  }
})

// Initialize chart rendering when data is available
watch([hasData, () => chartRef.value], async () => {
  if (hasData.value && chartRef.value) {
    await nextTick()
    console.log('📊 Chart data ready for rendering:', {
      teams: teamCount.value,
      games: maxGames.value,
      dataPoints: dataPointCount.value
    })
    // TODO: Initialize D3.js chart rendering here
  }
})

onMounted(() => {
  console.log('🏆 TournamentView mounted')
  
  // Initialize chart container
  if (chartRef.value) {
    console.log('📊 Chart container ready')
  }
})
</script>

<style scoped>
.tournament-view {
  @apply min-h-screen relative;
}

.selection-phase {
  @apply py-8;
}

.tournament-display {
  @apply relative;
}

.tournament-header {
  @apply flex items-center justify-between p-6 bg-slate-800 border-b border-slate-700;
}

.tournament-info h1 {
  @apply text-2xl font-bold text-white;
}

.tournament-info p {
  @apply text-slate-400 mt-1;
}

.tournament-actions {
  @apply flex gap-3;
}

/* Loading State */
.loading-container {
  @apply flex items-center justify-center min-h-96 p-8;
}

.loading-content {
  @apply text-center max-w-md;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-6;
}

.loading-title {
  @apply text-xl font-semibold text-white mb-2;
}

.loading-message {
  @apply text-slate-400 mb-6;
}

.loading-progress {
  @apply space-y-2;
}

.progress-bar {
  @apply w-full bg-slate-700 rounded-full h-2 overflow-hidden;
}

.progress-fill {
  @apply h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-300;
}

.progress-text {
  @apply text-sm text-slate-400;
}

/* Error State */
.error-container {
  @apply flex items-center justify-center min-h-96 p-8;
}

.error-content {
  @apply text-center max-w-md;
}

.error-icon {
  @apply text-6xl mb-4;
}

.error-title {
  @apply text-xl font-semibold text-red-400 mb-2;
}

.error-message {
  @apply text-slate-400 mb-6;
}

.error-actions {
  @apply flex gap-3 justify-center;
}

/* Main Content */
.tournament-content {
  @apply relative;
}

.chart-container {
  @apply relative min-h-screen bg-slate-900;
}

.chart-wrapper {
  @apply relative w-full h-full;
}

.chart-canvas {
  @apply w-full h-full min-h-96;
}

/* Chart Placeholder */
.chart-placeholder {
  @apply flex items-center justify-center min-h-96 p-8;
}

.placeholder-content {
  @apply text-center max-w-lg;
}

.placeholder-icon {
  @apply text-6xl mb-4;
}

.placeholder-title {
  @apply text-2xl font-bold text-white mb-2;
}

.placeholder-text {
  @apply text-slate-400 mb-8;
}

.placeholder-stats {
  @apply grid grid-cols-3 gap-6;
}

.stat {
  @apply text-center;
}

.stat-value {
  @apply block text-2xl font-bold text-red-400;
}

.stat-label {
  @apply block text-sm text-slate-400 mt-1;
}

/* Chart Legend */
.chart-legend {
  @apply absolute top-4 left-4 bg-slate-800 border border-slate-700 rounded-lg p-4 max-w-xs;
  @apply backdrop-blur-md shadow-xl;
}

.legend-header {
  @apply flex items-center justify-between mb-3;
}

.legend-title {
  @apply font-semibold text-white;
}

.legend-items {
  @apply space-y-2;
}

.legend-item {
  @apply flex items-center gap-2 text-sm;
}

.legend-item-hidden {
  @apply opacity-50;
}

.legend-color {
  @apply w-3 h-3 rounded-full;
}

.legend-label {
  @apply text-white flex-1;
}

.legend-count {
  @apply text-slate-400 text-xs;
}

/* Status Bar */
.status-bar {
  @apply fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-4;
  @apply flex items-center justify-between text-sm;
}

.status-left,
.status-right {
  @apply flex items-center gap-6;
}

.status-item {
  @apply flex items-center gap-1;
}

.status-label {
  @apply text-slate-400;
}

.status-value {
  @apply text-white font-medium;
}

/* Responsive */
@media (max-width: 1024px) {
  .tournament-header {
    @apply flex-col gap-4 items-start;
  }
  
  .chart-legend {
    @apply relative top-0 left-0 mb-4 max-w-none;
  }
  
  .status-bar {
    @apply flex-col gap-2 items-start;
  }
  
  .status-left,
  .status-right {
    @apply flex-wrap gap-4;
  }
}

@media (max-width: 640px) {
  .placeholder-stats {
    @apply grid-cols-1 gap-4;
  }
  
  .tournament-actions {
    @apply flex-col w-full;
  }
  
  .error-actions {
    @apply flex-col;
  }
}

/* Animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Focus states */
.tournament-view:focus-within {
  @apply outline-none;
}

/* Print styles */
@media print {
  .status-bar,
  .tournament-actions {
    @apply hidden;
  }
  
  .chart-container {
    @apply min-h-0;
  }
}
</style>