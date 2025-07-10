const fs = require('fs');
const path = require('path');

/**
 * Converts detailed game-by-game data to Year 4 summary format
 * Input: Team,Rank,Game,Placement,Kills,Points (multiple rows per team)
 * Output: Team,Game 1,Game 2,Game 3,Game 4,Game 5,Game 6,Overall Points (one row per team)
 */
function convertToYear4Format(inputCsvPath, outputCsvPath) {
    console.log(`Converting ${inputCsvPath} to Year 4 format...`);
    
    // Read the input CSV
    const csvContent = fs.readFileSync(inputCsvPath, 'utf-8');
    const lines = csvContent.trim().split('\n');
    const header = lines[0].split(',');
    
    // Parse the data
    const teamData = {};
    const gameNumbers = new Set();
    
    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
        const [team, rank, game, placement, kills, points] = lines[i].split(',');
        const gameNum = parseInt(game);
        const pointsNum = parseInt(points);
        
        // Track game numbers
        gameNumbers.add(gameNum);
        
        // Initialize team data if not exists
        if (!teamData[team]) {
            teamData[team] = {
                rank: parseInt(rank),
                games: {},
                totalPoints: 0
            };
        }
        
        // Store game points
        teamData[team].games[gameNum] = pointsNum;
        teamData[team].totalPoints += pointsNum;
    }
    
    // Get sorted game numbers
    const sortedGames = Array.from(gameNumbers).sort((a, b) => a - b);
    const maxGames = Math.max(...sortedGames);
    
    // Create output header
    const outputHeader = ['Team'];
    for (let i = 1; i <= maxGames; i++) {
        outputHeader.push(`Game ${i}`);
    }
    outputHeader.push('Overall Points');
    
    // Create output rows
    const outputRows = [outputHeader.join(',')];
    
    // Sort teams by rank
    const sortedTeams = Object.entries(teamData)
        .sort(([, a], [, b]) => a.rank - b.rank);
    
    // Generate output rows
    for (const [teamName, data] of sortedTeams) {
        const row = [teamName];
        
        // Add game points (0 if game not played)
        for (let i = 1; i <= maxGames; i++) {
            row.push(data.games[i] || 0);
        }
        
        // Add total points
        row.push(data.totalPoints);
        
        outputRows.push(row.join(','));
    }
    
    // Write output file
    fs.writeFileSync(outputCsvPath, outputRows.join('\n'));
    
    console.log(`✅ Conversion complete! Output saved to: ${outputCsvPath}`);
    console.log(`📊 Converted ${sortedTeams.length} teams with ${maxGames} games each`);
    
    return {
        teamsCount: sortedTeams.length,
        gamesCount: maxGames,
        outputPath: outputCsvPath
    };
}

/**
 * Batch convert all files in a directory
 */
function convertAllFiles(inputDir, outputDir, suffix = '-summary') {
    console.log(`🔄 Converting all CSV files in ${inputDir} to Year 4 format...`);
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const files = fs.readdirSync(inputDir);
    const csvFiles = files.filter(file => file.endsWith('.csv'));
    
    const results = [];
    
    for (const file of csvFiles) {
        const inputPath = path.join(inputDir, file);
        const outputFileName = file.replace('.csv', `${suffix}.csv`);
        const outputPath = path.join(outputDir, outputFileName);
        
        try {
            const result = convertToYear4Format(inputPath, outputPath);
            results.push({ file, ...result });
        } catch (error) {
            console.error(`❌ Error converting ${file}:`, error.message);
        }
    }
    
    console.log(`\n📈 Batch conversion complete! Converted ${results.length} files.`);
    return results;
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
Usage: node format-converter.js [options]

Options:
  <input-file> <output-file>     Convert single file
  --batch <input-dir> <output-dir>  Convert all CSV files in directory
  --help                         Show this help

Examples:
  node format-converter.js raw/Day1-WinnersRound1-3-fixed.csv processed/Day1-WinnersRound1-3-year4-format.csv
  node format-converter.js --batch raw/ processed/
        `);
        process.exit(0);
    }
    
    if (args[0] === '--batch') {
        const inputDir = args[1] || '../public/year5champions/raw';
        const outputDir = args[2] || '../public/year5champions/processed';
        convertAllFiles(inputDir, outputDir);
    } else if (args[0] === '--help') {
        console.log('Help text shown above');
    } else {
        const inputFile = args[0];
        const outputFile = args[1];
        
        if (!inputFile || !outputFile) {
            console.error('❌ Please provide both input and output file paths');
            process.exit(1);
        }
        
        convertToYear4Format(inputFile, outputFile);
    }
}

module.exports = {
    convertToYear4Format,
    convertAllFiles
}; 