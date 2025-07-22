# ALGS Championship Visualization - Architecture Rebuild Plan

## Project Overview

A complete rewrite of the ALGS Championship tournament visualization dashboard from legacy JavaScript/Options API to modern TypeScript + Composition API architecture, following VUE_RULEKIT guidelines for maintainable, scalable, and performant code.

## Current Status

### ✅ Completed Phase: Legacy Cleanup
- **Archive Created**: All legacy files moved to `archive/src/` with `.backup` extensions
- **Directory Structure**: Maintained exact folder structure for reference
- **Clean Slate**: `src/components/`, `src/composables/`, `src/stores/` emptied and ready

### 📁 Archived Legacy Files
```
archive/src/
├── components/
│   ├── ActionPanel.vue.backup           # Interactive control panel (Options API)
│   ├── IndexApp.vue.backup              # Landing page (Options API)
│   ├── InteractiveRaceChart.vue.backup  # D3.js chart component (Composition API)
│   ├── TournamentSelector.vue.backup    # Tournament selector (Options API)
│   └── TournamentView.vue.backup        # Main view (Options API, highest complexity)
├── composables/
│   ├── useTeamConfig.js.backup          # Team configuration logic
│   └── useVisualEnhancer.js.backup      # Visual enhancement utilities
├── stores/
│   └── tournament.js.backup             # Main Pinia store (JavaScript)
└── utils/
    ├── GSAPDraggableManager.js.backup   # Draggable functionality
    └── TooltipManager.js.backup         # Tooltip system
```

### 🎯 Core Features Identified
From legacy analysis, the application provides:

1. **Tournament Management**
   - Tournament type selection (Year 4, Year 5, EWC 2025)
   - Day/matchup selection within tournaments
   - Data loading and processing

2. **Interactive Race Chart**
   - D3.js-powered racing bar chart
   - Real-time game progression
   - Team performance visualization
   - Map-based coloring system

3. **Game Controls & Filtering**
   - Play/pause/reset functionality
   - Game-by-game navigation
   - Selective game filtering
   - Animation speed controls

4. **Data Export & Legend**
   - CSV data export
   - Chart legend toggle
   - Interactive tooltips

## New Architecture Design

### 🏗️ Directory Structure (VUE_RULEKIT Compliant)
```
src/
├── api/                     # Pure data fetching functions
│   ├── tournaments.ts       # Tournament data fetching
│   └── charts.ts           # Chart data processing
├── queries/                 # Pinia Colada reactive queries
│   ├── tournaments.ts       # Tournament queries
│   └── charts.ts           # Chart data queries
├── stores/                  # Pure state management (TypeScript)
│   ├── tournament.ts        # Tournament state
│   ├── chart.ts            # Chart state
│   └── ui.ts               # UI state (panels, tooltips)
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.vue
│   │   ├── Slider.vue
│   │   ├── Tooltip.vue
│   │   └── Modal.vue
│   ├── layout/             # Layout components
│   │   ├── AppLayout.vue
│   │   └── AppHeader.vue
│   └── features/           # Feature-specific components
│       ├── tournament/
│       │   ├── TournamentSelector.vue
│       │   └── TournamentView.vue
│       ├── charts/
│       │   ├── InteractiveRaceChart.vue
│       │   └── ChartLegend.vue
│       └── controls/
│           ├── ActionPanel.vue
│           ├── GameControls.vue
│           └── GameFilters.vue
├── composables/            # Composition functions (TypeScript)
│   ├── useTooltip.ts       # Unified tooltip system
│   ├── useDraggable.ts     # Draggable functionality
│   ├── useChart.ts         # Chart-specific logic
│   └── useKeyboard.ts      # Keyboard shortcuts
├── types/                  # TypeScript type definitions
│   ├── tournament.ts       # Tournament-related types
│   ├── chart.ts           # Chart data types
│   └── api.ts             # API response types
└── utils/                  # Pure utility functions
    ├── data-transforms.ts  # Data transformation utilities
    ├── color-utils.ts      # Color and theming utilities
    └── performance.ts      # Performance optimization utilities
```

## Implementation Strategy

### 🎯 Phase 1: Foundation (Types & Store)
**Goal**: Establish type-safe foundation with proper state management

#### 1.1 TypeScript Interfaces
- Define core data structures
- Tournament, Game, Team, Chart data types
- API response interfaces
- Component prop interfaces

#### 1.2 Modern Pinia Stores
- **Tournament Store**: State management for tournament selection, data loading
- **Chart Store**: Chart-specific state (current game, filtering, animation)  
- **UI Store**: Panel states, tooltip management, user preferences

#### 1.3 API Layer
- Separate data fetching from components
- Pure functions for CSV loading and processing
- Error handling and loading states

### 🎯 Phase 2: Core Components (UI Foundation)
**Goal**: Build reusable UI components with proper typing

#### 2.1 UI Components Library
- Button, Slider, Tooltip components
- Proper TypeScript props and emits
- Consistent styling with Tailwind
- Full accessibility support

#### 2.2 Layout Components
- App layout structure
- Responsive design patterns
- Navigation and header components

### 🎯 Phase 3: Feature Components (Business Logic)
**Goal**: Implement feature-specific components with clean separation

#### 3.1 Tournament Management
- Tournament selector with type safety
- Tournament view container
- Data loading and error states

#### 3.2 Chart System
- Interactive race chart (TypeScript conversion of existing D3.js logic)
- Chart legend component
- Performance optimization for large datasets

#### 3.3 Control System
- Action panel with modern architecture
- Game controls (play/pause/reset)
- Game filtering system
- Export functionality

