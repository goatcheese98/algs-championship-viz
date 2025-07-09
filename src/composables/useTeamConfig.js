/**
 * Vue Composable for Team Configuration
 * Optimized replacement for js/teamConfig.js
 */

import { ref, computed } from 'vue'

// Team configuration data
const teamData = {
  // Team logo mappings with cleaned URLs
  logoUrls: {
    "Team Falcons": "https://apexlegendsstatus.com/algs/assets/teams/teamfalcons.png",
    "Alliance": "https://apexlegendsstatus.com/algs/assets/teams/alliance.png",
    "Aurora": "https://apexlegendsstatus.com/algs/assets/teams/aurora.png",
    "FNATIC": "https://apexlegendsstatus.com/algs/assets/teams/fnatuc.png",
    "SR": "https://apexlegendsstatus.com/algs/assets/teams/shopifyrebellion.png",
    "Noctem": "https://apexlegendsstatus.com/algs/assets/teams/noctem.png",
    "VK GAMING": "https://apexlegendsstatus.com/algs/assets/teams/vkgaming.png",
    "Virtus.pro": "https://apexlegendsstatus.com/algs/assets/teams/virtuspro.png",
    "GoNext": "https://apexlegendsstatus.com/algs/assets/teams/gonext.png",
    "FURIA": "https://apexlegendsstatus.com/algs/assets/teams/furia.png",
    "GUILD": "https://apexlegendsstatus.com/algs/assets/teams/guild.png",
    "Envy": "https://apexlegendsstatus.com/algs/assets/teams/envy.png",
    "LG": "https://apexlegendsstatus.com/algs/assets/teams/lg.png",
    "ENTER FORCE.36": "https://apexlegendsstatus.com/algs/assets/teams/enterforce36.png",
    "Exo Clan": "https://apexlegendsstatus.com/algs/assets/teams/exoclan.png",
    "Cloud9": "https://apexlegendsstatus.com/algs/assets/teams/cloud9.png",
    "100 Thieves": "https://apexlegendsstatus.com/algs/assets/teams/100T.png",
    "OrglessAndHungry": "https://apexlegendsstatus.com/algs/assets/teams/orglessandhungry.png",
    "GaiminGladiators": "https://apexlegendsstatus.com/algs/assets/teams/gaimingladiators.png",
    "CRAZY RACCOON": "https://apexlegendsstatus.com/algs/assets/teams/crazyraccoon.png",
    "AlQadsiahEsports": "https://apexlegendsstatus.com/algs/assets/teams/alqadsiahesports.png",
    "Zero Tenacity (Disbanded)": "https://apexlegendsstatus.com/algs/assets/teams/zerotenacity(disbanded).png",
    "GREEN STEGO": "https://apexlegendsstatus.com/algs/assets/teams/greenstego.png",
    "disguised": "https://apexlegendsstatus.com/algs/assets/teams/disguised.png",
    "GHS Professional": "https://apexlegendsstatus.com/algs/assets/teams/GHS.png",
    "DRAGONS": "https://apexlegendsstatus.com/algs/assets/teams/dragons.png",
    "JD GAMING": "https://apexlegendsstatus.com/algs/assets/teams/jdgaming.png",
    "FaZe": "https://apexlegendsstatus.com/algs/assets/teams/faze.png",
    "STALLIONS": "https://apexlegendsstatus.com/algs/assets/teams/stallions.png",
    "NRG": "https://apexlegendsstatus.com/algs/assets/teams/nrg.png",
    "Ninjas": "https://apexlegendsstatus.com/algs/assets/teams/ninjas.png",
    "REIGNITE": "https://apexlegendsstatus.com/algs/assets/teams/reignite.png",
    "shadow3690": "https://apexlegendsstatus.com/algs/assets/teams/shadow3690.png",
    "Meteor": "https://apexlegendsstatus.com/algs/assets/teams/meteor.png",
    "Supernova": "https://apexlegendsstatus.com/algs/assets/teams/supernova.png",
    "TSM": "https://apexlegendsstatus.com/algs/assets/teams/tsm.png",
    "Team SoloMid": "https://apexlegendsstatus.com/algs/assets/teams/tsm.png",
    "SOURCE XNY": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "Oblivion": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "Team Liquid": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "Complexity (Disbanded)": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "ROC Esports": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "MOVISTAR KOI": "https://apexlegendsstatus.com/algs/assets/teams/fa.png",
    "EDward Gaming": "https://apexlegendsstatus.com/algs/assets/teams/fa.png"
  },

  // Team name mappings for consistency
  teamNameMappings: {
    "ShopifyRebellion": "SR",
    "Shopify Rebellion": "SR",
    "FaZe Clan": "FaZe",
    "Complexity": "Complexity (Disbanded)",
    "100T": "100 Thieves",
    "C9": "Cloud9",
    "TSM": "Team SoloMid",
    "Falcons": "Team Falcons",
    "TEAM FALCONS": "Team Falcons",
    "team falcons": "Team Falcons",
    "100 THIEVES": "100 Thieves",
    "100thieves": "100 Thieves",
    "fnatic": "FNATIC",
    "Fnatic": "FNATIC",
    "nrg": "NRG",
    "Nrg": "NRG",
    "cloud9": "Cloud9",
    "CLOUD9": "Cloud9",
    "virtus.pro": "Virtus.pro",
    "VIRTUS.PRO": "Virtus.pro",
    "VirtusPro": "Virtus.pro",
    "faze": "FaZe",
    "FAZE": "FaZe",
    "Faze": "FaZe",
    "guild": "GUILD",
    "Guild": "GUILD",
    "vk gaming": "VK GAMING",
    "VK Gaming": "VK GAMING"
  }
}

