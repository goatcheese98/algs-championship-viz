# ALGS Championship Visualization

Interactive race chart visualization for the ALGS Championship tournament featuring 40+ teams across 5 days of competition.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server with live reload
npm run dev
```

This will open the application at `http://localhost:3000` with automatic browser refresh when you make changes.

## 📋 Available Scripts

- `npm run dev` - Start development server with home page (recommended)
- `npm run experiment` - Start development server with experimental lab
- `npm run tournament` - Start development server with tournament overview
- `npm start` - Start production server
- `npm run serve` - Start server without opening browser

## ✨ Features

- **Interactive animated race charts** with smooth transitions
- **Real-time team position tracking** with cumulative scoring
- **Custom team colors and styling** for all 40+ teams
- **Tournament progression visualization** across 5 days
- **Centralized chart engine** for consistent rendering
- **Map-based color coding** (E-District, Storm Point, World's Edge)
- **Responsive two-panel layout** with dedicated controls

## 🏗️ Project Structure

### Pages
- `index.html` - Modern home page with navigation
- `group_stages.html` - Tournament overview and production charts
- `experiment_page.html` - Experimental chart lab for testing

### Core Components
- `js/chartEngine.js` - Centralized chart rendering engine
- `js/mapSequences.js` - Map rotation and game configuration
- `teamConfig.js` - Team colors and styling configuration

### Data Files
- `*_points.csv` - Tournament matchup data (AvsB, BvsD, ER1, etc.)
- Various HTML files for individual race charts

## 🎮 Tournament Structure

- **Group Stages**: 6 games per matchup (AvsB, AvsC, BvsD, etc.)
- **Bracket Stages**: 8 games per round (ER1, ER2, etc.)
- **Finals**: 12+ games with extended competition (WR1, etc.)

## 🗺️ Map Rotation System

Each matchup follows a specific map sequence:
- **E-District** (Blue) - Technical urban combat
- **Storm Point** (Purple) - Challenging terrain
- **World's Edge** (Orange) - Classic competitive map

## 🔧 Development

The application uses:
- **D3.js v7** for data visualization and animations
- **Live Server** for fast development with hot reload
- **Vanilla JavaScript** for lightweight, fast performance
- **CSS Grid/Flexbox** for responsive layouts

## 📊 Data Format

CSV files contain team scores per game:
```csv
Team,Game 1,Game 2,Game 3,Game 4,Game 5,Game 6,Total
Team Alpha,15,12,18,20,14,16,95
Team Beta,18,16,15,17,19,13,98
...
```

## 🎯 Usage

1. **Home Page**: Navigate between different sections
2. **Tournament Overview**: View all matchups and standings
3. **Experimental Lab**: Test new features and chart configurations
4. **Individual Charts**: Deep dive into specific matchup details