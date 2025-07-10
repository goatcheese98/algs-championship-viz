# 🚀 ALGS Tournament Batch Processing Automation System

## 📋 Overview

This automation system provides a complete web-based GUI for batch processing ALGS tournament data. You can paste multiple tournament URLs and the system will automatically:

1. **Scrape** tournament data from ALGS websites
2. **Convert** to simple format for main visualizations
3. **Convert** to bifurcated format for detailed tooltips

## 🎯 Quick Start

### Prerequisites
- Node.js installed on your system
- Internet connection for scraping

### Installation & Setup

1. **Navigate to the data extraction directory**:
   ```bash
   cd src/data-extraction
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the automation server**:
   ```bash
   npm start
   ```

4. **Open the GUI**:
   Open your browser and go to `http://localhost:3000`

## 🖥️ Using the GUI

### Step 1: Add Tournament URLs
1. Copy tournament URLs from ALGS websites
2. Paste them into the text area (one per line)
3. Click "Add to Queue"

**Example URLs:**
```
https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/WinnersRound1-1#tab_scores
https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/WinnersRound1-2#tab_scores
https://apexlegendsstatus.com/algs/Y5-Split1/ALGS-Open/Global/Day1/WinnersRound1-3#tab_scores
```

### Step 2: Start Processing
1. Review the queue to ensure all URLs are correct
2. Click "Start Processing"
3. Monitor real-time progress updates

### Step 3: View Results
- Results appear in real-time as processing completes
- Files are automatically saved to the correct directories
- Success/error status shown for each tournament

## 📁 File Structure

### Input
- URLs from `apexlegendsstatus.com` with `#tab_scores` fragment

### Output Files
```
public/year5champions/
├── raw/
│   ├── Day1-WinnersRound1-1.csv
│   ├── Day1-WinnersRound1-2.csv
│   └── Day1-WinnersRound1-3.csv
└── processed/
    ├── Day1-WinnersRound1-1-simple.csv
    ├── Day1-WinnersRound1-1-bifurcated.csv
    ├── Day1-WinnersRound1-2-simple.csv
    ├── Day1-WinnersRound1-2-bifurcated.csv
    └── ...
```

## 🎨 GUI Features

### 📊 **Real-time Dashboard**
- Live queue status
- Processing progress
- Success/error tracking
- Connection status indicator

### 🔄 **Queue Management**
- Add multiple URLs at once
- Duplicate detection
- Clear queue functionality
- URL validation

### 📈 **Statistics**
- Total URLs in queue
- Completed successfully
- Error count
- Processing time

### 📱 **Responsive Design**
- Works on desktop and mobile
- Modern, clean interface
- Progress indicators
- Real-time updates

## 🔧 Technical Architecture

### Frontend
- **HTML5 + CSS3**: Modern responsive design
- **WebSocket**: Real-time updates
- **JavaScript**: Dynamic UI updates

### Backend
- **Node.js + Express**: Web server
- **Puppeteer**: Web scraping
- **Child Processes**: Isolated scraping
- **File System**: CSV generation

### Processing Pipeline
1. **URL Validation**: Ensures valid ALGS tournament URLs
2. **Queue Management**: Handles batch processing order
3. **Web Scraping**: Extracts tournament data using Puppeteer
4. **Data Conversion**: Converts to standard formats
5. **File Generation**: Saves CSV files to correct directories

## 🛠️ System Components

### Core Files
```
src/data-extraction/
├── automation-server.js      # Main server
├── batch-processor.js        # Core processing logic
├── create-standard-formats.js # Format conversion
├── package.json              # Dependencies
├── public/
│   └── index.html            # GUI interface
└── GUI-README.md             # Detailed documentation
```

### API Endpoints
- `POST /api/add-urls` - Add URLs to processing queue
- `POST /api/start-processing` - Start batch processing
- `POST /api/clear-queue` - Clear all queued URLs
- `GET /api/status` - Get current system status

### WebSocket Events
- `state` - Initial state synchronization
- `queue_update` - Queue changes
- `processing` - Real-time progress updates
- `completed` - Processing completion

## 📊 Data Formats

### Simple Format (`*-simple.csv`)
Perfect for main visualizations:
```csv
Team,Game 1,Game 2,Game 3,Game 4,Game 5,Game 6,Overall Points
Falcons,16,30,11,3,19,20,99
Purple Slushee,3,1,4,16,8,19,51
```

### Bifurcated Format (`*-bifurcated.csv`)
Perfect for detailed tooltips:
```csv
Team,Game 1 P,Game 1 K,Game 2 P,Game 2 K,Game 3 P,Game 3 K,Overall Points
Falcons,4,12,12,18,5,6,99
Purple Slushee,2,1,1,0,1,3,51
```

## 🚨 Troubleshooting

### Common Issues

**Server Won't Start**
```bash
# Check if Node.js is installed
node --version

# Install dependencies
npm install

# Check if port 3000 is available
netstat -an | grep 3000
```

**URLs Not Processing**
- Ensure URLs contain `#tab_scores`
- Check internet connection
- Verify tournament pages are accessible

**Missing Output Files**
- Check directory permissions
- Ensure `public/year5champions/` exists
- Verify file system write access

**WebSocket Connection Issues**
- Refresh browser page
- Check browser console for errors
- Restart the server

### Debug Mode
```bash
# Run with debug output
DEBUG=* npm start

# Or run the test script
node test-automation.js
```

## 🎯 Best Practices

### URL Management
- Validate URLs before adding to queue
- Use consistent naming conventions
- Process tournaments in logical order

### Performance
- Process during off-peak hours
- Monitor system resources
- Close unnecessary browser tabs
- Use stable internet connection

### Data Organization
- Follow consistent file naming
- Backup important data
- Document processing batches

## 🔮 Advanced Usage

### Custom Processing
You can extend the system by:
- Adding custom validation rules
- Implementing additional data formats
- Adding scheduling capabilities
- Creating custom export options

### Integration
The system is designed to integrate with:
- Your existing visualization dashboard
- External data analysis tools
- Automated reporting systems
- CI/CD pipelines

## 📈 Performance Metrics

### Typical Processing Times
- **Single Tournament**: 30-60 seconds
- **Batch of 10 URLs**: 10-20 minutes
- **Memory Usage**: ~200MB per browser instance

### Recommended Limits
- **Queue Size**: Up to 50 URLs
- **Concurrent Processing**: 1 URL at a time
- **Session Duration**: Process in batches of 10-20

## 🛡️ Security & Privacy

### Local Environment
- System runs entirely on your local machine
- No data sent to external servers
- Full control over processing and storage

### Data Handling
- Temporary files cleaned up automatically
- No sensitive data stored
- All processing logs available locally

## 🎉 Success Stories

This automation system has been designed to handle:
- ✅ **Multiple tournament formats**
- ✅ **Batch processing of 50+ URLs**
- ✅ **Real-time monitoring and updates**
- ✅ **Automatic error recovery**
- ✅ **Consistent data formatting**

---

## 🚀 Get Started Now!

1. **Install**: `npm install`
2. **Start**: `npm start`
3. **Browse**: `http://localhost:3000`
4. **Process**: Paste URLs and click "Start Processing"

**Ready to automate your ALGS tournament data processing! 🏆** 