<template>
  <div class="min-h-screen bg-surface-950">
    <!-- Header with Selectors -->
    <header class="sticky top-0 z-50 glass-heavy border-b border-surface-800">
      <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Top Row: Logo -->
        <div class="flex items-center h-14 border-b border-surface-800/50">
          <RouterLink to="/" class="flex items-center gap-3 group">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-lg shadow-glow transition-transform group-hover:scale-105">
              🏆
            </div>
            <span class="font-bold text-surface-100 group-hover:text-brand-400 transition-colors">ALGS Dashboard</span>
          </RouterLink>
        </div>
        
        <!-- Bottom Row: Selectors -->
        <div class="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar">
          <!-- Tournament Selector -->
          <div class="relative">
            <select 
              v-model="selectedTournament"
              @change="handleTournamentChange"
              class="input text-sm py-2 pl-3 pr-10 min-w-[160px] cursor-pointer appearance-none bg-surface-800/50"
            >
              <option value="year-4-championship">Year 4 Championship</option>
              <option value="year-5-open">Year 5 Open</option>
              <option value="ewc-2025">EWC 2025</option>
            </select>
            <svg class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          
          <!-- Day Selector -->
          <div class="flex items-center gap-1">
            <button
              v-for="day in tournamentDays"
              :key="day.id"
              @click="handleDaySelect(day.id)"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                selectedDay === day.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-800/50 text-surface-400 hover:bg-surface-700 hover:text-surface-200'
              ]"
            >
              {{ day.shortName || day.name }}
            </button>
          </div>
          
          <div class="w-px h-6 bg-surface-700 mx-1" />
          
          <!-- Matchup Selector -->
          <div class="flex items-center gap-1">
            <button
              v-for="matchup in currentDayMatchups"
              :key="matchup.id"
              @click="handleMatchupSelect(matchup.id)"
              :class="[
                'px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                selectedMatchup === matchup.id
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30'
                  : 'bg-surface-800/30 text-surface-400 hover:bg-surface-800 hover:text-surface-200'
              ]"
            >
              {{ matchup.title }}
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content - Full Width Chart -->
    <main class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-32">
        <div class="w-12 h-12 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4" />
        <p class="text-surface-500">Loading tournament data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex flex-col items-center justify-center py-32 text-center">
        <div class="w-16 h-16 rounded-2xl bg-accent-danger/10 flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-accent-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-surface-200 mb-2">Failed to Load Data</h3>
        <p class="text-surface-500">{{ error }}</p>
      </div>

      <!-- Chart + Side Panel Layout -->
      <div v-else class="grid lg:grid-cols-[1fr_400px] gap-4">
        <!-- Chart Area -->
        <div class="glass-card p-1 relative overflow-hidden">
          <!-- Filter Button - Top Right -->
          <div class="absolute top-4 right-4 z-30">
            <GameFilter
              :max-games="maxGames"
              :selected-games="filteredGameIndices"
              :is-filtered="isFiltered"
              @update:filter="setGameFilter"
            />
          </div>

          <!-- Chart (fills entire area) -->
          <div class="p-4 pt-8 min-h-[600px]">
            <RaceChartEcharts />
          </div>

          <!-- Map Legend & Game Info - Bottom Right (overlays on chart) -->
          <div class="absolute bottom-6 right-6 z-20 flex flex-col items-end gap-3 pointer-events-none">
            <!-- Map Legend -->
            <div class="pointer-events-auto">
              <MapLegend
                :data="processedChartData"
                :is-visible="isLegendVisible"
                @toggle="toggleLegend"
              />
            </div>

            <!-- Game Badge -->
            <div class="glass-heavy px-4 py-2 rounded-xl border border-surface-700/50 backdrop-blur-xl pointer-events-none shadow-xl">
              <div class="text-xs text-surface-500 uppercase tracking-wider mb-0.5">Current Game</div>
              <div class="text-2xl font-bold text-brand-400">
                {{ currentGame }}<span class="text-surface-500 text-base">/{{ maxGames }}</span>
              </div>
              <div v-if="currentMap" class="text-xs text-surface-400 mt-0.5">{{ currentMap }}</div>
            </div>
          </div>
        </div>

        <!-- Right Side Panel -->
        <div class="space-y-4">
          <!-- Game Breakdown - Top Gainers -->
          <div class="glass-card overflow-hidden">
            <div class="section-header border-b border-surface-700/50">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span class="section-title">{{ currentGame === 0 ? 'Controls' : `Game ${currentGame} Breakdown` }}</span>
              </div>
            </div>

            <!-- Controls Guide (when no game selected) -->
            <div v-if="currentGame === 0" class="p-4 space-y-4">
              <div class="space-y-3">
                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg bg-brand-600/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-surface-200 mb-1">Playback Controls</h4>
                    <p class="text-xs text-surface-500">Use the controls below to play through tournament games automatically or navigate manually.</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg bg-surface-700/50 border border-surface-600/30 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-surface-200 mb-1">Filter Games</h4>
                    <p class="text-xs text-surface-500">Click the "Filter Games" button above the chart to select specific games to analyze.</p>
                  </div>
                </div>

                <div class="flex items-start gap-3">
                  <div class="w-8 h-8 rounded-lg bg-surface-700/50 border border-surface-600/30 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-surface-200 mb-1">Hover for Details</h4>
                    <p class="text-xs text-surface-500">Hover over any colored segment in the chart to see placement, kills, and points for that game.</p>
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-surface-700/50">
                <button
                  @click="setCurrentGame(1)"
                  class="w-full btn-primary text-sm py-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                  Start from Game 1
                </button>
              </div>
            </div>

            <!-- Game Breakdown (when game is selected) -->
            <div v-else>
              <!-- Top 3 Highlight -->
              <div class="p-3 bg-surface-800/30 border-b border-surface-700/50">
                <div class="text-xs text-surface-500 uppercase tracking-wider mb-2">Top Gainers</div>
                <div class="space-y-2">
                  <div 
                    v-for="(team, i) in currentGameRankings.slice(0, 3)" 
                    :key="team.team"
                    class="flex items-center gap-3"
                  >
                    <div class="flex items-center justify-center w-6 h-6 rounded-full bg-surface-800 text-xs font-bold"
                      :class="i === 0 ? 'text-accent-gold' : i === 1 ? 'text-surface-300' : i === 2 ? 'text-amber-600' : 'text-surface-500'"
                    >
                      {{ i + 1 }}
                    </div>
                    <span class="flex-1 font-medium text-surface-200 text-sm truncate">{{ team.team }}</span>
                    <span class="font-mono text-accent-gold font-semibold">+{{ team.gamePoints }}</span>
                  </div>
                </div>
              </div>
              
              <!-- All Rankings - Scrollable with Column Headers -->
              <div class="max-h-[320px] overflow-y-auto thin-scrollbar">
                <!-- Column Headers -->
                <div class="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-3 py-2 bg-surface-900/50 text-xs text-surface-500 font-medium border-b border-surface-700/30">
                  <span class="w-6 text-center">#</span>
                  <span>Team</span>
                  <span class="w-12 text-right">Place</span>
                  <span class="w-10 text-right">Kills</span>
                  <span class="w-12 text-right">Pts</span>
                </div>
                
                <div class="p-1">
                  <div 
                    v-for="(team, i) in currentGameRankings" 
                    :key="team.team"
                    class="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-800/50 transition-colors items-center"
                    :class="i < 3 ? 'bg-surface-800/20' : ''"
                  >
                    <span class="w-6 text-center text-xs font-medium" :class="i < 3 ? 'text-surface-300' : 'text-surface-500'">
                      {{ i + 1 }}
                    </span>
                    <span class="text-sm text-surface-300 truncate">{{ team.team }}</span>
                    <span class="w-12 text-right text-xs" :class="getPlacementColor(team.placement)">
                      {{ formatPlacement(team.placement) }}
                    </span>
                    <span class="w-10 text-right text-xs text-surface-400">{{ team.kills }}</span>
                    <span class="w-12 text-right font-mono text-brand-400 text-sm">+{{ team.gamePoints }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Playback Controls -->
          <PlaybackControls 
            :max-games="maxGames"
            :current-game="currentGame"
            :is-playing="isPlaying"
            :animation-speed="animationSpeed"
            @update:current-game="setCurrentGame"
            @toggle-playback="togglePlayback"
            @update:speed="setAnimationSpeed"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTournamentStore } from '@/stores/tournament'
