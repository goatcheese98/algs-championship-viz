<template>
  <div id="app">
    <!-- Global error boundary -->
    <ErrorBoundary>
      <!-- Loading indicator -->
      <div v-if="isAppLoading" class="app-loading">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <h2 class="loading-title">ALGS Championship Dashboard</h2>
          <p class="loading-message">Initializing tournament data...</p>
        </div>
      </div>
      
      <!-- Main application content -->
      <div v-else class="app-content">
        <router-view />
      </div>
      
      <!-- Global notifications -->
      <NotificationContainer />
    </ErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTournamentStore, useUIStore } from './stores'
import ErrorBoundary from './components/ErrorBoundary.vue'
import NotificationContainer from './components/NotificationContainer.vue'

// Store integration
const tournamentStore = useTournamentStore()
const uiStore = useUIStore()

// Local state
const isAppLoading = ref(true)

// Simulate app initialization
onMounted(async () => {
  try {
    console.log('🚀 ALGS Championship Dashboard starting...')
    
    // Initialize stores
    await tournamentStore.$reset?.() || Promise.resolve()
    await uiStore.$reset?.() || Promise.resolve()
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('✅ Dashboard initialized successfully')
    
  } catch (error) {
    console.error('💥 Failed to initialize dashboard:', error)
    
    uiStore.addNotification({
      type: 'error',
      title: 'Initialization Error',
      message: 'Failed to initialize the application. Please refresh to try again.',
      duration: 0 // Persistent error
    })
  } finally {
    isAppLoading.value = false
  }
})
</script>

<style scoped>
#app {
  @apply min-h-screen bg-slate-900 text-white;
}

.app-loading {
  @apply min-h-screen flex items-center justify-center bg-slate-900;
}

.loading-content {
  @apply text-center max-w-md px-6;
}

.loading-spinner {
  @apply w-12 h-12 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-6;
}

.loading-title {
  @apply text-2xl font-bold text-white mb-2;
}

.loading-message {
  @apply text-slate-400;
}

.app-content {
  @apply min-h-screen;
}

/* Global animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Router transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>

 