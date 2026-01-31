import { cn } from '@/shared/lib/utils'
import { ProgressBar } from '@/shared/ui/primitives'
import { View } from '@/tw'
import React from 'react'

interface OnboardingProgressBarProps {
  currentStep: number
  totalSteps: number
  variant?: 'bar' | 'dots'
  className?: string
}

export function OnboardingProgressBar({
  currentStep,
  totalSteps,
  variant = 'bar',
  className,
}: OnboardingProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100

  if (variant === 'dots') {
    return (
      <View className={cn('flex-row justify-center gap-2', className)}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            className={cn('w-2 h-2 rounded-full', index <= currentStep ? 'bg-primary' : 'bg-muted')}
          />
        ))}
      </View>
    )
  }

  return (
    <View className={className}>
      <ProgressBar value={progress} variant="default" size="sm" />
    </View>
  )
}
