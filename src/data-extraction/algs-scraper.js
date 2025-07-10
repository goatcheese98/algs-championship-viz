/**
 * ALGS Tournament Data Scraper
 * Extracts tournament data from apexlegendsstatus.com and converts to CSV format
 * Supports Year 5 Open LAN tournament structure
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class ALGSScraper {
    constructor() {
        this.baseUrl = 'https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global';
        this.browser = null;
        this.page = null;
        this.tournamentStructure = {
            'Day1': { rounds: 12, type: 'bracket' },
            'Day2': { rounds: 12, type: 'bracket' },
            'Day3': { rounds: 5, type: 'bracket' },
            'Day4': { rounds: 1, type: 'final' }
        };
    }

    /**
     * Initialize browser and page
     */
    async init() {
        console.log('🚀 Starting ALGS Scraper...');
        this.browser = await puppeteer.launch({
            headless: false, // Set to true for production
            defaultViewport: { width: 1920, height: 1080 },
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        
        // Set user agent to avoid bot detection
        await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        console.log('✅ Browser initialized');
    }

    /**
     * Extract tournament data from a specific round
     */
    async extractRoundData(day, roundName) {
        const url = `${this.baseUrl}/${day}/${roundName}#tab_scores`;
        console.log(`📊 Extracting data from: ${url}`);
        
        try {
            await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Wait for scores tab to load
            await this.page.waitForSelector('#tab_scores', { timeout: 10000 });
            
            // Click on scores tab if not already active
            const scoresTab = await this.page.$('#tab_scores');
            if (scoresTab) {
                await scoresTab.click();
                await this.page.waitForTimeout(2000); // Wait for content to load
            }

            // Wait for the specific score matrix and scores content divs to load
            await this.page.waitForSelector('.score-matrix, #scores-content', { timeout: 10000 });

            // Extract team data using the specific structure described by the user
            const teamData = await this.page.evaluate(() => {
                // Define the calculatePoints function in browser context
                const calculatePoints = (placement, kills) => {
                    // Correct ALGS placement points distribution
                    const placementPoints = {
                        1: 12,   // 1st place
                        2: 9,    // 2nd place
                        3: 7,    // 3rd place
                        4: 5,    // 4th place
                        5: 4,    // 5th place
                        6: 3,    // 6th place
                        7: 3,    // 7th place
                        8: 2,    // 8th place
                        9: 2,    // 9th place
                        10: 2,   // 10th place
                        11: 1,   // 11th place
                        12: 1,   // 12th place
                        13: 1,   // 13th place
                        14: 1,   // 14th place
                        15: 1,   // 15th place
                        // 16th-20th place get 0 points (handled by default)
                    };
                    
                    const basePoints = placementPoints[placement] || 0;
                    const killPoints = kills * 1; // 1 point per kill
                    
                    return basePoints + killPoints;
                };
                
                const teams = [];
                
                // Look for the score-matrix div as mentioned by user
                const scoreMatrix = document.querySelector('.score-matrix');
                const scoresContent = document.querySelector('#scores-content');
                
                if (!scoreMatrix && !scoresContent) {
                    console.warn('Could not find score-matrix or scores-content divs, falling back to generic selectors');
                }
                
                // Try multiple selector patterns for team rows
                const teamRowSelectors = [
                    '.score-matrix tbody tr',
                    '#scores-content tbody tr',
                    'tbody tr[data-team]',
                    'tbody tr',
                    '.team-row'
                ];
                
                let teamRows = [];
                for (const selector of teamRowSelectors) {
                    teamRows = document.querySelectorAll(selector);
                    if (teamRows.length > 0) {
                        console.log(`Found ${teamRows.length} team rows using selector: ${selector}`);
                        break;
                    }
                }

                // Also get the final scores for validation
                const finalScores = {};
                const finalScoreElements = document.querySelectorAll('#scores-content .final-score, .total-score');
                finalScoreElements.forEach(el => {
                    const teamName = el.closest('tr')?.querySelector('.team-name, .team')?.textContent?.trim();
                    const score = parseInt(el.textContent.trim()) || 0;
                    if (teamName) {
                        finalScores[teamName] = score;
                    }
                });
                
                teamRows.forEach((row, index) => {
                    try {
                        // Extract team name with multiple fallback selectors
                        const teamNameSelectors = ['.team-name', '.team', '[data-team-name]', 'td:first-child'];
                        let teamName = '';
                        
                        for (const selector of teamNameSelectors) {
                            const element = row.querySelector(selector);
                            if (element && element.textContent.trim()) {
                                teamName = element.textContent.trim();
                                break;
                            }
                        }
                        
                        if (!teamName || teamName === '') {
                            console.warn(`No team name found for row ${index}`);
                            return;
                        }
                        
                        // Extract game-by-game data with P (placement) and K (kills) columns
                        const gameData = [];
                        
                        // Look for game columns - these should contain P and K values
                        const gameCells = row.querySelectorAll('.game, .game-score, [data-game], td');
                        
                        // Process each game cell to extract P and K values
                        let gameIndex = 0;
                        for (let i = 0; i < gameCells.length; i++) {
                            const cell = gameCells[i];
                            
                            // Skip non-game cells (team name, total score, etc.)
                            if (cell.classList.contains('team-name') || cell.classList.contains('total-score')) {
                                continue;
                            }
                            
                            // Look for P and K values within the cell
                            const pElement = cell.querySelector('.p, .placement, [data-p]');
                            const kElement = cell.querySelector('.k, .kills, [data-k]');
                            
                            // Alternative: look for text patterns like "P: 5, K: 12"
                            const cellText = cell.textContent.trim();
                            
                            let placement = 0;
                            let kills = 0;
                            
                            if (pElement && kElement) {
                                // Direct P and K elements found
                                placement = parseInt(pElement.textContent.trim()) || 0;
                                kills = parseInt(kElement.textContent.trim()) || 0;
                            } else if (cellText.includes('P') && cellText.includes('K')) {
                                // Parse from text like "P: 5, K: 12"
                                const pMatch = cellText.match(/P[:\s]*(\d+)/i);
                                const kMatch = cellText.match(/K[:\s]*(\d+)/i);
                                
                                placement = pMatch ? parseInt(pMatch[1]) : 0;
                                kills = kMatch ? parseInt(kMatch[1]) : 0;
                            } else if (cellText.match(/^\d+$/)) {
                                // Single number - might be total points for this game
                                continue;
                            }
                            
                            if (placement > 0 || kills > 0) {
                                const points = calculatePoints(placement, kills);
                                gameData.push({
                                    game: gameIndex + 1,
                                    placement: placement,
                                    kills: kills,
                                    points: points
                                });
                                gameIndex++;
                            }
                        }
                        
                        // Calculate total score from games
                        const calculatedTotal = gameData.reduce((sum, game) => sum + game.points, 0);
                        
                        // Get the displayed total score for validation
                        const totalScoreElement = row.querySelector('.total-score, .total, .points, .final-score');
                        const displayedTotal = totalScoreElement ? parseInt(totalScoreElement.textContent.trim()) || 0 : 0;
                        
                        // Use final scores from scores-content div if available
                        const validationTotal = finalScores[teamName] || displayedTotal;
                        
                        // Validate calculated vs displayed total
                        if (Math.abs(calculatedTotal - validationTotal) > 1 && validationTotal > 0) {
                            console.warn(`Score mismatch for ${teamName}: calculated ${calculatedTotal}, displayed ${validationTotal}`);
                        }
                        
                        teams.push({
                            name: teamName,
                            totalScore: validationTotal || calculatedTotal,
                            games: gameData,
                            position: index + 1,
                            calculatedTotal: calculatedTotal,
                            displayedTotal: validationTotal,
                            scoreMatch: Math.abs(calculatedTotal - validationTotal) <= 1
                        });
                        
                    } catch (error) {
                        console.warn(`Error parsing team row ${index}:`, error);
                    }
                });
                
                return teams;
            });
            
            // Validate the extracted data
            const validTeams = teamData.filter(team => team.scoreMatch);
            const invalidTeams = teamData.filter(team => !team.scoreMatch);
            
            if (invalidTeams.length > 0) {
                console.warn(`⚠️  Found ${invalidTeams.length} teams with score mismatches:`);
                invalidTeams.forEach(team => {
                    console.warn(`   ${team.name}: calculated ${team.calculatedTotal}, displayed ${team.displayedTotal}`);
                });
            }
            
            console.log(`✅ Extracted ${teamData.length} teams from ${day}/${roundName} (${validTeams.length} with matching scores)`);
            return {
                day: day,
                round: roundName,
                teams: teamData,
                timestamp: new Date().toISOString(),
                validation: {
                    validTeams: validTeams.length,
                    invalidTeams: invalidTeams.length,
                    totalTeams: teamData.length
                }
            };
            
        } catch (error) {
            console.error(`❌ Error extracting data from ${day}/${roundName}:`, error);
            return null;
        }
    }

    /**
     * Calculate ALGS points based on placement and kills
     * Updated to match the correct ALGS scoring system
     */
    calculatePoints(placement, kills) {
        // Correct ALGS placement points distribution
        const placementPoints = {
            1: 12,   // 1st place
            2: 9,    // 2nd place
            3: 7,    // 3rd place
            4: 5,    // 4th place
            5: 4,    // 5th place
            6: 3,    // 6th place
            7: 3,    // 7th place
            8: 2,    // 8th place
            9: 2,    // 9th place
            10: 2,   // 10th place
            11: 1,   // 11th place
            12: 1,   // 12th place
            13: 1,   // 13th place
            14: 1,   // 14th place
            15: 1,   // 15th place
            // 16th-20th place get 0 points (handled by default)
        };
        
        const basePoints = placementPoints[placement] || 0;
        const killPoints = kills * 1; // 1 point per kill
        
        return basePoints + killPoints;
    }

    /**
     * Generate round names based on tournament structure
     */
    generateRoundNames(day) {
        const dayInfo = this.tournamentStructure[day];
        const roundNames = [];
        
        if (day === 'Day4') {
            roundNames.push('Final');
        } else {
            // Generate round names like "WinnersRound1-3", "WinnersRound4-6", etc.
            const roundsPerGroup = 3;
            for (let i = 1; i <= dayInfo.rounds; i += roundsPerGroup) {
                const endRound = Math.min(i + roundsPerGroup - 1, dayInfo.rounds);
                roundNames.push(`WinnersRound${i}-${endRound}`);
            }
        }
        
        return roundNames;
    }

    /**
     * Convert tournament data to CSV format
     */
    async convertToCSV(tournamentData, matchupName) {
        const csvData = [];
        
        // Add header
        const maxGames = Math.max(...tournamentData.teams.map(team => team.games.length));
        const header = ['Team', 'Total'];
        for (let i = 1; i <= maxGames; i++) {
            header.push(`Game${i}`);
        }
        csvData.push(header.join(','));
        
        // Add team data
        tournamentData.teams.forEach(team => {
            const row = [team.name, team.totalScore];
            
            for (let i = 0; i < maxGames; i++) {
                const gameData = team.games[i];
                if (gameData) {
                    row.push(gameData.points);
                } else {
                    row.push(0);
                }
            }
            
            csvData.push(row.join(','));
        });
        
        // Save to file
        const outputDir = path.join(__dirname, '../../public/year5champions');
        await fs.mkdir(outputDir, { recursive: true });
        
        const filename = `${matchupName}_points.csv`;
        const filepath = path.join(outputDir, filename);
        
        await fs.writeFile(filepath, csvData.join('\n'));
        console.log(`✅ CSV saved: ${filepath}`);
        
        return filepath;
    }

    /**
     * Scrape full tournament data
     */
    async scrapeFullTournament() {
        console.log('🏆 Starting full tournament scraping...');
        
        const allData = {};
        
        for (const [day, dayInfo] of Object.entries(this.tournamentStructure)) {
            console.log(`📅 Processing ${day} (${dayInfo.rounds} rounds)`);
            
            const roundNames = this.generateRoundNames(day);
            allData[day] = {};
            
            for (const roundName of roundNames) {
                const roundData = await this.extractRoundData(day, roundName);
                if (roundData) {
                    allData[day][roundName] = roundData;
                    
                    // Convert to CSV
                    const matchupName = `${day}_${roundName}`;
                    await this.convertToCSV(roundData, matchupName);
                    
                    // Small delay to be respectful to the server
                    await this.page.waitForTimeout(2000);
                }
            }
        }
        
        // Save raw JSON data for reference
        const jsonPath = path.join(__dirname, '../../public/year5champions/tournament_data.json');
        await fs.writeFile(jsonPath, JSON.stringify(allData, null, 2));
        console.log(`✅ Raw data saved: ${jsonPath}`);
        
        return allData;
    }

    /**
     * Scrape specific matchup
     */
    async scrapeMatchup(day, roundName) {
        console.log(`🎯 Scraping specific matchup: ${day}/${roundName}`);
        
        const roundData = await this.extractRoundData(day, roundName);
        if (roundData) {
            const matchupName = `${day}_${roundName}`;
            await this.convertToCSV(roundData, matchupName);
            return roundData;
        }
        
        return null;
    }

    /**
     * Close browser and cleanup
     */
    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('✅ Browser closed');
        }
    }
}

// CLI Interface
async function main() {
    const scraper = new ALGSScraper();
    
    try {
        await scraper.init();
        
        // Check command line arguments
        const args = process.argv.slice(2);
        
        if (args.length === 0) {
            // Scrape full tournament
            console.log('🔄 No specific arguments provided, scraping full tournament...');
            await scraper.scrapeFullTournament();
        } else if (args.length === 2) {
            // Scrape specific matchup
            const [day, roundName] = args;
            console.log(`🔄 Scraping specific matchup: ${day}/${roundName}`);
            await scraper.scrapeMatchup(day, roundName);
        } else {
            console.log('❌ Usage: node algs-scraper.js [day] [roundName]');
            console.log('   Example: node algs-scraper.js Day1 WinnersRound1-3');
            console.log('   Or run without arguments to scrape full tournament');
        }
        
    } catch (error) {
        console.error('❌ Scraping failed:', error);
    } finally {
        await scraper.close();
    }
}

// Export for use in other modules
module.exports = ALGSScraper;

// Run if called directly
if (require.main === module) {
    main();
} 