import { cn } from '@/shared/lib/utils'
import { Text, View } from '@/tw'
import type { OnboardingFeature } from '@/types'
import React from 'react'

interface OnboardingFeatureCardProps {
  feature: OnboardingFeature
  className?: string
}

export function OnboardingFeatureCard({ feature, className }: OnboardingFeatureCardProps) {
  return (
    <View className={cn('flex-row items-center bg-card p-4 rounded-xl', className)}>
      <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-4">
        <Text className="text-2xl">{getFeatureIcon(feature.icon)}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{feature.title}</Text>
        <Text className="text-sm text-muted-foreground mt-0.5">{feature.description}</Text>
      </View>
    </View>
  )
}

function getFeatureIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    brain: '🧠',
    'checkmark.circle': '✅',
    cloud: '☁️',
    star: '⭐',
    bell: '🔔',
    lock: '🔒',
    chart: '📊',
    sparkles: '✨',
  }
  return iconMap[icon] ?? '📱'
}
