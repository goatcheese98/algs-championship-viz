// src/main.js

// Import necessary functions and modules from Vue and other libraries.
import { createApp } from 'vue';
import { createPinia } from 'pinia'; // Pinia is used for state management.
import App from './App.vue'; // The root component of the Vue application.
import router from './router'; // Vue Router for handling navigation and routing.

// Import global utility and styling files.
import './utils/GSAPDraggableManager.js'; // Manages draggable elements using GSAP.
import '../styles/championship.css'; // Global championship-specific styling.

// Dynamically add styling for router-link components to ensure they match the appearance
// and behavior of standard anchor tags, especially for navigation and interactive elements.
const routerLinkStyles = document.createElement('style');
routerLinkStyles.textContent = `
  /* Base styling for both anchor tags and router-link components */
  a, router-link {
    text-decoration: none; /* Remove underline */
    color: inherit; /* Inherit text color from parent */
    cursor: pointer; /* Indicate interactivity */
    display: inline-block; /* Allow setting width/height and vertical alignment */
  }
  
  /* Ensure specific router-link classes inherit all relevant styling properties
     from championship.css to maintain consistent UI across the application. */
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
  
  /* Maintain hover states for router-link components to provide visual feedback. */
  router-link:hover {
    color: inherit;
    text-decoration: none;
  }
`;
// Append the created style element to the document's head.
document.head.appendChild(routerLinkStyles);

// Create the main Vue application instance.
const app = createApp(App);
// Create a Pinia store instance.
const pinia = createPinia();

// Register Pinia and Vue Router with the Vue application.
app.use(pinia); // Integrates Pinia for state management.
app.use(router); // Integrates Vue Router for navigation.

// Mount the Vue application to the DOM element with the ID 'app'.
// This makes the Vue application control the content within that element.
app.mount('#app'); 