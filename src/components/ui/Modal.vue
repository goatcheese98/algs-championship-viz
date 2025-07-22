<template>
  <teleport to="body">
    <transition
      name="modal"
      enter-active-class="modal-enter-active"
      leave-active-class="modal-leave-active"
      enter-from-class="modal-enter-from"
      leave-to-class="modal-leave-to"
    >
      <div
        v-if="visible"
        class="modal-backdrop"
        :class="backdropClasses"
        @click="handleBackdropClick"
        role="dialog"
        :aria-labelledby="titleId"
        :aria-describedby="contentId"
        aria-modal="true"
      >
        <div
          ref="modalRef"
          class="modal-container"
          :class="modalClasses"
          @click.stop
        >
          <!-- Modal Header -->
          <div v-if="config.title || closable" class="modal-header">
            <h2 v-if="config.title" :id="titleId" class="modal-title">
              {{ config.title }}
            </h2>
            
            <button
              v-if="closable"
              type="button"
              class="modal-close-btn"
              @click="handleClose"
              :aria-label="closeLabel"
            >
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Modal Body -->
          <div :id="contentId" class="modal-body" :class="bodyClasses">
            <slot />
          </div>
          
          <!-- Modal Footer -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { ModalConfig } from '../../types'
import { generateId } from '../../utils/data-transforms'

// Props interface
interface Props {
  visible: boolean
  config: ModalConfig
  closable?: boolean
  closeLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  closable: true,
  closeLabel: 'Close modal'
})

// Emits
interface Emits {
  close: []
  'update:visible': [value: boolean]
}

const emit = defineEmits<Emits>()

// Reactive references
const modalRef = ref<HTMLDivElement>()
const titleId = generateId('modal-title')
const contentId = generateId('modal-content')
const previousActiveElement = ref<HTMLElement | null>(null)

/**
 * Handle modal close
 */
function handleClose(): void {
  emit('update:visible', false)
  emit('close')
}

/**
 * Handle backdrop click
 */
function handleBackdropClick(): void {
  if (props.config.backdrop !== 'static' && props.closable) {
    handleClose()
  }
}

/**
 * Handle escape key
 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.visible && props.closable) {
    handleClose()
  }
}

/**
 * Focus management
 */
function manageFocus(): void {
  if (props.visible) {
    // Store current focus
    previousActiveElement.value = document.activeElement as HTMLElement
    
    // Focus modal
    nextTick(() => {
      const focusTarget = modalRef.value?.querySelector('[autofocus]') as HTMLElement ||
                         modalRef.value?.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') as HTMLElement ||
                         modalRef.value
      
      focusTarget?.focus()
    })
  } else {
    // Restore previous focus
    previousActiveElement.value?.focus()
    previousActiveElement.value = null
  }
}

/**
 * Body scroll lock
 */
function toggleBodyScroll(lock: boolean): void {
  if (lock) {
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = getScrollbarWidth() + 'px'
  } else {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

/**
 * Get scrollbar width to prevent layout shift
 */
function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth
}

// Watchers
watch(() => props.visible, (newVisible) => {
  manageFocus()
  toggleBodyScroll(newVisible)
})

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  toggleBodyScroll(false) // Ensure scroll is restored
})

/**
 * Backdrop CSS classes
 */
const backdropClasses = computed((): string[] => {
  const classes = ['modal-backdrop-base']
  
  if (props.config.backdrop === false) {
    classes.push('pointer-events-none')
  }
  
  return classes
})

/**
 * Modal container CSS classes
 */
const modalClasses = computed((): string[] => {
  const classes = ['modal-base']
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  }
  
  classes.push(sizeClasses[props.config.size || 'md'])
  
  // Centered
  if (props.config.centered) {
    classes.push('modal-centered')
  }
  
  return classes
})

/**
 * Body classes for scrollable content
 */
const bodyClasses = computed((): string[] => {
  const classes = []
  
  if (props.config.scrollable) {
    classes.push('modal-body-scrollable')
  }
  
  return classes
})
</script>

<style scoped>
.modal-backdrop {
  @apply fixed inset-0 z-50 flex items-center justify-center p-4;
}

.modal-backdrop-base {
  @apply bg-black bg-opacity-75 backdrop-blur-sm;
}

.modal-container {
  @apply relative w-full max-h-full;
}

.modal-base {
  @apply bg-slate-800 rounded-xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden;
}

.modal-centered {
  @apply my-auto;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-slate-700;
}

.modal-title {
  @apply text-xl font-semibold text-white;
}

.modal-close-btn {
  @apply p-1 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-700;
}

.modal-body {
  @apply p-6 flex-1 overflow-y-auto;
}

.modal-body-scrollable {
  @apply max-h-96;
}

.modal-footer {
  @apply px-6 py-4 bg-slate-750 border-t border-slate-700 flex items-center justify-end gap-3;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  @apply transition-all duration-300;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  @apply transition-all duration-300;
}

.modal-enter-from,
.modal-leave-to {
  @apply opacity-0;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  @apply scale-95 translate-y-4;
}

/* Focus styles */
.modal-container:focus {
  @apply outline-none;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .modal-backdrop {
    @apply p-2;
  }
  
  .modal-base {
    @apply max-w-full max-h-full;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    @apply px-4;
  }
  
  .modal-header {
    @apply py-4;
  }
  
  .modal-title {
    @apply text-lg;
  }
}
</style>