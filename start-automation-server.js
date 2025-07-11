#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const serverPath = path.join(__dirname, 'src', 'data-extraction', 'automation-server.js');

console.log('🚀 Starting ALGS Data Extraction Server...');
console.log(`Server path: ${serverPath}`);

const server = spawn('node', [serverPath], {
    stdio: 'inherit',
    cwd: path.join(__dirname, 'src', 'data-extraction')
});

server.on('error', (err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});

server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    server.kill('SIGTERM');
}); 