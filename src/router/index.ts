import { createRouter, createWebHistory, type RouteRecordRaw, type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import type { Component } from 'vue'

// Type for route meta information
interface RouteMeta {
  title: string
  description?: string
  preload?: boolean
  requiresAuth?: boolean
  errorBoundary?: boolean
}

/**
 * Lazy load components with error handling and loading states
 */
const lazyLoad = (componentPath: string): (() => Promise<Component>) => {
  return () => import(componentPath).catch((error) => {
    console.error(`Failed to load component: ${componentPath}`, error)
    // Return fallback component on error
    return import('../components/ErrorFallback.vue').catch(() => ({
      template: '<div class="error-fallback">Failed to load component</div>'
    }))
  })
}

// Route definitions with proper typing
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Dashboard',
    component: lazyLoad('../views/DashboardView.vue'),
    meta: {
      title: 'ALGS Championship Dashboard',
      description: 'Interactive tournament data visualization and analysis',
      preload: true,
      errorBoundary: true
    } as RouteMeta
  },
  {
    path: '/tournament',
    name: 'Tournament',
    component: lazyLoad('../views/TournamentView.vue'),
    meta: {
      title: 'Tournament Analysis',
      description: 'Detailed tournament matchup analysis with interactive charts',
      errorBoundary: true
    } as RouteMeta
  },
  {
    path: '/tournament/:matchupId',
    name: 'TournamentMatchup',
    component: lazyLoad('../views/TournamentView.vue'),
    props: true,
    meta: {
      title: 'Tournament Matchup',
      description: 'Specific matchup analysis and visualization',
      errorBoundary: true
    } as RouteMeta
  },
  // 404 fallback route
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: lazyLoad('../views/NotFoundView.vue'),
    meta: {
      title: '404 - Page Not Found',
      description: 'The requested page could not be found'
    } as RouteMeta
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Return saved position if navigating back/forward
    if (savedPosition) {
      return savedPosition
    }
    
    // Scroll to anchor if present
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    
    // Scroll to top for new routes
    return { top: 0, behavior: 'smooth' }
  }
})

/**
 * Update document title and meta tags
 */
function updatePageMeta(to: RouteLocationNormalized): void {
  const meta = to.meta as RouteMeta
  
  // Update title
  if (meta.title) {
    document.title = meta.title
  }
  
  // Update meta description
  if (meta.description) {
    let descElement = document.querySelector('meta[name="description"]') as HTMLMetaElement
    if (!descElement) {
      descElement = document.createElement('meta')
      descElement.name = 'description'
      document.head.appendChild(descElement)
    }
    descElement.content = meta.description
  }
}

/**
 * Preload likely next routes based on current route
 */
function preloadLikelyRoutes(currentRoute: string): void {
  const preloadMap: Record<string, string[]> = {
    'Dashboard': ['../views/TournamentView.vue'],
    'Tournament': ['../views/DashboardView.vue']
  }
  
  const routesToPreload = preloadMap[currentRoute] || []
  
  routesToPreload.forEach((route) => {
    setTimeout(() => {
      import(route).catch(() => {
        // Silent fail for preloading
      })
    }, 1000)
  })
}

/**
 * Performance monitoring for route changes
 */
function trackRoutePerformance(to: RouteLocationNormalized, from: RouteLocationNormalized): void {
  if (import.meta.env.DEV) {
    const startTime = performance.now()
    
    // Track route change performance
    const routeChangeObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'navigation') {
          const endTime = performance.now()
          console.log(`🚀 Route Change Performance [${from.name} → ${to.name}]:`, {
            duration: Math.round(endTime - startTime),
            route: to.path
          })
        }
      }
    })
    
    routeChangeObserver.observe({ entryTypes: ['navigation'] })
    
    // Stop observing after a short time
    setTimeout(() => routeChangeObserver.disconnect(), 1000)
  }
}

// Navigation guards
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  // Track performance in development
  trackRoutePerformance(to, from)
  
  // Update page meta information
  updatePageMeta(to)
  
  // Handle authentication if required
  const meta = to.meta as RouteMeta
  if (meta.requiresAuth) {
    // Add authentication logic here if needed
    // For now, just proceed
  }
  
  next()
})

router.afterEach((to: RouteLocationNormalized) => {
  // Preload likely next routes
  if (to.name) {
    preloadLikelyRoutes(to.name.toString())
  }
  
  // Track page views in production
  if (import.meta.env.PROD) {
    // Could integrate with analytics
    // Example: gtag('config', 'GA_TRACKING_ID', { page_path: to.path })
  }
  
  // Log successful navigation in development
  if (import.meta.env.DEV) {
    console.log(`📍 Navigated to: ${to.path}`)
  }
})

// Handle router errors
router.onError((error) => {
  console.error('💥 Router Error:', error)
  
  // In production, could send to error reporting
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(error)
  }
})

export default router