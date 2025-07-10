const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const WebSocket = require('ws');
const BatchProcessor = require('./batch-processor');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

// Initialize scraper variable
let scraper = null;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Initialize batch processor
const batchProcessor = new BatchProcessor();

// Set up WebSocket broadcasting
function broadcastToClients(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// Set up batch processor callbacks
batchProcessor.setCallbacks({
    onStateChange: (state) => {
        broadcastToClients({
            type: 'queue_update',
            queue: state.queue,
            current: state.current,
            results: state.results
        });
    },
    onProgress: (id, stage, message) => {
        broadcastToClients({
            type: 'processing',
            id,
            stage,
            message
        });
    }
});

// WebSocket connection for real-time updates
wss.on('connection', (ws) => {
    console.log('Client connected');
    
    // Send current state to new client
    ws.send(JSON.stringify({
        type: 'state',
        queue: batchProcessor.getState().queue,
        current: batchProcessor.getState().current,
        results: batchProcessor.getState().results
    }));
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// API Routes
app.post('/api/add-urls', async (req, res) => {
    try {
        const { urls } = req.body;
        
        if (!Array.isArray(urls)) {
            return res.status(400).json({
                success: false,
                error: 'URLs must be an array'
            });
        }
        
        const added = batchProcessor.addUrls(urls);
        
        res.json({
            success: true,
            added: added.length,
            items: added
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/start-processing', async (req, res) => {
    try {
        const result = await batchProcessor.startProcessing();
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/clear-queue', async (req, res) => {
    try {
        await batchProcessor.clearQueue();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/stop-processing', async (req, res) => {
    try {
        await batchProcessor.stopProcessing();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/set-concurrent', async (req, res) => {
    try {
        const { maxConcurrent } = req.body;
        
        if (typeof maxConcurrent !== 'number' || maxConcurrent < 1 || maxConcurrent > 10) {
            return res.status(400).json({
                success: false,
                error: 'maxConcurrent must be a number between 1 and 10'
            });
        }
        
        batchProcessor.setMaxConcurrent(maxConcurrent);
        res.json({ 
            success: true, 
            maxConcurrent: maxConcurrent 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        state: batchProcessor.getState()
    });
});

// File Management API Routes
app.get('/api/list-processed-files', async (req, res) => {
    try {
        const processedDir = path.join(__dirname, '../../public/year5champions/processed');
        
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
        const csvFiles = files.filter(file => file.endsWith('.csv'))
                               .map(file => {
                                   const stats = { name: file };
                                   return stats;
                               });
        
        res.json({
            success: true,
            files: csvFiles,
            count: csvFiles.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.post('/api/rename-files-with-prefix', async (req, res) => {
    try {
        const { dayPrefix, selectedFiles } = req.body;
        
        if (!dayPrefix || typeof dayPrefix !== 'string') {
            return res.status(400).json({
                success: false,
                error: 'Day prefix is required and must be a string'
            });
        }
        
        if (!Array.isArray(selectedFiles) || selectedFiles.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Selected files array is required and must not be empty'
            });
        }
        
        const processedDir = path.join(__dirname, '../../public/year5champions/processed');
        const renamedFiles = [];
        const errors = [];
        
        for (const fileName of selectedFiles) {
            try {
                const oldPath = path.join(processedDir, fileName);
                
                // Check if file already has the prefix
                if (fileName.startsWith(dayPrefix)) {
                    errors.push(`${fileName}: Already has prefix ${dayPrefix}`);
                    continue;
                }
                
                const newFileName = `${dayPrefix}-${fileName}`;
                const newPath = path.join(processedDir, newFileName);
                
                // Check if target file already exists
                try {
                    await fs.access(newPath);
                    errors.push(`${fileName}: Target file ${newFileName} already exists`);
                    continue;
                } catch (error) {
                    // File doesn't exist, which is good
                }
                
                // Rename the file
                await fs.rename(oldPath, newPath);
                renamedFiles.push({
                    original: fileName,
                    renamed: newFileName
                });
                
                console.log(`✅ Renamed: ${fileName} → ${newFileName}`);
                
            } catch (error) {
                errors.push(`${fileName}: ${error.message}`);
                console.error(`❌ Failed to rename ${fileName}:`, error.message);
            }
        }
        
        res.json({
            success: true,
            renamedFiles,
            errors,
            total: selectedFiles.length,
            successful: renamedFiles.length,
            failed: errors.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Metadata Extraction API Routes
app.post('/api/extract-metadata', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({
                success: false,
                error: 'URL is required'
            });
        }

        console.log(`📊 Starting metadata extraction for: ${url}`);
        
        // Initialize scraper if needed
        if (!scraper) {
            const ALGSScraper = require('./algs-scraper');
            scraper = new ALGSScraper();
            await scraper.init();
        }

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

        console.log(`📊 Starting batch metadata extraction for ${urls.length} URLs`);
        
        // Initialize scraper if needed
        if (!scraper) {
            const ALGSScraper = require('./algs-scraper');
            scraper = new ALGSScraper();
            await scraper.init();
        }

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
        const processedDir = path.join(__dirname, '../../public/year5champions/processed');
        
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
        const processedDir = path.join(__dirname, '../../public/year5champions/processed');
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
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`
🚀 ALGS Tournament Batch Processor Server Started!

📊 Access the GUI at: http://localhost:${PORT}
🔧 API available at: http://localhost:${PORT}/api/*

Ready to process ALGS tournament data! 🏆
    `);
}); 