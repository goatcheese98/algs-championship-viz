<template>
  <teleport to="body">
    <div
      v-if="visible"
      ref="tooltipRef"
      class="tooltip"
      :class="tooltipClasses"
      :style="tooltipStyle"
      role="tooltip"
      :aria-describedby="ariaId"
    >
      <!-- Content slot or text -->
      <div class="tooltip-content">
        <slot v-if="$slots.default" />
        <template v-else>
          <h3 v-if="title" class="tooltip-title">{{ title }}</h3>
          <p v-if="content" class="tooltip-text">{{ content }}</p>
        </template>
      </div>
      
      <!-- Arrow -->
      <div class="tooltip-arrow" :class="arrowClasses"></div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { TooltipConfig } from '../../types'
import { generateId } from '../../utils/data-transforms'

// Props interface
interface Props {
  visible: boolean
  config: TooltipConfig
  title?: string
  content?: string
  targetElement?: HTMLElement
}

const props = defineProps<Props>()

// Emits
interface Emits {
  hide: []
}

const emit = defineEmits<Emits>()

// Reactive references
const tooltipRef = ref<HTMLDivElement>()
const ariaId = generateId('tooltip')
const computedPosition = ref({ x: 0, y: 0 })
const actualPosition = ref<'top' | 'bottom' | 'left' | 'right'>('top')

/**
 * Calculate optimal tooltip position
 */
function calculatePosition(): void {
  if (!tooltipRef.value || !props.targetElement) return

  const tooltip = tooltipRef.value
  const target = props.targetElement
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  
  const targetRect = target.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  
  // Preferred position from config
  let position = props.config.position
  let x = props.config.offset.x
  let y = props.config.offset.y
  
  // Auto-positioning logic
  if (position === 'auto') {
    const spaceAbove = targetRect.top
    const spaceBelow = viewport.height - targetRect.bottom
    const spaceLeft = targetRect.left
    const spaceRight = viewport.width - targetRect.right
    
    // Choose position with most space
    if (spaceAbove >= tooltipRect.height && spaceAbove >= spaceBelow) {
      position = 'top'
    } else if (spaceBelow >= tooltipRect.height) {
      position = 'bottom'
    } else if (spaceRight >= tooltipRect.width) {
      position = 'right'
    } else {
      position = 'left'
    }
  }
  
  // Calculate final position
  switch (position) {
    case 'top':
      x = targetRect.left + targetRect.width / 2 + props.config.offset.x
      y = targetRect.top - tooltipRect.height - 8 + props.config.offset.y
      break
    case 'bottom':
      x = targetRect.left + targetRect.width / 2 + props.config.offset.x
      y = targetRect.bottom + 8 + props.config.offset.y
      break
    case 'left':
      x = targetRect.left - tooltipRect.width - 8 + props.config.offset.x
      y = targetRect.top + targetRect.height / 2 + props.config.offset.y
      break
    case 'right':
      x = targetRect.right + 8 + props.config.offset.x
      y = targetRect.top + targetRect.height / 2 + props.config.offset.y
      break
  }
  
  // Ensure tooltip stays within viewport
  x = Math.max(8, Math.min(x, viewport.width - tooltipRect.width - 8))
  y = Math.max(8, Math.min(y, viewport.height - tooltipRect.height - 8))
  
  computedPosition.value = { x, y }
  actualPosition.value = position
}

/**
 * Update position when visibility or config changes
 */
watch([() => props.visible, () => props.config], async () => {
  if (props.visible) {
    await nextTick()
    calculatePosition()
  }
})

/**
 * Handle window resize
 */
function handleResize(): void {
  if (props.visible) {
    calculatePosition()
  }
}

/**
 * Handle escape key to hide tooltip
 */
function handleKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && props.visible) {
    emit('hide')
  }
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
})

/**
 * Tooltip positioning styles
 */
const tooltipStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${computedPosition.value.x}px`,
  top: `${computedPosition.value.y}px`,
  zIndex: 9999,
  maxWidth: props.config.maxWidth ? `${props.config.maxWidth}px` : '300px'
}))

/**
 * Tooltip CSS classes
 */
const tooltipClasses = computed((): string[] => {
  const classes = [
    'tooltip-base',
    `tooltip-${actualPosition.value}`
  ]
  
  return classes
})

/**
 * Arrow CSS classes based on position
 */
const arrowClasses = computed((): string[] => {
  return [`arrow-${actualPosition.value}`]
})
</script>

<style scoped>
.tooltip {
  @apply pointer-events-none;
}

.tooltip-base {
  @apply bg-slate-800 text-white text-sm rounded-lg shadow-xl border border-slate-700 overflow-hidden;
  animation: tooltipFadeIn 0.2s ease-out;
}

.tooltip-content {
  @apply p-3;
}

.tooltip-title {
  @apply font-semibold text-white mb-1;
}

.tooltip-text {
  @apply text-slate-200 leading-relaxed;
}

.tooltip-arrow {
  @apply absolute w-2 h-2 transform rotate-45 bg-slate-800 border border-slate-700;
}

/* Arrow positioning */
.arrow-top {
  @apply -bottom-1 left-1/2 -translate-x-1/2 border-t-0 border-l-0;
}

.arrow-bottom {
  @apply -top-1 left-1/2 -translate-x-1/2 border-b-0 border-r-0;
}

.arrow-left {
  @apply -right-1 top-1/2 -translate-y-1/2 border-l-0 border-b-0;
}

.arrow-right {
  @apply -left-1 top-1/2 -translate-y-1/2 border-r-0 border-t-0;
}

/* Animations */
@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-5px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .tooltip-base {
    @apply max-w-xs text-xs;
  }
  
  .tooltip-content {
    @apply p-2;
  }
}
</style>