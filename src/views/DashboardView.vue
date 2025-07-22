<template>
  <AppLayout>
    <div class="dashboard-view">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-background">
          <div class="hero-gradient"></div>
          <div class="hero-particles"></div>
        </div>
        
        <div class="hero-content">
          <div class="hero-text">
            <div class="hero-badge">
              <svg class="hero-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
              </svg>
              Professional Esports Analytics
            </div>
            
            <h1 class="hero-title">
              ALGS Championship
              <span class="hero-title-accent">Data Analytics Platform</span>
            </h1>
            
            <p class="hero-subtitle">
              Unlock the power of tournament data with advanced visualization, 
              comprehensive match analysis, and real-time performance insights 
              for the Apex Legends Global Series Championship.
            </p>
            
            <div class="hero-actions">
              <Button
                variant="primary"
                size="lg"
                @click="navigateToTournament"
                class="hero-cta-primary"
              >
                <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 2L3 6V20C3 21.1 3.9 22 5 22H19C20.1 22 21 21.1 21 20V6L18 2H6Z"/>
                  <polyline points="3,6 21,6"/>
                  <path d="M16 10C16 11.1046 15.1046 12 14 12C12.8954 12 12 11.1046 12 10C12 8.89543 12.8954 8 14 8C15.1046 8 16 8.89543 16 10Z"/>
                </svg>
                Explore Tournament Data
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                @click="scrollToStats"
                class="hero-cta-secondary"
              >
                <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                </svg>
                View Analytics
              </Button>
            </div>
          </div>
          
          <div class="hero-visual">
            <div class="hero-chart-container">
              <div class="hero-chart-bg"></div>
              <svg class="hero-chart" viewBox="0 0 300 200">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ef4444" stop-opacity="0.8"/>
                    <stop offset="100%" stop-color="#dc2626" stop-opacity="0.2"/>
                  </linearGradient>
                </defs>
                <path d="M 20 150 Q 50 120 80 130 T 140 110 T 200 90 T 260 70 L 280 180 L 20 180 Z" 
                      fill="url(#chartGradient)" class="chart-path"/>
                <path d="M 20 150 Q 50 120 80 130 T 140 110 T 200 90 T 260 70" 
                      stroke="#ef4444" stroke-width="3" fill="none" class="chart-line"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Stats Section -->
      <div class="stats-section" id="stats-section">
        <div class="stats-header">
          <h2 class="stats-title">Platform Overview</h2>
          <p class="stats-subtitle">Real-time insights into tournament performance and system metrics</p>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card tournaments hover-lift animate-fade-up">
            <div class="stat-background">
              <div class="stat-gradient"></div>
              <div class="stat-pattern"></div>
            </div>
            <div class="stat-content">
              <div class="stat-header">
                <div class="stat-icon-container">
                  <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M6 9H4.5C3.67 9 3 9.67 3 10.5V20.5C3 21.33 3.67 22 4.5 22H19.5C20.33 22 21 21.33 21 20.5V10.5C21 9.67 20.33 9 19.5 9H18M6 9V6C6 4.34 7.34 3 9 3H15C16.66 3 18 4.34 18 6V9M6 9H18"/>
                  </svg>
                </div>
                <div class="stat-trend positive">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
              </div>
              <div class="stat-body">
                <h3 class="stat-value">{{ totalTournaments }}</h3>
                <p class="stat-label">Tournaments Tracked</p>
                <p class="stat-description">Active championship series</p>
              </div>
            </div>
          </div>
          
          <div class="stat-card matchups hover-lift animate-fade-up animate-stagger-1">
            <div class="stat-background">
              <div class="stat-gradient"></div>
              <div class="stat-pattern"></div>
            </div>
            <div class="stat-content">
              <div class="stat-header">
                <div class="stat-icon-container">
                  <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    <line x1="9" y1="9" x2="9.01" y2="9"/>
                    <line x1="15" y1="9" x2="15.01" y2="9"/>
                  </svg>
                </div>
                <div class="stat-trend positive">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
              </div>
              <div class="stat-body">
                <h3 class="stat-value">{{ totalMatchups }}</h3>
                <p class="stat-label">Match Configurations</p>
                <p class="stat-description">Available for analysis</p>
              </div>
            </div>
          </div>
          
          <div class="stat-card datapoints hover-lift animate-fade-up animate-stagger-2">
            <div class="stat-background">
              <div class="stat-gradient"></div>
              <div class="stat-pattern"></div>
            </div>
            <div class="stat-content">
              <div class="stat-header">
                <div class="stat-icon-container">
                  <svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                  </svg>
                </div>
                <div class="stat-trend positive">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                    <polyline points="17 6 23 6 23 12"/>
                  </svg>
                </div>
              </div>
              <div class="stat-body">
                <h3 class="stat-value">{{ totalDataPoints }}</h3>
                <p class="stat-label">Data Points Processed</p>
                <p class="stat-description">Performance metrics collected</p>
              </div>
            </div>
          </div>
          
          <div class="stat-card status hover-lift animate-fade-up animate-stagger-3" :class="systemStatus.toLowerCase()">
            <div class="stat-background">
              <div class="stat-gradient"></div>
              <div class="stat-pattern"></div>
            </div>
            <div class="stat-content">
              <div class="stat-header">
                <div class="stat-icon-container">
                  <svg v-if="systemStatus === 'Online'" class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22,4 12,14.01 9,11.01"/>
                  </svg>
                  <svg v-else class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div class="status-indicator status-pulse" :class="systemStatus.toLowerCase()"></div>
              </div>
              <div class="stat-body">
                <h3 class="stat-value">{{ systemStatus }}</h3>
                <p class="stat-label">System Status</p>
                <p class="stat-description">{{ systemStatus === 'Online' ? 'All systems operational' : 'Service degraded' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tournament Selection -->
      <div class="tournament-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">Tournament Selection</h2>
            <p class="section-subtitle">Choose a tournament to dive deep into match analytics and performance data</p>
          </div>
          
          <div class="tournament-selector-wrapper">
            <TournamentSelector />
          </div>
        </div>
      </div>
      
      <!-- Recent Activity -->
      <div class="activity-section">
        <div class="section-container">
          <div class="section-header">
            <div class="section-title-group">
              <h2 class="section-title">Recent Activity</h2>
              <div class="activity-badge">Live</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              @click="refreshActivity"
              :loading="isRefreshingActivity"
              class="refresh-button"
            >
              <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="23,4 23,10 17,10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </Button>
          </div>
          
          <div v-if="isLoadingActivity" class="activity-loading">
            <div class="loading-container">
              <div class="loading-spinner"></div>
              <div class="loading-content">
                <p class="loading-title">Loading Activity Feed</p>
                <p class="loading-subtitle">Fetching the latest updates...</p>
              </div>
            </div>
          </div>
          
          <div v-else class="activity-feed">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="activity-item"
              @click="handleActivityClick(activity)"
            >
              <div class="activity-timeline"></div>
              <div class="activity-icon-wrapper">
                <div class="activity-icon" :style="{ backgroundColor: activity.color }">
                  {{ activity.icon }}
                </div>
              </div>
              <div class="activity-content">
                <div class="activity-header">
                  <h4 class="activity-title">{{ activity.title }}</h4>
                  <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
                </div>
                <p class="activity-description">{{ activity.description }}</p>
                <div class="activity-footer">
                  <div class="activity-status">
                    <div class="status-dot completed"></div>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="recentActivity.length === 0" class="no-activity">
              <div class="no-activity-content">
                <svg class="no-activity-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21.5 2L17.5 6L21.5 10"/>
                  <path d="M2.5 22L6.5 18L2.5 14"/>
                  <line x1="7.5" y1="18" x2="17.5" y2="6"/>
                </svg>
                <h3 class="no-activity-title">No Recent Activity</h3>
                <p class="no-activity-text">Activity feed will update as new data becomes available</p>
              </div>
            </div>
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
 * Scroll to stats section
 */
function scrollToStats(): void {
  const statsSection = document.getElementById('stats-section')
  if (statsSection) {
    statsSection.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
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
  @apply min-h-screen bg-slate-950 text-white relative overflow-hidden;
}

/* ===== HERO SECTION ===== */
.hero-section {
  @apply relative min-h-screen flex items-center justify-center px-4 lg:px-8;
  background: linear-gradient(135deg, #0f0f23 0%, #1e1b3c 25%, #2d1b69 75%, #1e293b 100%);
}

.hero-background {
  @apply absolute inset-0;
}

.hero-gradient {
  @apply absolute inset-0;
  background: radial-gradient(circle at 30% 30%, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 35%, transparent 70%),
              radial-gradient(circle at 70% 70%, rgba(147, 51, 234, 0.1) 0%, rgba(147, 51, 234, 0.05) 35%, transparent 70%),
              linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
}

.hero-particles {
  @apply absolute inset-0 pointer-events-none;
  background-image: 
    radial-gradient(2px 2px at 20px 30px, rgba(239, 68, 68, 0.3), transparent),
    radial-gradient(2px 2px at 40px 70px, rgba(147, 51, 234, 0.3), transparent),
    radial-gradient(1px 1px at 90px 40px, rgba(239, 68, 68, 0.2), transparent),
    radial-gradient(1px 1px at 130px 80px, rgba(147, 51, 234, 0.2), transparent),
    radial-gradient(2px 2px at 160px 30px, rgba(239, 68, 68, 0.1), transparent);
  background-repeat: repeat;
  background-size: 200px 100px;
  animation: particles 20s linear infinite;
}

@keyframes particles {
  from { transform: translateY(0px); }
  to { transform: translateY(-200px); }
}

.hero-content {
  @apply relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center;
}

.hero-text {
  @apply space-y-8;
}

.hero-badge {
  @apply inline-flex items-center gap-2 px-4 py-2 bg-red-950/30 border border-red-500/30 rounded-full text-red-300 text-sm font-medium backdrop-blur-sm max-w-max;
  animation: glow 3s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); }
  to { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4), 0 0 30px rgba(239, 68, 68, 0.1); }
}

.hero-badge-icon {
  @apply w-4 h-4 text-red-400 flex-shrink-0;
}

.hero-title {
  @apply text-5xl lg:text-7xl font-bold leading-tight;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-title-accent {
  @apply block mt-2;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  @apply text-xl lg:text-2xl text-slate-300 leading-relaxed max-w-2xl;
}

.hero-actions {
  @apply flex flex-col sm:flex-row gap-4 items-start sm:items-center;
}

.hero-cta-primary {
  @apply bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0 shadow-lg shadow-red-600/25 transition-all duration-300 px-8 py-4 text-lg font-semibold;
}

.hero-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(239, 68, 68, 0.3);
}

.hero-cta-secondary {
  @apply bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600 hover:border-slate-500 backdrop-blur-sm transition-all duration-300 px-8 py-4 text-lg font-semibold;
}

.hero-cta-secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(30, 41, 59, 0.3);
}

