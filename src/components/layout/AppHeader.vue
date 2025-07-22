<template>
  <header class="app-header" :class="headerClasses">
    <div class="header-content">
      <!-- Left section -->
      <div class="header-left">
        <!-- Navigation toggle (mobile) -->
        <button
          v-if="showNavigation"
          type="button"
          class="nav-toggle lg:hidden"
          @click="$emit('navigationToggle')"
          aria-label="Toggle navigation"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <!-- App title/logo -->
        <div class="app-title">
          <h1 class="title-text">{{ title }}</h1>
          <div v-if="subtitle" class="subtitle-text">{{ subtitle }}</div>
        </div>
      </div>
      
      <!-- Center section (slot for navigation) -->
      <div v-if="$slots.navigation" class="header-center">
        <slot name="navigation" />
      </div>
      
      <!-- Right section -->
      <div class="header-right">
        <!-- Theme toggle -->
        <button
          type="button"
          class="theme-toggle"
          @click="toggleTheme"
          :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <svg v-if="isDarkMode" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
        
        <!-- Settings/menu -->
        <div class="header-menu">
          <button
            type="button"
            class="menu-toggle"
            @click="toggleMenu"
            aria-label="Open settings menu"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          
          <!-- Menu dropdown -->
          <div v-if="showMenu" class="menu-dropdown" @click.stop>
            <div class="menu-content">
              <!-- Performance mode toggle -->
              <button
                type="button"
                class="menu-item"
                @click="togglePerformanceMode"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Performance Mode</span>
                <span v-if="performanceMode" class="menu-badge">ON</span>
              </button>
              
              <!-- Keyboard shortcuts toggle -->
              <button
                type="button"
                class="menu-item"
                @click="toggleKeyboardShortcuts"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 15.292M15 21H3v-1a6 6 0 015.775-5.99" />
                </svg>
                <span>Keyboard Shortcuts</span>
                <span v-if="keyboardShortcutsEnabled" class="menu-badge">ON</span>
              </button>
              
              <!-- Divider -->
              <hr class="menu-divider" />
              
              <!-- About/Help -->
              <button type="button" class="menu-item" @click="showAbout">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>About</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Additional slot for custom actions -->
        <div v-if="$slots.actions" class="header-actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
    
    <!-- Progress bar for global loading -->
    <div v-if="isLoading" class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: `${loadingProgress}%` }"
      ></div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUIStore } from '../../stores'

// Props interface
interface Props {
  title: string
  subtitle?: string
  showNavigation?: boolean
  sticky?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showNavigation: false,
  sticky: true
})

// Emits
interface Emits {
  navigationToggle: []
}

const emit = defineEmits<Emits>()

// Local reactive state
const showMenu = ref(false)

// Store integration
const uiStore = useUIStore()
const {
  isDarkMode,
  performanceMode,
  keyboardShortcutsEnabled,
  globalLoading
} = storeToRefs(uiStore)

/**
 * Extract loading state
 */
const isLoading = computed(() => globalLoading.value.isLoading)
const loadingProgress = computed(() => globalLoading.value.progress || 0)

/**
 * Header CSS classes
 */
const headerClasses = computed((): string[] => {
  const classes = ['header-base']
  
  if (props.sticky) {
    classes.push('sticky')
  }
  
  return classes
})

/**
 * Toggle theme mode
 */
function toggleTheme(): void {
  uiStore.toggleThemeMode()
}

/**
 * Toggle settings menu
 */
function toggleMenu(): void {
  showMenu.value = !showMenu.value
}

/**
 * Close menu when clicking outside
 */
function handleClickOutside(event: MouseEvent): void {
  if (showMenu.value && !(event.target as Element).closest('.header-menu')) {
    showMenu.value = false
  }
}

/**
 * Toggle performance mode
 */
function togglePerformanceMode(): void {
  uiStore.togglePerformanceMode()
  showMenu.value = false
}

/**
 * Toggle keyboard shortcuts
 */
function toggleKeyboardShortcuts(): void {
  uiStore.toggleKeyboardShortcuts()
  showMenu.value = false
}

/**
 * Show about modal
 */
function showAbout(): void {
  uiStore.openModal('about')
  showMenu.value = false
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  @apply relative z-40;
}

.header-base {
  @apply bg-slate-800 border-b border-slate-700 shadow-lg;
}

.header-base.sticky {
  @apply sticky top-0;
}

.header-content {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  @apply flex items-center justify-between h-16;
}

.header-left {
  @apply flex items-center gap-4;
}

.nav-toggle {
  @apply p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors;
}

.app-title {
  @apply flex flex-col;
}

.title-text {
  @apply text-lg font-semibold text-white leading-tight;
}

.subtitle-text {
  @apply text-xs text-slate-400 leading-tight;
}

.header-center {
  @apply hidden lg:flex flex-1 justify-center max-w-lg mx-8;
}

.header-right {
  @apply flex items-center gap-2;
}

.theme-toggle {
  @apply p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors;
}

.header-menu {
  @apply relative;
}

.menu-toggle {
  @apply p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors;
}

.menu-dropdown {
  @apply absolute right-0 top-full mt-2 w-64 z-50;
  @apply bg-slate-800 border border-slate-700 rounded-lg shadow-xl;
}

.menu-content {
  @apply py-2;
}

.menu-item {
  @apply w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300;
  @apply hover:bg-slate-700 hover:text-white transition-colors;
  @apply text-left;
}

.menu-badge {
  @apply ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full;
}

.menu-divider {
  @apply my-2 border-slate-700;
}

.header-actions {
  @apply flex items-center gap-2;
}

/* Progress bar */
.progress-bar {
  @apply absolute bottom-0 left-0 right-0 h-0.5 bg-slate-700;
}

.progress-fill {
  @apply h-full bg-red-500 transition-all duration-300;
  @apply bg-gradient-to-r from-red-500 to-red-400;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .header-content {
    @apply px-2;
  }
  
  .title-text {
    @apply text-base;
  }
  
  .subtitle-text {
    @apply hidden;
  }
  
  .menu-dropdown {
    @apply w-56;
  }
}

/* Animation for menu */
.menu-dropdown {
  animation: menuSlideIn 0.2s ease-out;
}

@keyframes menuSlideIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .header-base {
    @apply border-b-2;
  }
  
  .menu-item:hover {
    @apply bg-white text-black;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .theme-toggle,
  .nav-toggle,
  .menu-toggle,
  .menu-item {
    @apply transition-none;
  }
  
  .menu-dropdown {
    animation: none;
  }
}
</style>