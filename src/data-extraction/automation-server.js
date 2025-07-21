const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Global variables
let scraper = null;
let batchProcessor = null;
let isProcessing = false;
let processingQueue = [];
let selectedFolder = 'year5champions'; // Default folder
let browserEngine = 'puppeteer'; // Default engine for backward compatibility

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('🔌 Client connected to automation server');
    
    // Send current state to newly connected client
    socket.emit('status', {
        isProcessing,
        queueLength: processingQueue.length,
        scraperInitialized: scraper !== null,
        selectedFolder: selectedFolder,
        browserEngine: browserEngine
    });
    
    socket.on('disconnect', () => {
        console.log('🔌 Client disconnected from automation server');
    });
});

// Broadcast state changes to all clients
function broadcastState() {
    io.emit('status', {
        isProcessing,
        queueLength: processingQueue.length,
        scraperInitialized: scraper !== null,
        selectedFolder: selectedFolder,
        browserEngine: browserEngine
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'ALGS Data Extraction Server',
        version: '1.0.0'
    });
});

// Get server status
app.get('/api/status', (req, res) => {
    res.json({
        isProcessing,
        queueLength: processingQueue.length,
        scraperInitialized: scraper !== null,
        selectedFolder: selectedFolder,
        browserEngine: browserEngine,
        timestamp: new Date().toISOString()
    });
});

