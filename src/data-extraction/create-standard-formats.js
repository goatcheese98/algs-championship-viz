const fs = require('fs');
const path = require('path');

/**
 * Converts detailed Year 5 data to both standard formats
 * Creates both simple and bifurcated formats for tournament data
 */
class StandardFormatConverter {
    constructor() {
        this.placementPoints = {
            1: 12, 2: 9, 3: 7, 4: 5, 5: 4,
            6: 3, 7: 3, 8: 2, 9: 2, 10: 2,
            11: 1, 12: 1, 13: 1, 14: 1, 15: 1
        };
    }

    /**
     * Calculate placement points using ALGS scoring system
     */
    calculatePlacementPoints(placement) {
        return this.placementPoints[placement] || 0;
    }

    /**
     * Parse raw tournament data
     */
    parseRawData(csvContent) {
        const lines = csvContent.trim().split('\n');
        const teamData = {};
        const gameNumbers = new Set();
        
        // Process each line (skip header)
        for (let i = 1; i < lines.length; i++) {
            const row = lines[i].split(',');
            const team = row[0];
            const rank = parseInt(row[1]);
            const game = parseInt(row[2]);
            const placement = parseInt(row[3]);
            const kills = parseInt(row[4]);
            const totalPoints = parseInt(row[5]);
            
            // Calculate placement and kill points
            const placementPoints = this.calculatePlacementPoints(placement);
            const killPoints = kills;
            
            if (!teamData[team]) {
                teamData[team] = {
                    rank: rank,
                    games: {},
                    totalPoints: 0
                };
            }
            
            teamData[team].games[game] = {
                placement: placementPoints,
                kills: killPoints,
                total: totalPoints
            };
            
            teamData[team].totalPoints += totalPoints;
            gameNumbers.add(game);
        }
        
        return {
            teamData,
            gameNumbers: Array.from(gameNumbers).sort((a, b) => a - b)
        };
    }

    /**
     * Generate simple format: Team,Game 1,Game 2,...,Overall Points
     */
    generateSimpleFormat(teamData, gameNumbers) {
        const header = ['Team', ...gameNumbers.map(g => `Game ${g}`), 'Overall Points'];
        const sortedTeams = Object.entries(teamData).sort((a, b) => a[1].rank - b[1].rank);
        
        const lines = [header.join(',')];
        
        for (const [team, data] of sortedTeams) {
            const row = [team];
            
            // Add total points for each game
            for (const gameNum of gameNumbers) {
                const gameData = data.games[gameNum];
                row.push(gameData ? gameData.total : 0);
            }
            
            row.push(data.totalPoints);
            lines.push(row.join(','));
        }
        
        return lines.join('\n');
    }

    /**
     * Generate bifurcated format: Team,Game 1 P,Game 1 K,Game 2 P,Game 2 K,...,Overall Points
     */
    generateBifurcatedFormat(teamData, gameNumbers) {
        const header = ['Team'];
        for (const gameNum of gameNumbers) {
            header.push(`Game ${gameNum} P`);
            header.push(`Game ${gameNum} K`);
        }
        header.push('Overall Points');
        
        const sortedTeams = Object.entries(teamData).sort((a, b) => a[1].rank - b[1].rank);
        const lines = [header.join(',')];
        
        for (const [team, data] of sortedTeams) {
            const row = [team];
            
            // Add placement and kill points for each game
            for (const gameNum of gameNumbers) {
                const gameData = data.games[gameNum];
                if (gameData) {
                    row.push(gameData.placement);
                    row.push(gameData.kills);
                } else {
                    row.push(0); // No placement points
                    row.push(0); // No kill points
                }
            }
            
            row.push(data.totalPoints);
            lines.push(row.join(','));
        }
        
        return lines.join('\n');
    }

    /**
     * Convert a single file to both standard formats
     */
    convertFile(inputPath, outputDir, baseName) {
        console.log(`🔄 Converting ${inputPath}...`);
        
        // Read and parse the input file
        const csvContent = fs.readFileSync(inputPath, 'utf-8');
        const { teamData, gameNumbers } = this.parseRawData(csvContent);
        
        // Generate both formats
        const simpleFormat = this.generateSimpleFormat(teamData, gameNumbers);
        const bifurcatedFormat = this.generateBifurcatedFormat(teamData, gameNumbers);
        
        // Create output paths
        const simpleOutputPath = path.join(outputDir, `${baseName}-simple.csv`);
        const bifurcatedOutputPath = path.join(outputDir, `${baseName}-bifurcated.csv`);
        
        // Write files
        fs.writeFileSync(simpleOutputPath, simpleFormat);
        fs.writeFileSync(bifurcatedOutputPath, bifurcatedFormat);
        
        // Get stats
        const sortedTeams = Object.entries(teamData).sort((a, b) => a[1].rank - b[1].rank);
        const winner = sortedTeams[0];
        
        console.log(`✅ ${baseName} conversion complete:`);
        console.log(`   📊 ${sortedTeams.length} teams, ${gameNumbers.length} games`);
        console.log(`   🏆 Winner: ${winner[0]} (${winner[1].totalPoints} points)`);
        console.log(`   📁 Simple: ${simpleOutputPath}`);
        console.log(`   📁 Bifurcated: ${bifurcatedOutputPath}`);
        
        return {
            simple: simpleOutputPath,
            bifurcated: bifurcatedOutputPath,
            stats: {
                teams: sortedTeams.length,
                games: gameNumbers.length,
                winner: winner[0],
                winnerPoints: winner[1].totalPoints
            }
        };
    }

    /**
     * Convert all files in a directory
     */
    convertDirectory(inputDir, outputDir) {
        console.log(`🔄 Converting all files in ${inputDir}...\\n`);
        
        const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.csv'));
        const results = [];
        
        for (const file of files) {
            const inputPath = path.join(inputDir, file);
            const baseName = file.replace('.csv', '');
            
            try {
                const result = this.convertFile(inputPath, outputDir, baseName);
                results.push(result);
                console.log('');
            } catch (error) {
                console.error(`❌ Error converting ${file}:`, error.message);
            }
        }
        
        console.log(`\\n📊 Conversion Summary:`);
        console.log(`   ✅ ${results.length} files converted successfully`);
        console.log(`   📁 Output directory: ${outputDir}`);
        
        return results;
    }
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const converter = new StandardFormatConverter();
    
    if (args.length === 0) {
        console.log('Usage:');
        console.log('  Single file: node create-standard-formats.js <input-file> [output-dir] [base-name]');
        console.log('  Directory:   node create-standard-formats.js --dir <input-dir> <output-dir>');
        console.log('');
        console.log('Examples:');
        console.log('  node create-standard-formats.js "raw/Day1-WinnersRound1-3-fixed.csv" "processed" "Day1-WinnersRound1-3"');
        console.log('  node create-standard-formats.js --dir "raw" "processed"');
        process.exit(1);
    }
    
    try {
        if (args[0] === '--dir') {
            // Directory mode
            const inputDir = args[1];
            const outputDir = args[2];
            converter.convertDirectory(inputDir, outputDir);
        } else {
            // Single file mode
            const inputPath = args[0];
            const outputDir = args[1] || path.dirname(inputPath);
            const baseName = args[2] || path.basename(inputPath, '.csv');
            converter.convertFile(inputPath, outputDir, baseName);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

module.exports = StandardFormatConverter; 