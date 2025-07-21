#!/usr/bin/env node

const PlaywrightScraper = require('./playwright-scraper');
const ALGSScraper = require('./algs-scraper');

// Test configuration
const TEST_URLS = [
    'https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/WinnersRound1-1',
    // Add more test URLs as needed
];

class PerformanceTest {
    constructor() {
        this.results = {
            playwright: [],
            puppeteer: []
        };
    }

    async runTest(scraper, url, engineName) {
        const startTime = Date.now();
        console.log(`\n🚀 Testing ${engineName} with URL: ${url}`);
        
        try {
            const result = await scraper.processURL(url);
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`✅ ${engineName} completed in ${duration}ms`);
            console.log(`   Teams processed: ${result.teamsProcessed || 'N/A'}`);
            console.log(`   Success: ${result.success}`);
            
            return {
                url,
                engine: engineName,
                duration,
                success: result.success,
                teamsProcessed: result.teamsProcessed || 0,
                error: result.error || null
            };
        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`❌ ${engineName} failed in ${duration}ms: ${error.message}`);
            
            return {
                url,
                engine: engineName,
                duration,
                success: false,
                teamsProcessed: 0,
                error: error.message
            };
        }
    }

    async compareEngines() {
        console.log('🎭 Starting Playwright vs Puppeteer Performance Comparison');
        console.log('=' .repeat(60));
        
        // Initialize both scrapers
        const playwrightScraper = new PlaywrightScraper();
        const puppeteerScraper = new ALGSScraper();
        
        try {
            await playwrightScraper.init();
            await puppeteerScraper.init();
            console.log('✅ Both scrapers initialized successfully');
            
            for (const url of TEST_URLS) {
                console.log(`\n📊 Testing URL: ${url}`);
                console.log('-' .repeat(50));
                
                // Test Playwright
                const playwrightResult = await this.runTest(playwrightScraper, url, 'Playwright');
                this.results.playwright.push(playwrightResult);
                
                // Small delay between tests
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Test Puppeteer  
                const puppeteerResult = await this.runTest(puppeteerScraper, url, 'Puppeteer');
                this.results.puppeteer.push(puppeteerResult);
                
                // Compare results
                this.compareResults(playwrightResult, puppeteerResult);
                
                // Delay between URLs
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
            this.printSummary();
            
        } catch (error) {
            console.error('❌ Test failed:', error);
        } finally {
            // Clean up
            await playwrightScraper.close();
            await puppeteerScraper.close();
            console.log('🔒 Scrapers closed');
        }
    }

    compareResults(playwrightResult, puppeteerResult) {
        console.log('\n📈 Comparison:');
        
        if (playwrightResult.success && puppeteerResult.success) {
            const speedDiff = puppeteerResult.duration - playwrightResult.duration;
            const percentDiff = ((speedDiff / puppeteerResult.duration) * 100).toFixed(1);
            
            if (speedDiff > 0) {
                console.log(`   🏆 Playwright was ${speedDiff}ms (${percentDiff}%) faster`);
            } else {
                console.log(`   🏆 Puppeteer was ${Math.abs(speedDiff)}ms (${Math.abs(percentDiff)}%) faster`);
            }
            
            if (playwrightResult.teamsProcessed === puppeteerResult.teamsProcessed) {
                console.log(`   ✅ Both extracted ${playwrightResult.teamsProcessed} teams`);
            } else {
                console.log(`   ⚠️  Team count mismatch: Playwright(${playwrightResult.teamsProcessed}) vs Puppeteer(${puppeteerResult.teamsProcessed})`);
            }
        } else {
            console.log('   ❌ Cannot compare - one or both tests failed');
        }
    }

    printSummary() {
        console.log('\n' + '=' .repeat(60));
        console.log('📊 PERFORMANCE SUMMARY');
        console.log('=' .repeat(60));
        
        const playwrightStats = this.calculateStats(this.results.playwright);
        const puppeteerStats = this.calculateStats(this.results.puppeteer);
        
        console.log('\n🎭 Playwright Results:');
        console.log(`   Average Duration: ${playwrightStats.avgDuration}ms`);
        console.log(`   Success Rate: ${playwrightStats.successRate}%`);
        console.log(`   Total Teams: ${playwrightStats.totalTeams}`);
        
        console.log('\n🎪 Puppeteer Results:');
        console.log(`   Average Duration: ${puppeteerStats.avgDuration}ms`);
        console.log(`   Success Rate: ${puppeteerStats.successRate}%`);
        console.log(`   Total Teams: ${puppeteerStats.totalTeams}`);
        
        console.log('\n🏁 Winner:');
        if (playwrightStats.avgDuration < puppeteerStats.avgDuration && 
            playwrightStats.successRate >= puppeteerStats.successRate) {
            console.log('   🏆 Playwright wins! (Faster and equally reliable)');
        } else if (puppeteerStats.avgDuration < playwrightStats.avgDuration && 
                   puppeteerStats.successRate >= playwrightStats.successRate) {
            console.log('   🏆 Puppeteer wins! (Faster and equally reliable)');
        } else {
            console.log('   🤝 Mixed results - check individual metrics above');
        }
    }

    calculateStats(results) {
        const successful = results.filter(r => r.success);
        const avgDuration = successful.length > 0 ? 
            Math.round(successful.reduce((sum, r) => sum + r.duration, 0) / successful.length) : 0;
        const successRate = Math.round((successful.length / results.length) * 100);
        const totalTeams = successful.reduce((sum, r) => sum + r.teamsProcessed, 0);
        
        return { avgDuration, successRate, totalTeams };
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    const test = new PerformanceTest();
    test.compareEngines()
        .then(() => {
            console.log('\n✅ Performance test completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Performance test failed:', error);
            process.exit(1);
        });
}

module.exports = PerformanceTest;