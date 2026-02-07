<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      :class="['btn-secondary text-xs', { 'btn-active': isFiltered }]"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
      </svg>
      <span>Filter Games</span>
      <span v-if="isFiltered" class="ml-1 w-2 h-2 rounded-full bg-brand-400" />
    </button>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-1"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-1"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 top-full mt-2 w-64 glass-heavy rounded-xl border border-surface-700 shadow-glass-lg z-50"
      >
        <div class="p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-surface-200">Select Games</span>
            <button
              @click="clearFilter"
              class="text-xs text-brand-400 hover:text-brand-300"
            >
              Clear
            </button>
          </div>
          
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="game in maxGames"
              :key="game"
              :class="[
                'py-2 text-sm font-medium rounded-lg transition-colors',
                localSelection.includes(game)
                  ? 'bg-brand-600 text-white'
                  : 'bg-surface-800 text-surface-400 hover:bg-surface-700'
              ]"
              @click="toggleGame(game)"
            >
              {{ game }}
            </button>
          </div>

          <div class="pt-3 border-t border-surface-700/50 flex gap-2">
            <button
              @click="selectAll"
              class="flex-1 py-1.5 text-xs font-medium bg-surface-800 text-surface-300 rounded-lg hover:bg-surface-700 transition-colors"
            >
              All
            </button>
            <button
              @click="applyFilter"
              class="flex-1 py-1.5 text-xs font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-500 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  maxGames: { type: Number, default: 6 },
  selectedGames: { type: Array, default: () => [] },
  isFiltered: { type: Boolean, default: false }
})

const emit = defineEmits(['update:filter'])

const isOpen = ref(false)
const localSelection = ref([])

// Sync local selection with props when opened
watch(() => isOpen.value, (open) => {
  if (open) {
    localSelection.value = [...props.selectedGames]
  }
})

const toggleGame = (game) => {
  const index = localSelection.value.indexOf(game)
  if (index > -1) {
    localSelection.value.splice(index, 1)
  } else {
    localSelection.value.push(game)
    localSelection.value.sort((a, b) => a - b)
  }
}

const selectAll = () => {
  localSelection.value = Array.from({ length: props.maxGames }, (_, i) => i + 1)
}

const clearFilter = () => {
  localSelection.value = []
  emit('update:filter', [])
  isOpen.value = false
}

const applyFilter = () => {
  emit('update:filter', localSelection.value)
  isOpen.value = false
}
</script>