.button-icon {
  @apply w-5 h-5 mr-2 flex-shrink-0;
}

.hero-visual {
  @apply relative lg:justify-self-center;
}

.hero-chart-container {
  @apply relative w-full max-w-md mx-auto;
}

.hero-chart-bg {
  @apply absolute inset-0 bg-gradient-to-br from-slate-800/20 to-slate-900/40 rounded-2xl backdrop-blur-sm border border-slate-700/50;
}

.hero-chart {
  @apply w-full h-auto relative z-10 p-6;
}

.chart-path {
  animation: chartFill 2s ease-out 0.5s both;
}

.chart-line {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: chartLine 2s ease-out 0.5s both;
}

@keyframes chartFill {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes chartLine {
  to { stroke-dashoffset: 0; }
}

/* ===== STATS SECTION ===== */
.stats-section {
  @apply py-20 px-4 lg:px-8 bg-slate-950 relative;
}

.stats-header {
  @apply text-center mb-16 max-w-3xl mx-auto;
}

.stats-title {
  @apply text-4xl lg:text-5xl font-bold mb-6;
  background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-subtitle {
  @apply text-xl text-slate-400 leading-relaxed;
}

.stats-grid {
  @apply grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto;
}

.stat-card {
  @apply relative group cursor-pointer transition-all duration-500;
  transform-style: preserve-3d;
}

.stat-card:hover {
  transform: translateY(-8px);
}

.stat-background {
  @apply absolute inset-0 rounded-2xl overflow-hidden;
}

.stat-card.tournaments .stat-gradient {
  @apply absolute inset-0;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.stat-card.matchups .stat-gradient {
  @apply absolute inset-0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.stat-card.datapoints .stat-gradient {
  @apply absolute inset-0;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.stat-card.status.online .stat-gradient {
  @apply absolute inset-0;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.05) 100%);
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.stat-card.status.error .stat-gradient {
  @apply absolute inset-0;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.stat-pattern {
  @apply absolute inset-0 opacity-5;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='53' cy='7' r='1'/%3E%3Ccircle cx='7' cy='53' r='1'/%3E%3Ccircle cx='53' cy='53' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.stat-content {
  @apply relative z-10 p-6 h-full backdrop-blur-sm rounded-2xl;
}

.stat-header {
  @apply flex items-center justify-between mb-4;
}

.stat-icon-container {
  @apply w-12 h-12 min-w-12 min-h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm flex items-center justify-center border border-white/10 flex-shrink-0;
}

.stat-icon {
  @apply w-6 h-6 text-white flex-shrink-0;
}

.stat-trend {
  @apply w-8 h-8 rounded-lg flex items-center justify-center;
}

.stat-trend.positive {
  @apply bg-green-500/20 text-green-400;
}

.stat-trend svg {
  @apply w-4 h-4 flex-shrink-0;
}

.stat-body {
  @apply space-y-2;
}

.stat-value {
  @apply text-3xl font-bold text-white;
}

.stat-label {
  @apply text-lg font-semibold text-slate-200;
}

.stat-description {
  @apply text-sm text-slate-400;
}

.status-indicator {
  @apply w-3 h-3 rounded-full animate-pulse;
}

.status-indicator.online {
  @apply bg-green-400;
}

.status-indicator.error {
  @apply bg-red-400;
}

/* ===== TOURNAMENT SECTION ===== */
.tournament-section {
  @apply py-20 px-4 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900;
}

.section-container {
  @apply max-w-7xl mx-auto;
}

.section-header {
  @apply text-center mb-16;
}

.section-title {
  @apply text-3xl lg:text-4xl font-bold text-white mb-4;
}

.section-subtitle {
  @apply text-lg text-slate-400 max-w-2xl mx-auto;
}

.tournament-selector-wrapper {
  @apply bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8;
}

/* ===== ACTIVITY SECTION ===== */
.activity-section {
  @apply py-20 px-4 lg:px-8 bg-slate-900;
}

.section-title-group {
  @apply flex items-center gap-3;
}

.activity-badge {
  @apply px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.refresh-button {
  @apply hover:bg-slate-800 border border-slate-700 hover:border-slate-600;
}

.activity-loading {
  @apply flex items-center justify-center py-20;
}

.loading-container {
  @apply flex items-center gap-4;
}

.loading-spinner {
  @apply w-10 h-10 border-3 border-red-200 border-t-red-500 rounded-full animate-spin;
}

.loading-content {
  @apply space-y-1;
}

.loading-title {
  @apply text-white font-semibold;
}

.loading-subtitle {
  @apply text-slate-400 text-sm;
}

.activity-feed {
  @apply space-y-4 max-w-4xl mx-auto;
}

.activity-item {
  @apply relative group bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-300 cursor-pointer;
}

.activity-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.activity-timeline {
  @apply absolute left-6 top-0 w-0.5 h-full bg-gradient-to-b from-red-500/50 to-transparent;
}

.activity-timeline::before {
  content: '';
  @apply absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900;
}

.activity-item:first-child .activity-timeline::before {
  @apply bg-green-500;
}

.activity-icon-wrapper {
  @apply relative z-10 flex-shrink-0 max-w-max;
}

.activity-icon {
  @apply w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-semibold shadow-lg flex-shrink-0;
}

.activity-content {
  @apply flex-1 ml-6;
}

.activity-header {
  @apply flex items-center justify-between mb-2;
}

.activity-title {
  @apply font-semibold text-white text-lg;
}

.activity-time {
  @apply text-slate-400 text-sm font-medium;
}

.activity-description {
  @apply text-slate-300 mb-4 leading-relaxed;
}

.activity-footer {
  @apply flex items-center justify-between;
}

.activity-status {
  @apply flex items-center gap-2 text-sm text-slate-400;
}

.status-dot {
  @apply w-2 h-2 rounded-full;
}

.status-dot.completed {
  @apply bg-green-400;
}

.no-activity {
  @apply text-center py-20;
}

.no-activity-content {
  @apply space-y-4 max-w-sm mx-auto;
}

.no-activity-icon {
  @apply w-16 h-16 text-slate-500 mx-auto flex-shrink-0;
}

.no-activity-title {
  @apply text-xl font-semibold text-slate-300;
}

.no-activity-text {
  @apply text-slate-500;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .hero-content {
    @apply grid-cols-1 text-center gap-8;
  }
  
  .hero-title {
    @apply text-4xl lg:text-6xl;
  }
  
  .stats-grid {
    @apply grid-cols-1 md:grid-cols-2;
  }
}

@media (max-width: 768px) {
  .hero-title {
    @apply text-3xl;
  }
  
  .hero-subtitle {
    @apply text-lg;
  }
  
  .hero-actions {
    @apply flex-col;
  }
  
  .stats-grid {
    @apply grid-cols-1 gap-6;
  }
  
  .stats-title {
    @apply text-3xl;
  }
}

@media (max-width: 640px) {
  .activity-item {
    @apply p-4;
  }
  
  .activity-content {
    @apply ml-4;
  }
  
  .activity-icon {
    @apply w-12 h-12 text-base;
  }
}

/* ===== ANIMATIONS ===== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeInUp 0.6s ease-out forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.activity-item {
  animation: fadeInUp 0.5s ease-out forwards;
}

.activity-item:nth-child(1) { animation-delay: 0.1s; }
.activity-item:nth-child(2) { animation-delay: 0.2s; }
.activity-item:nth-child(3) { animation-delay: 0.3s; }
</style>