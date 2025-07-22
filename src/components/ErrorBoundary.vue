<template>
  <div class="error-boundary">
    <div v-if="hasError" class="error-boundary-fallback">
      <div class="error-content">
        <div class="error-icon">💥</div>
        <h1 class="error-title">Application Error</h1>
        <p class="error-message">
          Something went wrong and the application crashed.
        </p>
        
        <div class="error-actions">
          <Button
            variant="primary"
            @click="handleRetry"
            :loading="isRetrying"
          >
            Retry
          </Button>
          
          <Button
            variant="ghost"
            @click="handleReload"
          >
            Reload Page
          </Button>
        </div>
        
        <details v-if="errorDetails && isDev" class="error-details">
          <summary class="error-details-toggle">Show Error Details</summary>
          <div class="error-details-content">
            <h3 class="error-details-title">Error:</h3>
            <pre class="error-stack">{{ errorDetails.message }}</pre>
            
            <h3 class="error-details-title">Stack Trace:</h3>
            <pre class="error-stack">{{ errorDetails.stack }}</pre>
            
            <h3 class="error-details-title">Component Info:</h3>
            <pre class="error-stack">{{ errorDetails.info }}</pre>
          </div>
        </details>
      </div>
    </div>
    
    <div v-else class="error-boundary-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onErrorCaptured, nextTick } from 'vue'
import { Button } from './ui'

// Types
interface ErrorDetails {
  message: string
  stack: string
  info: string
}

// Local state
const hasError = ref(false)
const isRetrying = ref(false)
const errorDetails = ref<ErrorDetails | null>(null)

// Environment check
const isDev = import.meta.env.DEV

/**
 * Handle Vue errors
 */
onErrorCaptured((error: Error, instance, info: string) => {
  console.error('💥 Error Boundary caught error:', error)
  
  hasError.value = true
  errorDetails.value = {
    message: error.message,
    stack: error.stack || 'No stack trace available',
    info: info
  }
  
  // In production, could send to error reporting service
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(error, { extra: { info } })
  }
  
  // Prevent the error from propagating further
  return false
})

/**
 * Handle JavaScript errors
 */
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    console.error('💥 Global JavaScript error:', event.error)
    
    hasError.value = true
    errorDetails.value = {
      message: event.error?.message || event.message || 'Unknown error',
      stack: event.error?.stack || 'No stack trace available',
      info: `File: ${event.filename}, Line: ${event.lineno}, Column: ${event.colno}`
    }
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('💥 Unhandled promise rejection:', event.reason)
    
    hasError.value = true
    errorDetails.value = {
      message: event.reason?.message || 'Unhandled promise rejection',
      stack: event.reason?.stack || 'No stack trace available',
      info: 'Promise rejection was not handled'
    }
  })
}

/**
 * Retry the failed operation
 */
async function handleRetry(): Promise<void> {
  isRetrying.value = true
  
  try {
    // Reset error state
    hasError.value = false
    errorDetails.value = null
    
    // Allow Vue to re-render
    await nextTick()
    
    console.log('🔄 Error boundary retry completed')
    
  } catch (error) {
    console.error('💥 Retry failed:', error)
    hasError.value = true
  } finally {
    isRetrying.value = false
  }
}

/**
 * Reload the entire page
 */
function handleReload(): void {
  window.location.reload()
}
</script>

<style scoped>
.error-boundary {
  @apply min-h-screen;
}

.error-boundary-content {
  @apply min-h-screen;
}

.error-boundary-fallback {
  @apply min-h-screen bg-slate-900 flex items-center justify-center p-6;
}

.error-content {
  @apply text-center max-w-2xl;
}

.error-icon {
  @apply text-8xl mb-6 opacity-75;
}

.error-title {
  @apply text-3xl font-bold text-red-400 mb-4;
}

.error-message {
  @apply text-lg text-slate-300 mb-8 leading-relaxed;
}

.error-actions {
  @apply flex gap-4 justify-center mb-8;
}

.error-details {
  @apply bg-slate-800 border border-slate-700 rounded-lg text-left;
}

.error-details-toggle {
  @apply p-4 text-sm text-slate-400 cursor-pointer hover:text-white transition-colors;
  @apply border-b border-slate-700;
}

.error-details-content {
  @apply p-4 space-y-4;
}

.error-details-title {
  @apply text-sm font-semibold text-red-400 mb-2;
}

.error-stack {
  @apply text-xs text-slate-300 font-mono bg-slate-900 p-3 rounded;
  @apply overflow-auto max-h-32 whitespace-pre-wrap;
}

/* Responsive */
@media (max-width: 640px) {
  .error-icon {
    @apply text-6xl mb-4;
  }
  
  .error-title {
    @apply text-2xl mb-3;
  }
  
  .error-message {
    @apply text-base mb-6;
  }
  
  .error-actions {
    @apply flex-col;
  }
}
</style>