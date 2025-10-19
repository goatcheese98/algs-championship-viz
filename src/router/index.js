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
    path: '/tournament/:id',
    name: 'Tournament',
    component: TournamentView,
    props: true
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router; 