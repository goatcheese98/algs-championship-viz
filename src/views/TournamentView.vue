<template>
  <AppLayout>
    <div class="tournament-view-wrapper">
      <!-- Use the existing tournament view component -->
      <TournamentViewComponent />
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { AppLayout } from '../components/layout'
import TournamentViewComponent from '../components/features/tournament/TournamentView.vue'

// Props for route params
interface Props {
  matchupId?: string
}

const props = defineProps<Props>()

onMounted(() => {
  console.log('🏆 Tournament View mounted', props.matchupId ? `with matchup: ${props.matchupId}` : '')
})
</script>

<style scoped>
.tournament-view-wrapper {
  @apply min-h-screen;
}
</style>