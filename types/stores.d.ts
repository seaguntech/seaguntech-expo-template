export interface OfflineAction {
  id: string
  type: string
  payload: unknown
  createdAt: string
  retryCount: number
  maxRetries: number
}

export interface OfflineState {
  isOnline: boolean
  pendingActions: OfflineAction[]
  lastSyncAt: string | null
  isSyncing: boolean
  syncError: string | null
}

export interface OfflineStoreState extends OfflineState {
  setOnline: (isOnline: boolean) => void
  addPendingAction: (action: Omit<OfflineAction, 'id' | 'createdAt' | 'retryCount'>) => void
  removePendingAction: (id: string) => void
  incrementRetry: (id: string) => void
  clearPendingActions: () => void
  startSync: () => void
  finishSync: (error?: string) => void
  getActionsByType: (type: string) => OfflineAction[]
}

export interface OnboardingStoreState {
  currentStep: number
  totalSteps: number
  isCompleted: boolean
  completedAt: string | null
  skippedSteps: string[]
  permissionsGranted: string[]
  setCurrentStep: (step: number) => void
  nextStep: () => void
  previousStep: () => void
  skipStep: (stepId: string) => void
  completeOnboarding: () => void
  resetOnboarding: () => void
  grantPermission: (permission: string) => void
  hasGrantedPermission: (permission: string) => boolean
}

export interface ProfileStoreState {
  displayName: string | null
  avatarUrl: string | null
  email: string | null
  isPremium: boolean
  locale: string
  setDisplayName: (name: string | null) => void
  setAvatarUrl: (url: string | null) => void
  setEmail: (email: string | null) => void
  setIsPremium: (isPremium: boolean) => void
  setLocale: (locale: string) => void
  clearProfile: () => void
  hydrate: (data: Partial<ProfileStoreState>) => void
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface CacheState {
  entries: Record<string, CacheEntry<unknown>>
  set: <T>(key: string, data: T, ttl?: number) => void
  get: <T>(key: string) => T | null
  has: (key: string) => boolean
  remove: (key: string) => void
  clear: () => void
  isExpired: (key: string) => boolean
}
