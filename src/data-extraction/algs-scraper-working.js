/**
 * Fixed ALGS Scraper with correct table structure parsing
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;

// ALGS placement points distribution
const placementPoints = {
    1: 12, 2: 9, 3: 7, 4: 5, 5: 4, 6: 3, 7: 3, 8: 2, 9: 2, 10: 2,
    11: 1, 12: 1, 13: 1, 14: 1, 15: 1
    // 16th-20th place get 0 points (handled by default)
};

function calculatePoints(placement, kills) {
    const basePoints = placementPoints[placement] || 0;
    const killPoints = kills * 1; // 1 point per kill
    return basePoints + killPoints;
}

async function scrapeALGSData() {
    console.log('🚀 Starting Fixed ALGS Data Scraper');
    
    let browser = null;
    try {
        // Launch browser
        console.log('🌐 Launching browser...');
        browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Navigate to test URL
        const testUrl = 'https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/WinnersRound1-1#tab_scores';
        console.log(`📊 Navigating to: ${testUrl}`);
        
        await page.goto(testUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForTimeout(3000);
        
        // Wait for score matrix
        await page.waitForSelector('.score-matrix', { timeout: 10000 });
        
        // Extract data with correct parsing
        console.log('📊 Extracting tournament data...');
        const tournamentData = await page.evaluate(() => {
            // Define calculatePoints function inside the browser context
            const placementPoints = {
                1: 12, 2: 9, 3: 7, 4: 5, 5: 4, 6: 3, 7: 3, 8: 2, 9: 2, 10: 2,
                11: 1, 12: 1, 13: 1, 14: 1, 15: 1
            };
            
            function calculatePoints(placement, kills) {
                const basePoints = placementPoints[placement] || 0;
                const killPoints = kills * 1;
                return basePoints + killPoints;
            }
            
            const scoreMatrix = document.querySelector('.score-matrix');
            if (!scoreMatrix) return null;
            
            const rows = scoreMatrix.querySelectorAll('tr');
            const teams = [];
            
            // Skip header row and any empty rows
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const cells = row.querySelectorAll('td');
                
                if (cells.length < 3) continue; // Skip rows with insufficient data
                
                // Parse team data according to correct structure:
                // Cell 0: Rank, Cell 1: Team name, Cell 2: Total score
                // Cell 3+: Game data in P, K, P, K, P, K pattern
                
                const teamRank = cells[0].textContent.trim();
                const teamName = cells[1].textContent.trim();
                const totalScore = parseInt(cells[2].textContent.trim()) || 0;
                
                if (!teamName) continue;
                
                const teamData = {
                    rank: teamRank,
                    name: teamName,
                    expectedTotal: totalScore,
                    games: [],
                    calculatedTotal: 0
                };
                
                // Parse game data starting from cell 3
                // Pattern: P, K, P, K, P, K, P, K, P, K, P, K
                let gameIndex = 0;
                for (let j = 3; j < cells.length; j += 2) {
                    if (j + 1 >= cells.length) break;
                    
                    const placement = parseInt(cells[j].textContent.trim()) || 0;
                    const kills = parseInt(cells[j + 1].textContent.trim()) || 0;
                    
                    if (placement > 0 || kills > 0) {
                        gameIndex++;
                        const gamePoints = calculatePoints(placement, kills);
                        
                        teamData.games.push({
                            game: gameIndex,
                            placement: placement,
                            kills: kills,
                            points: gamePoints
                        });
                        
                        teamData.calculatedTotal += gamePoints;
                    }
                }
                
                teams.push(teamData);
            }
            
            return teams;
        });
        
        if (!tournamentData || tournamentData.length === 0) {
            console.log('❌ No tournament data extracted');
            return;
        }
        
        console.log(`✅ Extracted data for ${tournamentData.length} teams`);
        
        // Display sample data with verification
        console.log('\n📋 Sample Team Data with Verification:');
        tournamentData.slice(0, 5).forEach((team, index) => {
            const difference = team.calculatedTotal - team.expectedTotal;
            const status = difference === 0 ? '✅' : '❌';
            
            console.log(`\n${index + 1}. ${team.name} (Rank: ${team.rank})`);
            console.log(`   Expected: ${team.expectedTotal} | Calculated: ${team.calculatedTotal} | Diff: ${difference} ${status}`);
            
            team.games.forEach(game => {
                console.log(`   Game ${game.game}: ${game.placement}th place, ${game.kills} kills = ${game.points} points`);
            });
        });
        
        // Verification summary
        let perfectMatches = 0;
        let totalMismatches = 0;
        
        tournamentData.forEach(team => {
            if (team.calculatedTotal === team.expectedTotal) {
                perfectMatches++;
            } else {
                totalMismatches++;
            }
        });
        
        console.log(`\n📊 Verification Summary: ${perfectMatches} perfect matches, ${totalMismatches} mismatches`);
        
        // Only proceed if we have good data
        if (perfectMatches === 0 && totalMismatches > 0) {
            console.log('⚠️  Warning: No perfect matches found. There may be a parsing issue.');
        }
        
        // Convert to CSV format
        console.log('\n📝 Converting to CSV format...');
        const csvLines = ['Team,Rank,Game,Placement,Kills,Points'];
        
        tournamentData.forEach(team => {
            team.games.forEach(game => {
                csvLines.push(`${team.name},${team.rank},${game.game},${game.placement},${game.kills},${game.points}`);
            });
        });
        
        const csvContent = csvLines.join('\n');
        
        // Save to file
        const outputPath = '../../public/year5champions/raw/Day1-WinnersRound1-1-fixed.csv';
        await fs.writeFile(outputPath, csvContent, 'utf8');
        console.log(`✅ Data saved to: ${outputPath}`);
        
        // Save summary with verification
        const summaryLines = ['Team,Rank,ExpectedTotal,CalculatedTotal,Difference,Status'];
        tournamentData.forEach(team => {
            const difference = team.calculatedTotal - team.expectedTotal;
            const status = difference === 0 ? 'MATCH' : 'MISMATCH';
            summaryLines.push(`${team.name},${team.rank},${team.expectedTotal},${team.calculatedTotal},${difference},${status}`);
        });
        
        const summaryPath = '../../public/year5champions/processed/Day1-WinnersRound1-1-summary-fixed.csv';
        await fs.writeFile(summaryPath, summaryLines.join('\n'), 'utf8');
        console.log(`✅ Summary saved to: ${summaryPath}`);
        
        console.log('\n🎉 Fixed scraping completed successfully!');
        
    } catch (error) {
        console.error('❌ Scraping failed:', error.message);
        console.error(error.stack);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the scraper
scrapeALGSData().catch(console.error); 