# ALGS Year 4 Championship - Sapporo, Japan
## Interactive Tournament Visualization System

Professional-grade visualization for the ALGS Year 4 Championship featuring 40+ teams across multiple tournament days with real-time animated charts, GSAP-powered draggable controls, and comprehensive tournament coverage.

**📅 Tournament Details:**
- **Location**: Sapporo, Japan  
- **Dates**: January 29 - February 2, 2025
- **Teams**: 40+ Professional Apex Legends teams
- **Format**: Group stages, elimination rounds, and finals

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server with live reload
npm run dev
```

This will open the application at `http://localhost:3000`. Navigate to the **"ALGS Year 4 Championship"** button to access the full tournament interface.

## 📋 Available Scripts

- `npm run dev` - Start development server (recommended)
- `npm start` - Start production server
- `npm run serve` - Start server without opening browser

## ✨ Key Features

### 🏆 **Complete Tournament Coverage**
- **4+ Days of Championship Action** - Group stages through finals
- **All Matchups Included** - AvsB, CvsD, ER1, ER2, WR1, and more
- **Real-time Position Tracking** - Live team rankings with cumulative scoring
- **Professional Tournament Interface** - Single unified system

### ⚡ **GSAP-Powered Interface**
- **Draggable Control Panel** - Smooth, high-performance dragging with momentum
- **Hardware Acceleration** - 60fps animations with transform3d optimization
- **Game Filtering System** - Select specific games (3,4,5) with instant visual updates
- **Progress Tracking** - Always-visible game progress slider

### 🗺️ **Advanced Map Visualization**
- **HSL Color Coding** - Storm Point (orange), World's Edge (red), E-District (purple)
- **Occurrence-Based Colors** - Dynamic color progression (1st, 2nd, 3rd occurrence)
- **Map-Aware Rendering** - Colors automatically adjust based on game sequence

### 📊 **Interactive Chart System**
- **900px Height Charts** - Optimal team spacing and readability  
- **Animated Race Progression** - Smooth transitions between game states
- **50% Thicker Bars** - Enhanced visual clarity and impact
- **Custom Team Styling** - Individual team colors and rankings

## 🏗️ Production Architecture

### **Single Unified Interface**
- `year_4_championship.html` - **Production tournament interface**
- `index.html` - ALGS tournament dashboard homepage
- Clean, professional two-page architecture

### **Core Engine**
- `js/chartEngine.js` - Centralized chart rendering with GSAP integration
- `js/mapSequences.js` - Tournament configuration and map sequences

### **Tournament Data**
- `*_points.csv` - All tournament matchup data files
- Structured data for consistent visualization across all days

## 🎮 Tournament Structure

### **Day 1-2: Group Stages**
- **6 games per matchup** (AvsB, AvsC, AvsD, BvsC, BvsD, CvsD)
- Round-robin format with all group combinations

### **Day 3: Elimination Round 1**  
- **8 games** (ER1) - First elimination bracket
- Higher stakes, extended game count

### **Day 4: Finals**
- **ER2** (8 games) - Elimination Round 2
- **WR1** (8 games) - Winners Round 1
- Championship culmination

## 🎨 Professional Design System

### **Championship Branding**
- **Header**: Animated ALGS Year 4 Championship title
- **Location Badge**: Highlighted "Sapporo, Japan" with pulsing effects
- **Date Display**: Dynamic "Jan 29 - Feb 2, 2025" with gradient highlighting
- **Gaming Aesthetic**: Professional esports color scheme and effects

### **Advanced Controls**
- **Translucent Panel**: Background transparency with opaque controls
- **Premium Buttons**: 3D gradients, shine effects, and hover animations
- **GSAP Animations**: Smooth entrance effects and professional transitions

## 🔧 Technical Implementation

### **Technology Stack**
- **Vue.js 3** - Reactive interface and state management
- **D3.js v7** - Data visualization and chart rendering  
- **GSAP 3.12** - High-performance animations and dragging
- **Modern CSS** - Hardware-accelerated styling and effects

### **Performance Optimizations**
- **Centralized Chart Manager** - Prevents memory leaks and duplicate instances
- **Hardware Acceleration** - GPU-powered transforms and animations
- **Efficient Filtering** - Smart game filtering without full re-renders
- **Responsive Design** - Scales perfectly from desktop to mobile

## 📊 Data Structure

```csv
Team,Game 1,Game 2,Game 3,Game 4,Game 5,Game 6,Total
TSM,15,12,18,20,14,16,95
100 Thieves,18,16,15,17,19,13,98
FNATIC,12,20,16,18,15,17,98
...
```

## 🚀 Production Deployment

### **Local Development**
1. **ALGS Dashboard**: Open `index.html` for the main tournament dashboard
2. **Championship Access**: Click "Enter Championship" to access Year 4 tournament
3. **Navigate Days**: Use day selector to switch between tournament days  
4. **Select Matchups**: Choose specific matchups within each day
5. **Control Playback**: Use draggable controls for game progression
6. **Filter Games**: Select specific games for detailed analysis

### **GitHub Pages Deployment** 🌐

This project is automatically deployed to GitHub Pages using GitHub Actions. The deployment process:

#### **Automatic Deployment**
- **Triggers**: Pushes to `main` or `master` branch
- **Workflow**: `.github/workflows/deploy.yml` handles the entire process
- **Live URL**: `https://gareth-seaward.github.io/algs-y4-viz`

#### **What Gets Deployed**
- ✅ All HTML files (`index.html`, `year_4_championship.html`)
- ✅ JavaScript modules (`js/chartEngine.js`, `js/teamConfig.js`, `js/mapSequences.js`)
- ✅ Tournament data (all `*.csv` files)
- ✅ Documentation and assets
- ✅ `.nojekyll` file for proper GitHub Pages support

#### **Manual Deployment Setup**
If you're forking this repository:

1. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to "Pages" section
   - Select "GitHub Actions" as the source

2. **Verify Workflow**:
   - Check that `.github/workflows/deploy.yml` exists
   - Ensure your repository has the necessary permissions

3. **Build Locally** (optional):
   ```bash
   npm run build
   # Creates ./dist folder with deployment files
   ```

4. **Custom Domain** (optional):
   - Add `CNAME` file to root directory
   - Configure custom domain in repository settings

#### **Deployment Status**
- **Build Status**: Visible in Actions tab
- **Deployment URL**: Available after successful build
- **Automatic Updates**: Every push triggers new deployment

## 🎯 Key Improvements Over Legacy System

- ✅ **Unified Interface** - Single application instead of 20+ separate files
- ✅ **GSAP Performance** - Smooth 60fps animations vs. laggy CSS transitions  
- ✅ **Vue.js Reactivity** - Real-time state management vs. manual DOM updates
- ✅ **Professional Design** - Championship branding vs. basic styling
- ✅ **Better UX** - Draggable controls vs. fixed control panels
- ✅ **Comprehensive Coverage** - All tournament days in one interface

## 💡 Usage Guide

### **Quick Navigation**
1. Start at the **ALGS tournament dashboard** for tournament overview
2. Click **"Enter Championship"** to access the Year 4 Championship interface  
3. Use **day tabs** to navigate between tournament days
4. Select **matchups** within each day for detailed visualization

### **Advanced Controls**
- **Drag the control panel** anywhere on screen for optimal viewing
- **Use game filtering** to analyze specific game subsets
- **Progress slider** shows current game progression
- **Play/Reset buttons** control automated playback

---

**🏆 Built for the ALGS Year 4 Championship - Sapporo, Japan 2025**