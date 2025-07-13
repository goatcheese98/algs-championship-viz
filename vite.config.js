import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  root: '.',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
        year4: './year_4_championship.html',
        year5: './year_5_open.html',
        ewc2025: './ewc_2025.html'
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  optimizeDeps: {
    include: ['vue', 'd3']
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})

// Module organization reference for better maintainability
const moduleStructure = {
  components: ['src/components/ChampionshipApp.vue', 'src/components/TournamentSelector.vue', 'src/components/ActionPanel.vue', 'src/components/IndexApp.vue'],
  chart: ['src/chart/ChartEngine.js', 'src/chart/ChartRenderer.js', 'src/chart/DataManager.js', 'src/chart/MapSequenceData.js', 'src/chart/MapColoringLogic.js'],
  utils: ['src/utils/GSAPDraggableManager.js'],
  composables: ['src/composables/useTeamConfig.js']
} 