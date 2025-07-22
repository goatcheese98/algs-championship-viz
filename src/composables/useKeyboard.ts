// Composable for keyboard shortcut management

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUIStore } from '../stores'
import type { KeyboardShortcut } from '../types'

interface KeyboardOptions {
  global?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

/**
 * Composable for managing keyboard shortcuts
 */
export function useKeyboard() {
  const registeredShortcuts = ref(new Map<string, KeyboardShortcut>())
  const pressedKeys = ref(new Set<string>())
  
  const uiStore = useUIStore()
  const { keyboardShortcutsEnabled } = storeToRefs(uiStore)

  /**
   * Normalize key combinations for consistent matching
   */
  function normalizeKeys(keys: readonly string[]): string {
    const normalized = keys
      .map(key => key.toLowerCase())
      .sort()
      .join('+')
    
    return normalized
  }

  /**
   * Register a keyboard shortcut
   */
  function registerShortcut(
    keys: readonly string[],
    handler: (event: KeyboardEvent) => void,
    description: string,
    options: KeyboardOptions = {}
  ): string {
    const id = normalizeKeys(keys)
    const shortcut: KeyboardShortcut = {
      keys,
      description,
      handler,
      global: options.global,
      preventDefault: options.preventDefault
    }
    
    registeredShortcuts.value.set(id, shortcut)
    
    console.log(`⌨️ Registered shortcut: ${keys.join('+')} - ${description}`)
    
    return id
  }

  /**
   * Unregister a keyboard shortcut
   */
  function unregisterShortcut(id: string): void {
    if (registeredShortcuts.value.delete(id)) {
      console.log(`⌨️ Unregistered shortcut: ${id}`)
    }
  }

  /**
   * Handle keydown events
   */
  function handleKeydown(event: KeyboardEvent): void {
    if (!keyboardShortcutsEnabled.value) return

    // Track pressed keys
    pressedKeys.value.add(event.key.toLowerCase())
    
    // Build current key combination
    const currentKeys = Array.from(pressedKeys.value).sort()
    const keyCombo = currentKeys.join('+')
    
    // Find matching shortcut
    for (const [id, shortcut] of registeredShortcuts.value) {
      if (id === keyCombo) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault()
        }
        
        if (event.stopPropagation) {
          event.stopPropagation()
        }
        
        try {
          shortcut.handler(event)
          console.log(`⌨️ Executed shortcut: ${shortcut.keys.join('+')}`)
        } catch (error) {
          console.error(`⌨️ Error executing shortcut ${shortcut.keys.join('+')}:`, error)
        }
        
        break
      }
    }
  }

  /**
   * Handle keyup events
   */
  function handleKeyup(event: KeyboardEvent): void {
    pressedKeys.value.delete(event.key.toLowerCase())
  }

  /**
   * Clear all pressed keys (on blur, etc.)
   */
  function clearPressedKeys(): void {
    pressedKeys.value.clear()
  }

  /**
   * Get all registered shortcuts
   */
  const shortcuts = computed(() => Array.from(registeredShortcuts.value.values()))

  /**
   * Check if a shortcut is registered
   */
  function isShortcutRegistered(keys: readonly string[]): boolean {
    const id = normalizeKeys(keys)
    return registeredShortcuts.value.has(id)
  }

  // Lifecycle management
  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('keyup', handleKeyup)
    window.addEventListener('blur', clearPressedKeys)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.removeEventListener('keyup', handleKeyup)
    window.removeEventListener('blur', clearPressedKeys)
    registeredShortcuts.value.clear()
  })

  return {
    // State
    shortcuts,
    pressedKeys: computed(() => Array.from(pressedKeys.value)),
    keyboardShortcutsEnabled,
    
    // Methods
    registerShortcut,
    unregisterShortcut,
    isShortcutRegistered,
    clearPressedKeys
  }
}

/**
 * Composable for common application shortcuts
 */