// Initialize scraper
app.post('/api/initialize', async (req, res) => {
    try {
        if (!scraper) {
            const ScraperFactory = require('./scraper-factory');
            scraper = ScraperFactory.createScraper(browserEngine);
            await scraper.init();
        }
        
        res.json({
            success: true,
            message: `Scraper initialized successfully with ${browserEngine}`,
            browserEngine: browserEngine
        });
        
        broadcastState();
    } catch (error) {
        console.error('❌ Failed to initialize scraper:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Process single URL
app.post('/api/process-url', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }
        
        console.log(`📊 Processing single URL: ${url} to folder: ${selectedFolder}`);
        
        // Initialize scraper if needed
        if (!scraper) {
            const ScraperFactory = require('./scraper-factory');
            scraper = ScraperFactory.createScraper(browserEngine);
            await scraper.init();
        }
        
        // Set the selected folder for the scraper
        scraper.setSelectedFolder(selectedFolder);
        
        const result = await scraper.processURL(url);
        
        res.json({
            success: true,
            result: result
        });
        
    } catch (error) {
        console.error('❌ Error processing URL:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Start batch processing
app.post('/api/start-batch', async (req, res) => {
    try {
        const { urls, maxConcurrent = 2 } = req.body;
        
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'URLs array is required and must not be empty'
            });
        }
        
        if (isProcessing) {
            return res.status(400).json({
                success: false,
                error: 'Batch processing is already in progress'
            });
        }
        
        console.log(`🚀 Starting batch processing with ${urls.length} URLs`);
        
        // Initialize batch processor
        if (!batchProcessor) {
            const BatchProcessor = require('./batch-processor');
            batchProcessor = new BatchProcessor(maxConcurrent);
            
            // Set up progress callbacks
            batchProcessor.onProgress = (progress) => {
                io.emit('progress', progress);
            };
            
            batchProcessor.onStateChange = (state) => {
                io.emit('state', state);
            };
        }
        
        // Initialize scraper if needed
        if (!scraper) {
            const ScraperFactory = require('./scraper-factory');
            scraper = ScraperFactory.createScraper(browserEngine);
            await scraper.init();
        }
        
        // Set the selected folder for the scraper
        scraper.setSelectedFolder(selectedFolder);
        
        // Start processing
        isProcessing = true;
        processingQueue = urls.map((url, index) => ({
            id: `batch_${Date.now()}_${index}`,
            url,
            status: 'pending'
        }));
        
        broadcastState();
        
        // Process in background
        batchProcessor.processBatch(processingQueue, scraper)
            .then(results => {
                console.log('✅ Batch processing completed');
                isProcessing = false;
                processingQueue = [];
                broadcastState();
                
                io.emit('batch-complete', {
                    success: true,
                    results: results
                });
            })
            .catch(error => {
                console.error('❌ Batch processing failed:', error);
                isProcessing = false;
                processingQueue = [];
                broadcastState();
                
                io.emit('batch-complete', {
                    success: false,
                    error: error.message
                });
            });
        
        res.json({
            success: true,
            message: `Batch processing started with ${urls.length} URLs`,
            queueLength: processingQueue.length
        });
        
    } catch (error) {
        console.error('❌ Error starting batch processing:', error);
        isProcessing = false;
        processingQueue = [];
        broadcastState();
        
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Stop batch processing
app.post('/api/stop-batch', async (req, res) => {
    try {
        if (!isProcessing) {
            return res.status(400).json({
                success: false,
                error: 'No batch processing is currently in progress'
            });
        }
        
        console.log('🛑 Stopping batch processing');
        
        if (batchProcessor) {
            batchProcessor.stop();
        }
        
        isProcessing = false;
        processingQueue = [];
        broadcastState();
        
        res.json({
            success: true,
            message: 'Batch processing stopped'
        });
        
    } catch (error) {
        console.error('❌ Error stopping batch processing:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get processing queue
app.get('/api/queue', (req, res) => {
    res.json({
        success: true,
        queue: processingQueue,
        isProcessing: isProcessing,
        queueLength: processingQueue.length
    });
});

// Folder Management API Endpoints

// List available folders in /public
app.get('/api/list-folders', async (req, res) => {
    try {
        const publicDir = path.join(__dirname, '../../public');
        
        // Check if public directory exists
        try {
            await fs.access(publicDir);
        } catch (error) {
            return res.json({
                success: true,
                folders: [],
                selectedFolder: selectedFolder,
                message: 'Public directory not found'
            });
        }
        
        const items = await fs.readdir(publicDir);
        const folders = [];
        
        for (const item of items) {
            const itemPath = path.join(publicDir, item);
            const stats = await fs.stat(itemPath);
            
            if (stats.isDirectory()) {
                // Check if it has processed and raw subdirectories
                const processedPath = path.join(itemPath, 'processed');
                const rawPath = path.join(itemPath, 'raw');
                
                let hasProcessed = false;
                let hasRaw = false;
                let fileCount = 0;
                
                try {
                    await fs.access(processedPath);
                    hasProcessed = true;
                    const processedFiles = await fs.readdir(processedPath);
                    fileCount = processedFiles.filter(f => f.endsWith('.csv')).length;
                } catch (error) {
                    // No processed folder
                }
                
                try {
                    await fs.access(rawPath);
                    hasRaw = true;
                } catch (error) {
                    // No raw folder
                }
                
                folders.push({
                    name: item,
                    hasProcessed: hasProcessed,
                    hasRaw: hasRaw,
                    fileCount: fileCount,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    isSelected: item === selectedFolder
                });
            }
        }
        
        // Sort folders by name
        folders.sort((a, b) => a.name.localeCompare(b.name));
        
        res.json({
            success: true,
            folders: folders,
            selectedFolder: selectedFolder,
            count: folders.length
        });
        
    } catch (error) {
        console.error('❌ Error listing folders:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Create new folder
app.post('/api/create-folder', async (req, res) => {
    try {
        const { folderName } = req.body;
        
        if (!folderName || typeof folderName !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Folder name is required and must be a string'
            });
        }
        
        // Sanitize folder name
        const sanitizedName = folderName.replace(/[^a-zA-Z0-9_-]/g, '');
        
        if (sanitizedName.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Folder name must contain at least one alphanumeric character'
            });
        }
        
        const publicDir = path.join(__dirname, '../../public');
        const folderPath = path.join(publicDir, sanitizedName);
        const processedPath = path.join(folderPath, 'processed');
        const rawPath = path.join(folderPath, 'raw');
        
        // Check if folder already exists
        try {
            await fs.access(folderPath);
            return res.status(400).json({
                success: false,
                error: 'Folder already exists'
            });
        } catch (error) {
            // Folder doesn't exist, which is what we want
        }
        
        // Create the folder structure
        await fs.mkdir(folderPath, { recursive: true });
        await fs.mkdir(processedPath, { recursive: true });
        await fs.mkdir(rawPath, { recursive: true });
        
        console.log(`📁 Created new folder: ${sanitizedName}`);
        
        res.json({
            success: true,
            message: 'Folder created successfully',
            folderName: sanitizedName,
            folderPath: folderPath
        });
        
    } catch (error) {
        console.error('❌ Error creating folder:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Select folder for data processing
app.post('/api/select-folder', async (req, res) => {
    try {
        const { folderName } = req.body;
        
        if (!folderName || typeof folderName !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Folder name is required'
            });
        }
        
        const publicDir = path.join(__dirname, '../../public');
        const folderPath = path.join(publicDir, folderName);
        
        // Check if folder exists
        try {
            await fs.access(folderPath);
            const stats = await fs.stat(folderPath);
            
            if (!stats.isDirectory()) {
                return res.status(400).json({
                    success: false,
                    error: 'Selected item is not a folder'
                });
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                error: 'Selected folder does not exist'
            });
        }
        
        selectedFolder = folderName;
        console.log(`📁 Selected folder: ${selectedFolder}`);
        
        // Broadcast folder selection to all connected clients
        io.emit('folder-selected', {
            selectedFolder: selectedFolder
        });
        
        res.json({
            success: true,
            message: 'Folder selected successfully',
            selectedFolder: selectedFolder
        });
        
    } catch (error) {
        console.error('❌ Error selecting folder:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get current selected folder
app.get('/api/selected-folder', (req, res) => {
    res.json({
        success: true,
        selectedFolder: selectedFolder
    });
});

// Browser Engine Management API Endpoints

// Get available browser engines
app.get('/api/browser-engines', (req, res) => {
    const ScraperFactory = require('./scraper-factory');
    res.json({
        success: true,
        engines: ScraperFactory.getSupportedEngines(),
        currentEngine: browserEngine,
        defaultEngine: ScraperFactory.getDefaultEngine()
    });
});

// Set browser engine
app.post('/api/set-browser-engine', async (req, res) => {
    try {
        const { engine } = req.body;
        
        if (!engine || typeof engine !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Engine name is required'
            });
        }
        
        const ScraperFactory = require('./scraper-factory');
        const supportedEngines = ScraperFactory.getSupportedEngines();
        
        if (!supportedEngines.includes(engine)) {
            return res.status(400).json({
                success: false,
                error: `Unsupported engine: ${engine}. Supported engines: ${supportedEngines.join(', ')}`
            });
        }
        
        // Close existing scraper if running
        if (scraper) {
            console.log(`🔄 Switching from ${browserEngine} to ${engine}`);
            await scraper.close();
            scraper = null;
        }
        
        browserEngine = engine;
        console.log(`🔧 Browser engine set to: ${browserEngine}`);
        
        // Broadcast engine change to all connected clients
        io.emit('engine-changed', {
            browserEngine: browserEngine,
            timestamp: new Date().toISOString()
        });
        
        broadcastState();
        
        res.json({
            success: true,
            message: `Browser engine set to ${browserEngine}`,
            browserEngine: browserEngine,
            scraperReinitialized: false
        });
        
    } catch (error) {
        console.error('❌ Error setting browser engine:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get current browser engine
app.get('/api/current-browser-engine', (req, res) => {
    res.json({
        success: true,
        browserEngine: browserEngine,
        scraperInitialized: scraper !== null
    });
});

// List processed files
app.get('/api/list-processed-files', async (req, res) => {
    try {
        const processedDir = path.join(__dirname, `../../public/${selectedFolder}/processed`);
        
        // Check if directory exists
        try {
            await fs.access(processedDir);
        } catch (error) {
            return res.json({
                success: true,
                files: [],
                count: 0,
                message: `Processed directory not found for ${selectedFolder}`
            });
        }
        
        const files = await fs.readdir(processedDir);
        const csvFiles = files.filter(file => file.endsWith('.csv'));
        
        const fileDetails = [];
        for (const file of csvFiles) {
            const stats = await fs.stat(path.join(processedDir, file));
            fileDetails.push({
                name: file,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime
            });
        }
        
        res.json({
            success: true,
            files: fileDetails,
            count: fileDetails.length
        });
        
    } catch (error) {
        console.error('❌ Error listing processed files:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Rename files with day prefix
app.post('/api/rename-files-with-prefix', async (req, res) => {
    try {
        const { dayPrefix, selectedFiles } = req.body;
        
        if (!dayPrefix || !selectedFiles || !Array.isArray(selectedFiles)) {
            return res.status(400).json({
                success: false,
                error: 'Day prefix and selected files are required'
            });
        }
        
        const processedDir = path.join(__dirname, `../../public/${selectedFolder}/processed`);
        const results = {
            total: selectedFiles.length,
            successful: 0,
            failed: 0,
            renamedFiles: [],
            errors: []
        };
        
        for (const filename of selectedFiles) {
            try {
                const oldPath = path.join(processedDir, filename);
                const newFilename = `${dayPrefix}-${filename}`;
                const newPath = path.join(processedDir, newFilename);
                
                await fs.rename(oldPath, newPath);
                
                results.successful++;
                results.renamedFiles.push({
                    original: filename,
                    renamed: newFilename
                });
                
            } catch (error) {
                results.failed++;
                results.errors.push(`${filename}: ${error.message}`);
            }
        }
        
        res.json({
            success: results.successful > 0,
            ...results
        });
        
    } catch (error) {
        console.error('❌ Error renaming files:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Extract metadata from single URL
app.post('/api/extract-metadata', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        console.log(`📊 Starting metadata extraction for: ${url} to folder: ${selectedFolder}`);
        
        // Initialize scraper if needed
        if (!scraper) {
            const ScraperFactory = require('./scraper-factory');
            scraper = ScraperFactory.createScraper(browserEngine);
            await scraper.init();
        }

        // Set the selected folder for the scraper
        scraper.setSelectedFolder(selectedFolder);

        const result = await scraper.extractSingleMetadata(url);
        
        if (result.success) {
            res.json({
                success: true,
                message: 'Metadata extracted successfully',
                data: result,
                summary: result.summary
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error,
                message: 'Failed to extract metadata'
            });
        }
        
    } catch (error) {
        console.error('❌ Error in metadata extraction:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Internal server error during metadata extraction'
        });
    }
});

// Batch metadata extraction for multiple URLs
app.post('/api/batch-extract-metadata', async (req, res) => {
    try {
        const { urls } = req.body;
        
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'URLs array is required and must not be empty'
            });
        }

        console.log(`📊 Starting batch metadata extraction for ${urls.length} URLs to folder: ${selectedFolder}`);
        
        // Initialize scraper if needed
        if (!scraper) {
            const ScraperFactory = require('./scraper-factory');
            scraper = ScraperFactory.createScraper(browserEngine);
            await scraper.init();
        }

        // Set the selected folder for the scraper
        scraper.setSelectedFolder(selectedFolder);

        const results = [];
        const errors = [];
        
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            console.log(`Processing ${i + 1}/${urls.length}: ${url}`);
            
            try {
                const result = await scraper.extractSingleMetadata(url);
                results.push({
                    url: url,
                    index: i + 1,
                    ...result
                });
                
                // Small delay between requests to be respectful
                if (i < urls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`❌ Error processing URL ${url}:`, error);
                errors.push({
                    url: url,
                    index: i + 1,
                    error: error.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const summary = {
            total: urls.length,
            successful: successCount,
            failed: errors.length,
            results: results,
            errors: errors
        };

        res.json({
            success: successCount > 0,
            message: `Batch metadata extraction completed: ${successCount}/${urls.length} successful`,
            summary: summary
        });
        
    } catch (error) {
        console.error('❌ Error in batch metadata extraction:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Internal server error during batch metadata extraction'
        });
    }
});

// Get metadata files from processed directory
app.get('/api/list-metadata-files', async (req, res) => {
    try {
        const processedDir = path.join(__dirname, `../../public/${selectedFolder}/processed`);
        
        // Check if directory exists
        try {
            await fs.access(processedDir);
        } catch (error) {
            return res.json({
                success: true,
                files: [],
                message: 'Processed directory not found'
            });
        }
        
        const files = await fs.readdir(processedDir);
        const metadataFiles = files.filter(file => 
            file.endsWith('-metadata.json') || file.includes('metadata')
        );
        
        const fileDetails = [];
        
        for (const file of metadataFiles) {
            try {
                const filePath = path.join(processedDir, file);
                const stats = await fs.stat(filePath);
                const content = await fs.readFile(filePath, 'utf8');
                const metadata = JSON.parse(content);
                
                fileDetails.push({
                    filename: file,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                    roundName: metadata.roundInfo?.roundName || 'Unknown',
                    totalGames: metadata.roundInfo?.totalGames || 0,
                    maps: metadata.mapRotation?.length || 0,
                    bans: metadata.legendBans?.length || 0,
                    extractedAt: metadata.processingInfo?.extractedAt || null
                });
            } catch (error) {
                console.error(`Error reading metadata file ${file}:`, error);
                fileDetails.push({
                    filename: file,
                    error: 'Failed to read file',
                    size: 0,
                    created: null,
                    modified: null
                });
            }
        }
        
        res.json({
            success: true,
            files: fileDetails,
            count: fileDetails.length
        });
        
    } catch (error) {
        console.error('❌ Error listing metadata files:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to list metadata files'
        });
    }
});

// Get specific metadata file content
app.get('/api/get-metadata/:filename', async (req, res) => {
    try {
        const { filename } = req.params;
        const processedDir = path.join(__dirname, `../../public/${selectedFolder}/processed`);
        const filePath = path.join(processedDir, filename);
        
        // Security check - ensure filename doesn't contain path traversal
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid filename'
            });
        }
        
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const metadata = JSON.parse(content);
            
            res.json({
                success: true,
                filename: filename,
                metadata: metadata
            });
        } catch (error) {
            if (error.code === 'ENOENT') {
                res.status(404).json({
                    success: false,
                    error: 'Metadata file not found'
                });
            } else {
                throw error;
            }
        }
        
    } catch (error) {
        console.error('❌ Error getting metadata file:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to get metadata file'
        });
    }
});

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
    console.log(`
🚀 ALGS Tournament Batch Processor Server Started!
📍 Server: http://localhost:${PORT}
📊 GUI: http://localhost:${PORT}/
🔧 API: http://localhost:${PORT}/api/

Features Available:
• 📊 Tournament data scraping
• 🚀 Batch processing with concurrency control
• 📁 File management with day prefixes
• 🎮 Metadata extraction (maps & legend bans)
• 📋 Real-time progress tracking
• 🔄 WebSocket updates

Ready to process ALGS tournament data!
`);
}); 