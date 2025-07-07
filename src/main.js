import { createApp } from 'vue'

// Import utilities (make them available globally)
import './utils/GSAPDraggableManager.js'

// Import Vue SFC components
import IndexApp from './components/IndexApp.vue'
import ChampionshipApp from './components/ChampionshipApp.vue'

// Determine which app to mount based on current page
const currentPath = window.location.pathname

console.log('🚀 Starting Vue application for:', currentPath)

// Initialize the appropriate app
if (currentPath.includes('year_4_championship.html') || currentPath.includes('championship')) {
    console.log('📊 Mounting Championship App')
    createApp(ChampionshipApp).mount('#app')
} else {
    console.log('🏠 Mounting Index App')
    createApp(IndexApp).mount('#app')
} 