// Image cache for performance
const imageCache = new Map()

export function useTeamConfig() {
  // Reactive state for loaded images
  const loadedImages = ref(new Set())
  
  // Computed properties for better performance
  const teamLogos = computed(() => teamData.logoUrls)
  const teamMappings = computed(() => teamData.teamNameMappings)
  
  /**
   * Get team logo URL with caching
   * @param {string} teamName - Team name
   * @returns {string|null} Logo URL or null
   */
  const getTeamLogo = (teamName) => {
    if (!teamName) return null
    
    // Direct match
    let logoUrl = teamLogos.value[teamName]
    if (logoUrl) return logoUrl
    
    // Mapped name lookup
    const mappedName = teamMappings.value[teamName]
    if (mappedName && teamLogos.value[mappedName]) {
      return teamLogos.value[mappedName]
    }
    
    // Fuzzy match (simplified)
    const normalizedName = teamName.toLowerCase().trim()
    for (const [key, value] of Object.entries(teamLogos.value)) {
      if (key.toLowerCase().includes(normalizedName) || 
          normalizedName.includes(key.toLowerCase())) {
        return value
      }
    }
    
    return null
  }
  
  /**
   * Generate fallback configuration for teams
   * @param {string} teamName - Team name
   * @returns {object} Fallback config
   */
  const getFallbackConfig = (teamName) => {
    if (!teamName) return { backgroundColor: '#6b7280', initials: '??', icon: '❓' }
    
    // Generate color based on team name hash
    const hash = teamName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    
    const colors = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#2563eb', '#7c3aed', '#c2410c']
    const backgroundColor = colors[Math.abs(hash) % colors.length]
    
    // Generate initials
    const words = teamName.split(/\s+/).filter(word => word.length > 0)
    let initials = words.length > 1 
      ? words.slice(0, 2).map(word => word[0].toUpperCase()).join('')
      : teamName.substring(0, 2).toUpperCase()
    
    return {
      backgroundColor,
      initials,
      icon: '🏆'
    }
  }
  
  /**
   * Preload image for better performance
   * @param {string} url - Image URL
   * @returns {Promise<void>}
   */
  const preloadImage = (url) => {
    if (!url || imageCache.has(url)) return Promise.resolve()
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        imageCache.set(url, true)
        loadedImages.value.add(url)
        resolve()
      }
      img.onerror = reject
      img.src = url
    })
  }
  
  /**
   * Preload all team logos
   * @returns {Promise<void>}
   */
  const preloadAllLogos = async () => {
    const urls = Object.values(teamLogos.value).filter(url => url && !url.includes('fa.png'))
    
    try {
      await Promise.allSettled(urls.map(url => preloadImage(url)))
      console.log('✅ Team logos preloaded successfully')
    } catch (error) {
      console.warn('⚠️ Some team logos failed to preload:', error)
    }
  }
  
  /**
   * Get team initials for display
   * @param {string} teamName - Team name
   * @returns {string} Team initials
   */
  const getTeamInitials = (teamName) => {
    return getFallbackConfig(teamName).initials
  }
  
  /**
   * Check if image is loaded
   * @param {string} url - Image URL
   * @returns {boolean} Is loaded
   */
  const isImageLoaded = (url) => {
    return loadedImages.value.has(url)
  }
  
  return {
    // Reactive state
    loadedImages,
    
    // Computed properties
    teamLogos,
    teamMappings,
    
    // Methods
    getTeamLogo,
    getFallbackConfig,
    preloadImage,
    preloadAllLogos,
    getTeamInitials,
    isImageLoaded
  }
}

// Export team configuration for backward compatibility
export { teamData } 