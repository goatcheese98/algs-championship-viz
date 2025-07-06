/**
 * Map Sequences Configuration for ALGS Championship
 * This file centralizes all map sequences for different matchups and tournament stages
 */

const MapSequences = {
    // Group Stage Matchups (6 games each)
    'AvsB': {
        name: 'Groups A vs B',
        gameCount: 6,
        maps: {
            1: 'E-DISTRICT',
            2: 'E-DISTRICT', 
            3: 'STORM POINT',
            4: 'STORM POINT',
            5: 'WORLD\'S EDGE',
            6: 'WORLD\'S EDGE'
        }
    },
    
    'CvsD': {
        name: 'Groups C vs D',
        gameCount: 6,
        maps: {
            1: 'E-DISTRICT',
            2: 'E-DISTRICT',
            3: 'STORM POINT', 
            4: 'STORM POINT',
            5: 'WORLD\'S EDGE',
            6: 'WORLD\'S EDGE'
        }
    },
    
    'BvsD': {
        name: 'Groups B vs D',
        gameCount: 6,
        maps: {
            1: 'STORM POINT',
            2: 'STORM POINT',
            3: 'WORLD\'S EDGE',
            4: 'WORLD\'S EDGE',
            5: 'E-DISTRICT',
            6: 'E-DISTRICT'
        }
    },
    
    'AvsC': {
        name: 'Groups A vs C',
        gameCount: 6,
        maps: {
            1: 'E-DISTRICT',
            2: 'E-DISTRICT',
            3: 'STORM POINT',
            4: 'STORM POINT', 
            5: 'WORLD\'S EDGE',
            6: 'WORLD\'S EDGE'
        }
    },
    
    'BvsC': {
        name: 'Groups B vs C',
        gameCount: 6,
        maps: {
            1: 'STORM POINT',
            2: 'STORM POINT',
            3: 'WORLD\'S EDGE',
            4: 'WORLD\'S EDGE',
            5: 'E-DISTRICT',
            6: 'E-DISTRICT'
        }
    },
    
    'AvsD': {
        name: 'Groups A vs D',
        gameCount: 6,
        maps: {
            1: 'E-DISTRICT',
            2: 'E-DISTRICT',
            3: 'STORM POINT',
            4: 'STORM POINT',
            5: 'WORLD\'S EDGE',
            6: 'WORLD\'S EDGE'
        }
    },
    
    // Bracket Stage Matchups (8 games each)
    'ER1': {
        name: 'Elimination Round 1',
        gameCount: 8,
        maps: {
            1: 'E-DISTRICT',
            2: 'E-DISTRICT',
            3: 'E-DISTRICT',
            4: 'STORM POINT',
            5: 'STORM POINT',
            6: 'WORLD\'S EDGE',
            7: 'WORLD\'S EDGE',
            8: 'WORLD\'S EDGE'
        }
    },
    
    'ER2': {
        name: 'Elimination Round 2',
        gameCount: 8,
        maps: {
            1: 'STORM POINT',
            2: 'STORM POINT',
            3: 'WORLD\'S EDGE',
            4: 'WORLD\'S EDGE',
            5: 'E-DISTRICT',
            6: 'E-DISTRICT',
            7: 'STORM POINT',
            8: 'WORLD\'S EDGE'
        }
    },
    
    'WR1': {
        name: 'Winners Round 1',
        gameCount: 8,
        maps: {
            1: 'WORLD\'S EDGE',
            2: 'WORLD\'S EDGE',
            3: 'E-DISTRICT',
            4: 'E-DISTRICT',
            5: 'STORM POINT',
            6: 'STORM POINT',
            7: 'WORLD\'S EDGE',
            8: 'E-DISTRICT'
        }
    },
    
    // Finals (flexible game count - can be extended)
    'FINALS': {
        name: 'Grand Finals',
        gameCount: 12, // Placeholder - will be dynamic
        maps: {
            1: 'WORLD\'S EDGE',
            2: 'WORLD\'S EDGE',
            3: 'E-DISTRICT',
            4: 'E-DISTRICT',
            5: 'STORM POINT',
            6: 'STORM POINT',
            7: 'WORLD\'S EDGE',
            8: 'E-DISTRICT',
            9: 'STORM POINT',
            10: 'WORLD\'S EDGE',
            11: 'E-DISTRICT',
            12: 'STORM POINT'
        }
    }
};

