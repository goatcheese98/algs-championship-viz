<template>
  <Transition name="slide-up">
    <div v-if="isVisible && currentMapDisplay" class="map-legend">
      <div class="legend-header">
        <span class="legend-title">Current Map</span>
        <button @click="$emit('toggle')" class="toggle-btn" title="Hide">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="map-card">
        <div
          v-if="currentMapDisplay.imageUrl"
          class="map-card-bg"
          :style="{ backgroundImage: `url(${currentMapDisplay.imageUrl})` }"
        />
        <div class="map-card-vignette" />
        <div class="map-card-footer">
          <div class="map-card-dot" :style="{ backgroundColor: currentMapDisplay.color }" />
          <span class="map-card-name">{{ currentMapDisplay.displayName }}</span>
        </div>
      </div>
    </div>
  </Transition>

  <button v-if="!isVisible" @click="$emit('toggle')" class="show-legend-btn" title="Show map">
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 13V9m0 0L9 7" />
    </svg>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useTournamentStore } from '@/stores/tournament'
import { storeToRefs } from 'pinia'
import { getBaseMapColor } from '@/chart/MapColoringLogic'
import mapsData from '@/data/maps.json'

const props = defineProps({
  data: { type: Array, default: () => [] },
  isVisible: { type: Boolean, default: true }
})

defineEmits(['toggle'])

const store = useTournamentStore()
const { currentMap } = storeToRefs(store)

const currentMapDisplay = computed(() => {
  const rawMap = currentMap.value
  if (!rawMap) return null

  const displayName = mapsData.aliases[rawMap] || rawMap
  const imageUrl = mapsData.images[displayName] || null
  const color = getBaseMapColor(rawMap)

  return { rawMap, displayName, imageUrl, color }
})
</script>

<style scoped>
.map-legend {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  width: 220px;
}

.legend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.legend-title {
  font-size: 9px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  background: var(--bg-element-faint);
  border: 1px solid var(--border-faint);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: var(--bg-element);
  color: var(--text-secondary);
}

.map-card {
  position: relative;
  width: 100%;
  height: 120px;
  border-radius: 9px;
  overflow: hidden;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.map-card-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
  transition: filter 0.4s ease;
}

.map-card:hover .map-card-bg {
  filter: brightness(0.85);
}

.map-card-vignette {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%);
}

.map-card-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.map-card-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 0 6px currentColor;
}

.map-card-name {
  font-size: 13px;
  font-weight: 700;
  color: #f1f5f9;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.show-legend-btn {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: var(--bg-overlay);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: 7px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.show-legend-btn:hover {
  background: var(--bg-heavy);
  border-color: var(--border-subtle);
  color: var(--text-secondary);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
