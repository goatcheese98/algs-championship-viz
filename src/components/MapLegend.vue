<template>
  <Transition name="slide-up">
    <div v-if="isVisible" class="map-legend">
      <div class="legend-content">
        <div class="legend-header">
          <span class="legend-title">Maps</span>
          <button
            @click="$emit('toggle')"
            class="toggle-btn"
            title="Hide legend"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="legend-items">
          <div
            v-for="map in uniqueMaps"
            :key="map.name"
            class="legend-item"
          >
            <div
              class="legend-color"
              :style="{ backgroundColor: map.color }"
            />
            <span class="legend-name">{{ map.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Show button when hidden -->
  <button
    v-if="!isVisible"
    @click="$emit('toggle')"
    class="show-legend-btn"
    title="Show legend"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 13V9m0 0L9 7" />
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] },
  isVisible: { type: Boolean, default: true }
})

defineEmits(['toggle'])

// Get unique maps with colors
const uniqueMaps = computed(() => {
  if (!props.data.length) return []

  const mapsSet = new Map()
  props.data.forEach(team => {
    team.games?.forEach(game => {
      if (game.map && !mapsSet.has(game.map)) {
        mapsSet.set(game.map, game.color)
      }
    })
  })

  return Array.from(mapsSet.entries()).map(([name, color]) => ({
    name,
    color
  }))
})
</script>

<style scoped>
.map-legend {
  backdrop-filter: blur(20px);
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(100, 116, 139, 0.25);
  border-radius: 10px;
  padding: 8px 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.legend-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding-bottom: 5px;
  border-bottom: 1px solid rgba(100, 116, 139, 0.15);
}

.legend-title {
  font-size: 9px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: rgba(100, 116, 139, 0.1);
  border: 1px solid rgba(100, 116, 139, 0.2);
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: rgba(100, 116, 139, 0.2);
  border-color: rgba(100, 116, 139, 0.3);
  color: #cbd5e1;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 3px 7px;
  background: rgba(30, 41, 59, 0.3);
  border-radius: 5px;
  border: 1px solid rgba(100, 116, 139, 0.12);
}

.legend-color {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.legend-name {
  font-size: 10px;
  color: #cbd5e1;
  font-weight: 500;
  white-space: nowrap;
}

.show-legend-btn {
  backdrop-filter: blur(20px);
  background: rgba(15, 23, 42, 0.92);
  border: 1px solid rgba(100, 116, 139, 0.25);
  border-radius: 8px;
  padding: 7px;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.show-legend-btn:hover {
  background: rgba(15, 23, 42, 0.95);
  border-color: rgba(100, 116, 139, 0.35);
  color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 10px 36px rgba(0, 0, 0, 0.5);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
