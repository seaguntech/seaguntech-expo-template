import type { SupportedStorage } from '@supabase/supabase-js'
import { secureStorage, STORAGE_KEYS } from './index'

/**
 * Custom storage adapter for Supabase Auth using MMKV
 * This replaces AsyncStorage for faster, synchronous access
 */
export const supabaseStorage: SupportedStorage = {
  getItem: (key: string): string | null => {
    const value = secureStorage.getString(key)
    return value ?? null
  },

  setItem: (key: string, value: string): void => {
    secureStorage.set(key, value)
  },

  removeItem: (key: string): void => {
    secureStorage.remove(key)
  },
}

/**
 * Get the stored session from MMKV
 */
export const getStoredSession = (): string | null => {
  return secureStorage.getString(STORAGE_KEYS.SESSION) ?? null
}

/**
 * Store session in MMKV
 */
export const storeSession = (session: string): void => {
  secureStorage.set(STORAGE_KEYS.SESSION, session)
}

/**
 * Clear all auth-related data from storage
 */
export const clearAuthStorage = (): void => {
  secureStorage.remove(STORAGE_KEYS.ACCESS_TOKEN)
  secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN)
  secureStorage.remove(STORAGE_KEYS.SESSION)
  secureStorage.remove(STORAGE_KEYS.USER)
}

/**
 * Check if there's a stored session
 */
export const hasStoredSession = (): boolean => {
  return secureStorage.contains(STORAGE_KEYS.SESSION)
}
