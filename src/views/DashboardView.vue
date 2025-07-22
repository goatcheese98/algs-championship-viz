<template>
  <AppLayout>
    <div class="dashboard-view">
      <!-- Dashboard Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="dashboard-title">ALGS Championship Dashboard</h1>
          <p class="dashboard-subtitle">
            Interactive tournament data visualization and analysis
          </p>
        </div>
        
        <div class="header-actions">
          <Button
            variant="primary"
            @click="navigateToTournament"
            icon="🏆"
          >
            View Tournament
          </Button>
        </div>
      </div>
      
      <!-- Quick Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">🏆</div>
            <div class="stat-details">
              <h3 class="stat-value">{{ totalTournaments }}</h3>
              <p class="stat-label">Tournaments</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">🎮</div>
            <div class="stat-details">
              <h3 class="stat-value">{{ totalMatchups }}</h3>
              <p class="stat-label">Matchups</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">📊</div>
            <div class="stat-details">
              <h3 class="stat-value">{{ totalDataPoints }}</h3>
              <p class="stat-label">Data Points</p>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">⚡</div>
            <div class="stat-details">
              <h3 class="stat-value">{{ systemStatus }}</h3>
              <p class="stat-label">System Status</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tournament Selection -->
      <div class="tournament-section">
        <TournamentSelector />
      </div>
      
      <!-- Recent Activity -->
      <div class="activity-section">
        <div class="section-header">
          <h2 class="section-title">Recent Activity</h2>
          <Button
            variant="ghost"
            size="sm"
            @click="refreshActivity"
            :loading="isRefreshingActivity"
            icon="↻"
          >
            Refresh
          </Button>
        </div>
        
        <div v-if="isLoadingActivity" class="activity-loading">
          <div class="loading-spinner"></div>
          <p class="loading-text">Loading recent activity...</p>
        </div>
        
        <div v-else class="activity-list">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="activity-item"
            @click="handleActivityClick(activity)"
          >
            <div class="activity-icon" :style="{ backgroundColor: activity.color }">
              {{ activity.icon }}
            </div>
            <div class="activity-content">
              <h4 class="activity-title">{{ activity.title }}</h4>
              <p class="activity-description">{{ activity.description }}</p>
              <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
            </div>
          </div>
          
          <div v-if="recentActivity.length === 0" class="no-activity">
            <div class="no-activity-icon">📭</div>
            <p class="no-activity-text">No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useTournamentStore, useUIStore } from '../stores'
import { AppLayout } from '../components/layout'
import { Button } from '../components/ui'
import TournamentSelector from '../components/features/tournament/TournamentSelector.vue'

// Types
interface ActivityItem {
  id: string
  title: string
  description: string
  timestamp: Date
  icon: string
  color: string
  action?: string
}

// Composables
const router = useRouter()
const tournamentStore = useTournamentStore()
const uiStore = useUIStore()

// Store state
const { selectedMatchup, errorMessage } = storeToRefs(tournamentStore)

// Local reactive state
const isLoadingActivity = ref(false)
const isRefreshingActivity = ref(false)
const recentActivity = ref<ActivityItem[]>([])

/**
 * Computed statistics
 */
const totalTournaments = computed(() => 3) // Year 4, Year 5, EWC 2025

const totalMatchups = computed(() => {
  // Mock data - would come from API
  return 24
})

const totalDataPoints = computed(() => {
  // Mock data - would come from processed chart data
  return '12.5K'
})

const systemStatus = computed(() => {
  return errorMessage.value ? 'Error' : 'Online'
})

/**
 * Navigate to tournament view
 */
function navigateToTournament(): void {
  if (selectedMatchup.value) {
    router.push(`/tournament/${selectedMatchup.value}`)
  } else {
    router.push('/tournament')
  }
}

/**
 * Handle activity item click
 */
function handleActivityClick(activity: ActivityItem): void {
  console.log('🔗 Activity clicked:', activity)
  
  if (activity.action) {
    // Handle different activity actions
    switch (activity.action) {
      case 'navigate-tournament':
        router.push('/tournament')
        break
      case 'view-matchup':
        if (selectedMatchup.value) {
          router.push(`/tournament/${selectedMatchup.value}`)
        }
        break
    }
  }
}

