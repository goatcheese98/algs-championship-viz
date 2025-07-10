const fs = require('fs');
const path = require('path');

/**
 * Converts detailed game-by-game data to bifurcated format
 * Input: Team,Rank,Game,Placement,Kills,Points (multiple rows per team)
 * Output: Team,Game 1 P,Game 1 K,Game 2 P,Game 2 K,...,Overall Points
 */
function convertToBifurcatedFormat(inputCsvPath, outputCsvPath) {
    console.log(`Converting ${inputCsvPath} to bifurcated format...`);
    
    // Read the input CSV
    const csvContent = fs.readFileSync(inputCsvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    const header = lines[0].split(',');
    
    // Parse the data
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
        const points = parseInt(row[5]);
        
        // Calculate placement points using ALGS scoring
        const placementPoints = calculatePlacementPoints(placement);
        const killPoints = kills; // 1 point per kill
        
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
            total: points
        };
        
        teamData[team].totalPoints += points;
        gameNumbers.add(game);
    }
    
    // Sort game numbers
    const sortedGameNumbers = Array.from(gameNumbers).sort((a, b) => a - b);
    
    // Create header for bifurcated format
    const bifurcatedHeader = ['Team'];
    for (const gameNum of sortedGameNumbers) {
        bifurcatedHeader.push(`Game ${gameNum} P`);
        bifurcatedHeader.push(`Game ${gameNum} K`);
    }
    bifurcatedHeader.push('Overall Points');
    
    // Convert to bifurcated format
    const outputLines = [bifurcatedHeader.join(',')];
    
    // Sort teams by rank
    const sortedTeams = Object.entries(teamData).sort((a, b) => a[1].rank - b[1].rank);
    
    for (const [team, data] of sortedTeams) {
        const row = [team];
        
        // Add placement and kill points for each game
        for (const gameNum of sortedGameNumbers) {
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
        outputLines.push(row.join(','));
    }
    
    // Write the output file
    fs.writeFileSync(outputCsvPath, outputLines.join('\n'));
    console.log(`✅ Bifurcated format created: ${outputCsvPath}`);
    console.log(`   📊 ${sortedTeams.length} teams, ${sortedGameNumbers.length} games`);
    console.log(`   🏆 Winner: ${sortedTeams[0][0]} (${sortedTeams[0][1].totalPoints} points)`);
    
    return {
        teams: sortedTeams.length,
        games: sortedGameNumbers.length,
        winner: sortedTeams[0][0],
        totalPoints: sortedTeams[0][1].totalPoints
    };
}

/**
 * Calculate placement points using ALGS scoring system
 */
function calculatePlacementPoints(placement) {
    if (placement === 1) return 12;
    if (placement === 2) return 9;
    if (placement === 3) return 7;
    if (placement === 4) return 5;
    if (placement === 5) return 4;
    if (placement >= 6 && placement <= 7) return 3;
    if (placement >= 8 && placement <= 10) return 2;
    if (placement >= 11 && placement <= 15) return 1;
    return 0; // 16th-20th place
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length !== 2) {
        console.log('Usage: node create-bifurcated-format.js <input-csv> <output-csv>');
        console.log('Example: node create-bifurcated-format.js "../public/year5champions/raw/Day1-WinnersRound1-3-fixed.csv" "../public/year5champions/processed/Day1-WinnersRound1-3-bifurcated.csv"');
        process.exit(1);
    }
    
    const inputPath = args[0];
    const outputPath = args[1];
    
    try {
        convertToBifurcatedFormat(inputPath, outputPath);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

module.exports = { convertToBifurcatedFormat }; 