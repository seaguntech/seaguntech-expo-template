import { TOTAL_ONBOARDING_STEPS } from '@/constants/onboarding'
import { zustandStorage } from '@/shared/lib/storage/zustand'
import type { OnboardingStoreState } from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type OnboardingStorePersistedState = Pick<
  OnboardingStoreState,
  'currentStep' | 'isCompleted' | 'completedAt' | 'skippedSteps' | 'permissionsGranted'
>

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist<OnboardingStoreState, [], [], OnboardingStorePersistedState>(
    (set, get) => ({
      // State
      currentStep: 0,
      totalSteps: TOTAL_ONBOARDING_STEPS,
      isCompleted: false,
      completedAt: null,
      skippedSteps: [],
      permissionsGranted: [],

      // Actions
      setCurrentStep: (step) => set({ currentStep: step }),

      nextStep: () => {
        const { currentStep, totalSteps } = get()
        if (currentStep < totalSteps - 1) {
          set({ currentStep: currentStep + 1 })
        }
      },

      previousStep: () => {
        const { currentStep } = get()
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 })
        }
      },

      skipStep: (stepId) => {
        set((state) => ({
          skippedSteps: state.skippedSteps.includes(stepId)
            ? state.skippedSteps
            : [...state.skippedSteps, stepId],
        }))
      },

      completeOnboarding: () =>
        set({
          isCompleted: true,
          completedAt: new Date().toISOString(),
        }),

      resetOnboarding: () =>
        set({
          currentStep: 0,
          isCompleted: false,
          completedAt: null,
          skippedSteps: [],
          permissionsGranted: [],
        }),

      grantPermission: (permission) => {
        set((state) => ({
          permissionsGranted: state.permissionsGranted.includes(permission)
            ? state.permissionsGranted
            : [...state.permissionsGranted, permission],
        }))
      },

      hasGrantedPermission: (permission) => {
        return get().permissionsGranted.includes(permission)
      },
    }),
    {
      name: 'onboarding-store',
      storage: createJSONStorage<OnboardingStorePersistedState>(() => zustandStorage),
      partialize: (state) => ({
        currentStep: state.currentStep,
        isCompleted: state.isCompleted,
        completedAt: state.completedAt,
        skippedSteps: state.skippedSteps,
        permissionsGranted: state.permissionsGranted,
      }),
    },
  ),
)

// Selectors
export const selectCurrentStep = (state: OnboardingStoreState) => state.currentStep
export const selectIsCompleted = (state: OnboardingStoreState) => state.isCompleted
export const selectProgress = (state: OnboardingStoreState) =>
  (state.currentStep + 1) / state.totalSteps
export const selectIsFirstStep = (state: OnboardingStoreState) => state.currentStep === 0
export const selectIsLastStep = (state: OnboardingStoreState) =>
  state.currentStep === state.totalSteps - 1
