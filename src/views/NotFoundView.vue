<template>
  <AppLayout>
    <div class="not-found-view">
      <div class="not-found-content">
        <div class="not-found-icon">🔍</div>
        <h1 class="not-found-title">Page Not Found</h1>
        <p class="not-found-message">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div class="not-found-actions">
          <Button
            variant="primary"
            @click="goHome"
            icon="🏠"
          >
            Go Home
          </Button>
          
          <Button
            variant="ghost"
            @click="goBack"
            icon="←"
          >
            Go Back
          </Button>
        </div>
        
        <div class="not-found-suggestions">
          <h3 class="suggestions-title">Try these instead:</h3>
          <ul class="suggestions-list">
            <li>
              <router-link to="/" class="suggestion-link">
                🏠 Dashboard
              </router-link>
            </li>
            <li>
              <router-link to="/tournament" class="suggestion-link">
                🏆 Tournament Analysis
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { AppLayout } from '../components/layout'
import { Button } from '../components/ui'

const router = useRouter()

/**
 * Navigate to home page
 */
function goHome(): void {
  router.push('/')
}

/**
 * Go back to previous page
 */
function goBack(): void {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-view {
  @apply min-h-screen bg-slate-900 text-white flex items-center justify-center p-6;
}

.not-found-content {
  @apply text-center max-w-2xl;
}

.not-found-icon {
  @apply text-8xl mb-8 opacity-50;
}

.not-found-title {
  @apply text-4xl font-bold text-white mb-4;
}

.not-found-message {
  @apply text-xl text-slate-400 mb-8 leading-relaxed;
}

.not-found-actions {
  @apply flex gap-4 justify-center mb-12;
}

.not-found-suggestions {
  @apply bg-slate-800 border border-slate-700 rounded-xl p-6;
}

.suggestions-title {
  @apply text-lg font-semibold text-white mb-4;
}

.suggestions-list {
  @apply space-y-2 text-left;
}

.suggestion-link {
  @apply text-red-400 hover:text-red-300 transition-colors duration-200 text-lg;
  @apply flex items-center gap-2;
}

.suggestion-link:hover {
  @apply underline;
}

/* Responsive */
@media (max-width: 640px) {
  .not-found-icon {
    @apply text-6xl mb-6;
  }
  
  .not-found-title {
    @apply text-3xl mb-3;
  }
  
  .not-found-message {
    @apply text-lg mb-6;
  }
  
  .not-found-actions {
    @apply flex-col;
  }
}
</style>