import { storeToRefs } from 'pinia'
import PlaybackControls from './PlaybackControls.vue'
import GameFilter from './GameFilter.vue'
import RaceChartEcharts from './RaceChartEcharts.vue'
import MapLegend from './MapLegend.vue'

// Router & Store
const route = useRoute()
const router = useRouter()
const store = useTournamentStore()

const {
  selectedMatchup,
  selectedDay,
  currentGame,
  isPlaying,
  maxGames,
  isFiltered,
  filteredGameIndices,
  isLegendVisible,
  animationSpeed,
  processedChartData,
  isLoading,
  error,
  currentMap
} = storeToRefs(store)

const { 
  setTournamentType, 
  setDay, 
  selectMatchup, 
  setCurrentGame,
  togglePlayback,
  toggleLegend,
  setAnimationSpeed,
  setGameFilter,
  fetchDataForMatchup
} = store

// Local state for tournament selector
const selectedTournament = ref('year-4-championship')

// Playback interval
let playbackInterval = null
const SPEED_INTERVALS = {
  slow: 1500,
  medium: 800,
  fast: 400
}

// Tournament detection
const isYear5 = computed(() => selectedTournament.value === 'year-5-open')
const isEwc2025 = computed(() => selectedTournament.value === 'ewc-2025')

// Tournament days configuration
const tournamentDays = computed(() => {
  if (isEwc2025.value) {
    return [
      { id: 'day1', name: 'Day 1 - Group A', shortName: 'Day 1', matchups: [
        { id: 'Day1-A', title: 'Group A', games: 10 }
      ]},
      { id: 'day2', name: 'Day 2 - Group B', shortName: 'Day 2', matchups: [
        { id: 'Day2-B', title: 'Group B', games: 9 }
      ]},
      { id: 'day3', name: 'Day 3 - Last Chance', shortName: 'Day 3', matchups: [
        { id: 'Day3-LastChance', title: 'Last Chance', games: 6 }
      ]}
    ]
  }
  
  if (isYear5.value) {
    return [
      { id: 'day1', name: 'Winners Round 1', shortName: 'Winners R1', matchups: [
        { id: 'Day1-WinnersRound1-1', title: 'Match 1', games: 6 },
        { id: 'Day1-WinnersRound1-2', title: 'Match 2', games: 6 },
        { id: 'Day1-WinnersRound1-3', title: 'Match 3', games: 6 },
        { id: 'Day1-WinnersRound1-4', title: 'Match 4', games: 6 },
        { id: 'Day1-WinnersRound1-5', title: 'Match 5', games: 6 },
        { id: 'Day1-WinnersRound1-6', title: 'Match 6', games: 6 }
      ]}
    ]
  }
  
  // Year 4 Championship
  return [
    { id: 'day1', name: 'Day 1', shortName: 'Day 1', matchups: [
      { id: 'AvsB', title: 'A vs B', games: 6 },
      { id: 'CvsD', title: 'C vs D', games: 6 },
      { id: 'BvsD', title: 'B vs D', games: 6 }
    ]},
    { id: 'day2', name: 'Day 2', shortName: 'Day 2', matchups: [
      { id: 'AvsC', title: 'A vs C', games: 6 },
      { id: 'BvsC', title: 'B vs C', games: 6 },
      { id: 'AvsD', title: 'A vs D', games: 6 }
    ]},
    { id: 'day3', name: 'Day 3', shortName: 'Day 3', matchups: [
      { id: 'ER1', title: 'Elim R1', games: 8 }
    ]},
    { id: 'day4', name: 'Day 4', shortName: 'Day 4', matchups: [
      { id: 'ER2', title: 'Elim R2', games: 8 },
      { id: 'WR1', title: 'Winners R1', games: 8 }
    ]}
  ]
})

