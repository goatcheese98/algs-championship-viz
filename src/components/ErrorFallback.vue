<template>
  <div class="error-fallback">
    <div class="error-content">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">
        {{ errorMessage || 'An unexpected error occurred while loading this component.' }}
      </p>
      
      <div class="error-actions">
        <Button
          variant="primary"
          @click="retry"
          :loading="isRetrying"
        >
          Try Again
        </Button>
        
        <Button
          variant="ghost"
          @click="goHome"
        >
          Go Home
        </Button>
      </div>
      
      <details v-if="errorDetails && isDev" class="error-details">
        <summary class="error-details-toggle">Show Error Details</summary>
        <pre class="error-stack">{{ errorDetails }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from './ui'

// Props
interface Props {
  errorMessage?: string
  errorDetails?: string
  onRetry?: () => void | Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  errorMessage: '',
  errorDetails: '',
  onRetry: undefined
})

// Composables
const router = useRouter()

// Local state
const isRetrying = ref(false)

// Environment check
const isDev = import.meta.env.DEV

/**
 * Retry the failed operation
 */
async function retry(): Promise<void> {
  if (props.onRetry) {
    isRetrying.value = true
    
    try {
      await props.onRetry()
    } catch (error) {
      console.error('Retry failed:', error)
    } finally {
      isRetrying.value = false
    }
  } else {
    // Default retry: reload the current page
    window.location.reload()
  }
}

/**
 * Navigate to home page
 */
function goHome(): void {
  router.push('/')
}
</script>

<style scoped>
.error-fallback {
  @apply min-h-96 bg-slate-800 border border-slate-700 rounded-lg;
  @apply flex items-center justify-center p-8 text-center;
}

.error-content {
  @apply max-w-md space-y-4;
}

.error-icon {
  @apply text-6xl text-red-400 mb-4;
}

.error-title {
  @apply text-xl font-semibold text-white;
}

.error-message {
  @apply text-slate-400 leading-relaxed;
}

.error-actions {
  @apply flex gap-3 justify-center mt-6;
}

.error-details {
  @apply mt-6 text-left bg-slate-900 border border-slate-600 rounded-lg;
}

.error-details-toggle {
  @apply p-3 text-sm text-slate-300 cursor-pointer hover:text-white;
}

.error-stack {
  @apply p-3 text-xs text-red-300 font-mono overflow-auto max-h-48;
  @apply border-t border-slate-600;
}

/* Responsive */
@media (max-width: 640px) {
  .error-actions {
    @apply flex-col;
  }
}
</style>