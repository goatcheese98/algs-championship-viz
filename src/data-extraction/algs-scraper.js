const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class ALGSScraper {
    constructor() {
        this.initialized = false;
        this.browser = null;
        this.selectedFolder = 'year5champions'; // Default folder
    }

    // Placement to points conversion
    getPlacementPoints(placement) {
        const placementInt = parseInt(placement);
        if (placementInt === 1) return 12;
        if (placementInt === 2) return 9;
        if (placementInt === 3) return 7;
        if (placementInt === 4) return 5;
        if (placementInt === 5) return 4;
        if (placementInt >= 6 && placementInt <= 7) return 3;
        if (placementInt >= 8 && placementInt <= 10) return 2;
        if (placementInt >= 11 && placementInt <= 15) return 1;
        if (placementInt >= 16 && placementInt <= 20) return 0;
        return 0; // Default for invalid placement
    }

    async init() {
        console.log('🔧 Initializing ALGS Scraper...');
        
        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.initialized = true;
            console.log('✅ ALGS Scraper initialized with Puppeteer');
        } catch (error) {
            console.error('❌ Failed to initialize ALGS Scraper:', error);
            throw error;
        }
    }

    setSelectedFolder(folder) {
        this.selectedFolder = folder;
        console.log(`📁 Selected folder set to: ${folder}`);
    }

    async processURL(url) {
        if (!this.initialized) {
            await this.init();
        }

        const page = await this.browser.newPage();
        
        try {
            // Set user agent to avoid being blocked
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            console.log(`🌐 Navigating to: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            // Wait for the page to load
            await page.waitForTimeout(3000);
            
            console.log('🔍 Extracting team data using dual validation approach...');
            
            // Extract data using dual approach with validation
            const extractedData = await page.evaluate(() => {
                console.log('Starting dual extraction approach...');
                
                // Step 1: Extract from score-table_inner divs for validation
                const scoreTableEntries = [];
                const scoreTableInnerDivs = document.querySelectorAll('.score-table_inner');
                
                console.log(`Found ${scoreTableInnerDivs.length} score-table_inner divs`);
                
                for (let div of scoreTableInnerDivs) {
                    const rankElement = div.querySelector('.rank-number');
                    const teamNameElement = div.querySelector('.team-name');
                    const teamScoreElement = div.querySelector('.team-score');
                    const teamKillsElement = div.querySelector('.team-kills');
                    
                    if (rankElement && teamNameElement && teamScoreElement && teamKillsElement) {
                        const rank = parseInt(rankElement.textContent.trim());
                        const teamName = teamNameElement.textContent.trim();
                        const totalScore = parseInt(teamScoreElement.textContent.trim());
                        const totalKills = parseInt(teamKillsElement.textContent.trim());
                        
                        if (teamName && !isNaN(rank) && !isNaN(totalScore) && !isNaN(totalKills)) {
                            scoreTableEntries.push({
                                rank: rank,
                                team: teamName,
                                totalScore: totalScore,
                                totalKills: totalKills
                            });
                        }
                    }
                }
                
                console.log(`Extracted ${scoreTableEntries.length} teams from score table`);
                
                // Step 2: Extract from score matrix table
                const scoreMatrixData = [];
                const tables = document.querySelectorAll('table');
                let targetTable = null;
                
                // Find the score matrix table
                for (let table of tables) {
                    const headers = table.querySelectorAll('th');
                    const headerTexts = Array.from(headers).map(h => h.textContent.trim().toLowerCase());
                    
                    // Look for score matrix characteristics
                    if (headerTexts.some(h => h.includes('game')) && 
                        headerTexts.some(h => h.includes('total') || h.includes('score'))) {
                        targetTable = table;
                        console.log('Found score matrix table');
                        break;
                    }
                }
                
                if (!targetTable) {
                    // Fallback: look for any table with reasonable structure
                    for (let table of tables) {
                        const rows = table.querySelectorAll('tbody tr');
                        if (rows.length >= 10) { // Assume tournament has at least 10 teams
                            targetTable = table;
                            console.log('Using fallback table selection');
                            break;
                        }
                    }
                }
                
                if (targetTable) {
                    const rows = targetTable.querySelectorAll('tbody tr');
                    console.log(`Processing ${rows.length} rows from score matrix`);
                    
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows[i];
                        const cells = row.querySelectorAll('td');
                        
                        if (cells.length < 5) continue; // Need at least rank, team, score, and some game data
                        
                        // Extract all cell data
                        const rowData = [];
                        for (let cell of cells) {
                            let cellText = cell.textContent.trim();
                            // Clean up team names - remove extra whitespace and team info
                            if (cell.querySelector('.team-name') || cell.querySelector('img[alt*="logo"]')) {
                                const teamNameElement = cell.querySelector('.team-name') || cell;
                                cellText = teamNameElement.textContent.trim();
                            }
                            rowData.push(cellText);
                        }
                        
                        // Try to extract team data - be flexible with column positions
                        let rank = null;
                        let teamName = null;
                        let totalScore = null;
                        let gameData = [];
                        
                        // First cell is usually rank
                        if (/^\d+$/.test(rowData[0])) {
                            rank = parseInt(rowData[0]);
                        }
                        
                        // Look for team name in first few columns
                        for (let j = 1; j < Math.min(4, rowData.length); j++) {
                            const cellValue = rowData[j];
                            // Team name: not a number, has reasonable length, not empty
                            if (cellValue && 
                                cellValue.length > 1 && 
                                !/^\d+$/.test(cellValue) && 
                                !cellValue.toLowerCase().includes('total') &&
                                !cellValue.toLowerCase().includes('score')) {
                                teamName = cellValue;
                                break;
                            }
                        }
                        
                        // Look for total score in first few columns
                        for (let j = 1; j < Math.min(5, rowData.length); j++) {
                            const cellValue = rowData[j];
                            if (/^\d+$/.test(cellValue)) {
                                const numValue = parseInt(cellValue);
                                // Total score is usually between 0-500 for tournaments
                                if (numValue >= 0 && numValue <= 500) {
                                    totalScore = numValue;
                                    break;
                                }
                            }
                        }
                        
                        // Extract game data (P/K pairs) - skip first few columns that contain rank/team/score
                        let gameDataStartIndex = 3;
                        for (let j = gameDataStartIndex; j < rowData.length; j += 2) {
                            if (j + 1 < rowData.length) {
                                const placement = rowData[j];
                                const kills = rowData[j + 1];
                                
                                // Validate placement and kills are numbers
                                if (/^\d+$/.test(placement) && /^\d+$/.test(kills)) {
                                    const placementInt = parseInt(placement);
                                    const killsInt = parseInt(kills);
                                    
                                    // Reasonable ranges for placement (1-20) and kills (0-30)
                                    if (placementInt >= 1 && placementInt <= 20 && 
                                        killsInt >= 0 && killsInt <= 30) {
                                        gameData.push({
                                            placement: placementInt,
                                            kills: killsInt
                                        });
                                    }
                                }
                            }
                        }
                        
                        // Only include if we have valid team data
                        if (teamName && rank && gameData.length > 0) {
                            scoreMatrixData.push({
                                rank: rank,
                                team: teamName,
                                totalScore: totalScore || 0,
                                games: gameData
                            });
                        }
                    }
                }
                
                console.log(`Extracted ${scoreMatrixData.length} teams from score matrix`);
                
                // Step 3: Cross-validate and merge data
                const finalData = [];
                const processedTeams = new Set();
                
                // First, process teams found in both sources
                for (let scoreEntry of scoreTableEntries) {
                    const matrixEntry = scoreMatrixData.find(m => 
                        m.team.toLowerCase() === scoreEntry.team.toLowerCase() ||
                        m.team.toLowerCase().includes(scoreEntry.team.toLowerCase()) ||
                        scoreEntry.team.toLowerCase().includes(m.team.toLowerCase())
                    );
                    
                    if (matrixEntry) {
                        // Validate total scores match (allow small discrepancies)
                        const scoreDiff = Math.abs(matrixEntry.totalScore - scoreEntry.totalScore);
                        if (scoreDiff <= 2) { // Allow small calculation differences
                            finalData.push({
                                rank: scoreEntry.rank,
                                team: scoreEntry.team,
                                totalScore: scoreEntry.totalScore,
                                totalKills: scoreEntry.totalKills,
                                games: matrixEntry.games
                            });
                            processedTeams.add(scoreEntry.team.toLowerCase());
                            console.log(`✅ Validated team: ${scoreEntry.team} (Score: ${scoreEntry.totalScore})`);
                        } else {
                            console.log(`⚠️ Score mismatch for ${scoreEntry.team}: ${scoreEntry.totalScore} vs ${matrixEntry.totalScore}`);
                        }
                    } else {
                        console.log(`⚠️ No matrix data found for team: ${scoreEntry.team}`);
                    }
                }
                
                // Add any teams found only in matrix (fallback)
                for (let matrixEntry of scoreMatrixData) {
                    if (!processedTeams.has(matrixEntry.team.toLowerCase())) {
                        finalData.push(matrixEntry);
                        console.log(`📋 Added matrix-only team: ${matrixEntry.team}`);
                    }
                }
                
                // Sort by rank
                finalData.sort((a, b) => a.rank - b.rank);
                
                console.log(`Final data contains ${finalData.length} teams`);
                return finalData;
            });
            
            if (extractedData.length === 0) {
                console.log('❌ No tournament data found');
                return {
                    success: false,
                    message: 'No tournament data found on the page'
                };
            }
            
            console.log(`📊 Successfully extracted ${extractedData.length} teams with validation`);
            
            // Generate file names from URL
            const urlParts = url.split('/');
            const day = urlParts.find(part => part.includes('Day')) || 'Day1';
            const section = urlParts[urlParts.length - 1].split('#')[0] || 'A';
            const filename = `${day}-${section}`;
            
            // Save only the raw data
            await this.saveRawData(extractedData, filename);
            
            console.log(`✅ Successfully processed ${extractedData.length} teams`);
            return {
                success: true,
                teamsProcessed: extractedData.length,
                filename: filename
            };
            
        } catch (error) {
            console.error('❌ Error processing URL:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            await page.close();
        }
    }

    async saveRawData(data, filename) {
        const publicPath = path.join(process.cwd(), '../../public', this.selectedFolder);
        const rawPath = path.join(publicPath, 'raw');
        await fs.ensureDir(rawPath);
        
        const csvPath = path.join(rawPath, `${filename}.csv`);
        const csvWriter = createCsvWriter({
            path: csvPath,
            header: [
                { id: 'team', title: 'Team' },
                { id: 'rank', title: 'Rank' },
                { id: 'game', title: 'Game' },
                { id: 'placement', title: 'Placement' },
                { id: 'kills', title: 'Kills' },
                { id: 'points', title: 'Points' }
            ]
        });
        
        const records = [];
        for (const team of data) {
            for (let gameIndex = 0; gameIndex < team.games.length; gameIndex++) {
                const game = team.games[gameIndex];
                const placementPoints = this.getPlacementPoints(game.placement);
                const totalPoints = placementPoints + game.kills;
                
                records.push({
                    team: team.team,
                    rank: team.rank,
                    game: gameIndex + 1,
                    placement: game.placement,
                    kills: game.kills,
                    points: totalPoints
                });
            }
        }
        
        await csvWriter.writeRecords(records);
        console.log(`📝 Raw data saved to: ${csvPath}`);
    }





    async extractSingleMetadata(url) {
        if (!this.initialized) {
            await this.init();
        }

        const page = await this.browser.newPage();
        
        try {
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            
            console.log(`🔍 Extracting metadata from: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
            
            const metadata = await page.evaluate(() => {
                return {
                    title: document.title,
                    url: window.location.href,
                    tournament: document.querySelector('h1, .tournament-title, [class*="tournament"]')?.textContent?.trim() || 'Unknown Tournament',
                    round: document.querySelector('.round-title, [class*="round"]')?.textContent?.trim() || 'Unknown Round',
                    extractedAt: new Date().toISOString()
                };
            });
            
            // Save metadata
            const publicPath = path.join(process.cwd(), '../../public', this.selectedFolder);
            const processedPath = path.join(publicPath, 'processed');
            await fs.ensureDir(processedPath);
            
            const urlParts = url.split('/');
            const day = urlParts.find(part => part.includes('Day')) || 'Day1';
            const section = urlParts[urlParts.length - 1].split('#')[0] || 'A';
            const filename = `${day}-${section}-metadata.json`;
            
            const metadataPath = path.join(processedPath, filename);
            await fs.writeJson(metadataPath, metadata, { spaces: 2 });
            
            console.log(`📋 Metadata saved to: ${metadataPath}`);
            return {
                success: true,
                metadata: metadata,
                filename: filename
            };
            
        } catch (error) {
            console.error('❌ Error extracting metadata:', error);
            return {
                success: false,
                error: error.message
            };
        } finally {
            await page.close();
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.initialized = false;
            console.log('🔒 ALGS Scraper closed');
        }
    }
}

module.exports = ALGSScraper; 