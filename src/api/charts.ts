// Pure data processing functions for chart data

import type { 
  RawTeamDataWide, 
  TeamData, 
  ChartData, 
  GameData,
  MapSequence,
  DataValidationResult 
} from '../types'

/**
 * Extract maximum number of games from team data
 */
export function extractMaxGames(data: RawTeamDataWide[]): number {
  if (!data || data.length === 0) {
    return 0
  }
  
  const firstTeam = data[0]
  const gameColumns = Object.keys(firstTeam).filter(col => 
    col.startsWith('Game ') && col.endsWith(' P')
  )
  
  return gameColumns.length
}

/**
 * Process raw team data into chart-ready format
 */
export function processChartData(
  data: RawTeamDataWide[],
  mapSequence: MapSequence,
  getMapColor: (mapName: string, occurrence: number) => string,
  calculateMapOccurrence: (mapName: string, gameNum: number, sequence: MapSequence) => number
): ChartData {
  console.log('⚡ [API] Processing chart data...')
  
  if (!data || data.length === 0) {
    return []
  }
  
  const maxGames = extractMaxGames(data)
  
  if (maxGames === 0) {
    console.warn('⚠️ [API] No games found in data')
    return []
  }
  
  const chartData: TeamData[] = data.map(team => {
    const games: GameData[] = []
    let cumulativeScore = 0
    
    for (let gameNum = 1; gameNum <= maxGames; gameNum++) {
      const placementPoints = team[`Game ${gameNum} P` as keyof RawTeamDataWide] as number || 0
      const kills = team[`Game ${gameNum} K` as keyof RawTeamDataWide] as number || 0
      const gamePoints = placementPoints + kills
      
      const mapName = mapSequence?.maps?.[gameNum] || 'Unknown'
      const occurrenceCount = calculateMapOccurrence(mapName, gameNum, mapSequence)
      const gameColor = getMapColor(mapName, occurrenceCount)
      
      games.push({
        gameNumber: gameNum,
        placementPoints,
        kills,
        points: gamePoints,
        startX: cumulativeScore,
        map: mapName,
        color: gameColor
      })
      
      cumulativeScore += gamePoints
    }
    
    return {
      team: team.Team,
      games,
      totalScore: cumulativeScore,
      cumulativeScore
    }
  })
  
  // Sort by total score (highest first)
  chartData.sort((a, b) => b.totalScore - a.totalScore)
  
  console.log('✅ [API] Chart data processed:', {
    teams: chartData.length,
    maxGames,
    topTeam: chartData[0]?.team,
    topScore: chartData[0]?.totalScore
  })
  
  return chartData
}

/**
 * Filter chart data by selected games
 */
export function filterChartData(
  data: ChartData,
  selectedGames: readonly number[]
): ChartData {
  if (!selectedGames || selectedGames.length === 0) {
    return data
  }
  
  console.log(`🔍 [API] Filtering chart data for games: [${selectedGames.join(', ')}]`)
  
  const filteredData = data.map(teamData => {
    const filteredGames = teamData.games.filter(game => 
      selectedGames.includes(game.gameNumber)
    )
    
    // Recalculate cumulative scores for filtered games
    let cumulativeScore = 0
    const recalculatedGames = filteredGames.map(game => ({
      ...game,
      startX: cumulativeScore,
      points: (cumulativeScore += game.points || 0) - cumulativeScore + (game.points || 0)
    }))
    
    const totalScore = recalculatedGames.reduce((sum, game) => sum + game.points, 0)
    
    return {
      ...teamData,
      games: recalculatedGames,
      totalScore,
      cumulativeScore: totalScore
    }
  })
  
  // Re-sort by filtered total score
  filteredData.sort((a, b) => b.totalScore - a.totalScore)
  
  console.log('✅ [API] Chart data filtered:', {
    originalTeams: data.length,
    filteredTeams: filteredData.length,
    selectedGames: selectedGames.length
  })
  
  return filteredData
}

/**
 * Calculate data statistics for performance monitoring
 */
