const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const WebSocket = require('ws');
const BatchProcessor = require('./batch-processor');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

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

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`
🚀 ALGS Tournament Batch Processor Server Started!

📊 Access the GUI at: http://localhost:${PORT}
🔧 API available at: http://localhost:${PORT}/api/*

Ready to process ALGS tournament data! 🏆
    `);
}); 