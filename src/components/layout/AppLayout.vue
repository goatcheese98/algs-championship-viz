<template>
  <div class="app-layout" :class="layoutClasses">
    <!-- App Header -->
    <AppHeader
      :title="title"
      :show-navigation="showNavigation"
      @navigation-toggle="$emit('navigationToggle')"
    />
    
    <!-- Main Content Area -->
    <main class="app-main" :class="mainClasses">
      <div class="app-content">
        <!-- Content slot -->
        <slot />
        
        <!-- Loading overlay -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <p v-if="loadingMessage" class="loading-message">{{ loadingMessage }}</p>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Global notifications -->
    <div class="notifications-container">
      <transition-group name="notification" tag="div">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="getNotificationClasses(notification)"
        >
          <div class="notification-content">
            <div class="notification-icon">
              <component :is="getNotificationIcon(notification.type)" />
            </div>
            
            <div class="notification-body">
              <h4 v-if="notification.title" class="notification-title">
                {{ notification.title }}
              </h4>
              <p class="notification-message">{{ notification.message }}</p>
            </div>
            
            <button
              v-if="notification.closable !== false"
              type="button"
              class="notification-close"
              @click="removeNotification(notification.id)"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import AppHeader from './AppHeader.vue'
import { useUIStore } from '../../stores'
import type { NotificationConfig } from '../../types'

// Props interface
interface Props {
  title?: string
  showNavigation?: boolean
  sidebar?: boolean
  fluid?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'ALGS Championship Visualization',
  showNavigation: false,
  sidebar: false,
  fluid: false
})

// Emits
interface Emits {
  navigationToggle: []
}

const emit = defineEmits<Emits>()

// Store integration
const uiStore = useUIStore()
const { notifications, globalLoading, isDarkMode } = storeToRefs(uiStore)

/**
 * Extract loading state
 */
const isLoading = computed(() => globalLoading.value.isLoading)
const loadingMessage = computed(() => globalLoading.value.message)

/**
 * Layout CSS classes
 */
const layoutClasses = computed((): string[] => {
  const classes = []
  
  if (isDarkMode.value) {
    classes.push('dark')
  }
  
  if (props.sidebar) {
    classes.push('has-sidebar')
  }
  
  return classes
})

/**
 * Main content CSS classes
 */
const mainClasses = computed((): string[] => {
  const classes = []
  
  if (props.fluid) {
    classes.push('fluid')
  }
  
  return classes
})

/**
 * Get notification CSS classes based on type
 */
function getNotificationClasses(notification: NotificationConfig): string[] {
  const baseClasses = ['notification-base']
  const typeClasses = {
    info: 'notification-info',
    success: 'notification-success', 
    warning: 'notification-warning',
    error: 'notification-error'
  }
  
  baseClasses.push(typeClasses[notification.type])
  
  return baseClasses
}

/**
 * Get notification icon component based on type
 */
function getNotificationIcon(type: NotificationConfig['type']): string {
  const icons = {
    info: 'InformationCircleIcon',
    success: 'CheckCircleIcon',
    warning: 'ExclamationTriangleIcon',
    error: 'XCircleIcon'
  }
  
  return icons[type]
}

/**
 * Remove notification by ID
 */
function removeNotification(id: string): void {
  uiStore.removeNotification(id)
}
</script>

<style scoped>
.app-layout {
  @apply min-h-screen bg-slate-900 text-white;
  @apply flex flex-col;
}

.app-main {
  @apply flex-1 flex flex-col relative;
}

.app-content {
  @apply flex-1 relative;
  @apply max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8;
}

.app-content.fluid {
  @apply max-w-none px-0;
}

/* Loading overlay */
.loading-overlay {
  @apply absolute inset-0 bg-slate-900 bg-opacity-75 backdrop-blur-sm;
  @apply flex items-center justify-center z-50;
}

.loading-content {
  @apply text-center;
}

.loading-spinner {
  @apply w-8 h-8 border-2 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto;
}

.loading-message {
  @apply mt-4 text-slate-300 text-sm;
}

/* Notifications */
.notifications-container {
  @apply fixed top-4 right-4 z-50 space-y-2;
  @apply max-w-sm;
}

.notification {
  @apply pointer-events-auto;
}

.notification-base {
  @apply rounded-lg shadow-lg border p-4;
  @apply transform transition-all duration-300;
}

.notification-info {
  @apply bg-blue-50 border-blue-200 text-blue-900;
}

.notification-success {
  @apply bg-green-50 border-green-200 text-green-900;
}

.notification-warning {
  @apply bg-yellow-50 border-yellow-200 text-yellow-900;
}

.notification-error {
  @apply bg-red-50 border-red-200 text-red-900;
}

.notification-content {
  @apply flex items-start gap-3;
}

.notification-icon {
  @apply flex-shrink-0 w-5 h-5;
}

.notification-body {
  @apply flex-1;
}

.notification-title {
  @apply font-semibold text-sm mb-1;
}

.notification-message {
  @apply text-sm leading-relaxed;
}

.notification-close {
  @apply flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors;
}

/* Notification transitions */
.notification-enter-active,
.notification-leave-active {
  @apply transition-all duration-300;
}

.notification-enter-from {
  @apply opacity-0 transform translate-x-full;
}

.notification-leave-to {
  @apply opacity-0 transform translate-x-full;
}

.notification-move {
  @apply transition-transform duration-300;
}

/* Dark mode adjustments */
.dark .notification-info {
  @apply bg-blue-900 border-blue-700 text-blue-100;
}

.dark .notification-success {
  @apply bg-green-900 border-green-700 text-green-100;
}

.dark .notification-warning {
  @apply bg-yellow-900 border-yellow-700 text-yellow-100;
}

.dark .notification-error {
  @apply bg-red-900 border-red-700 text-red-100;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .notifications-container {
    @apply left-4 right-4 max-w-none;
  }
  
  .app-content {
    @apply px-2;
  }
}

/* Layout variants */
.has-sidebar .app-main {
  @apply lg:pl-64;
}

/* Print styles */
@media print {
  .notifications-container,
  .loading-overlay {
    @apply hidden;
  }
}
</style>