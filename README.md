# ALGS Tournament Dashboard v3.0

A modern, professional esports analytics platform for the Apex Legends Global Series (ALGS). Built with Vue 3, D3.js, and Tailwind CSS.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![Vue](https://img.shields.io/badge/Vue-3.5+-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## ✨ What's New in v3.0

Complete overhaul with modern architecture and design:

- **🎨 Modern Glassmorphism UI** - Clean, professional design with subtle depth effects
- **📱 Fully Responsive** - Optimized for all screen sizes
- **⚡ Performance** - 60fps animations, chunked bundle loading
- **🎯 Composition API** - Modern Vue 3 patterns throughout
- **🔧 TypeScript-Ready** - Clean code structure ready for TS migration
- **♿ Accessible** - Keyboard navigation, ARIA labels, focus states

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Architecture

```
src/
├── components/           # Vue components
│   ├── IndexApp.vue     # Landing page
│   ├── TournamentView.vue # Main tournament view
│   ├── RaceChart.vue    # D3.js race chart
│   ├── PlaybackControls.vue # Playback UI
│   └── GameFilter.vue   # Game filter dropdown
├── stores/              # Pinia stores
│   └── tournament.js    # Tournament state management
├── chart/               # Chart utilities
│   ├── MapSequenceData.js
│   └── MapColoringLogic.js
├── router/              # Vue Router
│   └── index.js
├── styles/              # Global styles
│   └── main.css         # Tailwind + custom CSS
├── App.vue              # Root component
└── main.js              # Entry point
```

## 🎨 Design System

### Colors
- **Primary**: Sky blue (`#0ea5e9`) - interactive elements
- **Surface**: Slate grays - backgrounds and cards
- **Accents**: Gold, silver, bronze - rankings and stats
- **Maps**: Unique colors for each map type

### Components
- **Glass Cards** - Translucent backgrounds with blur
- **Buttons** - Primary, secondary, ghost variants
- **Badges** - Status indicators (live, ended, upcoming)
- **Rank Badges** - Special styling for top 3 ranks

## 📊 Features

### Tournament Support
- **Year 4 Championship** - Sapporo, Japan (40 teams, 4 days)
- **Year 5 Open** - Global Tournament (40 teams)
- **EWC 2025** - Esports World Cup (20 teams)

### Interactive Chart
- Race chart with smooth animations
- Game-by-game progression
- Map color coding
- Hover tooltips with detailed stats
- Filter by specific games

### Playback Controls
- Play/Pause animation
- Adjustable speed (1x, 2x, 4x)
- Slider scrubbing
- Jump to start/end

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue | 3.5+ | UI Framework |
| Vue Router | 4.5+ | Client-side routing |
| Pinia | 2.3+ | State management |
| D3.js | 7.9+ | Data visualization |
| Tailwind CSS | 3.4+ | Styling |
| Vite | 6.0+ | Build tool |

## 📦 Bundle Analysis

```
dist/
├── index.html          (0.69 kB gzip)
├── index-[hash].css    (5.58 kB gzip)
├── index-[hash].js     (13.35 kB gzip)
├── d3-[hash].js        (19.15 kB gzip) - Lazy loaded
└── vendor-[hash].js    (38.52 kB gzip) - Vue, Router, Pinia
```

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📝 License

MIT License - see LICENSE for details

---

Built with ❤️ for the ALGS community
