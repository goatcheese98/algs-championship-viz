<template>
  <div class="tournament-selector">
    <div class="selector-header">
      <h2 class="selector-title">Select Tournament & Matchup</h2>
      <p class="selector-description">
        Choose a tournament type, day, and specific matchup to analyze
      </p>
    </div>
    
    <div class="selector-grid">
      <!-- Tournament Type Selection -->
      <div class="selector-section">
        <label class="section-label">Tournament Type</label>
        <div class="tournament-types">
          <button
            v-for="tournament in tournamentOptions"
            :key="tournament.type"
            type="button"
            class="tournament-card"
            :class="{ 'active': selectedType === tournament.type }"
            @click="selectTournamentType(tournament.type)"
          >
            <div class="card-content">
              <h3 class="card-title">{{ tournament.name }}</h3>
              <p class="card-description">{{ tournament.description }}</p>
              <div class="card-stats">
                <span class="stat">{{ tournament.totalDays }} days</span>
                <span class="stat">{{ tournament.maxGames }} games max</span>
              </div>
            </div>
          </button>
        </div>
      </div>
      
      <!-- Day Selection -->
      <div v-if="selectedType" class="selector-section">
        <label class="section-label">Day</label>
        <div class="day-tabs">
          <button
            v-for="day in availableDays"
            :key="day.id"
            type="button"
            class="day-tab"
            :class="{ 'active': selectedDay === day.id }"
            @click="selectDay(day.id)"
          >
            <span class="tab-label">{{ day.label }}</span>
            <span class="tab-count">{{ day.matchupCount }} matchups</span>
          </button>
        </div>
      </div>
      
      <!-- Matchup Selection -->
      <div v-if="selectedType && selectedDay" class="selector-section">
        <label class="section-label">Matchup</label>
        
        <div v-if="isLoadingMatchups" class="loading-state">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading matchups...</p>
        </div>
        
        <div v-else-if="matchupError" class="error-state">
          <div class="error-icon">⚠️</div>
          <p class="error-text">{{ matchupError }}</p>
          <Button
            variant="ghost"
            size="sm"
            @click="retryLoadMatchups"
          >
            Retry
          </Button>
        </div>
        
        <div v-else class="matchup-grid">
          <button
            v-for="matchup in availableMatchups"
            :key="matchup.id"
            type="button"
            class="matchup-card"
            :class="{ 'active': selectedMatchup === matchup.id }"
            @click="selectMatchup(matchup.id)"
          >
            <div class="matchup-content">
              <h4 class="matchup-title">{{ matchup.name }}</h4>
              <div class="matchup-meta">
                <span class="matchup-day">{{ formatDay(matchup.day) }}</span>
                <span class="matchup-type">{{ formatTournamentType(matchup.tournamentType) }}</span>
              </div>
            </div>
            
            <!-- Loading indicator for data fetch -->
            <div v-if="loadingMatchup === matchup.id" class="matchup-loading">
              <div class="mini-spinner"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Action Buttons -->
    <div v-if="selectedMatchup" class="selector-actions">
      <div class="selection-summary">
        <span class="summary-text">
          Ready to analyze: <strong>{{ currentSelectionSummary }}</strong>
        </span>
      </div>
      
      <div class="action-buttons">
        <Button
          variant="ghost"
          @click="clearSelection"
        >
          Clear Selection
        </Button>
        
        <Button
          variant="primary"
          :loading="isLoading"
          @click="loadSelectedData"
        >
          Load Tournament Data
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTournamentStore } from '../../../stores'
import { Button } from '../../ui'
import type { TournamentType, TournamentDay, TournamentMatchup } from '../../../types'

// Store integration
const tournamentStore = useTournamentStore()
const {
  selectedMatchup,
  selectedDay,
  tournamentType: selectedType,
  isLoading,
  errorMessage
} = storeToRefs(tournamentStore)

// Local reactive state
const isLoadingMatchups = ref(false)
const matchupError = ref('')
const loadingMatchup = ref<string | null>(null)
const availableMatchups = ref<TournamentMatchup[]>([])

/**
 * Tournament configuration data
 */
const tournamentOptions = [
  {
    type: 'year4' as TournamentType,
    name: 'Year 4 Championships',
    description: 'ALGS Championship 2023',
    totalDays: 3,
    maxGames: 8
  },
  {
    type: 'year5' as TournamentType,  
    name: 'Year 5 Championships',
    description: 'ALGS Championship 2024',
    totalDays: 3,
    maxGames: 6
  },
  {
    type: 'ewc2025' as TournamentType,
    name: 'EWC 2025',
    description: 'Esports World Cup 2025',
    totalDays: 3,
    maxGames: 10
  }
]

