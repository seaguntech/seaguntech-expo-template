// Onboarding Feature - Public API
// Only export what should be accessible from outside this feature

// Components
export {
  NotificationSettings,
  OnboardingFeatureCard,
  OnboardingNavigationButtons,
  OnboardingProgressBar,
  OnboardingStep1,
  OnboardingStep2,
  OnboardingStep3,
} from './components'

// Hooks
export { useOnboarding } from './hooks'

// Types
export type { OnboardingStep, OnboardingState, PermissionsGranted } from './types'

// Store - for direct state access in route screens
export { useOnboardingStore } from './stores'
