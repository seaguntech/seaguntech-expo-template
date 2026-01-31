import { ONBOARDING_STEPS } from '@/constants/onboarding'
import { Button } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import React from 'react'

interface OnboardingStep2Props {
  onRequestPermission: () => Promise<void>
  hasPermission: boolean
  isRequesting: boolean
}

export function OnboardingStep2({
  onRequestPermission,
  hasPermission,
  isRequesting,
}: OnboardingStep2Props) {
  const step = ONBOARDING_STEPS[1]

  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="w-32 h-32 bg-primary/10 rounded-full items-center justify-center mb-8">
        <Text className="text-6xl">🔔</Text>
      </View>

      <Text className="text-3xl font-bold text-foreground text-center mb-4">{step.title}</Text>

      <Text className="text-lg text-muted-foreground text-center mb-8 px-4">
        {step.description}
      </Text>

      <View className="w-full">
        {hasPermission ? (
          <View className="items-center py-4">
            <View className="w-16 h-16 bg-success/20 rounded-full items-center justify-center mb-3">
              <Text className="text-3xl">✓</Text>
            </View>
            <Text className="text-lg font-semibold text-success">Notifications Enabled</Text>
            <Text className="text-sm text-muted-foreground mt-1">
              You&quot;ll receive important updates and reminders
            </Text>
          </View>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onPress={onRequestPermission}
            isLoading={isRequesting}
          >
            {step.action?.buttonText ?? 'Enable Notifications'}
          </Button>
        )}
      </View>

      <Text className="text-xs text-muted-foreground text-center mt-6 px-8">
        You can always change this later in Settings
      </Text>
    </View>
  )
}
