#!/usr/bin/env node

/**
 * ALGS Scraper Setup Script
 * Initializes the scraper environment and installs dependencies
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class ScraperSetup {
    constructor() {
        this.scraperDir = path.join(__dirname, 'src', 'data-extraction');
        this.outputDir = path.join(__dirname, 'public', 'year5champions');
    }

    async run() {
        console.log('🏆 ALGS Scraper Setup');
        console.log('==================');
        
        try {
            await this.checkDirectories();
            await this.installDependencies();
            await this.createConfigFile();
            await this.testSetup();
            
            console.log('\n✅ Setup completed successfully!');
            console.log('\n🚀 Next steps:');
            console.log('1. cd src/data-extraction');
            console.log('2. node run-scraper.js --test');
            console.log('3. node run-scraper.js --full');
            
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            process.exit(1);
        }
    }

    async checkDirectories() {
        console.log('\n📁 Checking directories...');
        
        const directories = [
            this.scraperDir,
            this.outputDir,
            path.join(this.outputDir, 'raw'),
            path.join(this.outputDir, 'processed'),
            path.join(this.outputDir, 'reports'),
            path.join(this.outputDir, 'logs')
        ];

        for (const dir of directories) {
            try {
                await fs.mkdir(dir, { recursive: true });
                console.log(`✅ ${dir}`);
            } catch (error) {
                console.log(`⚠️  ${dir} - ${error.message}`);
            }
        }
    }

    async installDependencies() {
        console.log('\n📦 Installing dependencies...');
        
        const packageJsonPath = path.join(this.scraperDir, 'package.json');
        
        try {
            await fs.access(packageJsonPath);
            console.log('✅ package.json found');
        } catch {
            console.log('❌ package.json not found in src/data-extraction');
            throw new Error('package.json missing');
        }

        return new Promise((resolve, reject) => {
            const npm = spawn('npm', ['install'], {
                cwd: this.scraperDir,
                stdio: 'inherit',
                shell: true
            });

            npm.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Dependencies installed successfully');
                    resolve();
                } else {
                    reject(new Error(`npm install failed with code ${code}`));
                }
            });
        });
    }

    async createConfigFile() {
        console.log('\n⚙️  Creating configuration file...');
        
        const configPath = path.join(this.scraperDir, 'config.json');
        
        const config = {
            tournament: 'year5-open',
            baseUrl: 'https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global',
            outputPath: '../../public/year5champions',
            delayBetweenRequests: 2000,
            maxRetries: 3,
            timeout: 30000,
            browser: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        };

        try {
            await fs.writeFile(configPath, JSON.stringify(config, null, 2));
            console.log('✅ Configuration file created');
        } catch (error) {
            console.log(`⚠️  Could not create config file: ${error.message}`);
        }
    }

    async testSetup() {
        console.log('\n🧪 Testing setup...');
        
        try {
            const ScraperCLI = require(path.join(this.scraperDir, 'run-scraper.js'));
            console.log('✅ All modules can be loaded');
            
            // Test directory structure
            const testDirs = [
                'raw', 'processed', 'reports', 'logs'
            ];
            
            for (const dir of testDirs) {
                const dirPath = path.join(this.outputDir, dir);
                await fs.access(dirPath);
                console.log(`✅ ${dir} directory accessible`);
            }
            
        } catch (error) {
            console.log(`⚠️  Test warning: ${error.message}`);
        }
    }
}

// Run setup if this file is executed directly
if (require.main === module) {
    const setup = new ScraperSetup();
    setup.run().catch(error => {
        console.error('❌ Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = ScraperSetup; 