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
     * Extract map rotations and legend ban metadata from Replays and Bans tab
     * @param {string} url - Full URL to the tournament round with #tab_replaysandbans
     * @returns {Object} Metadata including maps, bans, and round info
     */
    async extractMetadata(url) {
        console.log(`🎮 Extracting metadata from: ${url}`);
        
        try {
            // Ensure we're going to the replays and bans tab
            const metadataUrl = url.includes('#tab_replaysandbans') ? url : `${url}#tab_replaysandbans`;
            
            await this.page.goto(metadataUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Wait for the replays and bans tab content to load
            await this.page.waitForSelector('.replay-banner_content, #tab_replaysandbans', { timeout: 15000 });
            
            // Click on replays and bans tab if not already active
            const replaysTab = await this.page.$('#tab_replaysandbans, [data-tab="replaysandbans"]');
            if (replaysTab) {
                await replaysTab.click();
                await this.page.waitForTimeout(3000); // Wait for content to load
            }

            // Extract metadata using the structure described by the user
            const metadata = await this.page.evaluate(() => {
                const extractedData = {
                    roundInfo: {
                        url: window.location.href,
                        timestamp: new Date().toISOString(),
                        roundName: '',
                        totalGames: 0
                    },
                    games: [],
                    mapRotation: [],
                    legendBans: []
                };

                // Find all replay-banner_content containers
                const replayContainers = document.querySelectorAll('.replay-banner_content');
                console.log(`Found ${replayContainers.length} replay containers`);

                if (replayContainers.length === 0) {
                    console.warn('No replay-banner_content containers found');
                    return extractedData;
                }

                // Process each replay container (games are in descending order, earliest at bottom)
                const containersArray = Array.from(replayContainers).reverse(); // Reverse to get chronological order
                
                containersArray.forEach((container, index) => {
                    try {
                        // Extract game title and map info from replay-banner_title
                        const titleElement = container.querySelector('.replay-banner_title');
                        if (!titleElement) {
                            console.warn(`No title element found in container ${index}`);
                            return;
                        }

                        const titleText = titleElement.textContent.trim();
                        console.log(`Processing title: ${titleText}`);

                        // Parse title format: "Winners R. 1 #5 - Game #1 - Storm Point"
                        const titleMatch = titleText.match(/(.+?)\s*-\s*Game\s*#(\d+)\s*-\s*(.+)/i);
                        
                        let roundName = '';
                        let gameNumber = 0;
                        let mapName = '';

                        if (titleMatch) {
                            roundName = titleMatch[1].trim();
                            gameNumber = parseInt(titleMatch[2]);
                            mapName = titleMatch[3].trim();
                        } else {
                            // Fallback parsing
                            const parts = titleText.split('-').map(part => part.trim());
                            if (parts.length >= 3) {
                                roundName = parts[0];
                                const gameMatch = parts[1].match(/Game\s*#(\d+)/i);
                                gameNumber = gameMatch ? parseInt(gameMatch[1]) : index + 1;
                                mapName = parts[2];
                            }
                        }

                        // Set round info from first game
                        if (index === 0 && roundName) {
                            extractedData.roundInfo.roundName = roundName;
                        }

                        // Extract legend ban information - improved logic
                        const banDiv = container.querySelector('.replay-banner_ban-div');
                        let bannedLegend = '';
                        let legendLogoUrl = '';

                        if (banDiv) {
                            // Extract text from the legend text element
                            const banTextElement = banDiv.querySelector('.replay-banner_ban-div_legend-text');
                            if (banTextElement) {
                                // Get inner HTML to handle <br> tags properly
                                const banHTML = banTextElement.innerHTML;
                                const banText = banHTML.replace(/<br\s*\/?>/gi, ' ').replace(/&nbsp;/g, ' ').trim();
                                
                                console.log(`Raw ban text: "${banText}"`);
                                
                                // Parse different formats: "Ban: Crypto", "Ban:Crypto", "Crypto", etc.
                                const banMatch = banText.match(/(?:Ban\s*:\s*)?(.+)/i);
                                if (banMatch && banMatch[1]) {
                                    bannedLegend = banMatch[1].trim();
                                    console.log(`Extracted banned legend: "${bannedLegend}"`);
                                }
                            }

                            // Extract image URL from the legend image element
                            const banImageElement = banDiv.querySelector('.replay-banner_ban-div_legend-image');
                            if (banImageElement) {
                                legendLogoUrl = banImageElement.getAttribute('src');
                                console.log(`Raw image URL: "${legendLogoUrl}"`);
                                
                                // Convert relative URLs to absolute
                                if (legendLogoUrl && legendLogoUrl.startsWith('/')) {
                                    legendLogoUrl = `https://apexlegendsstatus.com${legendLogoUrl}`;
                                    console.log(`Full image URL: "${legendLogoUrl}"`);
                                }
                            }

                            // Debug: Log what we found
                            if (!banTextElement && !banImageElement) {
                                console.warn(`No ban elements found in container ${index}`);
                                console.log('Available selectors in ban div:', banDiv.innerHTML.substring(0, 200));
                            }
                        } else {
                            console.log(`No replay-banner_ban-div found in container ${index} - likely no legend bans for this game`);
                            
                            // Only try very specific fallback selectors to avoid false matches
                            const fallbackTextElement = container.querySelector('.replay-banner_ban-div_legend-text, .legend-ban-text, .ban-legend-text');
                            const fallbackImageElement = container.querySelector('.replay-banner_ban-div_legend-image, .legend-ban-image, .ban-legend-image');
                            
                            if (fallbackTextElement) {
                                const fallbackText = fallbackTextElement.innerHTML.replace(/<br\s*\/?>/gi, ' ').replace(/&nbsp;/g, ' ').trim();
                                // Only extract if it actually contains "Ban:" to avoid false matches
                                if (fallbackText.toLowerCase().includes('ban:')) {
                                    const fallbackMatch = fallbackText.match(/Ban\s*:\s*(.+)/i);
                                    if (fallbackMatch && fallbackMatch[1]) {
                                        bannedLegend = fallbackMatch[1].trim();
                                        console.log(`Fallback extracted legend: "${bannedLegend}"`);
                                    }
                                }
                            }
                            
                            if (fallbackImageElement && fallbackImageElement.getAttribute('src')?.includes('legend')) {
                                legendLogoUrl = fallbackImageElement.getAttribute('src');
                                if (legendLogoUrl && legendLogoUrl.startsWith('/')) {
                                    legendLogoUrl = `https://apexlegendsstatus.com${legendLogoUrl}`;
                                }
                                console.log(`Fallback extracted image: "${legendLogoUrl}"`);
                            }
                        }

                        // Create game entry
                        const gameEntry = {
                            gameNumber: gameNumber,
                            mapName: mapName,
                            bannedLegend: (bannedLegend && bannedLegend.trim() && !bannedLegend.includes('<')) ? bannedLegend : '',
                            legendLogoUrl: legendLogoUrl || '',
                            titleText: titleText,
                            containerIndex: index
                        };

                        extractedData.games.push(gameEntry);

                        // Add to map rotation (unique maps in order)
                        if (mapName && !extractedData.mapRotation.find(m => m.map === mapName && m.gameNumber === gameNumber)) {
                            extractedData.mapRotation.push({
                                gameNumber: gameNumber,
                                map: mapName
                            });
                        }

                        // Add to legend bans only if we actually found a banned legend
                        if (bannedLegend && bannedLegend.trim() && !bannedLegend.includes('<')) {
                            extractedData.legendBans.push({
                                gameNumber: gameNumber,
                                legend: bannedLegend,
                                logoUrl: legendLogoUrl
                            });
                        }

                    } catch (error) {
                        console.error(`Error processing container ${index}:`, error);
                    }
                });

                // Sort data by game number
                extractedData.games.sort((a, b) => a.gameNumber - b.gameNumber);
                extractedData.mapRotation.sort((a, b) => a.gameNumber - b.gameNumber);
                extractedData.legendBans.sort((a, b) => a.gameNumber - b.gameNumber);

                // Set total games
                extractedData.roundInfo.totalGames = extractedData.games.length;

                return extractedData;
            });

            console.log(`✅ Extracted metadata for ${metadata.roundInfo.totalGames} games`);
            console.log(`📍 Maps found: ${metadata.mapRotation.map(m => `Game ${m.gameNumber}: ${m.map}`).join(', ')}`);
            
            if (metadata.legendBans.length > 0) {
                console.log(`🚫 Bans found: ${metadata.legendBans.map(b => `Game ${b.gameNumber}: ${b.legend}`).join(', ')}`);
            } else {
                console.log(`🚫 No legend bans found in this tournament round`);
            }

            return metadata;

        } catch (error) {
            console.error('❌ Error extracting metadata:', error.message);
            throw error;
        }
    }

    /**
     * Save metadata to JSON file in processed folder
     */
    async saveMetadata(metadata, filename) {
        try {
            const outputDir = path.join(__dirname, '../../public/year5champions/processed');
            
            // Ensure output directory exists
            await fs.mkdir(outputDir, { recursive: true });

            // Generate filename if not provided
            if (!filename) {
                const roundName = metadata.roundInfo.roundName
                    .replace(/[^a-zA-Z0-9]/g, '-')
                    .replace(/-+/g, '-')
                    .replace(/^-|-$/g, '');
                filename = `${roundName}-metadata.json`;
            }

            const outputPath = path.join(outputDir, filename);
            
            // Add processing timestamp
            metadata.processingInfo = {
                extractedAt: new Date().toISOString(),
                filename: filename,
                version: '1.0'
            };

            await fs.writeFile(outputPath, JSON.stringify(metadata, null, 2));
            console.log(`💾 Metadata saved to: ${outputPath}`);
            
            return outputPath;
        } catch (error) {
            console.error('❌ Error saving metadata:', error.message);
            throw error;
        }
    }

    /**
     * Extract metadata from a single tournament URL
     */
    async extractSingleMetadata(url) {
        try {
            if (!this.browser) {
                await this.init();
            }

            const metadata = await this.extractMetadata(url);
            const savedPath = await this.saveMetadata(metadata);

            return {
                success: true,
                metadata: metadata,
                savedPath: savedPath,
                summary: {
                    roundName: metadata.roundInfo.roundName,
                    totalGames: metadata.roundInfo.totalGames,
                    maps: metadata.mapRotation.length,
                    bans: metadata.legendBans.length
                }
            };
        } catch (error) {
            console.error('❌ Error in extractSingleMetadata:', error.message);
            return {
                success: false,
                error: error.message,
                metadata: null
            };
        }
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