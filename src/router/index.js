// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import IndexApp from '../components/IndexApp.vue';
import ChampionshipApp from '../components/ChampionshipApp.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: IndexApp
  },
  {
    // A dynamic route to handle all tournament pages
    // Examples: /tournament/year-4-championship, /tournament/ewc-2025
    path: '/tournament/:id',
    name: 'Championship',
    component: ChampionshipApp,
    // 'props: true' allows the URL parameter (e.g., 'year-4-championship')
    // to be passed as a prop to the ChampionshipApp component.
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 