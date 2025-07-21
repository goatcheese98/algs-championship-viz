const ALGSScraper = require('./algs-scraper');
const PlaywrightScraper = require('./playwright-scraper');

class ScraperFactory {
    static supportedEngines = ['puppeteer', 'playwright'];
    static defaultEngine = 'puppeteer'; // Keep backward compatibility

    static createScraper(engine = ScraperFactory.defaultEngine) {
        if (!ScraperFactory.supportedEngines.includes(engine)) {
            console.warn(`⚠️ Unsupported engine: ${engine}. Falling back to ${ScraperFactory.defaultEngine}`);
            engine = ScraperFactory.defaultEngine;
        }

        console.log(`🏭 Creating scraper with engine: ${engine}`);

        switch (engine) {
            case 'playwright':
                return new PlaywrightScraper();
            case 'puppeteer':
            default:
                return new ALGSScraper();
        }
    }

    static getSupportedEngines() {
        return [...ScraperFactory.supportedEngines];
    }

    static getDefaultEngine() {
        return ScraperFactory.defaultEngine;
    }

    static setDefaultEngine(engine) {
        if (ScraperFactory.supportedEngines.includes(engine)) {
            ScraperFactory.defaultEngine = engine;
            console.log(`🔧 Default engine set to: ${engine}`);
            return true;
        } else {
            console.error(`❌ Cannot set default engine to unsupported: ${engine}`);
            return false;
        }
    }
}

module.exports = ScraperFactory;