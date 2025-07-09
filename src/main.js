import { createApp } from 'vue'

// Import utilities (make them available globally)
import './utils/GSAPDraggableManager.js'

// Import TeamConfig and make it globally available


// Determine which app to mount based on current page
const currentPath = window.location.pathname

console.log('🚀 Starting Vue application for:', currentPath)

// Lazy load components for better performance
const loadApp = async () => {
    if (currentPath.includes('year_4_championship.html') || currentPath.includes('championship')) {
        console.log('📊 Lazy loading Championship App...')
        const { default: ChampionshipApp } = await import('./components/ChampionshipApp.vue')
        createApp(ChampionshipApp).mount('#app')
    } else {
        console.log('🏠 Lazy loading Index App...')
        const { default: IndexApp } = await import('./components/IndexApp.vue')
        createApp(IndexApp).mount('#app')
    }
}

// Initialize app with error handling
loadApp().catch(error => {
    console.error('❌ Failed to load application:', error)
    // Fallback for critical errors
    document.getElementById('app').innerHTML = `
        <div style="color: red; text-align: center; padding: 20px;">
            <h2>Application Load Error</h2>
            <p>Please refresh the page or contact support.</p>
        </div>
    `
}) 