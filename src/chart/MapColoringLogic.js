/**
 * MapColoringLogic - Centralized map coloring system using HSL color scheme
 * Handles occurrence-based coloring for tournament maps
 */

/**
 * Base HSL color palette for tournament maps
 * Each map has a base hue with variations for different occurrences
 */
export const MAP_COLOR_PALETTE = {
    'E-DISTRICT': {
        hue: 240,        // Blue
        name: 'E-District',
        variations: [
            { saturation: 40, lightness: 50 },  // 1st occurrence
            { saturation: 50, lightness: 50 },  // 2nd occurrence
            { saturation: 60, lightness: 50 }   // 3rd+ occurrence
        ]
    },
    'STORM POINT': {
        hue: 20,         // Orange
        name: 'Storm Point',
        variations: [
            { saturation: 40, lightness: 50 },  // 1st occurrence
            { saturation: 50, lightness: 50 },  // 2nd occurrence
            { saturation: 60, lightness: 50 }   // 3rd+ occurrence
        ]
    },
    'WORLD\'S EDGE': {
        hue: 350,        // Red
        name: 'World\'s Edge',
        variations: [
            { saturation: 40, lightness: 50 },  // 1st occurrence
            { saturation: 50, lightness: 50 },  // 2nd occurrence
            { saturation: 60, lightness: 50 }   // 3rd+ occurrence
        ]
    },
    'BROKEN MOON': {
        hue: 188,         // Yellow-green
        name: 'Broken Moon',
        variations: [
            { saturation: 40, lightness: 50 },  // 1st occurrence
            { saturation: 50, lightness: 50 },  // 2nd occurrence
            { saturation: 60, lightness: 50 }   // 3rd+ occurrence
        ]
    }
};

/**
 * Special state colors for non-map scenarios
 */
export const SPECIAL_STATE_COLORS = {
    UNKNOWN: '#6b7280',     // Gray for unknown maps
    PRE_GAME: '#008000',    // Green for pre-game state
    LOADING: '#9ca3af',     // Light gray for loading states
    ERROR: '#ef4444'        // Red for error states
};

/**
 * Generate HSL color string from components
 * @param {number} hue - Hue value (0-360)
 * @param {number} saturation - Saturation percentage (0-100)
 * @param {number} lightness - Lightness percentage (0-100)
 * @returns {string} HSL color string
 */
