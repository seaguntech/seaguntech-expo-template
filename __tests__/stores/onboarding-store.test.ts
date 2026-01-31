// Mock MMKV
jest.mock('react-native-mmkv', () => {
  const storage = {
    getString: jest.fn(),
    setString: jest.fn(),
    getBoolean: jest.fn(),
    setBoolean: jest.fn(),
    getNumber: jest.fn(),
    setNumber: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  }

  return {
    MMKV: jest.fn().mockImplementation(() => storage),
    createMMKV: jest.fn().mockImplementation(() => storage),
  }
})

describe('onboardingStore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.resetModules()
  })

  it('should have initial state', () => {
    const { useOnboardingStore } = require('@/features/onboarding/stores/onboarding-store')
    const state = useOnboardingStore.getState()

    expect(state.isCompleted).toBe(false)
    expect(state.currentStep).toBe(0)
  })

  it('should set current step', () => {
    const { useOnboardingStore } = require('@/features/onboarding/stores/onboarding-store')

    useOnboardingStore.getState().setCurrentStep(2)
    const state = useOnboardingStore.getState()

    expect(state.currentStep).toBe(2)
  })

  it('should complete onboarding', () => {
    const { useOnboardingStore } = require('@/features/onboarding/stores/onboarding-store')

    useOnboardingStore.getState().completeOnboarding()
    const state = useOnboardingStore.getState()

    expect(state.isCompleted).toBe(true)
  })

  it('should reset onboarding', () => {
    const { useOnboardingStore } = require('@/features/onboarding/stores/onboarding-store')

    // First complete
    useOnboardingStore.getState().completeOnboarding()
    useOnboardingStore.getState().setCurrentStep(3)

    // Then reset
    useOnboardingStore.getState().resetOnboarding()
    const state = useOnboardingStore.getState()

    expect(state.isCompleted).toBe(false)
    expect(state.currentStep).toBe(0)
  })
})