/**
 * Available days based on selected tournament
 */
const availableDays = computed(() => {
  if (!selectedType.value) return []
  
  const dayConfig = {
    'day1': { label: 'Day 1', matchupCount: 12 },
    'day2': { label: 'Day 2', matchupCount: 8 },  
    'day3': { label: 'Day 3', matchupCount: 4 }
  }
  
  return Object.entries(dayConfig).map(([id, config]) => ({
    id: id as TournamentDay,
    ...config
  }))
})

/**
 * Current selection summary for display
 */
const currentSelectionSummary = computed(() => {
  if (!selectedType.value || !selectedDay.value || !selectedMatchup.value) {
    return ''
  }
  
  const tournament = tournamentOptions.find(t => t.type === selectedType.value)
  const matchup = availableMatchups.value.find(m => m.id === selectedMatchup.value)
  
  return `${tournament?.name} - ${formatDay(selectedDay.value)} - ${matchup?.name}`
})

/**
 * Select tournament type
 */
function selectTournamentType(type: TournamentType): void {
  console.log(`🏆 Selecting tournament type: ${type}`)
  tournamentStore.setTournamentType(type)
  // Clear dependent selections
  tournamentStore.setDay('day1')
  clearMatchupSelection()
}

/**
 * Select day
 */
function selectDay(day: TournamentDay): void {
  console.log(`📅 Selecting day: ${day}`)
  tournamentStore.setDay(day)
  clearMatchupSelection()
  loadAvailableMatchups()
}

/**
 * Select matchup
 */
async function selectMatchup(matchupId: string): Promise<void> {
  console.log(`🎯 Selecting matchup: ${matchupId}`)
  loadingMatchup.value = matchupId
  
  try {
    await tournamentStore.selectMatchup(matchupId)
  } catch (error) {
    console.error('Failed to select matchup:', error)
    // Error is handled by store
  } finally {
    loadingMatchup.value = null
  }
}

/**
 * Clear matchup selection
 */
function clearMatchupSelection(): void {
  if (selectedMatchup.value) {
    tournamentStore.selectMatchup('')
  }
  availableMatchups.value = []
  matchupError.value = ''
}

/**
 * Clear all selections
 */
function clearSelection(): void {
  tournamentStore.setTournamentType('year4')
  tournamentStore.setDay('day1')
  clearMatchupSelection()
}

/**
 * Load tournament data for selected matchup
 */
async function loadSelectedData(): Promise<void> {
  if (!selectedMatchup.value) return
  
  try {
    await tournamentStore.loadMatchupData({ forceRefresh: true })
    console.log('✅ Tournament data loaded successfully')
  } catch (error) {
    console.error('❌ Failed to load tournament data:', error)
  }
}

/**
 * Load available matchups for selected tournament and day
 */
async function loadAvailableMatchups(): Promise<void> {
  if (!selectedType.value || !selectedDay.value) return
  
  isLoadingMatchups.value = true
  matchupError.value = ''
  
  try {
    // Mock data - in real implementation, this would fetch from API
    const mockMatchups: TournamentMatchup[] = [
      {
        id: `${selectedType.value}-${selectedDay.value}-match1`,
        name: 'Championship Finals',
        day: selectedDay.value,
        tournamentType: selectedType.value,
        csvPath: `/${selectedType.value}/raw/match1.csv`
      },
      {
        id: `${selectedType.value}-${selectedDay.value}-match2`, 
        name: 'Semi-Finals',
        day: selectedDay.value,
        tournamentType: selectedType.value,
        csvPath: `/${selectedType.value}/raw/match2.csv`
      },
      {
        id: `${selectedType.value}-${selectedDay.value}-match3`,
        name: 'Quarter-Finals', 
        day: selectedDay.value,
        tournamentType: selectedType.value,
        csvPath: `/${selectedType.value}/raw/match3.csv`
      }
    ]
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    availableMatchups.value = mockMatchups
    console.log(`📊 Loaded ${mockMatchups.length} matchups for ${selectedType.value} ${selectedDay.value}`)
    
  } catch (error) {
    matchupError.value = 'Failed to load matchups. Please try again.'
    console.error('Failed to load matchups:', error)
  } finally {
    isLoadingMatchups.value = false
  }
}

