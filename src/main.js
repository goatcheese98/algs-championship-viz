// src/main.js
import { createApp } from 'vue';
import App from './App.vue'; // The new root component
import router from './router'; // The new router configuration
import './utils/GSAPDraggableManager.js';
import '../styles/championship.css'; // Import championship styling

// Add router-link styling to match original anchor tags
const routerLinkStyles = document.createElement('style');
routerLinkStyles.textContent = `
  /* Router-link styling to match original anchor tags */
  a, router-link {
    text-decoration: none;
    color: inherit;
    cursor: pointer;
    display: inline-block;
  }
  
  /* Ensure router-link inherits all styling from championship.css */
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
  
  /* Ensure hover states work properly */
  router-link:hover {
    color: inherit;
    text-decoration: none;
  }
`;
document.head.appendChild(routerLinkStyles);

const app = createApp(App);

app.use(router); // Tell the Vue app to use the router

app.mount('#app'); 