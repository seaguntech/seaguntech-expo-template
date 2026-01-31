import { ONBOARDING_STEPS } from '@/constants/onboarding'
import {
  selectCurrentStep,
  selectIsCompleted,
  selectIsFirstStep,
  selectIsLastStep,
  selectProgress,
  useOnboardingStore,
} from '@/features/onboarding/stores'
import { useRouter } from 'expo-router'
import { useCallback } from 'react'

export function useOnboarding() {
  const router = useRouter()
  const currentStep = useOnboardingStore(selectCurrentStep)
  const totalSteps = useOnboardingStore((state) => state.totalSteps)
  const isCompleted = useOnboardingStore(selectIsCompleted)
  const isFirstStep = useOnboardingStore(selectIsFirstStep)
  const isLastStep = useOnboardingStore(selectIsLastStep)
  const progress = useOnboardingStore(selectProgress)
  const nextStep = useOnboardingStore((state) => state.nextStep)
  const previousStep = useOnboardingStore((state) => state.previousStep)
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding)
  const resetOnboardingAction = useOnboardingStore((state) => state.resetOnboarding)
  const grantPermission = useOnboardingStore((state) => state.grantPermission)
  const hasGrantedPermission = useOnboardingStore((state) => state.hasGrantedPermission)

  const currentStepData = ONBOARDING_STEPS[currentStep]

  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      nextStep()
    } else {
      completeOnboarding()
      router.replace('/(protected)/(tabs)')
    }
  }, [completeOnboarding, currentStep, nextStep, router, totalSteps])

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 0) {
      previousStep()
    }
  }, [currentStep, previousStep])

  const skipOnboarding = useCallback(() => {
    completeOnboarding()
    router.replace('/(protected)/(tabs)')
  }, [completeOnboarding, router])

  const resetOnboarding = useCallback(() => {
    resetOnboardingAction()
    router.replace('/onboarding')
  }, [resetOnboardingAction, router])

  return {
    // State
    currentStep,
    totalSteps,
    currentStepData,
    isCompleted,
    isFirstStep,
    isLastStep,
    progress,

    // Actions
    goToNextStep,
    goToPreviousStep,
    skipOnboarding,
    resetOnboarding,
    grantPermission,
    hasGrantedPermission,
  }
}
