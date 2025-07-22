import { createRouter, createWebHistory } from 'vue-router';

// Lazy load components for code splitting
const IndexApp = () => import('../components/IndexApp.vue');
const TournamentView = () => import('../components/TournamentView.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: IndexApp,
    meta: { 
      title: 'ALGS Tournament Dashboard',
      preload: true // Preload home page component
    }
  },
  {
    path: '/tournament/:id',
    name: 'Tournament',
    component: TournamentView,
    props: true,
    meta: { 
      title: 'Tournament View'
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Add navigation guards for performance
router.beforeEach((to, from, next) => {
  // Update page title
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

// Preload next likely route on home page
router.afterEach((to) => {
  if (to.name === 'Home') {
    // Preload tournament view after a short delay
    setTimeout(() => {
      import('../components/TournamentView.vue').catch(() => {
        // Silent fail for preloading
      });
    }, 2000);
  }
});

export default router; 