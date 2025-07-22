// UI state management store

import { defineStore } from 'pinia'
import type { 
  TooltipConfig, 
  NotificationConfig, 
  LoadingState, 
  PanelConfig,
  ThemeConfig 
} from '../types'

interface UIState {
  // Panel states
  actionPanelExpanded: boolean
  actionPanelLevel1Expanded: boolean
  actionPanelLevel2Expanded: boolean
  
  // Tooltip management
  activeTooltips: Map<string, TooltipConfig>
  
  // Notifications
  notifications: NotificationConfig[]
  
  // Loading states
  globalLoading: LoadingState
  
  // Theme and appearance
  theme: ThemeConfig
  
  // Modal states
  activeModal: string | null
  
  // Keyboard shortcuts enabled
  keyboardShortcutsEnabled: boolean
  
  // Performance monitoring
  performanceMode: boolean
}

/**
 * UI state management store for global interface state
 */
export const useUIStore = defineStore('ui', {
  state: (): UIState => ({
    // Panel states
    actionPanelExpanded: false,
    actionPanelLevel1Expanded: false,
    actionPanelLevel2Expanded: false,
    
    // Tooltip management
    activeTooltips: new Map(),
    
    // Notifications
    notifications: [],
    
    // Loading states
    globalLoading: {
      isLoading: false,
      message: '',
      progress: 0,
      cancellable: false
    },
    
    // Theme
    theme: {
      mode: 'dark',
      primaryColor: '#ef4444',
      secondaryColor: '#64748b',
      borderRadius: 'md',
      fontFamily: 'Inter, sans-serif'
    },
    
    // Modal states
    activeModal: null,
    
    // Keyboard shortcuts
    keyboardShortcutsEnabled: true,
    
    // Performance
    performanceMode: false
  }),

  getters: {
    /**
     * Check if any tooltip is currently active
     */
    hasActiveTooltips: (state): boolean => state.activeTooltips.size > 0,

    /**
     * Get tooltip by ID
     */
    getTooltip: (state) => (id: string): TooltipConfig | undefined => 
      state.activeTooltips.get(id),

    /**
     * Count of active notifications
     */
    notificationCount: (state): number => state.notifications.length,

    /**
     * Check if any loading operation is active
     */
    isLoading: (state): boolean => state.globalLoading.isLoading,

    /**
     * Get current theme mode
     */
    isDarkMode: (state): boolean => state.theme.mode === 'dark',

    /**
     * Check if any modal is open
     */
    hasOpenModal: (state): boolean => state.activeModal !== null,

    /**
     * Check if action panel is in any expanded state
     */
    isActionPanelActive: (state): boolean => 
      state.actionPanelLevel1Expanded || state.actionPanelLevel2Expanded
  },

  actions: {
    /**
     * Toggle action panel expansion
     */
    toggleActionPanel(): void {
      this.actionPanelExpanded = !this.actionPanelExpanded
      console.log(`🎛️ [UI] Action panel ${this.actionPanelExpanded ? 'expanded' : 'collapsed'}`)
    },

    /**
     * Toggle action panel level 1
     */
    toggleActionPanelLevel1(): void {
      this.actionPanelLevel1Expanded = !this.actionPanelLevel1Expanded
      
      // Close level 2 when level 1 is closed
      if (!this.actionPanelLevel1Expanded) {
        this.actionPanelLevel2Expanded = false
      }
      
      console.log(`🎛️ [UI] Action panel level 1 ${this.actionPanelLevel1Expanded ? 'expanded' : 'collapsed'}`)
    },

    /**
     * Toggle action panel level 2
     */
    toggleActionPanelLevel2(): void {
      this.actionPanelLevel2Expanded = !this.actionPanelLevel2Expanded
      console.log(`🎛️ [UI] Action panel level 2 ${this.actionPanelLevel2Expanded ? 'expanded' : 'collapsed'}`)
    },

    /**
     * Show tooltip with configuration
     */
    showTooltip(config: TooltipConfig): void {
      this.activeTooltips.set(config.id, config)
      console.log(`💬 [UI] Tooltip shown: ${config.id}`)
    },

    /**
     * Hide tooltip by ID
     */
    hideTooltip(id: string): void {
      if (this.activeTooltips.delete(id)) {
        console.log(`💬 [UI] Tooltip hidden: ${id}`)
      }
    },

    /**
     * Hide all tooltips
     */
    hideAllTooltips(): void {
      const count = this.activeTooltips.size
      this.activeTooltips.clear()
      if (count > 0) {
        console.log(`💬 [UI] All tooltips hidden (${count})`)
      }
    },

    /**
     * Update tooltip position
     */
    updateTooltipPosition(id: string, x: number, y: number): void {
      const tooltip = this.activeTooltips.get(id)
      if (tooltip) {
        this.activeTooltips.set(id, {
          ...tooltip,
          offset: { x, y }
        })
      }
    },

    /**
     * Add notification
     */
    addNotification(notification: Omit<NotificationConfig, 'id'>): string {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const fullNotification: NotificationConfig & { id: string } = {
        ...notification,
        id
      }
      
      this.notifications.push(fullNotification as NotificationConfig)
      
      // Auto-remove after duration
      if (notification.duration !== 0) {
        const duration = notification.duration || 5000
        setTimeout(() => {
          this.removeNotification(id)
        }, duration)
      }
      
      console.log(`🔔 [UI] Notification added: ${notification.type}`)
      return id
    },

    /**
     * Remove notification by ID
     */
    removeNotification(id: string): void {
      const index = this.notifications.findIndex(n => (n as any).id === id)
      if (index > -1) {
        this.notifications.splice(index, 1)
        console.log(`🔔 [UI] Notification removed: ${id}`)
      }
    },

    /**
     * Clear all notifications
     */
    clearNotifications(): void {
      const count = this.notifications.length
      this.notifications = []
      if (count > 0) {
        console.log(`🔔 [UI] All notifications cleared (${count})`)
      }
    },

    /**
     * Set global loading state
     */
    setGlobalLoading(loading: Partial<LoadingState>): void {
      this.globalLoading = { ...this.globalLoading, ...loading }
      console.log(`⏳ [UI] Global loading: ${loading.isLoading ? 'started' : 'stopped'}`)
    },

    /**
     * Set theme configuration
     */
    setTheme(theme: Partial<ThemeConfig>): void {
      this.theme = { ...this.theme, ...theme }
      console.log(`🎨 [UI] Theme updated:`, theme)
    },

    /**
     * Toggle theme mode
     */
    toggleThemeMode(): void {
      this.theme.mode = this.theme.mode === 'light' ? 'dark' : 'light'
      console.log(`🎨 [UI] Theme mode: ${this.theme.mode}`)
    },

    /**
     * Open modal
     */
    openModal(modalId: string): void {
      this.activeModal = modalId
      console.log(`🔲 [UI] Modal opened: ${modalId}`)
    },

    /**
     * Close active modal
     */
    closeModal(): void {
      const previousModal = this.activeModal
      this.activeModal = null
      if (previousModal) {
        console.log(`🔲 [UI] Modal closed: ${previousModal}`)
      }
    },

    /**
     * Toggle keyboard shortcuts
     */
    toggleKeyboardShortcuts(): void {
      this.keyboardShortcutsEnabled = !this.keyboardShortcutsEnabled
      console.log(`⌨️ [UI] Keyboard shortcuts ${this.keyboardShortcutsEnabled ? 'enabled' : 'disabled'}`)
    },

    /**
     * Toggle performance mode
     */
    togglePerformanceMode(): void {
      this.performanceMode = !this.performanceMode
      console.log(`⚡ [UI] Performance mode ${this.performanceMode ? 'enabled' : 'disabled'}`)
    },

    /**
     * Reset UI state to defaults
     */
    resetUIState(): void {
      console.log('🔄 [UI] Resetting UI state to defaults')
      
      // Reset panels
      this.actionPanelExpanded = false
      this.actionPanelLevel1Expanded = false
      this.actionPanelLevel2Expanded = false
      
      // Clear tooltips and notifications
      this.hideAllTooltips()
      this.clearNotifications()
      
      // Reset loading
      this.setGlobalLoading({
        isLoading: false,
        message: '',
        progress: 0,
        cancellable: false
      })
      
      // Close modals
      this.closeModal()
    }
  },

  // Persist certain UI preferences
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'ui-preferences',
        storage: localStorage,
        paths: ['theme', 'keyboardShortcutsEnabled', 'performanceMode']
      }
    ]
  }
})