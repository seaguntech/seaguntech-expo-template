export interface OnboardingStep {
  id: string
  title: string
  description: string
  image?: string
  icon?: string
  features?: OnboardingFeature[]
  action?: OnboardingAction
}

export interface OnboardingFeature {
  id: string
  title: string
  description: string
  icon: string
}

export interface OnboardingAction {
  type: 'permission' | 'button' | 'skip'
  permission?: PermissionType
  buttonText?: string
  onPress?: () => void
}

export type PermissionType = 'notifications' | 'camera' | 'photos' | 'location' | 'tracking'

export interface OnboardingState {
  currentStep: number
  totalSteps: number
  isCompleted: boolean
  completedAt: string | null
  skippedSteps: string[]
  permissionsGranted: PermissionType[]
}

export interface OnboardingStoreState extends OnboardingState {
  setCurrentStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  skipStep: (stepId: string) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  grantPermission: (permission: PermissionType) => void
  hasGrantedPermission: (permission: PermissionType) => boolean
}

export interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
  variant?: 'dots' | 'bar'
}

export interface OnboardingNavigationProps {
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  canGoBack: boolean
  canSkip: boolean
  isLastStep: boolean
  nextLabel?: string
  skipLabel?: string
}

export interface OnboardingConfig {
  steps: OnboardingStep[]
  allowSkip: boolean
  showProgressBar: boolean
  animationType: 'slide' | 'fade' | 'none'
}
