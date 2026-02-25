import { createMMKV } from 'react-native-mmkv'

export const storage = createMMKV({
  id: 'seaguntech-app-storage',
})

export const secureStorage = createMMKV({
  id: 'seaguntech-secure-storage',
})

const isBrowser = typeof window !== 'undefined'

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth.accessToken',
  REFRESH_TOKEN: 'auth.refreshToken',
  SESSION: 'auth.session',
  USER: 'auth.user',
  THEME_MODE: 'theme.mode',
  ONBOARDING_COMPLETED: 'onboarding.completed',
  ONBOARDING_STEP: 'onboarding.currentStep',
  PROFILE_CACHE: 'profile.cache',
  LOCALE: 'app.locale',
  OFFLINE_QUEUE: 'offline.queue',
  LAST_SYNC: 'offline.lastSync',
  PREMIUM_STATUS: 'premium.status',
  PREMIUM_EXPIRES: 'premium.expiresAt',
  SOUND_MUTED: 'sound.muted',
  PUSH_TOKEN: 'notifications.pushToken',
  PUSH_ENABLED: 'notifications.enabled',
} as const

export const mmkvStorage = {
  getString: (key: string): string | undefined => (isBrowser ? storage.getString(key) : undefined),
  setString: (key: string, value: string): void => {
    if (!isBrowser) return
    storage.set(key, value)
  },
  getNumber: (key: string): number | undefined => (isBrowser ? storage.getNumber(key) : undefined),
  setNumber: (key: string, value: number): void => {
    if (!isBrowser) return
    storage.set(key, value)
  },
  getBoolean: (key: string): boolean | undefined =>
    isBrowser ? storage.getBoolean(key) : undefined,
  setBoolean: (key: string, value: boolean): void => {
    if (!isBrowser) return
    storage.set(key, value)
  },
  getObject: <T>(key: string): T | null => {
    if (!isBrowser) return null
    const value = storage.getString(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },
  setObject: <T>(key: string, value: T): void => {
    if (!isBrowser) return
    storage.set(key, JSON.stringify(value))
  },
  delete: (key: string): void => {
    if (!isBrowser) return
    storage.remove(key)
  },
  contains: (key: string): boolean => (isBrowser ? storage.contains(key) : false),
  clearAll: (): void => {
    if (!isBrowser) return
    storage.clearAll()
  },
  getAllKeys: (): string[] => (isBrowser ? storage.getAllKeys() : []),
}

export const secureMMKVStorage = {
  getString: (key: string): string | undefined =>
    isBrowser ? secureStorage.getString(key) : undefined,
  setString: (key: string, value: string): void => {
    if (!isBrowser) return
    secureStorage.set(key, value)
  },
  getObject: <T>(key: string): T | null => {
    if (!isBrowser) return null
    const value = secureStorage.getString(key)
    if (!value) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return null
    }
  },
  setObject: <T>(key: string, value: T): void => {
    if (!isBrowser) return
    secureStorage.set(key, JSON.stringify(value))
  },
  delete: (key: string): void => {
    if (!isBrowser) return
    secureStorage.remove(key)
  },
  clearAll: (): void => {
    if (!isBrowser) return
    secureStorage.clearAll()
  },
}

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS]
