<template>
  <div class="slider-container">
    <label v-if="label" class="slider-label" :for="sliderId">
      {{ label }}
    </label>
    
    <div class="slider-wrapper">
      <span v-if="showMinMax" class="slider-value min-value">
        {{ formatValue(min) }}
      </span>
      
      <div class="slider-track-container">
        <input
          :id="sliderId"
          ref="sliderRef"
          type="range"
          :min="min"
          :max="max"
          :step="step"
          :value="modelValue"
          :disabled="disabled"
          class="slider-input"
          @input="handleInput"
          @change="handleChange"
        />
        
        <!-- Custom track styling -->
        <div class="slider-track" :style="trackStyle">
          <div class="slider-fill" :style="fillStyle"></div>
          <div class="slider-thumb" :style="thumbStyle"></div>
        </div>
        
        <!-- Marks/ticks if provided -->
        <div v-if="marks && Object.keys(marks).length > 0" class="slider-marks">
          <div
            v-for="(label, value) in marks"
            :key="value"
            class="slider-mark"
            :style="getMarkStyle(Number(value))"
          >
            <div class="slider-mark-dot"></div>
            <span class="slider-mark-label">{{ label }}</span>
          </div>
        </div>
      </div>
      
      <span v-if="showMinMax" class="slider-value max-value">
        {{ formatValue(max) }}
      </span>
    </div>
    
    <!-- Tooltip showing current value -->
    <div
      v-if="tooltip && !disabled"
      ref="tooltipRef"
      class="slider-tooltip"
      :class="{ 'opacity-100': showTooltip, 'opacity-0': !showTooltip }"
      :style="tooltipStyle"
    >
      {{ formatValue(modelValue) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick } from 'vue'
import { generateId, clamp } from '../../utils/data-transforms'

// Props interface
interface Props {
  modelValue: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  showMinMax?: boolean
  tooltip?: boolean
  label?: string
  formatValue?: (value: number) => string
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  disabled: false,
  tooltip: true,
  showMinMax: true,
  formatValue: (value: number) => value.toString()
})

// Model value with TypeScript support
interface Emits {
  'update:modelValue': [value: number]
  change: [value: number]
  input: [value: number]
}

const emit = defineEmits<Emits>()

// Reactive references
const sliderRef = ref<HTMLInputElement>()
const tooltipRef = ref<HTMLDivElement>()
const showTooltip = ref(false)
const sliderId = generateId('slider')

/**
 * Handle input events (real-time updates)
 */
function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = clamp(Number(target.value), props.min, props.max)
  
  emit('update:modelValue', value)
  emit('input', value)
  
  showTooltip.value = true
  updateTooltipPosition()
}

/**
 * Handle change events (final value)
 */
function handleChange(event: Event): void {
  const target = event.target as HTMLInputElement  
  const value = clamp(Number(target.value), props.min, props.max)
  
  emit('change', value)
  
  showTooltip.value = false
}

/**
 * Calculate percentage of current value
 */
const valuePercentage = computed((): number => {
  const range = props.max - props.min
  if (range === 0) return 0
  return ((props.modelValue - props.min) / range) * 100
})

/**
 * Track styling for custom appearance
 */
const trackStyle = computed(() => ({
  background: 'rgba(239, 68, 68, 0.2)'
}))

/**
 * Fill styling based on current value
 */
const fillStyle = computed(() => ({
  width: `${valuePercentage.value}%`,
  background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)'
}))

/**
 * Thumb styling based on current position
 */
const thumbStyle = computed(() => ({
  left: `${valuePercentage.value}%`,
  background: '#ef4444',
  boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)'
}))

/**
 * Get mark position styling
 */
function getMarkStyle(value: number) {
  const range = props.max - props.min
  const percentage = range === 0 ? 0 : ((value - props.min) / range) * 100
  
  return {
    left: `${percentage}%`
  }
}

/**
 * Tooltip positioning
 */
const tooltipStyle = computed(() => ({
  left: `${valuePercentage.value}%`,
  transform: 'translateX(-50%)'
}))

/**
 * Update tooltip position on value change
 */
async function updateTooltipPosition(): Promise<void> {
  await nextTick()
  // Additional positioning logic if needed
}
</script>

<style scoped>
.slider-container {
  @apply relative w-full;
}

.slider-label {
  @apply block text-sm font-medium text-slate-300 mb-2;
}

.slider-wrapper {
  @apply flex items-center gap-3;
}

.slider-value {
  @apply text-xs font-medium text-slate-400 min-w-8 text-center;
}

.slider-track-container {
  @apply relative flex-1 h-6 flex items-center;
}

.slider-input {
  @apply w-full h-2 bg-transparent appearance-none cursor-pointer relative z-10 opacity-0;
}

.slider-input:disabled {
  @apply cursor-not-allowed;
}

.slider-track {
  @apply absolute inset-0 h-2 rounded-full overflow-hidden;
}

.slider-fill {
  @apply absolute left-0 top-0 h-full rounded-full transition-all duration-150;
}

.slider-thumb {
  @apply absolute top-1/2 w-4 h-4 rounded-full transform -translate-y-1/2 -translate-x-1/2 transition-all duration-150 border-2 border-white;
}

.slider-marks {
  @apply absolute top-full mt-1 w-full;
}

.slider-mark {
  @apply absolute transform -translate-x-1/2;
}

.slider-mark-dot {
  @apply w-1.5 h-1.5 bg-slate-500 rounded-full mx-auto;
}

.slider-mark-label {
  @apply block text-xs text-slate-400 mt-1 text-center;
}

.slider-tooltip {
  @apply absolute top-0 transform -translate-y-8 bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg transition-opacity duration-200 pointer-events-none z-20;
}

.slider-tooltip::after {
  @apply absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0;
  content: '';
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid theme('colors.slate.800');
}

/* Webkit specific styles */
.slider-input::-webkit-slider-track {
  @apply appearance-none;
}

.slider-input::-webkit-slider-thumb {
  @apply appearance-none;
}

.slider-input::-moz-range-track {
  @apply bg-transparent border-none;
}

.slider-input::-moz-range-thumb {
  @apply bg-transparent border-none;
}
</style>