import { useTheme } from '@/shared/context/theme-context'
import { useMemo } from 'react'

export function useIconColors() {
  const { isDark } = useTheme()

  const colors = useMemo(
    () => ({
      primary: isDark ? '#60a5fa' : '#3b82f6',
      secondary: isDark ? '#a78bfa' : '#8b5cf6',
      success: isDark ? '#4ade80' : '#22c55e',
      warning: isDark ? '#fbbf24' : '#f59e0b',
      destructive: isDark ? '#f87171' : '#ef4444',
      muted: isDark ? '#6b7280' : '#9ca3af',
      foreground: isDark ? '#f9fafb' : '#111827',
      background: isDark ? '#111827' : '#ffffff',

      // Tab bar icons
      tabActive: isDark ? '#60a5fa' : '#3b82f6',
      tabInactive: isDark ? '#6b7280' : '#9ca3af',

      // Navigation icons
      navBack: isDark ? '#f9fafb' : '#111827',
      navAction: isDark ? '#60a5fa' : '#3b82f6',

      // Status icons
      online: '#22c55e',
      offline: '#ef4444',
      away: '#f59e0b',

      // Social icons
      google: '#4285F4',
      apple: isDark ? '#ffffff' : '#000000',
      facebook: '#1877F2',
      twitter: '#1DA1F2',

      // Payment icons
      stripe: '#635BFF',
      visa: '#1A1F71',
      mastercard: '#EB001B',
    }),
    [isDark],
  )

  return colors
}
