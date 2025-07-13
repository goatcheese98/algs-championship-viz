// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import IndexApp from '../components/IndexApp.vue';
import TournamentView from '../components/TournamentView.vue';

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
    name: 'Tournament',
    component: TournamentView,
    // 'props: true' allows the URL parameter (e.g., 'year-4-championship')
    // to be passed as a prop to the TournamentView component.
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 