export function useAppKeyboardShortcuts() {
  const keyboard = useKeyboard()
  const uiStore = useUIStore()

  // Register common shortcuts
  onMounted(() => {
    // Escape key - close modals, tooltips, etc.
    keyboard.registerShortcut(
      ['escape'],
      () => {
        uiStore.closeModal()
        uiStore.hideAllTooltips()
      },
      'Close modals and tooltips',
      { global: true }
    )

    // Ctrl/Cmd + K - Quick search/command palette
    keyboard.registerShortcut(
      ['meta', 'k'],
      (event) => {
        event.preventDefault()
        // TODO: Implement command palette
        console.log('⌨️ Quick search/command palette (not implemented)')
      },
      'Open command palette',
      { global: true, preventDefault: true }
    )

    keyboard.registerShortcut(
      ['ctrl', 'k'],
      (event) => {
        event.preventDefault()
        // TODO: Implement command palette
        console.log('⌨️ Quick search/command palette (not implemented)')
      },
      'Open command palette',
      { global: true, preventDefault: true }
    )

    // Toggle theme with Ctrl/Cmd + Shift + T
    keyboard.registerShortcut(
      ['meta', 'shift', 't'],
      () => {
        uiStore.toggleThemeMode()
      },
      'Toggle theme mode',
      { global: true }
    )

    keyboard.registerShortcut(
      ['ctrl', 'shift', 't'],
      () => {
        uiStore.toggleThemeMode()
      },
      'Toggle theme mode',
      { global: true }
    )

    // Toggle performance mode with Ctrl/Cmd + Shift + P
    keyboard.registerShortcut(
      ['meta', 'shift', 'p'],
      () => {
        uiStore.togglePerformanceMode()
      },
      'Toggle performance mode',
      { global: true }
    )

    keyboard.registerShortcut(
      ['ctrl', 'shift', 'p'],
      () => {
        uiStore.togglePerformanceMode()
      },
      'Toggle performance mode',
      { global: true }
    )

    // Help - Show keyboard shortcuts
    keyboard.registerShortcut(
      ['?'],
      () => {
        uiStore.openModal('keyboard-shortcuts')
      },
      'Show keyboard shortcuts help',
      { global: true }
    )
  })

  return keyboard
}

/**
 * Composable for tournament-specific shortcuts
 */
export function useTournamentKeyboardShortcuts() {
  const keyboard = useKeyboard()
  
  // Will be implemented when tournament components are ready
  onMounted(() => {
    // Space - Play/Pause
    keyboard.registerShortcut(
      [' '],
      (event) => {
        // Prevent space from scrolling page
        event.preventDefault()
        // TODO: Implement play/pause when tournament store is ready
        console.log('⌨️ Play/Pause toggle (not implemented)')
      },
      'Play/Pause animation',
      { global: false, preventDefault: true }
    )

    // Arrow keys for navigation
    keyboard.registerShortcut(
      ['arrowleft'],
      () => {
        // TODO: Previous game
        console.log('⌨️ Previous game (not implemented)')
      },
      'Previous game'
    )

    keyboard.registerShortcut(
      ['arrowright'],
      () => {
        // TODO: Next game  
        console.log('⌨️ Next game (not implemented)')
      },
      'Next game'
    )

    // Home/End for first/last game
    keyboard.registerShortcut(
      ['home'],
      () => {
        // TODO: First game
        console.log('⌨️ First game (not implemented)')
      },
      'Go to first game'
    )

    keyboard.registerShortcut(
      ['end'],
      () => {
        // TODO: Last game
        console.log('⌨️ Last game (not implemented)')
      },
      'Go to last game'
    )

    // R - Reset
    keyboard.registerShortcut(
      ['r'],
      () => {
        // TODO: Reset playback
        console.log('⌨️ Reset playback (not implemented)')
      },
      'Reset playback'
    )

    // L - Toggle legend
    keyboard.registerShortcut(
      ['l'],
      () => {
        // TODO: Toggle legend
        console.log('⌨️ Toggle legend (not implemented)')
      },
      'Toggle chart legend'
    )

    // Numbers 1-3 for animation speed
    keyboard.registerShortcut(
      ['1'],
      () => {
        // TODO: Slow speed
        console.log('⌨️ Animation speed: Slow (not implemented)')
      },
      'Set animation speed to slow'
    )

    keyboard.registerShortcut(
      ['2'],
      () => {
        // TODO: Medium speed
        console.log('⌨️ Animation speed: Medium (not implemented)')
      },
      'Set animation speed to medium'
    )

    keyboard.registerShortcut(
      ['3'],
      () => {
        // TODO: Fast speed
        console.log('⌨️ Animation speed: Fast (not implemented)')
      },
      'Set animation speed to fast'
    )
  })

  return keyboard
}