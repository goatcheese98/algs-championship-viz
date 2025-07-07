/**
 * ALGS Team Configuration and Logo Management
 * Extracted from Team.md with cleaned URLs and fallback handling
 */

const TeamConfig = {
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
        
        // Additional teams from CSV data (using fallback URL for teams without specific logos)
        "TSM": "https://apexlegendsstatus.com/algs/assets/teams/tsm.png",
        "Team SoloMid": "https://apexlegendsstatus.com/algs/assets/teams/tsm.png",
        "SOURCE XNY": "https://apexlegendsstatus.com/algs/assets/teams/fa.png", // Using fallback URL
        "Oblivion": "https://apexlegendsstatus.com/algs/assets/teams/fa.png", // Using fallback URL
        "Team Liquid": "https://apexlegendsstatus.com/algs/assets/teams/fa.png", // Using fallback URL
        "Complexity (Disbanded)": "https://apexlegendsstatus.com/algs/assets/teams/fa.png", // Using fallback URL
        "ROC Esports": "https://apexlegendsstatus.com/algs/assets/teams/fa.png", // Using fallback URL
        "MOVISTAR KOI": "https://apexlegendsstatus.com/algs/assets/teams/fa.png", // Using fallback URL
        "EDward Gaming": "https://apexlegendsstatus.com/algs/assets/teams/fa.png" // Using fallback URL
    },

    // Teams with missing/broken logos that need fallbacks
    missingLogos: [
        "Complexity (Disbanded)",
        "ROC Esports", 
        "Team Liquid",
        "MOVISTAR KOI",
        "EDward Gaming"
    ],

    // Alternative team name mappings for data consistency
    teamNameMappings: {
        // CSV name -> TeamConfig name mappings
        "ShopifyRebellion": "SR",
        "Shopify Rebellion": "SR", 
        "FaZe Clan": "FaZe",
        "Complexity": "Complexity (Disbanded)",
        "100T": "100 Thieves",
        "C9": "Cloud9",
        "TSM": "Team SoloMid",
        "Team Falcons": "Falcons",
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
        "VK Gaming": "VK GAMING",
        "green stego": "GREEN STEGO",
        "Green Stego": "GREEN STEGO",
        "GREEN Stego": "GREEN STEGO",
        "crazy raccoon": "CRAZY RACCOON",
        "Crazy Raccoon": "CRAZY RACCOON",
        "CRAZYRACCOON": "CRAZY RACCOON",
        "enter force.36": "ENTER FORCE.36",
        "ENTER FORCE 36": "ENTER FORCE.36",
        "enterforce36": "ENTER FORCE.36",
        "exo clan": "Exo Clan",
        "EXO CLAN": "Exo Clan",
        "ExoClan": "Exo Clan",
        "orglessandhungry": "OrglessAndHungry",
        "ORGLESSANDHUNGRY": "OrglessAndHungry",
        "Orgless And Hungry": "OrglessAndHungry",
        "gaimin gladiators": "GaiminGladiators",
        "GAIMIN GLADIATORS": "GaiminGladiators",
        "Gaimin Gladiators": "GaiminGladiators",
        "gaimingladiators": "GaiminGladiators",
        "alqadsiahesports": "AlQadsiahEsports",
        "AlQadsiah Esports": "AlQadsiahEsports",
        "AL QADSIAH ESPORTS": "AlQadsiahEsports",
        "zero tenacity": "Zero Tenacity (Disbanded)",
        "Zero Tenacity": "Zero Tenacity (Disbanded)",
        "ZERO TENACITY": "Zero Tenacity (Disbanded)",
        "ghs professional": "GHS Professional",
        "GHS PROFESSIONAL": "GHS Professional",
        "Ghs Professional": "GHS Professional",
        "jd gaming": "JD GAMING",
        "JD Gaming": "JD GAMING",
        "JDGaming": "JD GAMING",
        "reignite": "REIGNITE",
        "Reignite": "REIGNITE",
        "stallions": "STALLIONS",
        "Stallions": "STALLIONS",
        "ninjas": "Ninjas",
        "NINJAS": "Ninjas",
        "meteor": "Meteor",
        "METEOR": "Meteor",
        "supernova": "Supernova",
        "SUPERNOVA": "Supernova",
        "Super Nova": "Supernova",
        "aurora": "Aurora",
        "AURORA": "Aurora",
        "alliance": "Alliance",
        "ALLIANCE": "Alliance",
        "noctem": "Noctem",
        "NOCTEM": "Noctem",
        "gonext": "GoNext",
        "GONEXT": "GoNext",
        "Go Next": "GoNext",
        "furia": "FURIA",
        "Furia": "FURIA",
        "envy": "Envy",
        "ENVY": "Envy",
        "lg": "LG",
        "Lg": "LG",
        "team liquid": "Team Liquid",
        "TEAM LIQUID": "Team Liquid",
        "TeamLiquid": "Team Liquid",
        "liquid": "Team Liquid",
        "LIQUID": "Team Liquid",
        "edward gaming": "EDward Gaming",
        "EDWARD GAMING": "EDward Gaming",
        "EDGaming": "EDward Gaming",
        "roc esports": "ROC Esports",
        "ROC ESPORTS": "ROC Esports",
        "RocEsports": "ROC Esports",
        "movistar koi": "MOVISTAR KOI",
        "MOVISTAR KOI": "MOVISTAR KOI",
        "MovistarKoi": "MOVISTAR KOI"
    },

    /**
     * Get logo URL for a team with enhanced flexible matching
     * @param {string} teamName - The team name
     * @param {boolean} usePreload - Whether to preload the image
     * @returns {string} - Logo URL or null for fallback
     */
    getTeamLogo(teamName, usePreload = true) {
        if (!teamName) return null;
        
        console.log(`🔍 Looking up logo for team: "${teamName}"`);
        
        // Strategy 1: Direct exact match
        let logoUrl = this.logoUrls[teamName];
        if (logoUrl !== undefined) {
            console.log(`✅ Direct match found for "${teamName}":`, logoUrl);
            if (logoUrl && usePreload) this.preloadImage(logoUrl);
            return logoUrl;
        }
        
        // Strategy 2: Mapped name lookup
        const mappedName = this.teamNameMappings[teamName];
        if (mappedName && this.logoUrls[mappedName] !== undefined) {
            console.log(`✅ Mapped match: "${teamName}" -> "${mappedName}":`, this.logoUrls[mappedName]);
            logoUrl = this.logoUrls[mappedName];
            if (logoUrl && usePreload) this.preloadImage(logoUrl);
            return logoUrl;
        }
        
        // Strategy 3: Enhanced fuzzy matching
        const fuzzyMatch = this.findFuzzyMatch(teamName);
        if (fuzzyMatch) {
            logoUrl = this.logoUrls[fuzzyMatch];
            console.log(`✅ Fuzzy match: "${teamName}" -> "${fuzzyMatch}":`, logoUrl);
            if (logoUrl && usePreload) this.preloadImage(logoUrl);
            return logoUrl;
        }
        
        // Strategy 4: Reverse mapping lookup (if teamName is actually a mapped value)
        for (const [key, value] of Object.entries(this.teamNameMappings)) {
            if (value.toLowerCase() === teamName.toLowerCase()) {
                logoUrl = this.logoUrls[value];
                if (logoUrl !== undefined) {
                    console.log(`✅ Reverse mapping: "${teamName}" found as mapping value:`, logoUrl);
                    if (logoUrl && usePreload) this.preloadImage(logoUrl);
                    return logoUrl;
                }
            }
        }
        
        console.log(`❌ No logo found for team: "${teamName}", using fallback URL`);
        return "https://apexlegendsstatus.com/algs/assets/teams/fa.png"; // Fallback URL for all teams without logos
    },

    /**
     * Enhanced fuzzy matching for team names (handles typos, case differences, formatting)
     * @param {string} teamName - The team name to match
     * @returns {string|null} - Best matching team name or null
     */
    findFuzzyMatch(teamName) {
        const normalizedInput = teamName.toLowerCase().trim();
        const teamNames = Object.keys(this.logoUrls);
        
        // Helper function to normalize strings for comparison
        const normalize = (str) => str.toLowerCase()
            .replace(/[^a-z0-9]/g, '') // Remove special chars
            .replace(/\s+/g, ''); // Remove spaces
        
        // Strategy 1: Exact case-insensitive match
        for (const name of teamNames) {
            if (name.toLowerCase() === normalizedInput) {
                return name;
            }
        }
        
        // Strategy 2: Normalized exact match (remove special chars)
        const normalizedInputClean = normalize(teamName);
        for (const name of teamNames) {
            if (normalize(name) === normalizedInputClean && normalizedInputClean.length > 2) {
                return name;
            }
        }
        
        // Strategy 3: Contains match (both directions)
        for (const name of teamNames) {
            const nameLower = name.toLowerCase();
            
            // Input contained in team name (e.g., "TSM" matches "TSM FTX")
            if (normalizedInput.length >= 3 && nameLower.includes(normalizedInput)) {
                return name;
            }
            
            // Team name contained in input (e.g., "FaZe" matches "FaZe Clan")
            if (nameLower.length >= 3 && normalizedInput.includes(nameLower)) {
                return name;
            }
        }
        
        // Strategy 4: Word-by-word matching (handle multi-word team names)
        const inputWords = teamName.toLowerCase().split(/[\s\-\.\_]+/).filter(w => w.length > 1);
        
        for (const name of teamNames) {
            const nameWords = name.toLowerCase().split(/[\s\-\.\_]+/).filter(w => w.length > 1);
            
            // Check if any significant words match
            const matchingWords = inputWords.filter(inputWord => 
                nameWords.some(nameWord => 
                    nameWord.includes(inputWord) || inputWord.includes(nameWord)
                )
            );
            
            // If more than half the words match, consider it a match
            if (matchingWords.length >= Math.ceil(inputWords.length / 2) && matchingWords.length > 0) {
                return name;
            }
        }
        
        // Strategy 5: Acronym matching (e.g., "VK" matches "VK GAMING")
        if (normalizedInput.length <= 5) { // Only for short inputs (likely acronyms)
            for (const name of teamNames) {
                const words = name.split(/[\s\-\.\_]+/).filter(w => w.length > 0);
                if (words.length > 1) {
                    const acronym = words.map(w => w[0]).join('').toLowerCase();
                    if (acronym === normalizedInput) {
                        return name;
                    }
                }
            }
        }
        
        return null;
    },

    /**
     * Preload image for faster rendering
     * @param {string} url - Image URL to preload
     */
    preloadImage(url) {
        if (!this.preloadedImages) {
            this.preloadedImages = new Set();
        }
        
        if (!this.preloadedImages.has(url)) {
            const img = new Image();
            img.src = url;
            this.preloadedImages.add(url);
        }
    },

    /**
     * Get fallback logo configuration for teams without logos
     * @param {string} teamName - The team name
     * @returns {object} - Fallback configuration
     */
    getFallbackConfig(teamName) {
        // Generate color based on team name hash
        const hash = this.hashString(teamName);
        const hue = hash % 360;
        
        return {
            backgroundColor: `hsl(${hue}, 65%, 45%)`,
            textColor: '#ffffff',
            icon: this.getTeamIcon(teamName),
            initials: this.getTeamInitials(teamName)
        };
    },

    /**
     * Get team initials for fallback display
     * @param {string} teamName - The team name
     * @returns {string} - Team initials (1-3 characters)
     */
    getTeamInitials(teamName) {
        const words = teamName.split(/[\s\-\.]+/).filter(word => word.length > 0);
        
        if (words.length === 1) {
            // Single word - take first 2-3 characters
            return words[0].substring(0, 3).toUpperCase();
        } else {
            // Multiple words - take first letter of each (max 3)
            return words.slice(0, 3).map(word => word[0]).join('').toUpperCase();
        }
    },

    /**
     * Get appropriate icon for team based on name
     * @param {string} teamName - The team name
     * @returns {string} - Unicode icon
     */
    getTeamIcon(teamName) {
        const name = teamName.toLowerCase();
        
        if (name.includes('dragon')) return '🐉';
        if (name.includes('falcon')) return '🦅';
        if (name.includes('lion') || name.includes('king')) return '🦁';
        if (name.includes('wolf')) return '🐺';
        if (name.includes('tiger')) return '🐅';
        if (name.includes('bear')) return '🐻';
        if (name.includes('phoenix')) return '🔥';
        if (name.includes('storm')) return '⚡';
        if (name.includes('ice') || name.includes('frost')) return '❄️';
        if (name.includes('star') || name.includes('nova')) return '⭐';
        if (name.includes('shadow')) return '🌑';
        if (name.includes('ghost')) return '👻';
        if (name.includes('ninja')) return '🥷';
        if (name.includes('samurai')) return '⚔️';
        if (name.includes('knight')) return '🛡️';
        if (name.includes('royal') || name.includes('crown')) return '👑';
        
        return '🏆'; // Default trophy icon
    },

    /**
     * Simple string hash function for consistent color generation
     * @param {string} str - String to hash
     * @returns {number} - Hash value
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    },

    /**
     * Batch preload all available team logos
     * @returns {Promise} - Resolves when all images are loaded or failed
     */
    async preloadAllLogos() {
        const logoUrls = Object.values(this.logoUrls);
        const promises = logoUrls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve({ url, success: true });
                img.onerror = () => resolve({ url, success: false });
                img.src = url;
            });
        });
        
        const results = await Promise.all(promises);
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success);
        
        console.log(`📊 Team logos preloaded: ${successful}/${logoUrls.length} successful`);
        if (failed.length > 0) {
            console.warn('⚠️ Failed to load logos:', failed.map(f => f.url));
        }
        
        return results;
    }
};

// Make available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TeamConfig;
} else {
    window.TeamConfig = TeamConfig;
} 