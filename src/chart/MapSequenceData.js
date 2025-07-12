/**
 * MapSequenceData - Central repository for all tournament map sequences
 * Contains map rotations for both Year 4 Championship and Year 5 Open tournaments
 */

export const MAP_SEQUENCES = {
    // ========================================
    // YEAR 4 CHAMPIONSHIP TOURNAMENT MAP SEQUENCES
    // ========================================
    
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

    // ========================================
    // YEAR 5 OPEN TOURNAMENT MAP SEQUENCES
    // ========================================
    // All Year 5 rounds use consistent rotation pattern (6 games)
    // E-District (2) → Storm Point (2) → World's Edge (2)
    
    'Day1-WinnersRound1-1': {
        name: 'Day 1 - Winners Round 1 #1',
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

    'Day1-WinnersRound1-2': {
        name: 'Day 1 - Winners Round 1 #2',
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

    'Day1-WinnersRound1-3': {
        name: 'Day 1 - Winners Round 1 #3',
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

    'Day1-WinnersRound1-4': {
        name: 'Day 1 - Winners Round 1 #4',
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

    'Day1-WinnersRound1-5': {
        name: 'Day 1 - Winners Round 1 #5',
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

    'Day1-WinnersRound1-6': {
        name: 'Day 1 - Winners Round 1 #6',
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

    'Day1-WinnersRound1-7': {
        name: 'Day 1 - Winners Round 1 #7',
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

    'Day1-WinnersRound1-8': {
        name: 'Day 1 - Winners Round 1 #8',
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

    'Day1-WinnersRound2-3': {
        name: 'Day 1 - Winners Round 2 #3',
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

    'Day1-WinnersRound2-4': {
        name: 'Day 1 - Winners Round 2 #4',
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

    'Day1-EliminationRound1-3': {
        name: 'Day 1 - Elimination Round 1 #3',
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

    'Day1-EliminationRound1-4': {
        name: 'Day 1 - Elimination Round 1 #4',
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

    // Day 2 Sequences
    'Day2-WinnersRound2-1': {
        name: 'Day 2 - Winners Round 2 #1',
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

    'Day2-WinnersRound2-2': {
        name: 'Day 2 - Winners Round 2 #2',
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

    'Day2-WinnersRound3-1': {
        name: 'Day 2 - Winners Round 3 #1',
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

    'Day2-WinnersRound3-2': {
        name: 'Day 2 - Winners Round 3 #2',
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

    'Day2-EliminationRound1-1': {
        name: 'Day 2 - Elimination Round 1 #1',
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

    'Day2-EliminationRound1-2': {
        name: 'Day 2 - Elimination Round 1 #2',
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

    'Day2-EliminationRound2-1': {
        name: 'Day 2 - Elimination Round 2 #1',
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

    'Day2-EliminationRound2-2': {
        name: 'Day 2 - Elimination Round 2 #2',
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

    'Day2-EliminationRound2-3': {
        name: 'Day 2 - Elimination Round 2 #3',
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

    'Day2-EliminationRound2-4': {
        name: 'Day 2 - Elimination Round 2 #4',
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

    'Day2-EliminationRound3-1': {
        name: 'Day 2 - Elimination Round 3 #1',
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

    'Day2-EliminationRound3-2': {
        name: 'Day 2 - Elimination Round 3 #2',
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

    // ========================================
    // EWC 2025 TOURNAMENT MAP SEQUENCES
    // ========================================
    
    'Day1-A': {
        name: 'EWC 2025 Day 1 - Group A',
        gameCount: 'auto', // Dynamic based on CSV data
        maps: {
            1: 'WORLD\'S EDGE',
            2: 'WORLD\'S EDGE',
            3: 'E-DISTRICT',
            4: 'E-DISTRICT',
            5: 'E-DISTRICT',
            6: 'STORM POINT',
            7: 'STORM POINT',
            8: 'STORM POINT',
            9: 'BROKEN MOON',
            10: 'BROKEN MOON'
        }
    },

    'Day2-B': {
        name: 'EWC 2025 Day 2 - Group B',
        gameCount: 'auto', // Dynamic based on CSV data
        maps: {
            1: 'WORLD\'S EDGE',
            2: 'WORLD\'S EDGE',
            3: 'E-DISTRICT',
            4: 'E-DISTRICT',
            5: 'E-DISTRICT',
            6: 'STORM POINT',
            7: 'STORM POINT',
            8: 'STORM POINT',
            9: 'BROKEN MOON',
            10: 'BROKEN MOON'
        }
    },

    'Day3-LastChance': {
        name: 'EWC 2025 Day 3 - Last Chance',
        gameCount: 'auto', // Dynamic based on CSV data
        maps: {
            1: 'BROKEN MOON',
            2: 'BROKEN MOON',
            3: 'BROKEN MOON',
            4: 'E-DISTRICT',
            5: 'E-DISTRICT',
            6: 'E-DISTRICT',
            7: 'STORM POINT',
            8: 'STORM POINT',
            9: 'STORM POINT',
            10: 'STORM POINT'
        }
    }
}

/**
 * Get map sequence information for a specific matchup
 * @param {string} matchupId - The matchup identifier
 * @returns {Object|null} Map sequence data or null if not found
 */
export function getMapSequence(matchupId) {
    return MAP_SEQUENCES[matchupId] || null;
}

/**
 * Get all available matchup IDs
 * @returns {string[]} Array of matchup IDs
 */
export function getAllMatchupIds() {
    return Object.keys(MAP_SEQUENCES);
}

/**
 * Check if a matchup ID is valid
 * @param {string} matchupId - The matchup identifier
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidMatchup(matchupId) {
    return MAP_SEQUENCES.hasOwnProperty(matchupId);
}

/**
 * Get matchups by tournament type
 * @param {string} tournamentType - 'year4', 'year5', or 'ewc2025'
 * @returns {Object} Filtered map sequences
 */
export function getMatchupsByTournament(tournamentType) {
    const filtered = {};
    
    Object.keys(MAP_SEQUENCES).forEach(matchupId => {
        const isEwc2025 = matchupId.startsWith('Day1-A') || matchupId.startsWith('Day2-B');
        const isYear5 = matchupId.startsWith('Day') && !isEwc2025;
        const isYear4 = !matchupId.startsWith('Day') && !isEwc2025;
        
        if ((tournamentType === 'year5' && isYear5) || 
            (tournamentType === 'year4' && isYear4) ||
            (tournamentType === 'ewc2025' && isEwc2025)) {
            filtered[matchupId] = MAP_SEQUENCES[matchupId];
        }
    });
    
    return filtered;
} 