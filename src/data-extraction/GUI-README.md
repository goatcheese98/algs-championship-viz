# 🏆 ALGS Tournament Batch Processor GUI

A powerful web-based automation system for batch processing ALGS tournament data. This GUI allows you to queue multiple tournament URLs and automatically process them through all three steps: scraping, conversion to simple format, and conversion to bifurcated format.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd src/data-extraction
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open the GUI
Open your browser and navigate to:
```
http://localhost:3000
```

## 📊 Features

### 🎯 **Automated Processing Pipeline**
- **Step 1**: Web scraping with Puppeteer
- **Step 2**: Convert to simple format (`*-simple.csv`)
- **Step 3**: Convert to bifurcated format (`*-bifurcated.csv`)

### 🔄 **Real-time Updates**
- Live queue status
- Processing progress tracking
- Real-time results display
- WebSocket-based communication

### 📋 **Batch Management**
- Add multiple URLs at once
- Queue management
- Duplicate detection
- Error handling and recovery

### 📱 **Modern UI**
- Responsive design
- Mobile-friendly
- Progress indicators
- Connection status

## 🛠️ Usage Guide

### Adding URLs
1. **Paste URLs** into the text area (one per line)
2. **Click "Add to Queue"** to validate and add URLs
3. **View Queue** to see all pending tournaments

### Processing
1. **Click "Start Processing"** to begin batch processing
2. **Monitor Progress** in real-time
3. **View Results** as they complete

### Example URLs
```
https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/WinnersRound1-1#tab_scores
https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/WinnersRound1-2#tab_scores
https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/WinnersRound1-3#tab_scores
```

## 📁 Output Files

All processed files are saved to:
- **Raw Data**: `public/year5champions/raw/`
- **Processed Data**: `public/year5champions/processed/`

### File Naming Convention
- **Raw**: `Day1-WinnersRound1-1.csv`
- **Simple**: `Day1-WinnersRound1-1-simple.csv`
- **Bifurcated**: `Day1-WinnersRound1-1-bifurcated.csv`

## 🔧 Technical Details

### Architecture
- **Frontend**: Modern HTML5 + CSS3 + JavaScript
- **Backend**: Node.js + Express
- **Real-time**: WebSocket connections
- **Scraping**: Puppeteer headless browser
- **Processing**: Custom JavaScript parsers

### API Endpoints
- `POST /api/add-urls` - Add URLs to queue
- `POST /api/start-processing` - Start batch processing
- `POST /api/clear-queue` - Clear processing queue
- `GET /api/status` - Get current system status

### WebSocket Events
- `state` - Initial state sync
- `queue_update` - Queue changes
- `processing` - Progress updates
- `completed` - Processing complete

## 📊 Data Formats

### Simple Format
```csv
Team,Game 1,Game 2,Game 3,Game 4,Game 5,Game 6,Overall Points
LG,2,34,26,26,0,9,97
Virtus.pro,10,0,13,10,6,27,66
```

### Bifurcated Format
```csv
Team,Game 1 P,Game 1 K,Game 2 P,Game 2 K,Game 3 P,Game 3 K,Overall Points
LG,2,0,12,22,12,14,97
Virtus.pro,1,9,0,0,4,9,66
```

## 🚨 Troubleshooting

### Common Issues

**Server Won't Start**
- Ensure Node.js is installed
- Check port 3000 is available
- Run `npm install` to install dependencies

**URLs Not Processing**
- Verify URLs contain `#tab_scores`
- Check internet connection
- Ensure target website is accessible

**Missing Files**
- Verify directory structure exists
- Check file permissions
- Ensure `public/year5champions/` directories exist

**WebSocket Disconnection**
- Refresh browser page
- Check console for errors
- Restart server if needed

## 🛡️ Security Notes

- **Local Use Only**: This system is designed for local development
- **No Authentication**: GUI is open access (localhost only)
- **File System Access**: System writes to local file system
- **Process Spawning**: Uses child processes for scraping

## 📈 Performance

### Recommended Limits
- **Concurrent URLs**: 1 at a time (sequential processing)
- **Queue Size**: Up to 50 URLs
- **Processing Time**: 30-60 seconds per tournament
- **Memory Usage**: ~200MB per browser instance

### Optimization Tips
- Process during off-peak hours
- Use stable internet connection
- Close unnecessary browser tabs
- Monitor system resources

## 🔮 Future Enhancements

- [ ] Parallel processing support
- [ ] Advanced queue management
- [ ] Export/import queue functionality
- [ ] Scheduling and automation
- [ ] Advanced error recovery
- [ ] Performance monitoring dashboard

## 🆘 Support

For issues or questions:
1. Check the console logs
2. Verify URL formats
3. Ensure all dependencies are installed
4. Check the main project documentation

---

**Ready to batch process your ALGS tournament data! 🏆** 