// Utility functions
const MapSequenceUtils = {
    /**
     * Get map sequence configuration for a matchup
     * @param {string} matchupKey - The matchup identifier (e.g., 'AvsB', 'ER1')
     * @returns {object} - The sequence configuration
     */
    getSequence(matchupKey) {
        return MapSequences[matchupKey] || null;
    },
    
    /**
     * Get all available matchup keys
     * @returns {array} - Array of all matchup keys
     */
    getAllMatchups() {
        return Object.keys(MapSequences);
    },
    
    /**
     * Get map for a specific game in a matchup
     * @param {string} matchupKey - The matchup identifier
     * @param {number} gameNumber - The game number (1-based)
     * @returns {string} - The map name
     */
    getMapForGame(matchupKey, gameNumber) {
        const sequence = this.getSequence(matchupKey);
        if (!sequence) return 'UNKNOWN';
        return sequence.maps[gameNumber] || 'UNKNOWN';
    },
    
    /**
     * Get game count for a matchup
     * @param {string} matchupKey - The matchup identifier
     * @returns {number} - Number of games in the matchup
     */
    getGameCount(matchupKey) {
        const sequence = this.getSequence(matchupKey);
        return sequence ? sequence.gameCount : 6; // Default to 6 games
    },
    
    /**
     * Detect matchup from CSV filename
     * @param {string} filename - CSV filename (e.g., 'AvsB_points.csv')
     * @returns {string} - Matchup key
     */
    detectMatchupFromFilename(filename) {
        const baseName = filename.replace('_points.csv', '').replace('.csv', '');
        
        // Handle special cases
        if (baseName.includes('ER1')) return 'ER1';
        if (baseName.includes('ER2')) return 'ER2';
        if (baseName.includes('WR1')) return 'WR1';
        if (baseName.includes('FINALS')) return 'FINALS';
        
        // Handle group stage matchups
        return baseName.replace(/^[0-9]+\./, ''); // Remove day prefixes like "2."
    },
    
    /**
     * Get dynamic game count from CSV data
     * @param {array} csvData - Parsed CSV data
     * @returns {number} - Actual number of games in the data
     */
    getDynamicGameCount(csvData) {
        if (!csvData || csvData.length === 0) return 6;
        
        const firstRow = csvData[0];
        const gameColumns = Object.keys(firstRow).filter(col => col.startsWith('Game '));
        return gameColumns.length;
    },
    
    /**
     * Generate color palette for any number of games
     * @param {number} gameCount - Number of games
     * @returns {array} - Array of color hex codes
     */
    generateColorPalette(gameCount) {
        const baseColors = [
            '#15616d',  // Teal
            '#3998aa',  // Light Teal
            '#8bbbc4',  // Very Light Teal
            '#ff7d00',  // Orange
            '#ffb366',  // Light Orange
            '#a4243b',  // Dark Red
            '#F07167',  // Light Red
            '#f59189'   // Very Light Red
        ];
        
        // If we need more colors, interpolate
        if (gameCount <= baseColors.length) {
            return baseColors.slice(0, gameCount);
        }
        
        // Generate additional colors by interpolating
        const extraColors = [];
        for (let i = baseColors.length; i < gameCount; i++) {
            const hue = (i * 137.5) % 360; // Golden angle for good distribution
            extraColors.push(`hsl(${hue}, 65%, 55%)`);
        }
        
        return [...baseColors, ...extraColors];
    }
};

// Make available globally
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MapSequences, MapSequenceUtils };
} else {
    window.MapSequences = MapSequences;
    window.MapSequenceUtils = MapSequenceUtils;
} 