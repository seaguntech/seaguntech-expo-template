import type { ReactNode } from 'react'
import type { PressableProps, TextProps, ViewProps } from 'react-native'
import type { AnimatedProps } from 'react-native-reanimated'

export type ButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  disabled?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
  className?: string
}

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline'

export interface BadgeProps extends ViewProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

export interface CardProps extends ViewProps {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
  className?: string
}

export interface CardHeaderProps extends ViewProps {
  children: ReactNode
  className?: string
}

export interface CardContentProps extends ViewProps {
  children: ReactNode
  className?: string
}

export interface CardFooterProps extends ViewProps {
  children: ReactNode
  className?: string
}

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onPress: () => void
  }
}

export interface ToastContextValue {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, 'id'>) => void
  hideToast: (id: string) => void
  clearToasts: () => void
}

export interface DialogState {
  isOpen: boolean
  title?: string
  description?: string
  content?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  variant?: 'default' | 'destructive'
}

export interface DialogContextValue {
  state: DialogState
  openDialog: (options: Omit<DialogState, 'isOpen'>) => void
  closeDialog: () => void
  confirm: (options: Omit<DialogState, 'isOpen'>) => Promise<boolean>
  alert: (title: string, description?: string) => Promise<void>
}

export interface InputProps {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  className?: string
}

export interface SelectOption<T = string> {
  label: string
  value: T
  icon?: ReactNode
  disabled?: boolean
}

export interface SelectProps<T = string> {
  options: SelectOption<T>[]
  value?: T
  onChange?: (value: T) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  searchable?: boolean
  className?: string
}

export interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export interface ToggleProps {
  value?: boolean
  onValueChange?: (value: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'pills' | 'underline'
  className?: string
}

export interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  badge?: number
  disabled?: boolean
}

export interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  position?: 'left' | 'right'
  width?: number
  className?: string
}

export interface HeaderProps {
  title?: string
  subtitle?: string
  leftAction?: ReactNode
  rightAction?: ReactNode
  transparent?: boolean
  animated?: boolean
  className?: string
}
