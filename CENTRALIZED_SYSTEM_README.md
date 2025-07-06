# ALGS Championship - Centralized Chart System

## 🎯 Overview

We have successfully refactored the ALGS Championship visualization codebase to use a **centralized chart plotting system**. This eliminates code duplication and provides a flexible, maintainable architecture for tournament data visualization.

## 🏗️ Architecture

### **1. Map Sequence Configuration (`js/mapSequences.js`)**
- **Centralized map sequences** for all matchups
- **Dynamic game count** support (6, 8, 12+ games)
- **Automatic matchup detection** from CSV filenames
- **Flexible map rotation** system

**Example:**
```javascript
'AvsB': {
    name: 'Groups A vs B',
    gameCount: 6,
    maps: {
        1: 'E-DISTRICT',
        2: 'E-DISTRICT', 
        3: 'STORM POINT',
        4: 'STORM POINT',
        5: 'WORLD\'S EDGE',
        6: 'WORLD\'S EDGE'
    }
}
```

### **2. Chart Engine (`js/chartEngine.js`)**
- **Unified rendering system** for all chart types
- **Dynamic color generation** for any number of games
- **Automatic data loading** and parsing
- **Intelligent map sequence integration**
- **Theme support** (default, dark, colorful, minimal)

**Key Features:**
- ✅ Automatically detects game count from CSV data
- ✅ Uses correct map sequence for each matchup
- ✅ Generates appropriate colors for any number of games
- ✅ Displays real-time map information
- ✅ Supports 6-game group stages and 8-game bracket stages
- ✅ Extensible for Finals with 12+ games

### **3. Navigation System**
- **Home page** (`index.html`) - Central navigation hub
- **Production charts** (`group_stages.html`) - Stable tournament overview
- **Experimental lab** (`experiment_page.html`) - Testing centralized features

## 🚀 Key Improvements

### **Before (Old System):**
- ❌ Duplicate code in every chart file
- ❌ Hardcoded map sequences in each file
- ❌ Fixed 6-game structure
- ❌ Manual color management
- ❌ Difficult to maintain and extend

### **After (Centralized System):**
- ✅ Single chart engine handles all matchups
- ✅ Centralized map sequence configuration
- ✅ Dynamic game count support (6, 8, 12+ games)
- ✅ Automatic color palette generation
- ✅ Easy to add new tournaments and formats

## 📊 Map Sequences

### **Group Stages (6 games):**
- **A vs B, C vs D, A vs C, A vs D**: E-District → Storm Point → World's Edge
- **B vs D, B vs C**: Storm Point → World's Edge → E-District

### **Bracket Stages (8 games):**
- **ER1**: E-District (3) → Storm Point (2) → World's Edge (3)
- **ER2**: Storm Point (2) → World's Edge (2) → E-District (2) → Storm Point (1) → World's Edge (1)
- **WR1**: World's Edge (2) → E-District (2) → Storm Point (2) → World's Edge (1) → E-District (1)

### **Finals (12+ games - configurable):**
- Flexible sequence supporting any number of games

## 🛠️ How to Use

### **1. Testing the Centralized System:**
1. Visit: `http://localhost:8000/experiment_page.html`
2. Select any matchup (AvsB, ER1, etc.)
3. Choose chart type and theme
4. Click "Load Chart"
5. The system will:
   - Automatically load the correct CSV data
   - Apply the right map sequence
   - Generate appropriate colors
   - Display real-time map information

### **2. Adding New Tournaments:**
1. **Add CSV data** with game columns
2. **Update map sequence** in `mapSequences.js`:
```javascript
'NEW_MATCHUP': {
    name: 'New Tournament Round',
    gameCount: 10, // Detected automatically from CSV
    maps: {
        1: 'MAP_NAME_1',
        2: 'MAP_NAME_2',
        // ... up to gameCount
    }
}
```
3. **Add to dropdown** in experiment page
4. **System automatically handles** the rest!

### **3. Production Integration:**
The existing `group_stages.html` continues to work with enhanced navigation:
- Navigate between Home → Group Stages → Experimental Lab
- Original tournament viewing experience preserved
- New features available in experimental area

## 🔧 Technical Features

### **Automatic Game Count Detection:**
```javascript
// Detects 6, 8, or any number of games from CSV structure
const gameCount = MapSequenceUtils.getDynamicGameCount(csvData);
```

### **Dynamic Color Generation:**
```javascript
// Generates harmonious colors for any number of games
const colors = MapSequenceUtils.generateColorPalette(gameCount);
```

### **Map Sequence Integration:**
```javascript
// Gets correct map for any game in any matchup
const mapName = MapSequenceUtils.getMapForGame('AvsB', gameNumber);
```

## 📈 Benefits

1. **Maintainability**: Single source of truth for chart logic
2. **Scalability**: Easy to add new tournaments and formats
3. **Consistency**: Uniform styling and behavior across all charts
4. **Flexibility**: Supports any number of games and map sequences
5. **User Experience**: Real-time map information and better controls

## 🎮 Live Demo

Visit the experimental lab at `http://localhost:8000/experiment_page.html` to see the centralized system in action!

- Try different matchups (6-game vs 8-game)
- Switch between themes
- Watch automatic map sequence updates
- See dynamic color generation

---

**The centralized system is now ready for production use and future tournament formats!** 🎉 