export function createHSLColor(hue, saturation, lightness) {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get base color for a map (first occurrence)
 * @param {string} mapName - Name of the map
 * @returns {string} CSS color string
 */
export function getBaseMapColor(mapName) {
    if (!mapName || mapName === 'Unknown') {
        return SPECIAL_STATE_COLORS.UNKNOWN;
    }

    if (mapName === 'Pre-Game') {
        return SPECIAL_STATE_COLORS.PRE_GAME;
    }

    const mapConfig = MAP_COLOR_PALETTE[mapName];
    if (!mapConfig) {
        return SPECIAL_STATE_COLORS.UNKNOWN;
    }

    const firstVariation = mapConfig.variations[0];
    return createHSLColor(mapConfig.hue, firstVariation.saturation, firstVariation.lightness);
}

/**
 * Get color for a map based on its occurrence count
 * @param {string} mapName - Name of the map
 * @param {number} occurrenceCount - Which occurrence this is (1st, 2nd, 3rd+)
 * @returns {string} CSS color string
 */
export function getMapColorByOccurrence(mapName, occurrenceCount) {
    if (!mapName || mapName === 'Unknown') {
        return SPECIAL_STATE_COLORS.UNKNOWN;
    }

    if (mapName === 'Pre-Game') {
        return SPECIAL_STATE_COLORS.PRE_GAME;
    }

    const mapConfig = MAP_COLOR_PALETTE[mapName];
    if (!mapConfig) {
        return SPECIAL_STATE_COLORS.UNKNOWN;
    }

    // Ensure occurrence count is valid
    if (!occurrenceCount || occurrenceCount < 1) {
        occurrenceCount = 1;
    }

    // Get the appropriate variation (1st, 2nd, or 3rd+ occurrence)
    const variationIndex = Math.min(occurrenceCount - 1, mapConfig.variations.length - 1);
    const variation = mapConfig.variations[variationIndex];

    return createHSLColor(mapConfig.hue, variation.saturation, variation.lightness);
}

/**
 * Calculate map occurrence up to a specific game
 * @param {string} mapName - Name of the map to count
 * @param {number} gameNumber - Game number to count up to
 * @param {Object} mapSequence - Map sequence data with game-to-map mapping
 * @returns {number} Number of times the map has occurred up to this game
 */
export function calculateMapOccurrence(mapName, gameNumber, mapSequence) {
    if (!mapSequence || !mapSequence.maps) {
        return 1; // Default to first occurrence
    }

    let occurrenceCount = 0;
    for (let i = 1; i <= gameNumber; i++) {
        if (mapSequence.maps[i] === mapName) {
            occurrenceCount++;
        }
    }

    return Math.max(1, occurrenceCount); // Ensure at least 1
}

/**
 * Get comprehensive map color information
 * @param {string} mapName - Name of the map
 * @param {number} gameNumber - Game number (optional)
 * @param {Object} mapSequence - Map sequence data (optional)
 * @returns {Object} Color information object
 */
export function getMapColorInfo(mapName, gameNumber = null, mapSequence = null) {
    const baseColor = getBaseMapColor(mapName);
    
    if (gameNumber && mapSequence) {
        const occurrenceCount = calculateMapOccurrence(mapName, gameNumber, mapSequence);
        const occurrenceColor = getMapColorByOccurrence(mapName, occurrenceCount);
        
        return {
            mapName,
            gameNumber,
            occurrenceCount,
            baseColor,
            occurrenceColor,
            isSpecialState: !MAP_COLOR_PALETTE[mapName],
            colorInfo: MAP_COLOR_PALETTE[mapName] || null
        };
    }

    return {
        mapName,
        gameNumber: null,
        occurrenceCount: 1,
        baseColor,
        occurrenceColor: baseColor,
        isSpecialState: !MAP_COLOR_PALETTE[mapName],
        colorInfo: MAP_COLOR_PALETTE[mapName] || null
    };
}

/**
 * Get all available map colors for a specific map
 * @param {string} mapName - Name of the map
 * @returns {string[]} Array of all color variations for the map
 */
export function getAllMapColorVariations(mapName) {
    const mapConfig = MAP_COLOR_PALETTE[mapName];
    if (!mapConfig) {
        return [SPECIAL_STATE_COLORS.UNKNOWN];
    }

    return mapConfig.variations.map(variation => 
        createHSLColor(mapConfig.hue, variation.saturation, variation.lightness)
    );
}

/**
 * Get color palette summary for UI display
 * @returns {Object} Summary of all available colors
 */
export function getColorPaletteSummary() {
    const summary = {
        maps: {},
        specialStates: SPECIAL_STATE_COLORS,
        totalMaps: Object.keys(MAP_COLOR_PALETTE).length,
        totalVariations: 0
    };

    Object.keys(MAP_COLOR_PALETTE).forEach(mapName => {
        const mapConfig = MAP_COLOR_PALETTE[mapName];
        const colors = getAllMapColorVariations(mapName);
        
        summary.maps[mapName] = {
            name: mapConfig.name,
            hue: mapConfig.hue,
            colors: colors,
            variationCount: colors.length
        };
        
        summary.totalVariations += colors.length;
    });

    return summary;
}

/**
 * Validate map color configuration
 * @param {string} mapName - Name of the map to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateMapColorConfig(mapName) {
    const mapConfig = MAP_COLOR_PALETTE[mapName];
    if (!mapConfig) {
        return false;
    }

    // Check required properties
    if (typeof mapConfig.hue !== 'number' || 
        mapConfig.hue < 0 || 
        mapConfig.hue > 360) {
        return false;
    }

    if (!Array.isArray(mapConfig.variations) || 
        mapConfig.variations.length === 0) {
        return false;
    }

    // Check each variation
    return mapConfig.variations.every(variation => 
        typeof variation.saturation === 'number' &&
        typeof variation.lightness === 'number' &&
        variation.saturation >= 0 && variation.saturation <= 100 &&
        variation.lightness >= 0 && variation.lightness <= 100
    );
} 