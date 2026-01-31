import { cn } from '@/shared/lib/utils'
import { Text, View } from '@/tw'
import type { BadgeVariant } from '@/types'
import React from 'react'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
  outline: 'border border-border bg-transparent',
}

const variantTextStyles: Record<BadgeVariant, string> = {
  default: 'text-primary-foreground',
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  success: 'text-success-foreground',
  warning: 'text-warning-foreground',
  destructive: 'text-destructive-foreground',
  outline: 'text-foreground',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <View
      className={cn('px-2.5 py-0.5 rounded-full self-start', variantStyles[variant], className)}
    >
      {typeof children === 'string' ? (
        <Text className={cn('text-xs font-medium', variantTextStyles[variant])}>{children}</Text>
      ) : (
        children
      )}
    </View>
  )
}
