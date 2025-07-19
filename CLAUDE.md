# ALGS Championship Visualization - Architecture Documentation

## Project Overview
Professional tournament visualization platform for ALGS (Apex Legends Global Series) championships using Vue.js, D3.js, and GSAP for interactive race charts and tournament dashboards.

## Architecture Decisions

### Frontend Framework Stack
- **Vue 3** with Composition API for reactive UI components
- **Vue Router 4** for SPA routing between tournaments  
- **Pinia** for centralized state management
- **Vite** as build tool and dev server
- **D3.js 7** for data visualization and chart rendering
- **GSAP 3** for professional animations and transitions

### Project Structure
```
src/
├── components/           # Vue components
│   ├── TournamentView.vue     # Main tournament display
│   ├── ActionPanel.vue        # Floating/integrated controls
│   ├── TournamentSelector.vue # Tournament selection logic
│   └── InteractiveRaceChart.vue # D3 chart wrapper
├── composables/          # Vue composition functions
│   ├── useTeamConfig.js       # Team configuration logic
│   ├── useGameControls.js     # Game control state
│   ├── useGameStyling.js      # Game styling utilities
│   └── useMapTooltips.js      # Tooltip management
├── stores/               # Pinia state stores
│   └── tournament.js          # Tournament state management
├── chart/               # Chart logic and data
│   ├── MapColoringLogic.js    # Map color assignment
│   └── MapSequenceData.js     # Tournament map sequences
├── data-extraction/     # Data processing tools
└── utils/               # Utility functions
    └── GSAPDraggableManager.js # GSAP dragging utilities
```

### State Management Architecture
- **Pinia store** (`tournament.js`) handles all tournament state
- **Reactive data flow** between components and store
- **Composables** abstract reusable logic for components
- **LocalStorage persistence** for panel preferences

### Data Processing Pipeline
1. **CSV Data Sources**: Raw tournament data in `/public/[tournament]/raw/`
2. **Intelligent Format Detection**: Auto-detects long vs wide format CSV
3. **Data Transformation**: Converts placement data to ALGS point system
4. **Pre-computation**: Game-by-game cumulative scoring for chart performance
5. **Map Integration**: Links games to map names and colors

### Tournament Support
- **Year 4 Championship**: Original 40-team tournament format
- **Year 5 Open**: New 6-round tournament structure  
- **EWC 2025**: Esports World Cup format with group stages

### Animation & UX Decisions
- **GSAP-powered animations** for professional feel
- **Responsive panel system**: Integrated sidebar + floating panel options
- **Mobile-first design** with adaptive layouts
- **Performance optimization**: Hardware acceleration and efficient rendering

### Component Communication
- **Store actions** for state mutations
- **Reactive computed properties** for derived state
- **Event emission** for child-to-parent communication
- **Composables** for shared logic between components

### Build & Deployment
- **GitHub Pages** deployment via Vite static build
- **Asset optimization** for web delivery
- **Environment-specific** data paths

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run automation-server` - Start data processing server

## Key Files
- `src/stores/tournament.js` - Central state management
- `src/components/TournamentView.vue` - Main UI component
- `src/chart/MapColoringLogic.js` - Map visualization logic
- `package.json` - Dependencies and project metadata
- `vite.config.js` - Build configuration