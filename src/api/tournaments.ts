// Pure data fetching functions for tournament data

import * as d3 from 'd3'
import type { 
  TournamentType, 
  TournamentMatchup,
  RawTeamDataWide, 
  RawTeamDataLong, 
  ApiResponse,
  CsvLoadConfig,
  DataValidationResult,
  TournamentError,
  TournamentErrorDetails 
} from '../types'

/**
 * Placement points mapping for different tournament formats
 */
const PLACEMENT_POINTS_MAP: Record<string, number> = {
  '1': 12, '2': 9, '3': 7, '4': 5, '5': 4,
  '6': 3, '7': 3, '8': 2, '9': 2, '10': 2,
  '11': 1, '12': 1, '13': 1, '14': 1, '15': 1,
  '16': 0, '17': 0, '18': 0, '19': 0, '20': 0
} as const

/**
 * Build CSV path based on tournament type and matchup ID
 */
export function buildCsvPath(tournamentType: TournamentType, matchupId: string): string {
  const pathMap: Record<TournamentType, string> = {
    'ewc2025': `/ewc2025/raw/${matchupId}.csv`,
    'year5': `/year5champions/raw/${matchupId}.csv`, 
    'year4': `/year4champions/raw/${matchupId}.csv`
  }
  
  return pathMap[tournamentType]
}

/**
 * Load CSV data from URL with error handling and validation
 */
export async function loadCsvData(config: CsvLoadConfig): Promise<ApiResponse<unknown[]>> {
  const startTime = Date.now()
  
  try {
    console.log(`📂 [API] Loading CSV data from: ${config.url}`)
    
    const controller = new AbortController()
    const timeout = config.timeout || 10000
    
    // Set up timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await fetch(config.url, { 
      signal: controller.signal 
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const csvText = await response.text()
    
    if (!csvText || csvText.trim().length === 0) {
      throw new Error('Empty CSV file received')
    }
    
    const rawData = d3.csvParse(csvText)
    
    if (!rawData || rawData.length === 0) {
      throw new Error('No data rows found in CSV')
    }
    
    const loadTime = Date.now() - startTime
    console.log(`✅ [API] CSV loaded successfully:`, {
      url: config.url,
      rows: rawData.length,
      columns: rawData.columns?.length || 0,
      loadTime: `${loadTime}ms`
    })
    
    return {
      data: rawData,
      success: true,
      timestamp: Date.now()
    }
    
  } catch (error) {
    const loadTime = Date.now() - startTime
    console.error(`❌ [API] CSV load failed:`, {
      url: config.url,
      error: error instanceof Error ? error.message : 'Unknown error',
      loadTime: `${loadTime}ms`
    })
    
    return {
      data: [],
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load CSV data',
      timestamp: Date.now()
    }
  }
}

/**
 * Load tournament data for a specific matchup
 */
export async function loadTournamentData(
  tournamentType: TournamentType, 
  matchupId: string
): Promise<ApiResponse<unknown[]>> {
  if (!matchupId) {
    return {
      data: [],
      success: false,
      error: 'Matchup ID is required',
      timestamp: Date.now()
    }
  }
  
  const csvPath = buildCsvPath(tournamentType, matchupId)
  
  return loadCsvData({
    url: csvPath,
    timeout: 15000, // 15 second timeout for tournament data
    parseOptions: {
      skipEmptyLines: true,
      header: true
    }
  })
}

/**
 * Detect data format (wide vs long) based on column structure
 */
export function detectDataFormat(data: unknown[]): 'wide' | 'long' | 'unknown' {
  if (!data || data.length === 0) {
    return 'unknown'
  }
  
  const firstRow = data[0] as Record<string, unknown>
  const columns = Object.keys(firstRow)
  
  // Check for long format indicators
  const hasLongFormatColumns = columns.includes('Game') && 
                               columns.includes('Team') && 
                               columns.includes('Placement')
  
  if (hasLongFormatColumns) {
    return 'long'
  }
  
  // Check for wide format indicators  
  const hasWideFormatColumns = columns.some(col => 
    col.includes('Game ') && col.includes(' P')
  )
  
  if (hasWideFormatColumns) {
    return 'wide'
  }
  
  return 'unknown'
}

/**
 * Validate tournament data structure and content
 */
export function validateTournamentData(data: unknown[]): DataValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  let processedRows = 0
  let skippedRows = 0
  
  if (!Array.isArray(data)) {
    errors.push('Data must be an array')
    return { isValid: false, errors, warnings, processedRows, skippedRows }
  }
  
  if (data.length === 0) {
    errors.push('Data array is empty')
    return { isValid: false, errors, warnings, processedRows, skippedRows }
  }
  
  const dataFormat = detectDataFormat(data)
  
  if (dataFormat === 'unknown') {
    errors.push('Unable to detect data format (wide or long)')
    return { isValid: false, errors, warnings, processedRows, skippedRows }
  }
  
  // Validate each row
  for (let i = 0; i < data.length; i++) {
    const row = data[i] as Record<string, unknown>
    
    if (!row || typeof row !== 'object') {
      skippedRows++
      warnings.push(`Row ${i + 1}: Invalid row structure`)
      continue
    }
    
    if (!row.Team || typeof row.Team !== 'string' || row.Team.trim() === '') {
      skippedRows++
      warnings.push(`Row ${i + 1}: Missing or invalid team name`)
      continue
    }
    
    processedRows++
  }
  
  if (processedRows === 0) {
    errors.push('No valid data rows found')
  }
  
  if (skippedRows > data.length * 0.5) {
    warnings.push(`High number of skipped rows: ${skippedRows}/${data.length}`)
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
 * Transform long format data to wide format for processing
 */
export function transformLongToWideFormat(data: RawTeamDataLong[]): RawTeamDataWide[] {
  console.log('🔄 [API] Transforming long format data to wide format...')
  
  const teamsData: Record<string, RawTeamDataWide> = {}
  
  for (const row of data) {
    const teamName = row.Team?.trim()
    const gameNumber = parseInt(row.Game)
    const placement = row.Placement?.trim()
    const kills = parseInt(row.Kills) || 0
    
    if (!teamName || !gameNumber || !placement) {
      console.warn('🟡 [API] Skipping invalid row:', row)
      continue
    }
    
    if (!teamsData[teamName]) {
      teamsData[teamName] = {
        Team: teamName,
        'Overall Points': 0
      } as RawTeamDataWide
    }
    
    const placementPoints = PLACEMENT_POINTS_MAP[placement] || 0
    const totalGamePoints = placementPoints + kills
    
    // Set placement and kill points for this game
    const placementColumn = `Game ${gameNumber} P` as const
    const killColumn = `Game ${gameNumber} K` as const
    
    teamsData[teamName][placementColumn] = placementPoints
    teamsData[teamName][killColumn] = kills
    teamsData[teamName]['Overall Points'] += totalGamePoints
  }
  
  const transformedData = Object.values(teamsData)
    .sort((a, b) => b['Overall Points'] - a['Overall Points'])
  
  console.log('✅ [API] Long data transformed:', {
    originalRows: data.length,
    transformedTeams: transformedData.length
  })
  
  return transformedData
}

/**
 * Create tournament error with proper typing
 */
export function createTournamentError(
  type: TournamentError, 
  message: string, 
  details?: unknown
): TournamentErrorDetails {
  return {
    type,
    message,
    details
  }
}