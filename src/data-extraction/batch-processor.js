const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class BatchProcessor {
    constructor() {
        this.queue = [];
        this.currentProcessing = new Map(); // Track multiple concurrent processes
        this.results = [];
        this.isProcessing = false;
        this.maxConcurrent = 3; // Maximum concurrent processes
        this.callbacks = {
            onStateChange: null,
            onProgress: null,
            onComplete: null
        };
        this.activeBrowsers = new Map(); // Track active browser instances
    }

    /**
     * Set maximum concurrent processes
     */
    setMaxConcurrent(max) {
        this.maxConcurrent = Math.max(1, Math.min(max, 10)); // Limit between 1-10
    }

    /**
     * Add URLs to the processing queue
     */
    addUrls(urls) {
        const added = [];
        
        for (const url of urls) {
            if (this.isValidAlgsUrl(url)) {
                const item = this.parseAlgsUrl(url);
                if (item && !this.isDuplicate(item)) {
                    this.queue.push(item);
                    added.push(item);
                }
            }
        }
        
        this.notifyStateChange();
        return added;
    }

    /**
     * Clear the processing queue and stop all processing
     */
    async clearQueue() {
        this.queue = [];
        
        // Stop all current processing
        if (this.isProcessing) {
            await this.stopProcessing();
        }
        
        this.notifyStateChange();
    }

    /**
     * Stop all processing
     */
    async stopProcessing() {
        console.log('🛑 Stopping all processing...');
        this.isProcessing = false;
        
        // Close all active browsers
        const browserPromises = Array.from(this.activeBrowsers.values()).map(async (browserInfo) => {
            try {
                if (browserInfo.browser) {
                    await browserInfo.browser.close();
                }
            } catch (error) {
                console.error('Error closing browser:', error.message);
            }
        });
        
        await Promise.all(browserPromises);
        this.activeBrowsers.clear();
        this.currentProcessing.clear();
        this.notifyStateChange();
    }

    /**
     * Start processing the queue with concurrent processing
     */
    async startProcessing() {
        if (this.isProcessing) {
            return { success: false, error: 'Already processing' };
        }

        if (this.queue.length === 0) {
            return { success: false, error: 'Queue is empty' };
        }

        this.isProcessing = true;
        this.processQueueConcurrently();
        
        return { success: true };
    }

    /**
     * Process the queue items concurrently
     */
    async processQueueConcurrently() {
        const processingPromises = [];
        
        while (this.queue.length > 0 && this.isProcessing) {
            // Start up to maxConcurrent processes
            while (processingPromises.length < this.maxConcurrent && this.queue.length > 0) {
                const item = this.queue.shift();
                this.currentProcessing.set(item.id, item);
                this.notifyStateChange();

                const processingPromise = this.processItemConcurrently(item)
                    .then(result => {
                        this.results.push({
                            ...item,
                            result,
                            timestamp: new Date().toISOString()
                        });
                        this.currentProcessing.delete(item.id);
                        this.notifyStateChange();
                        return { success: true, item };
                    })
                    .catch(error => {
                        this.results.push({
                            ...item,
                            result: { success: false, error: error.message },
                            timestamp: new Date().toISOString()
                        });
                        this.currentProcessing.delete(item.id);
                        this.notifyStateChange();
                        return { success: false, error, item };
                    });

                processingPromises.push(processingPromise);
            }

            // Wait for at least one process to complete
            if (processingPromises.length > 0) {
                await Promise.race(processingPromises);
                // Filter out completed promises
                const stillPending = [];
                for (const promise of processingPromises) {
                    const isComplete = await Promise.race([
                        promise.then(() => true).catch(() => true),
                        new Promise(resolve => setTimeout(() => resolve(false), 0))
                    ]);
                    if (!isComplete) {
                        stillPending.push(promise);
                    }
                }
                processingPromises.length = 0;
                processingPromises.push(...stillPending);
            }
        }

        // Wait for all remaining processes to complete
        await Promise.all(processingPromises);

        this.isProcessing = false;
        this.currentProcessing.clear();
        this.notifyStateChange();
        
        console.log('🎉 All processing completed!');
    }

    /**
     * Process a single item concurrently
     */
    async processItemConcurrently(item) {
        console.log(`🔄 Processing (concurrent): ${item.tournament} - ${item.round}`);

        try {
            // Step 1: Scrape the data with shared browser pool
            this.notifyProgress(item.id, 'scraping', 'Scraping tournament data...');
            const scraperResult = await this.runScraperConcurrent(item.url, item.filename, item.id);
            
            if (!scraperResult.success) {
                throw new Error(`Scraping failed: ${scraperResult.error}`);
            }

            // Step 2: Convert to standard formats
            this.notifyProgress(item.id, 'converting', 'Converting to standard formats...');
            const conversionResult = await this.runConverter(item.filename);
            
            if (!conversionResult.success) {
                throw new Error(`Conversion failed: ${conversionResult.error}`);
            }

            this.notifyProgress(item.id, 'completed', 'Processing completed successfully');
            
            return {
                success: true,
                teamsExtracted: scraperResult.teamsExtracted,
                files: {
                    raw: `${item.filename}.csv`,
                    simple: `${item.filename}-simple.csv`,
                    bifurcated: `${item.filename}-bifurcated.csv`
                }
            };

        } catch (error) {
            console.error(`❌ Error processing ${item.tournament}: ${error.message}`);
            this.notifyProgress(item.id, 'error', error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Run the scraper with concurrent browser management
     */
    async runScraperConcurrent(url, filename, itemId) {
        return new Promise((resolve, reject) => {
            // Create a scraper that uses a managed browser pool
            const scraperCode = this.generateConcurrentScraperCode(url, filename, itemId);
            const tempScraperPath = path.join(__dirname, `temp-scraper-${itemId}.js`);
            
            fs.writeFile(tempScraperPath, scraperCode, 'utf8')
                .then(() => {
                    const child = spawn('node', [tempScraperPath], {
                        cwd: __dirname,
                        stdio: 'pipe'
                    });

                    let stdout = '';
                    let stderr = '';

                    child.stdout.on('data', (data) => {
                        stdout += data.toString();
                    });

                    child.stderr.on('data', (data) => {
                        stderr += data.toString();
                    });

                    child.on('close', (code) => {
                        // Clean up temp file
                        fs.unlink(tempScraperPath).catch(console.error);
                        
                        if (code === 0) {
                            // Extract teams count from output
                            const teamsMatch = stdout.match(/(\d+) teams/);
                            const teamsExtracted = teamsMatch ? parseInt(teamsMatch[1]) : 0;
                            
                            resolve({
                                success: true,
                                teamsExtracted,
                                output: stdout
                            });
                        } else {
                            reject(new Error(`Scraper exited with code ${code}: ${stderr}`));
                        }
                    });

                    child.on('error', (error) => {
                        fs.unlink(tempScraperPath).catch(console.error);
                        reject(error);
                    });
                })
                .catch(reject);
        });
    }

    /**
     * Generate concurrent scraper code with better resource management
     */
    generateConcurrentScraperCode(url, filename, itemId) {
        return `const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
    console.log('🚀 Starting ALGS scraper (concurrent)...');
    
    // Use more conservative browser settings for concurrent execution
    const browser = await puppeteer.launch({ 
        headless: true,
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor'
        ]
    });
    
    try {
        const page = await browser.newPage();
        
        // Set reasonable timeouts for concurrent execution
        page.setDefaultTimeout(30000);
        page.setDefaultNavigationTimeout(30000);
        
        // Navigate to tournament page
        console.log('📊 Navigating to tournament page...');
        await page.goto('${url}', { 
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // Wait for the score matrix to load
        console.log('⏳ Waiting for score matrix...');
        await page.waitForSelector('.score-matrix', { timeout: 15000 });
        
        // Extract tournament data
        console.log('🔍 Extracting tournament data...');
        const tournamentData = await page.evaluate(() => {
            const calculatePoints = (placement) => {
                const placementPoints = {
                    1: 12, 2: 9, 3: 7, 4: 5, 5: 4,
                    6: 3, 7: 3, 8: 2, 9: 2, 10: 2,
                    11: 1, 12: 1, 13: 1, 14: 1, 15: 1
                };
                return placementPoints[placement] || 0;
            };
            
            const scoreMatrix = document.querySelector('.score-matrix');
            if (!scoreMatrix) throw new Error('Score matrix not found');
            
            const rows = scoreMatrix.querySelectorAll('tr');
            const teams = [];
            
            // Skip header row
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].querySelectorAll('td');
                if (cells.length < 15) continue;
                
                const rankText = cells[0].textContent.trim();
                const teamName = cells[1].textContent.trim();
                const expectedTotal = parseInt(cells[2].textContent.trim());
                
                const games = [];
                let calculatedTotal = 0;
                
                // Process 6 games (P,K pairs starting from cell 3)
                for (let gameIdx = 0; gameIdx < 6; gameIdx++) {
                    const pCell = cells[3 + (gameIdx * 2)];
                    const kCell = cells[4 + (gameIdx * 2)];
                    
                    if (pCell && kCell) {
                        const placement = parseInt(pCell.textContent.trim());
                        const kills = parseInt(kCell.textContent.trim());
                        
                        if (!isNaN(placement) && !isNaN(kills)) {
                            const placementPoints = calculatePoints(placement);
                            const totalPoints = placementPoints + kills;
                            
                            games.push({
                                game: gameIdx + 1,
                                placement,
                                kills,
                                placementPoints,
                                totalPoints
                            });
                            
                            calculatedTotal += totalPoints;
                        }
                    }
                }
                
                teams.push({
                    rank: rankText,
                    team: teamName,
                    expectedTotal,
                    calculatedTotal,
                    games
                });
            }
            
            return teams;
        });
        
        console.log(\`✅ Extracted data for \${tournamentData.length} teams\`);
        
        // Generate CSV content
        const csvLines = ['Team,Rank,Game,Placement,Kills,Points'];
        
        tournamentData.forEach(team => {
            team.games.forEach(game => {
                csvLines.push(\`\${team.team},\${team.rank},\${game.game},\${game.placement},\${game.kills},\${game.totalPoints}\`);
            });
        });
        
        // Save to file
        const csvContent = csvLines.join('\\n');
        const outputPath = '../../public/year5champions/raw/${filename}.csv';
        await fs.writeFile(outputPath, csvContent, 'utf8');
        
        console.log(\`✅ Data saved to: \${outputPath}\`);
        console.log(\`📊 Processing complete: \${tournamentData.length} teams extracted\`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();`;
    }

    /**
     * Run the format converter
     */
    async runConverter(filename) {
        return new Promise((resolve, reject) => {
            const rawPath = `../../public/year5champions/raw/${filename}.csv`;
            const processedDir = `../../public/year5champions/processed`;
            
            const child = spawn('node', [
                'create-standard-formats.js',
                rawPath,
                processedDir,
                filename
            ], {
                cwd: __dirname,
                stdio: 'pipe'
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({
                        success: true,
                        output: stdout
                    });
                } else {
                    reject(new Error(`Converter exited with code ${code}: ${stderr}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Generate scraper code for a specific URL
     */
    generateScraperCode(url, filename) {
        return `const puppeteer = require('puppeteer');
const fs = require('fs').promises;

(async () => {
    console.log('🚀 Starting ALGS scraper...');
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to tournament page
        console.log('📊 Navigating to tournament page...');
        await page.goto('${url}', { waitUntil: 'networkidle2' });
        
        // Wait for the score matrix to load
        console.log('⏳ Waiting for score matrix...');
        await page.waitForSelector('.score-matrix', { timeout: 10000 });
        
        // Extract tournament data
        console.log('🔍 Extracting tournament data...');
        const tournamentData = await page.evaluate(() => {
            const calculatePoints = (placement) => {
                const placementPoints = {
                    1: 12, 2: 9, 3: 7, 4: 5, 5: 4,
                    6: 3, 7: 3, 8: 2, 9: 2, 10: 2,
                    11: 1, 12: 1, 13: 1, 14: 1, 15: 1
                };
                return placementPoints[placement] || 0;
            };
            
            const scoreMatrix = document.querySelector('.score-matrix');
            if (!scoreMatrix) throw new Error('Score matrix not found');
            
            const rows = scoreMatrix.querySelectorAll('tr');
            const teams = [];
            
            // Skip header row
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].querySelectorAll('td');
                if (cells.length < 15) continue;
                
                const rankText = cells[0].textContent.trim();
                const teamName = cells[1].textContent.trim();
                const expectedTotal = parseInt(cells[2].textContent.trim());
                
                const games = [];
                let calculatedTotal = 0;
                
                // Process 6 games (P,K pairs starting from cell 3)
                for (let gameIdx = 0; gameIdx < 6; gameIdx++) {
                    const pCell = cells[3 + (gameIdx * 2)];
                    const kCell = cells[4 + (gameIdx * 2)];
                    
                    if (pCell && kCell) {
                        const placement = parseInt(pCell.textContent.trim());
                        const kills = parseInt(kCell.textContent.trim());
                        
                        if (!isNaN(placement) && !isNaN(kills)) {
                            const placementPoints = calculatePoints(placement);
                            const totalPoints = placementPoints + kills;
                            
                            games.push({
                                game: gameIdx + 1,
                                placement,
                                kills,
                                placementPoints,
                                totalPoints
                            });
                            
                            calculatedTotal += totalPoints;
                        }
                    }
                }
                
                teams.push({
                    rank: rankText,
                    team: teamName,
                    expectedTotal,
                    calculatedTotal,
                    games
                });
            }
            
            return teams;
        });
        
        console.log(\`✅ Extracted data for \${tournamentData.length} teams\`);
        
        // Generate CSV content
        const csvLines = ['Team,Rank,Game,Placement,Kills,Points'];
        
        tournamentData.forEach(team => {
            team.games.forEach(game => {
                csvLines.push(\`\${team.team},\${team.rank},\${game.game},\${game.placement},\${game.kills},\${game.totalPoints}\`);
            });
        });
        
        // Save to file
        const csvContent = csvLines.join('\\n');
        const outputPath = '../../public/year5champions/raw/${filename}.csv';
        await fs.writeFile(outputPath, csvContent, 'utf8');
        
        console.log(\`✅ Data saved to: \${outputPath}\`);
        console.log(\`📊 Processing complete: \${tournamentData.length} teams extracted\`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await browser.close();
    }
})();`;
    }

    /**
     * Check if URL is a valid ALGS tournament URL
     */
    isValidAlgsUrl(url) {
        return url.includes('apexlegendsstatus.com/algs/') && url.includes('#tab_scores');
    }

    /**
     * Parse ALGS URL to extract tournament info
     */
    parseAlgsUrl(url) {
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/');
            
            // Extract tournament and round info from path
            const year = pathParts[2] || 'Y5-Split1';
            const competition = pathParts[3] || 'ALGS-Open';
            const region = pathParts[4] || 'Global';
            const day = pathParts[5] || 'Day1';
            const round = pathParts[6] || 'Round';
            
            return {
                id: Date.now().toString(),
                url: url,
                tournament: `${year}-${competition}-${region}-${day}`,
                round: round,
                filename: `${day}-${round}`
            };
        } catch (error) {
            console.error('Error parsing URL:', error.message);
            return null;
        }
    }

    /**
     * Check if item is already in queue
     */
    isDuplicate(item) {
        return this.queue.some(q => q.url === item.url) ||
               this.results.some(r => r.url === item.url);
    }

    /**
     * Set callback functions
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }

    /**
     * Notify state change
     */
    notifyStateChange() {
        if (this.callbacks.onStateChange) {
            this.callbacks.onStateChange({
                queue: this.queue,
                current: Array.from(this.currentProcessing.values()),
                results: this.results,
                isProcessing: this.isProcessing,
                concurrent: this.currentProcessing.size
            });
        }
    }

    /**
     * Notify progress
     */
    notifyProgress(id, stage, message) {
        if (this.callbacks.onProgress) {
            this.callbacks.onProgress(id, stage, message);
        }
    }

    /**
     * Get current state
     */
    getState() {
        return {
            queue: this.queue,
            current: Array.from(this.currentProcessing.values()),
            results: this.results,
            isProcessing: this.isProcessing,
            concurrent: this.currentProcessing.size,
            maxConcurrent: this.maxConcurrent
        };
    }
}

module.exports = BatchProcessor; 