/**
 * Retry loading matchups after error
 */
function retryLoadMatchups(): void {
  loadAvailableMatchups()
}

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
 * Format tournament type for display
 */
function formatTournamentType(type: TournamentType): string {
  const tournament = tournamentOptions.find(t => t.type === type)
  return tournament?.name || type
}

// Watch for day changes to load matchups
watch([selectedType, selectedDay], () => {
  if (selectedType.value && selectedDay.value) {
    loadAvailableMatchups()
  }
}, { immediate: true })

// Initialize on mount
onMounted(() => {
  if (selectedType.value && selectedDay.value) {
    loadAvailableMatchups()
  }
})
</script>

<style scoped>
.tournament-selector {
  @apply max-w-6xl mx-auto p-6;
}

.selector-header {
  @apply text-center mb-8;
}

.selector-title {
  @apply text-2xl font-bold text-white mb-2;
}

.selector-description {
  @apply text-slate-400 text-lg;
}

.selector-grid {
  @apply space-y-8;
}

.selector-section {
  @apply space-y-4;
}

.section-label {
  @apply block text-lg font-semibold text-slate-300 mb-4;
}

/* Tournament Type Cards */
.tournament-types {
  @apply grid grid-cols-1 md:grid-cols-3 gap-4;
}

.tournament-card {
  @apply bg-slate-800 border border-slate-700 rounded-xl p-6;
  @apply hover:border-red-500 hover:bg-slate-750 transition-all duration-200;
  @apply text-left w-full;
}

.tournament-card.active {
  @apply border-red-500 bg-slate-750 ring-2 ring-red-500 ring-opacity-50;
}

.card-content {
  @apply space-y-3;
}

.card-title {
  @apply text-lg font-semibold text-white;
}

.card-description {
  @apply text-slate-400 text-sm;
}

.card-stats {
  @apply flex gap-4 text-xs text-slate-500;
}

.stat {
  @apply bg-slate-700 px-2 py-1 rounded;
}

/* Day Tabs */
.day-tabs {
  @apply flex gap-2;
}

.day-tab {
  @apply bg-slate-800 border border-slate-700 rounded-lg px-4 py-3;
  @apply hover:border-red-500 transition-all duration-200;
  @apply flex flex-col items-center gap-1;
}

.day-tab.active {
  @apply border-red-500 bg-slate-750 text-red-400;
}

.tab-label {
  @apply font-medium text-white;
}

.tab-count {
  @apply text-xs text-slate-400;
}

/* Matchup Grid */
.matchup-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4;
}

.matchup-card {
  @apply bg-slate-800 border border-slate-700 rounded-lg p-4;
  @apply hover:border-red-500 hover:bg-slate-750 transition-all duration-200;
  @apply text-left w-full relative;
}

.matchup-card.active {
  @apply border-red-500 bg-slate-750 ring-2 ring-red-500 ring-opacity-50;
}

.matchup-content {
  @apply space-y-2;
}

.matchup-title {
  @apply font-medium text-white;
}

.matchup-meta {
  @apply flex gap-2 text-xs text-slate-400;
}

.matchup-loading {
  @apply absolute top-2 right-2;
}

/* Loading and Error States */
.loading-state, 
.error-state {
  @apply flex flex-col items-center justify-center py-12 text-center;
}

.loading-spinner,
.mini-spinner {
  @apply w-6 h-6 border-2 border-red-200 border-t-red-500 rounded-full animate-spin;
}

.mini-spinner {
  @apply w-4 h-4;
}

.loading-text {
  @apply mt-4 text-slate-400;
}

.error-state {
  @apply text-red-400;
}

.error-icon {
  @apply text-2xl mb-2;
}

.error-text {
  @apply mb-4;
}

/* Actions */
.selector-actions {
  @apply mt-8 bg-slate-800 border border-slate-700 rounded-xl p-6;
  @apply flex items-center justify-between;
}

.selection-summary {
  @apply flex-1;
}

.summary-text {
  @apply text-slate-300;
}

.action-buttons {
  @apply flex gap-3;
}

/* Responsive */
@media (max-width: 768px) {
  .selector-actions {
    @apply flex-col gap-4 items-stretch;
  }
  
  .action-buttons {
    @apply w-full justify-end;
  }
  
  .matchup-grid {
    @apply grid-cols-1;
  }
  
  .day-tabs {
    @apply flex-wrap;
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
</style>