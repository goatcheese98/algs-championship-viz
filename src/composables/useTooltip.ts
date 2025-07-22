// Composable for unified tooltip management

import { ref, reactive, onUnmounted } from 'vue'
import type { TooltipConfig } from '../types'
import { generateId } from '../utils/data-transforms'

interface TooltipOptions {
  position?: TooltipConfig['position']
  delay?: number
  hideDelay?: number
  maxWidth?: number
  offset?: { x: number; y: number }
}

/**
 * Composable for managing tooltips with proper lifecycle
 */
export function useTooltip(defaultOptions: TooltipOptions = {}) {
  const activeTooltips = ref(new Map<string, TooltipConfig>())
  const timeouts = new Map<string, NodeJS.Timeout>()

  /**
   * Show tooltip with configuration
   */
  function showTooltip(
    target: HTMLElement,
    content: string | object,
    options: TooltipOptions = {}
  ): string {
    const id = generateId('tooltip')
    const config: TooltipConfig = {
      id,
      content,
      position: options.position || defaultOptions.position || 'auto',
      offset: options.offset || defaultOptions.offset || { x: 0, y: -8 },
      delay: options.delay || defaultOptions.delay || 200,
      hideDelay: options.hideDelay || defaultOptions.hideDelay || 100,
      maxWidth: options.maxWidth || defaultOptions.maxWidth || 300
    }

    // Clear any existing timeout
    const existingTimeout = timeouts.get(id)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Show with delay
    const timeout = setTimeout(() => {
      activeTooltips.value.set(id, config)
      timeouts.delete(id)
    }, config.delay)

    timeouts.set(id, timeout)
    
    return id
  }

  /**
   * Show tooltip immediately without delay
   */
  function showTooltipImmediate(
    target: HTMLElement,
    content: string | object,
    options: TooltipOptions = {}
  ): string {
    return showTooltip(target, content, { ...options, delay: 0 })
  }

  /**
   * Hide tooltip by ID
   */
  function hideTooltip(id: string): void {
    const config = activeTooltips.value.get(id)
    if (!config) return

    // Clear show timeout if still pending
    const showTimeout = timeouts.get(id)
    if (showTimeout) {
      clearTimeout(showTimeout)
      timeouts.delete(id)
      return
    }

    // Hide with delay
    const hideTimeout = setTimeout(() => {
      activeTooltips.value.delete(id)
      timeouts.delete(id)
    }, config.hideDelay || 100)

    timeouts.set(id, hideTimeout)
  }

  /**
   * Hide tooltip immediately
   */
  function hideTooltipImmediate(id: string): void {
    const timeout = timeouts.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timeouts.delete(id)
    }
    activeTooltips.value.delete(id)
  }

  /**
   * Hide all tooltips
   */
  function hideAllTooltips(): void {
    // Clear all timeouts
    timeouts.forEach(timeout => clearTimeout(timeout))
    timeouts.clear()
    
    // Clear all tooltips
    activeTooltips.value.clear()
  }

  /**
   * Update tooltip position (for following mouse cursor)
   */
  function updateTooltipPosition(id: string, x: number, y: number): void {
    const tooltip = activeTooltips.value.get(id)
    if (tooltip) {
      activeTooltips.value.set(id, {
        ...tooltip,
        offset: { x, y }
      })
    }
  }

  /**
   * Check if tooltip is visible
   */
  function isTooltipVisible(id: string): boolean {
    return activeTooltips.value.has(id)
  }

  /**
   * Get tooltip configuration
   */
  function getTooltip(id: string): TooltipConfig | undefined {
    return activeTooltips.value.get(id)
  }

  // Cleanup on unmount
  onUnmounted(() => {
    hideAllTooltips()
  })

  return {
    // State
    activeTooltips: activeTooltips.value,
    
    // Methods
    showTooltip,
    showTooltipImmediate,
    hideTooltip,
    hideTooltipImmediate,
    hideAllTooltips,
    updateTooltipPosition,
    isTooltipVisible,
    getTooltip
  }
}

/**
 * Composable for element-based tooltip management
 */
export function useElementTooltip(element?: HTMLElement) {
  const tooltip = useTooltip()
  const currentTooltipId = ref<string | null>(null)

  /**
   * Show tooltip for the bound element
   */
  function show(content: string | object, options?: TooltipOptions): void {
    if (!element) return
    
    hide() // Hide any existing tooltip
    currentTooltipId.value = tooltip.showTooltip(element, content, options)
  }

  /**
   * Hide tooltip for the bound element
   */
  function hide(): void {
    if (currentTooltipId.value) {
      tooltip.hideTooltip(currentTooltipId.value)
      currentTooltipId.value = null
    }
  }

  /**
   * Toggle tooltip visibility
   */
  function toggle(content: string | object, options?: TooltipOptions): void {
    if (currentTooltipId.value && tooltip.isTooltipVisible(currentTooltipId.value)) {
      hide()
    } else {
      show(content, options)
    }
  }

  // Cleanup on unmount
  onUnmounted(() => {
    hide()
  })

  return {
    show,
    hide,
    toggle,
    isVisible: () => currentTooltipId.value && tooltip.isTooltipVisible(currentTooltipId.value)
  }
}

/**
 * Directive for easy tooltip usage in templates
 */
export const vTooltip = {
  mounted(el: HTMLElement, binding: any) {
    const { value, modifiers, arg } = binding
    const elementTooltip = useElementTooltip(el)
    
    const options: TooltipOptions = {
      position: arg || 'auto',
      delay: modifiers.slow ? 500 : modifiers.fast ? 0 : 200
    }

    let content = value
    if (typeof value === 'object' && value.content) {
      content = value.content
      Object.assign(options, value)
    }

    // Store tooltip instance on element for cleanup
    ;(el as any)._tooltipInstance = elementTooltip

    // Event listeners
    el.addEventListener('mouseenter', () => elementTooltip.show(content, options))
    el.addEventListener('mouseleave', () => elementTooltip.hide())
    el.addEventListener('focus', () => elementTooltip.show(content, options))
    el.addEventListener('blur', () => elementTooltip.hide())
  },

  updated(el: HTMLElement, binding: any) {
    // Update tooltip content if changed
    const tooltipInstance = (el as any)._tooltipInstance
    if (tooltipInstance && binding.value !== binding.oldValue) {
      tooltipInstance.hide()
      // Will show again on next interaction
    }
  },

  unmounted(el: HTMLElement) {
    const tooltipInstance = (el as any)._tooltipInstance
    if (tooltipInstance) {
      tooltipInstance.hide()
      delete (el as any)._tooltipInstance
    }
  }
}