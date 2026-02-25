// Mock MMKV
vi.mock('react-native-mmkv', () => {
  const storage = {
    getString: vi.fn(),
    setString: vi.fn(),
    getBoolean: vi.fn(),
    setBoolean: vi.fn(),
    getNumber: vi.fn(),
    setNumber: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
    clearAll: vi.fn(),
    getAllKeys: vi.fn(() => []),
  }

  return {
    MMKV: vi.fn().mockImplementation(() => storage),
    createMMKV: vi.fn().mockImplementation(() => storage),
  }
})

import { useOnboardingStore } from '@/features/onboarding/store/onboarding-store'

describe('onboardingStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('should have initial state', () => {
    const state = useOnboardingStore.getState()

    expect(state.isCompleted).toBe(false)
    expect(state.currentStep).toBe(0)
  })

  it('should set current step', () => {
    useOnboardingStore.getState().setCurrentStep(2)
    const state = useOnboardingStore.getState()

    expect(state.currentStep).toBe(2)
  })

  it('should complete onboarding', () => {
    useOnboardingStore.getState().completeOnboarding()
    const state = useOnboardingStore.getState()

    expect(state.isCompleted).toBe(true)
  })

  it('should reset onboarding', () => {
    // First complete
    useOnboardingStore.getState().completeOnboarding()

    // Then reset
    useOnboardingStore.getState().resetOnboarding()
    const state = useOnboardingStore.getState()

    expect(state.isCompleted).toBe(false)
    expect(state.currentStep).toBe(0)
  })
})
