import { cn } from '@/shared/lib/utils'
import { AnimatedView, View } from '@/tw'
import React from 'react'
import { Easing, useAnimatedStyle, withTiming } from 'react-native-reanimated'

interface ProgressBarProps {
  value: number
  max?: number
  variant?: 'default' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const variantStyles = {
  default: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error: 'bg-destructive',
}

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const animatedStyle = useAnimatedStyle(() => ({
    width: withTiming(`${percentage}%`, {
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    }),
  }))

  return (
    <View
      className={cn('w-full bg-muted rounded-full overflow-hidden', sizeStyles[size], className)}
    >
      <AnimatedView
        style={animatedStyle}
        className={cn('h-full rounded-full', variantStyles[variant])}
      />
    </View>
  )
}
