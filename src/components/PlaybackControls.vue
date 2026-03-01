<template>
  <div class="glass-card overflow-hidden">
    <div class="section-header">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="section-title">Playback</span>
      </div>
    </div>
    
    <div class="p-4 space-y-4">
      <!-- Progress Slider -->
      <div class="space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-surface-500">Game {{ currentGame }}</span>
          <span class="text-surface-500">of {{ maxGames }}</span>
        </div>
        <input
          type="range"
          :min="1"
          :max="maxGames"
          :value="currentGame"
          @input="$emit('update:currentGame', parseInt($event.target.value))"
          class="w-full h-2 bg-surface-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
      </div>

      <!-- Control Buttons -->
      <div class="flex items-center justify-center gap-2">
        <button
          @click="$emit('update:currentGame', 1)"
          class="btn-ghost p-2"
          title="Reset to Start"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          @click="$emit('update:currentGame', Math.max(1, currentGame - 1))"
          class="btn-ghost p-2"
          title="Previous Game"
          :disabled="currentGame <= 1"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          @click="$emit('togglePlayback')"
          :class="['btn-primary px-6', { 'bg-accent-danger hover:bg-red-600': isPlaying }]"
        >
          <svg v-if="isPlaying" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ isPlaying ? 'Pause' : 'Play' }}</span>
        </button>
        
        <button 
          @click="$emit('update:currentGame', Math.min(maxGames, currentGame + 1))"
          class="btn-ghost p-2"
          title="Next Game"
          :disabled="currentGame >= maxGames"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <button 
          @click="$emit('update:currentGame', maxGames)"
          class="btn-ghost p-2"
          title="Jump to End"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Speed Control -->
      <div class="pt-3 border-t border-surface-700/50">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs text-surface-500">Animation Speed</span>
        </div>
        <div class="flex gap-1">
          <button
            v-for="speed in speeds"
            :key="speed.value"
            :class="['flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors', 
              animationSpeed === speed.value 
                ? 'bg-brand-600 text-white' 
                : 'bg-surface-800 text-surface-400 hover:bg-surface-700']"
            @click="$emit('update:speed', speed.value)"
          >
            {{ speed.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  maxGames: { type: Number, default: 6 },
  currentGame: { type: Number, default: 1 },
  isPlaying: { type: Boolean, default: false },
  animationSpeed: { type: String, default: 'medium' }
})

defineEmits([
  'update:currentGame',
  'togglePlayback',
  'update:speed'
])

const speeds = [
  { value: 'slow', label: '1x' },
  { value: 'medium', label: '2x' },
  { value: 'fast', label: '4x' }
]
</script>
