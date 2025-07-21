#!/usr/bin/env node

const ALGSScraper = require('./algs-scraper');

async function testPuppeteerUpdate() {
    console.log('🧪 Testing Puppeteer update compatibility...');
    console.log('=' .repeat(50));
    
    const scraper = new ALGSScraper();
    
    try {
        // Test initialization
        console.log('1. Testing scraper initialization...');
        await scraper.init();
        console.log('   ✅ Initialization successful');
        
        // Test basic browser functionality
        console.log('2. Testing basic browser functionality...');
        const testUrl = 'https://example.com';
        
        // Create a simple test that doesn't rely on ALGS-specific selectors
        const testResult = await scraper.browser.newPage();
        await testResult.goto(testUrl, { waitUntil: 'networkidle2', timeout: 10000 });
        const title = await testResult.title();
        await testResult.close();
        
        console.log(`   ✅ Browser navigation successful (${title})`);
        
        // Test page evaluation
        console.log('3. Testing page evaluation...');
        const page = await scraper.browser.newPage();
        await page.goto(testUrl);
        
        const evalResult = await page.evaluate(() => {
            return {
                url: window.location.href,
                title: document.title,
                hasDocument: typeof document !== 'undefined'
            };
        });
        
        await page.close();
        console.log('   ✅ Page evaluation successful');
        console.log(`   📄 Title: ${evalResult.title}`);
        console.log(`   🌐 URL: ${evalResult.url}`);
        
        console.log('\n🎉 All Puppeteer compatibility tests passed!');
        console.log('✅ The update should work without issues.');
        
    } catch (error) {
        console.error('\n❌ Puppeteer compatibility test failed:', error.message);
        console.log('⚠️  You may need to review the code for breaking changes.');
        return false;
    } finally {
        await scraper.close();
        console.log('🔒 Scraper closed');
    }
    
    return true;
}

// Run the test if this file is executed directly
if (require.main === module) {
    testPuppeteerUpdate()
        .then(success => {
            if (success) {
                console.log('\n✅ Puppeteer update test completed successfully');
                process.exit(0);
            } else {
                console.log('\n❌ Puppeteer update test failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('\n❌ Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = testPuppeteerUpdate;