export interface ChartDataStats {
  readonly totalTeams: number
  readonly totalGames: number
  readonly totalDataPoints: number
  readonly maxScore: number
  readonly minScore: number
  readonly avgScore: number
  readonly uniqueMaps: number
}

export function calculateChartStats(data: ChartData): ChartDataStats {
  if (!data || data.length === 0) {
    return {
      totalTeams: 0,
      totalGames: 0,
      totalDataPoints: 0,
      maxScore: 0,
      minScore: 0,
      avgScore: 0,
      uniqueMaps: 0
    }
  }
  
  const scores = data.map(team => team.totalScore)
  const allGames = data.flatMap(team => team.games)
  const uniqueMaps = new Set(allGames.map(game => game.map))
  
  return {
    totalTeams: data.length,
    totalGames: data[0]?.games.length || 0,
    totalDataPoints: allGames.length,
    maxScore: Math.max(...scores),
    minScore: Math.min(...scores),
    avgScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    uniqueMaps: uniqueMaps.size
  }
}

/**
 * Validate processed chart data
 */
export function validateChartData(data: ChartData): DataValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  
  if (!Array.isArray(data)) {
    errors.push('Chart data must be an array')
    return { isValid: false, errors, warnings, processedRows: 0, skippedRows: 0 }
  }
  
  if (data.length === 0) {
    errors.push('Chart data is empty')
    return { isValid: false, errors, warnings, processedRows: 0, skippedRows: 0 }
  }
  
  let processedRows = 0
  let skippedRows = 0
  
  for (let i = 0; i < data.length; i++) {
    const team = data[i]
    
    if (!team?.team || typeof team.team !== 'string') {
      skippedRows++
      warnings.push(`Team ${i + 1}: Invalid team name`)
      continue
    }
    
    if (!Array.isArray(team.games) || team.games.length === 0) {
      skippedRows++
      warnings.push(`Team ${team.team}: No games data`)
      continue
    }
    
    // Validate games data
    for (let j = 0; j < team.games.length; j++) {
      const game = team.games[j]
      
      if (typeof game.gameNumber !== 'number' || game.gameNumber < 1) {
        warnings.push(`Team ${team.team}, Game ${j + 1}: Invalid game number`)
      }
      
      if (typeof game.points !== 'number' || game.points < 0) {
        warnings.push(`Team ${team.team}, Game ${game.gameNumber}: Invalid points`)
      }
      
      if (!game.map || typeof game.map !== 'string') {
        warnings.push(`Team ${team.team}, Game ${game.gameNumber}: Missing map name`)
      }
      
      if (!game.color || typeof game.color !== 'string') {
        warnings.push(`Team ${team.team}, Game ${game.gameNumber}: Missing color`)
      }
    }
    
    processedRows++
  }
  
  if (processedRows === 0) {
    errors.push('No valid team data found')
  }
  
  return {
    isValid: errors.length === 0 && processedRows > 0,
    errors,
    warnings,
    processedRows,
    skippedRows
  }
}

/**
 * Export chart data to CSV format
 */
export function exportChartDataToCsv(
  data: ChartData,
  selectedGames?: readonly number[]
): string {
  if (!data || data.length === 0) {
    return ''
  }
  
  const filteredData = selectedGames && selectedGames.length > 0 
    ? filterChartData(data, selectedGames)
    : data
  
  // Create CSV headers
  const maxGames = filteredData[0]?.games.length || 0
  const headers = ['Team', 'Total Score']
  
  for (let i = 1; i <= maxGames; i++) {
    headers.push(`Game ${i} Points`, `Game ${i} Map`)
  }
  
  // Create CSV rows
  const rows = [headers.join(',')]
  
  for (const team of filteredData) {
    const row = [
      `"${team.team}"`,
      team.totalScore.toString()
    ]
    
    for (const game of team.games) {
      row.push(game.points.toString(), `"${game.map}"`)
    }
    
    rows.push(row.join(','))
  }
  
  console.log('📊 [API] CSV export created:', {
    teams: filteredData.length,
    games: maxGames,
    rows: rows.length
  })
  
  return rows.join('\n')
}