### 🎯 Phase 4: Advanced Features (Optimization)
**Goal**: Performance optimization and advanced user experience

#### 4.1 Performance Enhancements
- Lazy loading of components
- Optimized reactivity patterns
- Memory leak prevention
- Bundle size optimization

#### 4.2 User Experience
- Keyboard shortcuts
- Advanced tooltips and help system
- User preferences persistence
- Accessibility improvements

#### 4.3 Developer Experience
- Comprehensive TypeScript coverage
- Component testing setup
- Documentation and examples

## Technical Decisions & Patterns

### 🔧 State Management Architecture
```typescript
// Single source of truth pattern
const tournamentStore = useTournamentStore()
const { selectedTournament, isLoading } = storeToRefs(tournamentStore)

// No local component state for global data
// Use computed properties for derived state
const filteredGames = computed(() => 
  tournamentStore.games.filter(game => selectedFilters.value.includes(game.id))
)
```

### 🔧 Component Composition Pattern
```vue
<script setup lang="ts">
// Proper TypeScript props definition
interface Props {
  tournament: Tournament
  readonly?: boolean
}
defineProps<Props>()

// Typed emits
interface Emits {
  select: [tournament: Tournament]
  update: [data: TournamentData]
}
const emit = defineEmits<Emits>()

// Store integration
const store = useTournamentStore()
const { selectTournament } = store
</script>
```

### 🔧 Data Flow Pattern
```
API Functions → Pinia Colada Queries → Pinia Stores → Components
     ↓                ↓                    ↓           ↓
  Pure functions   Reactive caching   State mgmt    UI rendering
```

## Performance Optimization Strategy

### 📈 Bundle Optimization
- **Tree shaking**: Proper ES modules usage
- **Code splitting**: Route-based and feature-based splitting
- **Lazy loading**: Components loaded when needed

### 📈 Runtime Optimization
- **Computed properties**: Cached derived state
- **Proper reactivity**: Avoid unnecessary re-renders  
- **Memory management**: Cleanup on component unmount
- **Debounced updates**: For high-frequency events (sliders, filters)

### 📈 Chart Performance
- **Canvas optimization**: Efficient D3.js rendering
- **Data virtualization**: For large datasets
- **Animation optimization**: GSAP performance patterns
- **Smooth interactions**: Proper event handling

## Testing Strategy

### 🧪 Unit Testing
- Store logic testing
- Utility function testing
- Component logic testing (excluding UI)

### 🧪 Integration Testing  
- Component interaction testing
- Store integration testing
- API integration testing

### 🧪 E2E Testing
- User workflow testing with Playwright
- Cross-browser compatibility
- Performance testing

## Migration Checklist

### ✅ Completed
- [x] Legacy code archived with structure preservation
- [x] VUE_RULEKIT compliance analysis
- [x] Architecture planning and documentation

### 🔄 Phase 1: Foundation
- [ ] Define TypeScript interfaces and types
- [ ] Create modern Pinia stores with TypeScript
- [ ] Implement API layer separation
- [ ] Set up Pinia Colada for reactive queries

### 🔄 Phase 2: UI Foundation  
- [ ] Build reusable UI component library
- [ ] Implement layout components
- [ ] Set up proper styling system

### 🔄 Phase 3: Feature Implementation
- [ ] Convert tournament management components
- [ ] Rebuild interactive chart system
- [ ] Implement modern control panel

### 🔄 Phase 4: Optimization & Polish
- [ ] Performance optimization
- [ ] Advanced UX features
- [ ] Testing implementation
- [ ] Documentation completion

## Key Principles for Implementation

### 🎯 Code Quality
1. **Single Responsibility**: Each component/function has one clear purpose
2. **Type Safety**: Full TypeScript coverage with proper interfaces
3. **Composition over Inheritance**: Use composables for shared logic
4. **Immutable Data**: Avoid direct state mutations

### 🎯 Performance  
1. **Lazy Loading**: Load components and data when needed
2. **Efficient Updates**: Minimize reactivity overhead
3. **Memory Management**: Proper cleanup and garbage collection
4. **Bundle Optimization**: Keep initial load size minimal

### 🎯 Maintainability
1. **Clear Naming**: Descriptive, consistent naming conventions
2. **Proper Documentation**: Code comments explain "why", not "what"
3. **Modular Architecture**: Easy to modify, extend, and test
4. **Error Handling**: Graceful error handling throughout

## Success Metrics

### 📊 Technical Metrics
- **Bundle Size**: < 50% of current size through optimization
- **Load Time**: < 2s initial load on 3G connection
- **Type Coverage**: 100% TypeScript coverage
- **Performance**: 60fps animations, < 100ms interaction response

### 📊 Developer Experience
- **Build Time**: < 10s for development builds
- **Type Safety**: Zero TypeScript errors in production
- **Maintainability**: Clear component boundaries and responsibilities
- **Testing**: > 80% code coverage with meaningful tests

## Future Considerations

### 🔮 Scalability
- **Micro-frontend Architecture**: For team scaling
- **Component Library**: Reusable across projects  
- **Internationalization**: Multi-language support
- **Advanced Filtering**: Complex query capabilities

### 🔮 Technology Evolution
- **Vue 4 Migration Path**: Architecture ready for future Vue versions
- **Web Workers**: For heavy data processing
- **WebGL**: For advanced chart rendering
- **PWA Features**: Offline support and mobile optimization

---

*This document serves as the master plan for the complete architecture rebuild. Update sections as implementation progresses and decisions evolve.*