const currentDayMatchups = computed(() => {
  const day = tournamentDays.value.find(d => d.id === selectedDay.value)
  return day?.matchups || []
})

// Get placement color
const getPlacementColor = (placement) => {
  if (placement <= 3) return 'text-accent-gold'
  if (placement <= 10) return 'text-surface-300'
  return 'text-surface-500'
}

// Format placement with suffix
const formatPlacement = (placement) => {
  if (!placement || placement === '-') return '-'
  const suffixes = { 1: 'st', 2: 'nd', 3: 'rd' }
  const suffix = suffixes[placement] || 'th'
  return `${placement}${suffix}`
}

// Current game rankings with actual placement from data
const currentGameRankings = computed(() => {
  if (!processedChartData.value.length || currentGame.value === 0) return []
  
  // Get raw data for current game and sort by points
  const gameData = processedChartData.value
    .map(team => {
      const game = team.games.find(g => g.gameNumber === currentGame.value)
      return {
        team: team.team,
        gamePoints: game?.points || 0,
        kills: game?.kills || 0,
        // Calculate actual placement based on game points ranking
      }
    })
    .sort((a, b) => b.gamePoints - a.gamePoints)
  
  // Assign actual placements (1st, 2nd, 3rd, etc.)
  return gameData.map((team, index) => ({
    ...team,
    placement: index + 1
  }))
})

