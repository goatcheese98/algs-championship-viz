import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

import './utils/GSAPDraggableManager.js';
import './styles/tailwind.css';
import '../styles/championship.css';

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

app.mount('#app'); 