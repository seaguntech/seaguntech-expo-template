// Onboarding Types

export interface OnboardingStep {
  id: number
  title: string
  description: string
  image?: string
}

export interface OnboardingState {
  currentStep: number
  totalSteps: number
  isCompleted: boolean
  completedAt: Date | null
  skippedSteps: number[]
  permissionsGranted: PermissionsGranted
}

export interface PermissionsGranted {
  notifications: boolean
  location: boolean
  camera: boolean
}

export interface OnboardingActions {
  nextStep: () => void
  previousStep: () => void
  skipStep: () => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  grantPermission: (permission: keyof PermissionsGranted) => void
}

export type OnboardingStore = OnboardingState & OnboardingActions
