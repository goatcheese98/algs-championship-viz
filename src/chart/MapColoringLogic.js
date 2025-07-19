


export const MAP_COLOR_PALETTE = {
    'E-DISTRICT': {
        hue: 240,
        name: 'E-District',
        variations: [
            { saturation: 40, lightness: 50 },
            { saturation: 50, lightness: 50 },
            { saturation: 60, lightness: 50 }
        ]
    },
    'STORM POINT': {
        hue: 20,
        name: 'Storm Point',
        variations: [
            { saturation: 40, lightness: 50 },
            { saturation: 50, lightness: 50 },
            { saturation: 60, lightness: 50 }
        ]
    },
    'WORLD\'S EDGE': {
        hue: 350,
        name: 'World\'s Edge',
        variations: [
            { saturation: 40, lightness: 50 },
            { saturation: 50, lightness: 50 },
            { saturation: 60, lightness: 50 }
        ]
    },
    'BROKEN MOON': {
        hue: 188,
        name: 'Broken Moon',
        variations: [
            { saturation: 40, lightness: 50 },
            { saturation: 50, lightness: 50 },
            { saturation: 60, lightness: 50 }
        ]
    }
};


export const SPECIAL_STATE_COLORS = {
    UNKNOWN: '#6b7280',
    PRE_GAME: '#008000',
    LOADING: '#9ca3af',
    ERROR: '#ef4444'
};

export function createHSLColor(hue, saturation, lightness) {
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

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

export function getAllMapColorVariations(mapName) {
    const mapConfig = MAP_COLOR_PALETTE[mapName];
    if (!mapConfig) {
        return [SPECIAL_STATE_COLORS.UNKNOWN];
    }

    return mapConfig.variations.map(variation => 
        createHSLColor(mapConfig.hue, variation.saturation, variation.lightness)
    );
}

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

 