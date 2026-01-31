import { ONBOARDING_STEPS } from '@/constants/onboarding'
import { useOnboardingStore } from '@/features/onboarding'
import { Button, ProgressBar } from '@/shared/ui'
import { AnimatedView, Pressable, Text, View } from '@/tw'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

export default function OnboardingScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { currentStep, totalSteps, nextStep, previousStep, completeOnboarding } =
    useOnboardingStore()

  const translateX = useSharedValue(0)
  const step = ONBOARDING_STEPS[currentStep]

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      nextStep()
    } else {
      completeOnboarding()
      router.replace('/(protected)/(tabs)')
    }
  }

  const handleSkip = () => {
    completeOnboarding()
    router.replace('/(protected)/(tabs)')
  }

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX
    })
    .onEnd((event) => {
      if (event.translationX < -50 && currentStep < totalSteps - 1) {
        runOnJS(nextStep)()
      } else if (event.translationX > 50 && currentStep > 0) {
        runOnJS(previousStep)()
      }
      translateX.value = withSpring(0)
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 0.3 }],
  }))

  return (
    <View className="flex-1 bg-background">
      <View className="absolute top-16 right-6 z-10">
        <Pressable onPress={handleSkip}>
          <Text className="text-muted-foreground font-medium">{t('onboarding.skip')}</Text>
        </Pressable>
      </View>

      <View className="pt-16 px-6">
        <ProgressBar value={((currentStep + 1) / totalSteps) * 100} variant="default" size="sm" />
        <Text className="text-sm text-muted-foreground text-center mt-2">
          {currentStep + 1} of {totalSteps}
        </Text>
      </View>

      <GestureDetector gesture={panGesture}>
        <AnimatedView style={animatedStyle} className="flex-1 justify-center items-center px-6">
          <View className="w-32 h-32 bg-primary/10 rounded-full items-center justify-center mb-8">
            <Text className="text-6xl">{getStepEmoji(currentStep)}</Text>
          </View>

          <Text className="text-3xl font-bold text-foreground text-center mb-4">{step.title}</Text>

          <Text className="text-lg text-muted-foreground text-center mb-8 px-4">
            {step.description}
          </Text>

          {step.features && (
            <View className="w-full gap-3 mb-8">
              {step.features.map((feature) => (
                <View key={feature.id} className="flex-row items-center bg-card p-4 rounded-xl">
                  <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
                    <Text className="text-xl">{getFeatureEmoji(feature.icon)}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-foreground">{feature.title}</Text>
                    <Text className="text-sm text-muted-foreground">{feature.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </AnimatedView>
      </GestureDetector>

      <View className="px-6 pb-12">
        <Button variant="primary" size="lg" onPress={handleNext}>
          {currentStep === totalSteps - 1 ? t('onboarding.getStarted') : t('onboarding.next')}
        </Button>

        <View className="flex-row justify-center mt-6 gap-2">
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

function getStepEmoji(step: number): string {
  const emojis = ['✨', '🔔', '🚀']
  return emojis[step] ?? '📱'
}

function getFeatureEmoji(icon: string): string {
  const emojis: Record<string, string> = {
    brain: '🧠',
    'checkmark.circle': '✅',
    cloud: '☁️',
  }
  return emojis[icon] ?? '📱'
}
