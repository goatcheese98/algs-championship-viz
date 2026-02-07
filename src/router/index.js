import { createRouter, createWebHistory } from 'vue-router'
import IndexApp from '@/components/IndexApp.vue'
import TournamentView from '@/components/TournamentView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: IndexApp,
    meta: { title: 'ALGS Tournament Dashboard' }
  },
  {
    path: '/tournament/:id',
    name: 'Tournament',
    component: TournamentView,
    props: true,
    meta: { title: 'Tournament View' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach((to) => {
  document.title = to.meta.title || 'ALGS Tournament Dashboard'
})

export default router
