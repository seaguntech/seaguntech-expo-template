import { ONBOARDING_STEPS } from '@/constants/onboarding'
import { Text, View } from '@/tw'
import React from 'react'
import { OnboardingFeatureCard } from './onboarding-feature-card'

export function OnboardingStep1() {
  const step = ONBOARDING_STEPS[0]

  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="w-32 h-32 bg-primary/10 rounded-full items-center justify-center mb-8">
        <Text className="text-6xl">✨</Text>
      </View>

      <Text className="text-3xl font-bold text-foreground text-center mb-4">{step.title}</Text>

      <Text className="text-lg text-muted-foreground text-center mb-8 px-4">
        {step.description}
      </Text>

      {step.features && (
        <View className="w-full gap-3">
          {step.features.map((feature) => (
            <OnboardingFeatureCard key={feature.id} feature={feature} />
          ))}
        </View>
      )}
    </View>
  )
}