// Playback control
const startPlayback = () => {
  if (playbackInterval) clearInterval(playbackInterval)
  
  if (currentGame.value >= maxGames.value) {
    setCurrentGame(0)
  }
  
  const interval = SPEED_INTERVALS[animationSpeed.value] || SPEED_INTERVALS.medium
  
  playbackInterval = setInterval(() => {
    if (currentGame.value < maxGames.value) {
      setCurrentGame(currentGame.value + 1)
    } else {
      stopPlayback()
    }
  }, interval)
}

const stopPlayback = () => {
  if (playbackInterval) {
    clearInterval(playbackInterval)
    playbackInterval = null
  }
}

// Watch for play state changes
watch(isPlaying, (playing) => {
  if (playing) startPlayback()
  else stopPlayback()
})

// Watch for speed changes
watch(animationSpeed, () => {
  if (isPlaying.value) startPlayback()
})

// Tournament change handler
const handleTournamentChange = () => {
  stopPlayback()
  router.push(`/tournament/${selectedTournament.value}`)
}

// Day selection - auto-select first matchup
const handleDaySelect = async (dayId) => {
  stopPlayback()
  setDay(dayId)
  
  // Auto-select first matchup of the new day
  const day = tournamentDays.value.find(d => d.id === dayId)
  if (day && day.matchups.length > 0) {
    const firstMatchup = day.matchups[0]
    selectMatchup(firstMatchup.id)
    await fetchDataForMatchup()
  }
}

// Matchup selection
const handleMatchupSelect = async (matchupId) => {
  stopPlayback()
  selectMatchup(matchupId)
  await fetchDataForMatchup()
}

// Initialize
onMounted(() => {
  // Set initial tournament from route
  const routeTournament = route.params.id
  if (routeTournament) {
    selectedTournament.value = routeTournament
  }
  
  const type = isEwc2025.value ? 'ewc2025' : isYear5.value ? 'year5' : 'year4'
  setTournamentType(type)
  
  // Auto-select first day/matchup
  const firstDay = tournamentDays.value[0]
  if (firstDay) {
    setDay(firstDay.id)
    if (firstDay.matchups[0]) {
      selectMatchup(firstDay.matchups[0].id)
      fetchDataForMatchup()
    }
  }
})

// Watch for route changes
watch(() => route.params.id, (newId) => {
  if (newId) {
    selectedTournament.value = newId
    const type = newId === 'ewc-2025' ? 'ewc2025' : newId === 'year-5-open' ? 'year5' : 'year4'
    setTournamentType(type)
    
    const firstDay = tournamentDays.value[0]
    if (firstDay) {
      setDay(firstDay.id)
      if (firstDay.matchups[0]) {
        selectMatchup(firstDay.matchups[0].id)
        fetchDataForMatchup()
      }
    }
  }
})

// Cleanup
onUnmounted(() => {
  stopPlayback()
})
</script>
