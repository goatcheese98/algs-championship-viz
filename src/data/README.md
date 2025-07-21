# Data Management

This directory contains extracted data structures for better organization and maintainability.

## Directory Structure

```
src/data/
├── tournaments/           # Tournament configurations
│   ├── index.js          # Data service and exports
│   ├── ewc-2025.json     # EWC 2025 tournament config
│   ├── year-5-open.json  # Year 5 Open tournament config
│   └── year-4-championship.json # Year 4 Championship config
├── maps.json             # Map images and metadata
└── README.md            # This file
```

## Data Extraction Benefits

- **Reduced Component Size**: Removed ~210 lines from Vue components
- **Maintainability**: Data changes don't require component modifications
- **Reusability**: Data can be shared across multiple components
- **Type Safety**: Can add TypeScript interfaces for data structures
- **Performance**: Data can be lazy-loaded or cached
- **Testing**: Data can be mocked/stubbed easily

## Usage Examples

### Import Data Service
```javascript
import { 
  getTournamentDays, 
  getMapImageUrl, 
  getTournamentConfig 
} from '@/data/tournaments'
```

### Get Tournament Days
```javascript
// In component data() or computed
const days = getTournamentDays('ewc-2025')
const days = getTournamentDays('year-5-open') 
const days = getTournamentDays('year-4-championship')
```

### Get Map Images
```javascript
// Handles normalization and fallbacks
const imageUrl = getMapImageUrl("World's Edge")
const imageUrl = getMapImageUrl("WORLD'S EDGE") // Same result
const imageUrl = getMapImageUrl("E-District")   // Handles aliases
```

### Get Full Tournament Config
```javascript
const config = getTournamentConfig('ewc-2025')
console.log(config.name) // "EWC 2025"
console.log(config.description) // "Esports World Cup 2025"
```

## Data Schema

### Tournament Configuration
```json
{
  "id": "tournament-id",
  "name": "Tournament Name", 
  "description": "Tournament Description",
  "days": [
    {
      "id": "day1",
      "name": "Day 1 - Stage Name",
      "description": "Day description",
      "matchups": [
        {
          "id": "matchup-id",
          "title": "Matchup Title",
          "description": "Matchup description",
          "teams": 20,
          "games": 6, // or "auto"
          "maps": "Map1 → Map2 → Map3"
        }
      ]
    }
  ]
}
```

### Maps Configuration
```json
{
  "images": {
    "MapName": "https://image-url.com/image.jpg"
  },
  "aliases": {
    "ALTERNATE_NAME": "MapName"
  }
}
```

## Adding New Data

### New Tournament
1. Create `new-tournament.json` in `tournaments/` directory
2. Follow the tournament schema above
3. Add to `tournaments` object in `index.js`
4. Import in components as needed

### New Map
1. Add image URL to `maps.json` under `images`
2. Add any aliases under `aliases` if needed
3. Use `getMapImageUrl()` to access

## Migration Notes

### Components Updated
- ✅ **TournamentSelector.vue**: ~200 lines → ~15 lines (92% reduction)
- ✅ **ActionPanel.vue**: ~12 lines → ~3 lines (75% reduction)

### Before/After Comparison
```javascript
// BEFORE: Massive inline data structures
data() {
  return {
    tournamentDays: this.isEwc2025Tournament ? [
      // 200+ lines of nested objects...
    ] : // more configurations...
  }
}

// AFTER: Clean data service usage
import { getTournamentDays } from '@/data/tournaments'

data() {
  return {
    tournamentDays: this.getTournamentData()
  }
},
methods: {
  getTournamentData() {
    if (this.isEwc2025Tournament) return getTournamentDays('ewc-2025')
    if (this.isYear5Tournament) return getTournamentDays('year-5-open')
    return getTournamentDays('year-4-championship')
  }
}
```

This extraction establishes a scalable data management pattern for the entire project.