/**
 * Format timestamp for display
 */
function formatTime(timestamp: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - timestamp.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

/**
 * Load recent activity data
 */
async function loadRecentActivity(): Promise<void> {
  isLoadingActivity.value = true
  
  try {
    // Mock activity data - would come from API
    const mockActivity: ActivityItem[] = [
      {
        id: '1',
        title: 'Tournament Data Updated',
        description: 'Year 5 Championship data has been refreshed',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        icon: '📊',
        color: '#10b981',
        action: 'navigate-tournament'
      },
      {
        id: '2',
        title: 'New Matchup Available',
        description: 'EWC 2025 Finals matchup data processed',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        icon: '🏆',
        color: '#3b82f6',
        action: 'view-matchup'
      },
      {
        id: '3',
        title: 'Performance Optimization',
        description: 'Chart rendering speed improved by 40%',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        icon: '⚡',
        color: '#f59e0b'
      }
    ]
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    recentActivity.value = mockActivity
    
  } catch (error) {
    console.error('Failed to load recent activity:', error)
    
    uiStore.addNotification({
      type: 'error',
      title: 'Load Failed',
      message: 'Failed to load recent activity',
      duration: 5000
    })
  } finally {
    isLoadingActivity.value = false
  }
}

/**
 * Refresh activity data
 */
async function refreshActivity(): Promise<void> {
  isRefreshingActivity.value = true
  
  try {
    await loadRecentActivity()
    
    uiStore.addNotification({
      type: 'success',
      title: 'Refreshed',
      message: 'Activity data has been updated',
      duration: 3000
    })
  } catch (error) {
    console.error('Failed to refresh activity:', error)
  } finally {
    isRefreshingActivity.value = false
  }
}

// Lifecycle
onMounted(() => {
  console.log('🏠 Dashboard mounted')
  loadRecentActivity()
})
</script>

<style scoped>
.dashboard-view {
  @apply min-h-screen bg-slate-900 text-white;
}

.dashboard-header {
  @apply flex items-center justify-between p-6 bg-slate-800 border-b border-slate-700;
}

.header-content h1 {
  @apply text-3xl font-bold text-white mb-2;
}

.header-content p {
  @apply text-slate-400 text-lg;
}

.header-actions {
  @apply flex gap-3;
}

/* Stats Grid */
.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6;
}

.stat-card {
  @apply bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-red-500 transition-colors;
}

.stat-content {
  @apply flex items-center gap-4;
}

.stat-icon {
  @apply text-3xl;
}

.stat-value {
  @apply text-2xl font-bold text-white;
}

.stat-label {
  @apply text-slate-400 text-sm;
}

/* Tournament Section */
.tournament-section {
  @apply px-6 pb-6;
}

/* Activity Section */
.activity-section {
  @apply p-6;
}

.section-header {
  @apply flex items-center justify-between mb-6;
}

.section-title {
  @apply text-xl font-semibold text-white;
}

.activity-loading {
  @apply flex items-center justify-center py-12;
}

.loading-spinner {
  @apply w-8 h-8 border-2 border-red-200 border-t-red-500 rounded-full animate-spin mr-3;
}

.loading-text {
  @apply text-slate-400;
}

.activity-list {
  @apply space-y-3;
}

.activity-item {
  @apply flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-lg;
  @apply hover:border-red-500 hover:bg-slate-750 transition-all duration-200 cursor-pointer;
}

.activity-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white text-lg;
}

.activity-content {
  @apply flex-1;
}

.activity-title {
  @apply font-semibold text-white text-sm mb-1;
}

.activity-description {
  @apply text-slate-400 text-sm mb-2;
}

.activity-time {
  @apply text-slate-500 text-xs;
}

.no-activity {
  @apply text-center py-12;
}

.no-activity-icon {
  @apply text-4xl mb-3;
}

.no-activity-text {
  @apply text-slate-400;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    @apply flex-col gap-4 items-start;
  }
  
  .stats-grid {
    @apply grid-cols-2;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    @apply grid-cols-1;
  }
}

/* Animations */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>