import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import * as d3 from 'd3'
import { getMapSequence } from '@/chart/MapSequenceData'
import { getMapColorByOccurrence, calculateMapOccurrence } from '@/chart/MapColoringLogic'

// ALGS Point System
const PLACEMENT_POINTS = {
  1: 12, 2: 9, 3: 7, 4: 5, 5: 4,
  6: 3, 7: 3, 8: 2, 9: 2, 10: 2,
  11: 1, 12: 1, 13: 1, 14: 1, 15: 1,
  16: 0, 17: 0, 18: 0, 19: 0, 20: 0
}

export const useTournamentStore = defineStore('tournament', () => {
  // ============ State ============
  const selectedMatchup = ref('')
  const selectedDay = ref('day1')
  const tournamentType = ref('year4')
  const currentGame = ref(0)
  const isPlaying = ref(false)
  const isFiltered = ref(false)
  const filteredGameIndices = ref([])
  const isLegendVisible = ref(true)
  const animationSpeed = ref('medium')
  
  const processedChartData = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // ============ Getters ============
  const maxGames = computed(() => {
    if (processedChartData.value.length > 0) {
      const firstTeam = processedChartData.value[0]
      return firstTeam?.games?.length || 6
    }
    
    // Fallback based on tournament type
    if (tournamentType.value === 'ewc2025') {
      if (selectedDay.value === 'day1') return 10
      if (selectedDay.value === 'day2') return 9
      return 6
    }
    return tournamentType.value === 'year5' ? 6 : 8
  })

  const currentMap = computed(() => {
    if (!selectedMatchup.value) return ''
    const sequence = getMapSequence(selectedMatchup.value)
    return sequence?.maps?.[currentGame.value] || ''
  })

  // ============ Actions ============
  const setTournamentType = (type) => {
    tournamentType.value = type
  }

  const setDay = (dayId) => {
    selectedDay.value = dayId
    selectedMatchup.value = ''
    resetPlayback()
  }

  const selectMatchup = (matchupId) => {
    selectedMatchup.value = matchupId
    resetPlayback()
  }

  const setCurrentGame = (game) => {
    currentGame.value = game
    if (game === 0) {
      isFiltered.value = false
      filteredGameIndices.value = []
    }
  }

  const togglePlayback = () => {
    isPlaying.value = !isPlaying.value
  }

  const stopPlayback = () => {
    isPlaying.value = false
  }

  const resetPlayback = () => {
    isPlaying.value = false
    currentGame.value = 0
    isFiltered.value = false
    filteredGameIndices.value = []
  }

  const toggleLegend = () => {
    isLegendVisible.value = !isLegendVisible.value
  }

  const setAnimationSpeed = (speed) => {
    animationSpeed.value = speed
  }

  const setGameFilter = (games) => {
    if (!games || games.length === 0) {
      isFiltered.value = false
      filteredGameIndices.value = []
    } else {
      isFiltered.value = true
      filteredGameIndices.value = [...games].sort((a, b) => a - b)
    }
  }

  const fetchDataForMatchup = async () => {
    if (!selectedMatchup.value) return

    isLoading.value = true
    error.value = null
    processedChartData.value = []

    try {
      const csvPath = buildCsvPath(selectedMatchup.value)
      const response = await fetch(csvPath)
      
      if (!response.ok) {
        throw new Error(`Failed to load data: ${response.status}`)
      }
      
      const csvText = await response.text()
      const rawData = d3.csvParse(csvText)
      processedChartData.value = processData(rawData)
      
    } catch (err) {
      error.value = err.message
      processedChartData.value = []
    } finally {
      isLoading.value = false
    }
  }

  // ============ Helpers ============
  const buildCsvPath = (matchupId) => {
    const base = import.meta.env.BASE_URL || '/'
    const paths = {
      ewc2025: `ewc2025/raw/${matchupId}.csv`,
      year5: `year5champions/raw/${matchupId}.csv`,
      year4: `year4champions/raw/${matchupId}.csv`
    }
    return `${base}${paths[tournamentType.value] || paths.year4}`
  }

  const processData = (rawData) => {
    if (!rawData || rawData.length === 0) return []

    const columns = rawData.columns || []
    const isLongFormat = columns.includes('Game') && columns.includes('Team')
    
    const data = isLongFormat 
      ? transformLongToWide(rawData) 
      : rawData

    return computeGameData(data)
  }

  const transformLongToWide = (rawData) => {
    const teams = {}

    rawData.forEach(row => {
      const teamName = row.Team
      const gameNum = parseInt(row.Game)
      const placement = row.Placement
      const kills = parseInt(row.Kills) || 0

      if (!teams[teamName]) {
        teams[teamName] = { Team: teamName, 'Overall Points': 0 }
      }

      const placementPoints = PLACEMENT_POINTS[placement] || 0
      teams[teamName][`Game ${gameNum} P`] = placementPoints
      teams[teamName][`Game ${gameNum} K`] = kills
      teams[teamName]['Overall Points'] += placementPoints + kills
    })

    return Object.values(teams).sort((a, b) => 
      b['Overall Points'] - a['Overall Points']
    )
  }

  const computeGameData = (data) => {
    const firstTeam = data[0]
    const gameColumns = Object.keys(firstTeam).filter(col => 
      col.startsWith('Game ') && col.endsWith(' P')
    )
    const maxGames = gameColumns.length

    const mapSequence = getMapSequence(selectedMatchup.value)

    const chartData = data.map(team => {
      const games = []
      let cumulativeScore = 0

      for (let i = 1; i <= maxGames; i++) {
        const placementPoints = team[`Game ${i} P`] || 0
        const kills = team[`Game ${i} K`] || 0
        const points = placementPoints + kills
        const mapName = mapSequence?.maps?.[i] || 'Unknown'
        const occurrence = calculateMapOccurrence(mapName, i, mapSequence)
        const color = getMapColorByOccurrence(mapName, occurrence)

        games.push({
          gameNumber: i,
          placementPoints,
          kills,
          points,
          startX: cumulativeScore,
          map: mapName,
          color
        })

        cumulativeScore += points
      }

      return {
        team: team.Team,
        games,
        totalScore: cumulativeScore
      }
    })

    return chartData.sort((a, b) => b.totalScore - a.totalScore)
  }

  return {
    // State
    selectedMatchup,
    selectedDay,
    tournamentType,
    currentGame,
    isPlaying,
    isFiltered,
    filteredGameIndices,
    isLegendVisible,
    animationSpeed,
    processedChartData,
    isLoading,
    error,
    
    // Getters
    maxGames,
    currentMap,
    
    // Actions
    setTournamentType,
    setDay,
    selectMatchup,
    setCurrentGame,
    togglePlayback,
    stopPlayback,
    resetPlayback,
    toggleLegend,
    setAnimationSpeed,
    setGameFilter,
    fetchDataForMatchup
  }
})
