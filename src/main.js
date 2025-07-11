import { createApp } from 'vue'

// Import utilities (make them available globally)
import './utils/GSAPDraggableManager.js'

// Import TeamConfig and make it globally available

// Wait for DOM to be ready
const waitForDOM = () => {
    return new Promise((resolve) => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', resolve)
        } else {
            resolve()
        }
    })
}

// Determine which app to mount based on current page
const currentPath = window.location.pathname

console.log('🚀 Starting Vue application for:', currentPath)

// Lazy load components for better performance
const loadApp = async () => {
    // Wait for DOM to be ready
    await waitForDOM()
    
    // Double-check app element exists
    const appElement = document.getElementById('app')
    if (!appElement) {
        console.error('❌ Cannot find #app element in DOM')
        return
    }
    
    console.log('✅ DOM ready, mounting Vue app...')
    
    if (currentPath.includes('year_4_championship.html') || 
        currentPath.includes('year_5_open.html') || 
        currentPath.includes('championship') ||
        currentPath.includes('year5') ||
        currentPath.includes('year_5') ||
        currentPath.includes('ewc_2025.html') || 
        currentPath.includes('ewc2025') ||
        currentPath.includes('ewc_2025')) {
        console.log('📊 Lazy loading Championship App for tournament...')
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
    const appElement = document.getElementById('app')
    if (appElement) {
        appElement.innerHTML = `
            <div style="color: red; text-align: center; padding: 20px;">
                <h2>Application Load Error</h2>
                <p>Please refresh the page or contact support.</p>
                <p>Error: ${error.message}</p>
            </div>
        `
    }
}) 