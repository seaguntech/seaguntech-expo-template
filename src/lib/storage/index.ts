import { createMMKV } from 'react-native-mmkv'

// Main storage instance for general app data
export const storage = createMMKV({
  id: 'seaguntech-app-storage',
})

// Secure storage instance for sensitive data (tokens, credentials)
export const secureStorage = createMMKV({
  id: 'seaguntech-secure-storage',
  encryptionKey: 'seaguntech-encryption-key-v1',
})

// Storage keys
export const STORAGE_KEYS = {
  // Auth
  ACCESS_TOKEN: 'auth.accessToken',
  REFRESH_TOKEN: 'auth.refreshToken',
  SESSION: 'auth.session',
  USER: 'auth.user',

  // Theme
  THEME_MODE: 'theme.mode',

  // Onboarding
  ONBOARDING_COMPLETED: 'onboarding.completed',
  ONBOARDING_STEP: 'onboarding.currentStep',

  // Profile
  PROFILE_CACHE: 'profile.cache',

  // Locale
  LOCALE: 'app.locale',

  // Offline
  OFFLINE_QUEUE: 'offline.queue',
  LAST_SYNC: 'offline.lastSync',

  // Premium
  PREMIUM_STATUS: 'premium.status',
  PREMIUM_EXPIRES: 'premium.expiresAt',

  // Sound
  SOUND_MUTED: 'sound.muted',

  // Notifications
  PUSH_TOKEN: 'notifications.pushToken',
  PUSH_ENABLED: 'notifications.enabled',
} as const

// Helper functions for typed storage operations
export const mmkvStorage = {
  getString: (key: string): string | undefined => {
    return storage.getString(key)
  },

  setString: (key: string, value: string): void => {
    storage.set(key, value)
  },

  getNumber: (key: string): number | undefined => {
    return storage.getNumber(key)
  },

  setNumber: (key: string, value: number): void => {
    storage.set(key, value)
  },

  getBoolean: (key: string): boolean | undefined => {
    return storage.getBoolean(key)
  },

  setBoolean: (key: string, value: boolean): void => {
    storage.set(key, value)
  },

  getObject: <T>(key: string): T | null => {
    const value = storage.getString(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },

  setObject: <T>(key: string, value: T): void => {
    storage.set(key, JSON.stringify(value))
  },

  delete: (key: string): void => {
    storage.remove(key)
  },

  contains: (key: string): boolean => {
    return storage.contains(key)
  },

  clearAll: (): void => {
    storage.clearAll()
  },

  getAllKeys: (): string[] => {
    return storage.getAllKeys()
  },
}

// Secure storage helpers
export const secureMMKVStorage = {
  getString: (key: string): string | undefined => {
    return secureStorage.getString(key)
  },

  setString: (key: string, value: string): void => {
    secureStorage.set(key, value)
  },

  getObject: <T>(key: string): T | null => {
    const value = secureStorage.getString(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },

  setObject: <T>(key: string, value: T): void => {
    secureStorage.set(key, JSON.stringify(value))
  },

  delete: (key: string): void => {
    secureStorage.remove(key)
  },

  clearAll: (): void => {
    secureStorage.clearAll()
  },
}

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
