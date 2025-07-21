import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import './utils/GSAPDraggableManager.js';
import './styles/main.css';
import { initializePhase2Loading, CSSPerformance } from './utils/cssLoader.js';

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

// Initialize Phase 2 CSS loading strategy
const cssManager = initializePhase2Loading();

// Initialize Phase 3 Route-Based CSS System
import { initializeRouteBasedCSS } from './utils/routeBasedCSS.js';
const { cssManager: routeCSSManager, integration, monitor } = initializeRouteBasedCSS(router);

// Initialize Phase 3 CSS Preloader
import { initializeCSSPreloader } from './utils/cssPreloader.js';
const preloader = initializeCSSPreloader();

// Initialize Phase 3 Styled Components
import { initializeStyledComponents } from './utils/styledComponents.js';
const styledManager = initializeStyledComponents();

// Initialize Phase 3 CSS Analytics
import { initializeCSSAnalytics } from './utils/cssAnalytics.js';
const analytics = initializeCSSAnalytics();

// Initialize Phase 3 CSS Service Worker Caching
import { initializeCSSServiceWorker } from './utils/cssServiceWorker.js';
let swManager = null;

// Initialize service worker asynchronously
initializeCSSServiceWorker().then(manager => {
  swManager = manager;
}).catch(error => {
  console.warn('Service Worker initialization failed:', error);
});

// Enable performance monitoring in development  
if (import.meta.env.DEV) {
  CSSPerformance.measureFCP();
  CSSPerformance.measureLCP();
  console.log('Phase 2 CSS optimization initialized:', cssManager.getStats());
  
  // Phase 3 performance monitoring
  setTimeout(async () => {
    console.log('🚀 Phase 3 Route CSS Stats:', routeCSSManager.getStats());
    console.log('📊 Phase 3 Performance:', monitor.getPerformanceStats());
    console.log('🎯 Phase 3 Preloader Stats:', preloader.getStats());
    console.log('🎨 Phase 3 Styled Components:', styledManager.getStats());
    console.log('📈 Phase 3 Analytics:', analytics.getQuickStats());
    
    // Service Worker stats (if available)
    if (swManager) {
      const swStats = await swManager.getCacheStats();
      console.log('💾 Phase 3 Service Worker Cache:', swStats);
    }
  }, 2000);
}

app.mount('#app'); 