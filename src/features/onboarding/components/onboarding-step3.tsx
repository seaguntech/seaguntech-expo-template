import { ONBOARDING_STEPS } from '@/constants/onboarding'
import { Text, View } from '@/tw'
import React from 'react'

export function OnboardingStep3() {
  const step = ONBOARDING_STEPS[2]

  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="w-32 h-32 bg-success/20 rounded-full items-center justify-center mb-8">
        <Text className="text-6xl">🚀</Text>
      </View>

      <Text className="text-3xl font-bold text-foreground text-center mb-4">{step.title}</Text>

      <Text className="text-lg text-muted-foreground text-center mb-8 px-4">
        {step.description}
      </Text>

      <View className="w-full gap-4">
        <CheckItem text="Account created successfully" />
        <CheckItem text="Preferences configured" />
        <CheckItem text="Ready to boost your productivity" />
      </View>
    </View>
  )
}

function CheckItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-center bg-card p-4 rounded-xl">
      <View className="w-8 h-8 bg-success/20 rounded-full items-center justify-center mr-3">
        <Text className="text-success">✓</Text>
      </View>
      <Text className="text-base text-foreground">{text}</Text>
    </View>
  )
}
