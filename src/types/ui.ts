// UI component related TypeScript interfaces

/**
 * Button component props and variants
 */
export interface ButtonProps {
  readonly variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
  readonly size?: 'sm' | 'md' | 'lg'
  readonly disabled?: boolean
  readonly loading?: boolean
  readonly icon?: string
  readonly fullWidth?: boolean
}

/**
 * Tooltip configuration and positioning
 */
export interface TooltipConfig {
  readonly id: string
  readonly content: string | object
  readonly position: 'top' | 'bottom' | 'left' | 'right' | 'auto'
  readonly offset: {
    readonly x: number
    readonly y: number
  }
  readonly delay?: number
  readonly hideDelay?: number
  readonly maxWidth?: number
}

/**
 * Modal component configuration
 */
export interface ModalConfig {
  readonly title?: string
  readonly size?: 'sm' | 'md' | 'lg' | 'xl'
  readonly closable?: boolean
  readonly backdrop?: boolean | 'static'
  readonly centered?: boolean
  readonly scrollable?: boolean
}

/**
 * Slider component props
 */
export interface SliderProps {
  readonly min: number
  readonly max: number
  readonly step?: number
  readonly value: number
  readonly disabled?: boolean
  readonly marks?: Record<number, string>
  readonly tooltip?: boolean
}

/**
 * Dropdown/Select component options
 */
export interface SelectOption {
  readonly value: string | number
  readonly label: string
  readonly disabled?: boolean
  readonly group?: string
}

export interface SelectProps {
  readonly options: readonly SelectOption[]
  readonly value?: string | number | readonly (string | number)[]
  readonly placeholder?: string
  readonly searchable?: boolean
  readonly multiple?: boolean
  readonly clearable?: boolean
  readonly disabled?: boolean
}

/**
 * Panel/Drawer component configuration
 */
export interface PanelConfig {
  readonly position: 'left' | 'right' | 'top' | 'bottom' | 'floating'
  readonly size?: string | number
  readonly collapsible?: boolean
  readonly resizable?: boolean
  readonly draggable?: boolean
  readonly persistent?: boolean
}

/**
 * Notification/Toast configuration
 */
export interface NotificationConfig {
  readonly type: 'info' | 'success' | 'warning' | 'error'
  readonly title?: string
  readonly message: string
  readonly duration?: number
  readonly closable?: boolean
  readonly actions?: readonly NotificationAction[]
}

export interface NotificationAction {
  readonly label: string
  readonly handler: () => void
  readonly style?: 'primary' | 'secondary'
}

/**
 * Loading state configuration
 */
export interface LoadingState {
  readonly isLoading: boolean
  readonly message?: string
  readonly progress?: number
  readonly cancellable?: boolean
}

/**
 * Theme and styling configuration
 */
export interface ThemeConfig {
  readonly mode: 'light' | 'dark' | 'auto'
  readonly primaryColor: string
  readonly secondaryColor: string
  readonly borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full'
  readonly fontFamily: string
}

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  readonly keys: readonly string[]
  readonly description: string
  readonly handler: (event: KeyboardEvent) => void
  readonly global?: boolean
  readonly preventDefault?: boolean
}

/**
 * Responsive breakpoint configuration
 */
export interface BreakpointConfig {
  readonly xs: number
  readonly sm: number
  readonly md: number
  readonly lg: number
  readonly xl: number
  readonly xxl: number
}

/**
 * Animation configuration for UI components
 */
export interface UIAnimationConfig {
  readonly duration: number
  readonly easing: string
  readonly delay?: number
  readonly stagger?: number
}