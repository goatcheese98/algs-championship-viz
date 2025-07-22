<template>
  <Teleport to="body">
    <div class="notification-container">
      <TransitionGroup name="notification" tag="div" class="notification-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="notificationClasses(notification)"
          @click="dismissNotification(notification.id)"
        >
          <div class="notification-content">
            <div class="notification-icon">
              {{ getNotificationIcon(notification.type) }}
            </div>
            
            <div class="notification-text">
              <h4 v-if="notification.title" class="notification-title">
                {{ notification.title }}
              </h4>
              <p class="notification-message">
                {{ notification.message }}
              </p>
            </div>
            
            <button
              type="button"
              class="notification-close"
              @click.stop="dismissNotification(notification.id)"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
          
          <div 
            v-if="notification.duration && notification.duration > 0"
            class="notification-progress"
            :style="getProgressStyle(notification)"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUIStore } from '../stores'
import type { NotificationType } from '../types'

// Store integration
const uiStore = useUIStore()
const { notifications } = storeToRefs(uiStore)

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: NotificationType): string {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type]
}

/**
 * Get CSS classes for notification
 */
function notificationClasses(notification: any) {
  return [
    `notification-${notification.type}`,
    { 'notification-clickable': notification.duration !== 0 }
  ]
}

/**
 * Get progress bar style for timed notifications
 */
function getProgressStyle(notification: any) {
  if (!notification.duration || notification.duration === 0) {
    return {}
  }
  
  const elapsed = Date.now() - notification.createdAt
  const progress = Math.max(0, 100 - (elapsed / notification.duration) * 100)
  
  return {
    width: `${progress}%`,
    transition: 'width 100ms ease-out'
  }
}

/**
 * Dismiss a notification
 */
function dismissNotification(id: string): void {
  uiStore.dismissNotification(id)
}

/**
 * Auto-dismiss notifications with duration
 */
let dismissInterval: number | null = null

onMounted(() => {
  dismissInterval = window.setInterval(() => {
    const now = Date.now()
    
    notifications.value.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const elapsed = now - notification.createdAt
        if (elapsed >= notification.duration) {
          dismissNotification(notification.id)
        }
      }
    })
  }, 100)
})

onUnmounted(() => {
  if (dismissInterval) {
    clearInterval(dismissInterval)
  }
})
</script>

<style scoped>
.notification-container {
  @apply fixed top-4 right-4 z-50 space-y-3;
  max-width: 400px;
}

.notification-list {
  @apply space-y-3;
}

.notification {
  @apply bg-slate-800 border rounded-lg shadow-xl overflow-hidden;
  @apply min-w-80 max-w-sm;
}

.notification-clickable {
  @apply cursor-pointer hover:shadow-2xl transition-shadow duration-200;
}

.notification-content {
  @apply flex items-start gap-3 p-4;
}

.notification-icon {
  @apply text-lg flex-shrink-0 mt-0.5;
}

.notification-text {
  @apply flex-1 min-w-0;
}

.notification-title {
  @apply font-semibold text-white text-sm mb-1;
}

.notification-message {
  @apply text-slate-300 text-sm leading-relaxed;
}

.notification-close {
  @apply text-slate-400 hover:text-white transition-colors duration-200;
  @apply text-lg leading-none flex-shrink-0 mt-0.5;
}

.notification-progress {
  @apply h-1 bg-current opacity-30;
}

/* Type-specific styles */
.notification-success {
  @apply border-green-500 text-green-400;
}

.notification-error {
  @apply border-red-500 text-red-400;
}

.notification-warning {
  @apply border-yellow-500 text-yellow-400;
}

.notification-info {
  @apply border-blue-500 text-blue-400;
}

/* Transition animations */
.notification-enter-active {
  @apply transition-all duration-300 ease-out;
}

.notification-leave-active {
  @apply transition-all duration-200 ease-in;
}

.notification-enter-from {
  @apply opacity-0 transform translate-x-full scale-95;
}

.notification-leave-to {
  @apply opacity-0 transform translate-x-full scale-95;
}

.notification-move {
  @apply transition-transform duration-300 ease-out;
}

/* Responsive */
@media (max-width: 640px) {
  .notification-container {
    @apply left-4 right-4 max-w-none;
  }
  
  .notification {
    @apply min-w-0;
  }
}

/* Focus states for accessibility */
.notification:focus-within {
  @apply ring-2 ring-current ring-opacity-50;
}

.notification-close:focus {
  @apply outline-none ring-2 ring-current ring-opacity-50 rounded;
}
</style>