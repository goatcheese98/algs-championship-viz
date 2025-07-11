# ALGS Tournament Data Extraction System

A comprehensive data extraction system for ALGS (Apex Legends Global Series) tournament data with a web-based GUI interface.

## Features

- 🎯 **Single URL Processing**: Extract data from individual tournament pages
- 🚀 **Batch Processing**: Process multiple URLs simultaneously with configurable concurrency
- 📁 **File Management**: Rename and organize processed CSV files with day prefixes
- 🎮 **Metadata Extraction**: Extract map rotations and legend ban information
- 📊 **Real-time Progress**: WebSocket-based live updates and progress tracking
- 🔧 **Web GUI**: User-friendly interface accessible via browser

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Access the GUI**
   Open your browser to: `http://localhost:3002`

## Usage

### Web Interface

The main GUI provides several sections:

- **Server Status**: Monitor connection and processing status
- **Single URL Processing**: Process individual tournament URLs
- **Batch Processing**: Handle multiple URLs with concurrency control
- **File Management**: Rename CSV files with day prefixes
- **Metadata Extraction**: Extract map and legend ban data
- **Processing Queue**: Monitor current processing tasks

### Example URLs

```
https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/WinnersRound1-1
https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/WinnersRound1-2
https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/EliminationRound1-1
```

For metadata extraction, append `#tab_replaysandbans` to the URL.

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/status` - Server status
- `POST /api/process-url` - Process single URL
- `POST /api/start-batch` - Start batch processing
- `POST /api/stop-batch` - Stop batch processing
- `GET /api/queue` - Get processing queue
- `POST /api/extract-metadata` - Extract metadata from single URL
- `POST /api/batch-extract-metadata` - Extract metadata from multiple URLs

## File Structure

```
src/data-extraction/
├── automation-server.js      # Main server
├── public/
│   └── index.html            # Web GUI
├── algs-scraper.js           # Core scraper
├── batch-processor.js        # Batch processing logic
├── scraper-utils.js          # Utility functions
├── package.json              # Dependencies
└── README.md                 # This file
```

## Development

1. **Development Mode**
   ```bash
   npm run dev
   ```

2. **Testing**
   ```bash
   npm test
   ```

## Output

Processed data is saved to:
- `../../public/year5champions/processed/` - CSV files
- `../../public/year5champions/raw/` - Raw data files

## Configuration

- **Port**: Default 3002 (set via `PORT` environment variable)
- **Concurrency**: Configurable via web interface (1-5 concurrent processes)
- **File Naming**: Day prefixes can be customized (Day1, Day2, etc.)

## Troubleshooting

1. **Connection Issues**: Ensure port 3002 is available
2. **Processing Errors**: Check browser console for detailed error messages
3. **File Permissions**: Ensure write permissions for output directories

## Support

For issues or feature requests, check the processing logs and browser console for detailed error information. 