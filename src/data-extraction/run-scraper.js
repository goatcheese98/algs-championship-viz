#!/usr/bin/env node

/**
 * ALGS Scraper CLI Runner
 * Easy-to-use command line interface for the ALGS tournament data scraper
 */

const ALGSScraper = require('./algs-scraper');
const ScraperUtils = require('./scraper-utils');
const fs = require('fs').promises;
const path = require('path');

class ScraperCLI {
    constructor() {
        this.scraper = new ALGSScraper();
        this.config = ScraperUtils.generateTournamentConfig('year5-open');
    }

    async run() {
        const args = process.argv.slice(2);
        
        if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
            this.showHelp();
            return;
        }

        try {
            await this.handleCommand(args);
        } catch (error) {
            console.error('❌ Error:', error.message);
            process.exit(1);
        }
    }

    async handleCommand(args) {
        const [command, ...params] = args;

        switch (command) {
            case '--full':
                await this.runFullTournament();
                break;
            case '--setup':
                await this.setupDirectories();
                break;
            case '--test':
                await this.runTest();
                break;
            case '--validate':
                await this.validateData(params[0]);
                break;
            case '--urls':
                await this.showUrls();
                break;
            case '--config':
                await this.showConfig();
                break;
            default:
                // Assume it's a specific day/round
                await this.runSpecific(command, params[0]);
                break;
        }
    }

    async runFullTournament() {
        console.log('🚀 Starting full tournament scraping...');
        
        const urls = ScraperUtils.generateUrlList(this.config);
        const results = {};
        
        for (const urlInfo of urls) {
            console.log(`\n📊 Scraping ${urlInfo.day} ${urlInfo.round}...`);
            
            try {
                const data = await this.scraper.scrapeMatchup(urlInfo.day, urlInfo.round);
                
                if (!results[urlInfo.day]) {
                    results[urlInfo.day] = {};
                }
                
                results[urlInfo.day][urlInfo.round] = data;
                
                console.log(`✅ Successfully scraped ${data.teams.length} teams`);
                
                // Add delay between requests
                await this.delay(2000);
                
            } catch (error) {
                console.error(`❌ Failed to scrape ${urlInfo.day} ${urlInfo.round}:`, error.message);
                continue;
            }
        }
        
        // Generate summary report
        const reportPath = path.join(__dirname, '../../public/year5champions/reports/scraping-report.json');
        await ScraperUtils.saveScrapingReport(results, reportPath);
        
        console.log('\n✅ Full tournament scraping completed!');
        console.log(`📊 Report saved to: ${reportPath}`);
    }

    async runSpecific(day, round) {
        if (!day) {
            console.error('❌ Day parameter required');
            this.showHelp();
            return;
        }

        if (!round) {
            console.error('❌ Round parameter required');
            this.showHelp();
            return;
        }

        console.log(`🚀 Scraping ${day} ${round}...`);
        
        try {
            const data = await this.scraper.scrapeMatchup(day, round);
            console.log(`✅ Successfully scraped ${data.teams.length} teams`);
            
            // Show summary
            console.log('\n📊 Summary:');
            console.log(`- Teams: ${data.teams.length}`);
            console.log(`- Games: ${data.teams[0]?.games?.length || 0}`);
            console.log(`- Top 3 teams:`);
            
            data.teams.slice(0, 3).forEach((team, index) => {
                console.log(`  ${index + 1}. ${team.name} (${team.totalScore} pts)`);
            });
            
        } catch (error) {
            console.error(`❌ Failed to scrape ${day} ${round}:`, error.message);
        }
    }

    async runTest() {
        console.log('🧪 Running test scraping...');
        
        try {
            const data = await this.scraper.scrapeMatchup('Day1', 'WinnersRound1-3');
            console.log('✅ Test successful!');
            console.log(`📊 Extracted ${data.teams.length} teams`);
            
            // Show sample data
            if (data.teams.length > 0) {
                const sampleTeam = data.teams[0];
                console.log(`📋 Sample team: ${sampleTeam.name} (${sampleTeam.totalScore} pts)`);
                console.log(`🎮 Games: ${sampleTeam.games.length}`);
            }
            
        } catch (error) {
            console.error('❌ Test failed:', error.message);
        }
    }

    async setupDirectories() {
        console.log('📁 Setting up output directories...');
        
        try {
            await ScraperUtils.setupOutputDirectories();
            console.log('✅ Directories created successfully!');
            
            // Create additional directories
            const additionalDirs = [
                'public/year5champions/reports',
                'public/year5champions/logs'
            ];
            
            for (const dir of additionalDirs) {
                await fs.mkdir(dir, { recursive: true });
            }
            
            console.log('📂 Directory structure:');
            console.log('  public/year5champions/');
            console.log('  ├── raw/');
            console.log('  ├── processed/');
            console.log('  ├── reports/');
            console.log('  └── logs/');
            
        } catch (error) {
            console.error('❌ Failed to setup directories:', error.message);
        }
    }

    async validateData(filePath) {
        if (!filePath) {
            console.error('❌ File path required for validation');
            return;
        }

        console.log(`🔍 Validating data: ${filePath}`);
        
        try {
            const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
            const validation = ScraperUtils.validateTournamentData(data);
            
            if (validation.valid) {
                console.log('✅ Data validation passed!');
                console.log(`📊 Teams: ${validation.teamCount}`);
                console.log(`🎮 Max games: ${validation.maxGames}`);
            } else {
                console.log('❌ Data validation failed:');
                validation.errors.forEach(error => {
                    console.log(`  - ${error}`);
                });
            }
            
        } catch (error) {
            console.error('❌ Validation failed:', error.message);
        }
    }

    async showUrls() {
        console.log('🔗 Tournament URLs:');
        
        const urls = ScraperUtils.generateUrlList(this.config);
        
        urls.forEach(urlInfo => {
            console.log(`  ${urlInfo.day} ${urlInfo.round}:`);
            console.log(`    ${urlInfo.url}`);
        });
        
        console.log(`\n📊 Total URLs: ${urls.length}`);
    }

    async showConfig() {
        console.log('⚙️  Current Configuration:');
        console.log(JSON.stringify(this.config, null, 2));
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showHelp() {
        console.log(`
🏆 ALGS Tournament Data Scraper CLI

Usage:
  node run-scraper.js [command] [options]

Commands:
  <day> <round>     Scrape specific day and round
                    Example: node run-scraper.js Day1 WinnersRound1-3
  
  --full            Scrape entire tournament
  --test            Run test scraping (Day1 WinnersRound1-3)
  --setup           Create output directories
  --validate <file> Validate extracted data file
  --urls            Show all tournament URLs
  --config          Show current configuration
  --help, -h        Show this help message

Examples:
  node run-scraper.js Day1 WinnersRound1-3
  node run-scraper.js --full
  node run-scraper.js --test
  node run-scraper.js --setup
  node run-scraper.js --validate ./data.json

Output:
  CSV files will be saved to: public/year5champions/
  Reports will be saved to: public/year5champions/reports/

For more information, see README.md
        `);
    }
}

// Run CLI if this file is executed directly
if (require.main === module) {
    const cli = new ScraperCLI();
    cli.run().catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = ScraperCLI; 