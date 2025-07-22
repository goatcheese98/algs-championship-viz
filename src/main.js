import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import './utils/GSAPDraggableManager.js';

// Load main CSS asynchronously after critical path
const loadMainCSS = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/src/styles/main.css';
  document.head.appendChild(link);
};

// Load after DOM content loaded for better performance
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadMainCSS);
} else {
  loadMainCSS();
}

const routerLinkStyles = document.createElement('style');
routerLinkStyles.textContent = `
  a, router-link {
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    display: inline-block;
  }
  
  router-link.nav-link,
  router-link.ewc-banner-button,
  router-link.enter-button {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
    display: inherit;
    border: inherit;
    background: inherit;
    padding: inherit;
    margin: inherit;
    border-radius: inherit;
    box-shadow: inherit;
    transition: inherit;
  }
  
  router-link:hover {
    color: inherit;
    text-decoration: none;
  }
`;
document.head.appendChild(routerLinkStyles);

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Reset any browser zoom issues
function resetBrowserZoom() {
  document.documentElement.style.zoom = 'normal';
  document.body.style.zoom = '1';
  document.body.style.transform = 'scale(1)';
}

// Apply zoom reset on load
resetBrowserZoom();

// Initialize Visual Enhancer after app mount
import { visualEnhancer } from './utils/visualEnhancer.js';

// Simple performance monitoring in development
if (import.meta.env.DEV) {
  // Basic performance tracking
  window.addEventListener('load', () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType('navigation')[0];
      console.log('📊 Load Performance:', {
        domContentLoaded: Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart),
        loadComplete: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 'N/A',
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 'N/A'
      });
    }, 1000);
  });
}

app.mount('#app');

// Initialize visual enhancements after Vue app is mounted
setTimeout(async () => {
  await visualEnhancer.initialize();
  
  // Apply animations to existing elements (excluding chart-container to avoid conflicts with GSAP)
  visualEnhancer.observeForAnimations('.tournament-card', 'fade-in-up');
  // visualEnhancer.observeForAnimations('.chart-container', 'fade-in-left'); // Disabled - conflicts with TournamentView GSAP animations
  visualEnhancer.applyStaggeredAnimation('.bento-grid');
  
  if (import.meta.env.DEV) {
    console.log('🎨 Visual Enhancer Stats:', visualEnhancer.getStats());
  }
}, 200); 