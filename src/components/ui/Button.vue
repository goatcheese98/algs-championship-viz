<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <span v-if="loading" class="btn-loading">
      <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </span>
    
    <span v-if="icon && !loading" :class="iconClasses">
      {{ icon }}
    </span>
    
    <span v-if="$slots.default" :class="{ 'ml-2': icon || loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// Types
type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

// Props interface
interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  icon?: string
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  fullWidth: false
})

// Emits with TypeScript support
interface Emits {
  click: [event: MouseEvent]
}

const emit = defineEmits<Emits>()

/**
 * Handle button click events
 */
function handleClick(event: MouseEvent): void {
  if (props.disabled || props.loading) {
    event.preventDefault()
    return
  }
  
  emit('click', event)
}

/**
 * Computed button classes based on props
 */
const buttonClasses = computed((): string => {
  const baseClasses = [
    'inline-flex items-center justify-center',
    'font-medium rounded-md transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ]
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm', 
    lg: 'px-6 py-3 text-base'
  }
  
  // Variant classes
  const variantClasses = {
    primary: [
      'bg-red-500 text-white border border-red-500',
      'hover:bg-red-600 hover:border-red-600',
      'focus:ring-red-500',
      'active:bg-red-700'
    ],
    secondary: [
      'bg-slate-600 text-white border border-slate-600',
      'hover:bg-slate-700 hover:border-slate-700', 
      'focus:ring-slate-500',
      'active:bg-slate-800'
    ],
    danger: [
      'bg-red-600 text-white border border-red-600',
      'hover:bg-red-700 hover:border-red-700',
      'focus:ring-red-500', 
      'active:bg-red-800'
    ],
    success: [
      'bg-green-500 text-white border border-green-500',
      'hover:bg-green-600 hover:border-green-600',
      'focus:ring-green-500',
      'active:bg-green-700'
    ],
    ghost: [
      'bg-transparent text-slate-300 border border-slate-600',
      'hover:bg-slate-800 hover:border-slate-500',
      'focus:ring-slate-500',
      'active:bg-slate-700'
    ]
  }
  
  // Width classes
  const widthClasses = props.fullWidth ? 'w-full' : ''
  
  return [
    ...baseClasses,
    sizeClasses[props.size],
    ...variantClasses[props.variant],
    widthClasses
  ].filter(Boolean).join(' ')
})

/**
 * Icon classes for proper spacing
 */
const iconClasses = computed((): string => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }
  
  return sizeClasses[props.size]
})
</script>

<style scoped>
.btn-loading {
  @apply inline-flex items-center;
}

/* Custom animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>