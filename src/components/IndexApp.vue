<template>
  <div class="min-h-screen bg-surface-950">
    <!-- Header with Tournament Selector -->
    <header class="glass-heavy border-b border-surface-800 relative">
      <!-- Red accent line at bottom of header -->
      <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-700/60 to-transparent" />
      <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <img src="/apex-legends.svg" alt="Apex Legends" class="apex-logo" />
          </div>

          <!-- Right controls -->
          <div class="flex items-center gap-3">
            <span class="text-sm text-surface-400 hidden sm:inline">Select Tournament:</span>
            <div class="relative">
              <select
                v-model="selectedTournament"
                class="input text-sm py-2 pl-3 pr-10 min-w-[180px] cursor-pointer appearance-none bg-surface-800/50"
              >
                <option value="year-4-championship">Year 4 Championship</option>
                <option value="year-5-open">Year 5 Open</option>
                <option value="ewc-2025">EWC 2025</option>
              </select>
              <svg class="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <button @click="enterTournament" class="btn-primary">
              View Tournament
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <!-- Theme toggle -->
            <button
              @click="toggleTheme"
              class="btn-ghost p-2 rounded-xl"
              :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            >
              <svg v-if="isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <main>
      <div class="relative overflow-hidden">
        <!-- Background: dark mode = deep dark-red gradient, light mode = warm cream -->
        <template v-if="isDark">
          <div class="absolute inset-0 bg-gradient-to-br from-brand-950 via-surface-950 to-surface-950" />
          <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(185,28,28,0.18),transparent_55%)]" />
        </template>
        <template v-else>
          <div class="absolute inset-0" style="background-color: var(--bg-base);" />
          <div class="absolute inset-0" style="background: radial-gradient(ellipse at top, rgba(185,28,28,0.08), transparent 55%);" />
        </template>

        <div class="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div class="text-center max-w-3xl mx-auto">
            <!-- Badge -->
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
              <span class="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              Live Tournament Analytics
            </div>

            <!-- Title -->
            <div class="flex justify-center mb-6">
              <img src="/apex-legends.svg" alt="Apex Legends" class="apex-logo-hero" />
            </div>

            <!-- Description -->
            <p class="text-lg sm:text-xl text-surface-400 mb-10 leading-relaxed">
              Professional-grade analytics and visualization for Apex Legends Global Series tournaments.
              Track team performance, analyze match data, and explore championship statistics in real-time.
            </p>

            <!-- Quick Tournament Cards -->
            <div class="grid gap-4 sm:grid-cols-3 mb-12">
              <button
                @click="selectAndEnter('year-4-championship')"
                class="glass-card-hover group text-left p-6"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  🏆
                </div>
                <h3 class="text-lg font-semibold text-surface-100 mb-1">Year 4 Championship</h3>
                <p class="text-sm text-surface-500">Sapporo, Japan • 40 Teams</p>
              </button>

              <button
                @click="selectAndEnter('year-5-open')"
                class="glass-card-hover group text-left p-6"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  🌍
                </div>
                <h3 class="text-lg font-semibold text-surface-100 mb-1">Year 5 Open</h3>
                <p class="text-sm text-surface-500">Global Tournament • 40 Teams</p>
              </button>

              <button
                @click="selectAndEnter('ewc-2025')"
                class="glass-card-hover group text-left p-6"
              >
                <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  ⚔️
                </div>
                <h3 class="text-lg font-semibold text-surface-100 mb-1">EWC 2025</h3>
                <p class="text-sm text-surface-500">Esports World Cup • 20 Teams</p>
              </button>
            </div>

            <!-- Features -->
            <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div class="glass-card p-4">
                <div class="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 class="font-medium text-surface-200 text-sm mb-1">Live Charts</h3>
                <p class="text-xs text-surface-500">Interactive race charts with real-time tracking</p>
              </div>

              <div class="glass-card p-4">
                <div class="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 0L9 7" />
                  </svg>
                </div>
                <h3 class="font-medium text-surface-200 text-sm mb-1">Map Analysis</h3>
                <p class="text-xs text-surface-500">Color-coded map sequences and performance</p>
              </div>

              <div class="glass-card p-4">
                <div class="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 class="font-medium text-surface-200 text-sm mb-1">Team Stats</h3>
                <p class="text-xs text-surface-500">Comprehensive performance metrics</p>
              </div>

              <div class="glass-card p-4">
                <div class="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                  <svg class="w-5 h-5 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 class="font-medium text-surface-200 text-sm mb-1">Playback</h3>
                <p class="text-xs text-surface-500">Animated tournament progression</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-surface-800">
      <div class="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="text-sm text-surface-500">
            ALGS Tournament Dashboard • Built for esports analytics
          </p>
          <a href="https://github.com/goatcheese49/algs-championship-viz"
             target="_blank"
             class="text-surface-500 hover:text-surface-300 transition-colors">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const router = useRouter()
const { isDark, toggleTheme } = useTheme()
const selectedTournament = ref('year-4-championship')

const enterTournament = () => {
  router.push(`/tournament/${selectedTournament.value}`)
}

const selectAndEnter = (tournament) => {
  selectedTournament.value = tournament
  router.push(`/tournament/${tournament}`)
}
</script>

<style scoped>
.apex-logo {
  height: 28px;
  width: auto;
  filter: invert(1);
  opacity: 0.9;
  transition: opacity 0.2s;
}

.apex-logo:hover {
  opacity: 1;
}

.apex-logo-hero {
  height: 72px;
  width: auto;
  filter: invert(1);
  opacity: 0.95;
}

html.light .apex-logo,
html.light .apex-logo-hero {
  filter: invert(0);
}
</style>
