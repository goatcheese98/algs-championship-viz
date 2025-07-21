import ewc2025 from './ewc-2025.json'
import year5Open from './year-5-open.json' 
import year4Championship from './year-4-championship.json'
import mapData from '../maps.json'

// Tournament configurations registry
export const tournaments = {
  'ewc-2025': ewc2025,
  'year-5-open': year5Open,
  'year-4-championship': year4Championship
}

// Export map data
export { mapData }

/**
 * Get tournament configuration by type
 * @param {string} tournamentType - Tournament identifier
 * @returns {Object} Tournament configuration object
 */
export const getTournamentConfig = (tournamentType) => {
  return tournaments[tournamentType] || tournaments['year-4-championship']
}

/**
 * Get tournament days for a specific tournament type
 * @param {string} tournamentType - Tournament identifier  
 * @returns {Array} Array of tournament days
 */
export const getTournamentDays = (tournamentType) => {
  const config = getTournamentConfig(tournamentType)
  return config.days || []
}

/**
 * Get map image URL with fallback and normalization
 * @param {string} mapName - Map name to look up
 * @returns {string} Image URL or empty string if not found
 */
export const getMapImageUrl = (mapName) => {
  if (!mapName) return ''
  
  // First try direct lookup
  let imageUrl = mapData.images[mapName]
  if (imageUrl) return imageUrl
  
  // Try alias lookup
  const normalized = mapData.aliases[mapName]
  if (normalized && mapData.images[normalized]) {
    return mapData.images[normalized]
  }
  
  // Fallback: normalize the map name and try fuzzy matching
  const normalizedMapName = mapName.toLowerCase().replace(/[^a-z]/g, '')
  const normalizedImages = Object.keys(mapData.images).reduce((acc, key) => {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '')
    acc[normalizedKey] = mapData.images[key]
    return acc
  }, {})
  
  return normalizedImages[normalizedMapName] || ''
}


