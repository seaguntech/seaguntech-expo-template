import type { SupportedStorage } from '@supabase/supabase-js'
import { secureMMKVStorage, STORAGE_KEYS } from './index'

/**
 * Custom storage adapter for Supabase Auth using MMKV
 * This replaces AsyncStorage for faster, synchronous access
 */
export const supabaseStorage: SupportedStorage = {
  getItem: (key: string): string | null => {
    const value = secureMMKVStorage.getString(key)
    return value ?? null
  },

  setItem: (key: string, value: string): void => {
    secureMMKVStorage.setString(key, value)
  },

  removeItem: (key: string): void => {
    secureMMKVStorage.delete(key)
  },
}

/**
 * Get the stored session from MMKV
 */
export const getStoredSession = (): string | null => {
  return secureMMKVStorage.getString(STORAGE_KEYS.SESSION) ?? null
}

/**
 * Store session in MMKV
 */
export const storeSession = (session: string): void => {
  secureMMKVStorage.setString(STORAGE_KEYS.SESSION, session)
}

/**
 * Clear all auth-related data from storage
 */
export const clearAuthStorage = (): void => {
  secureMMKVStorage.delete(STORAGE_KEYS.ACCESS_TOKEN)
  secureMMKVStorage.delete(STORAGE_KEYS.REFRESH_TOKEN)
  secureMMKVStorage.delete(STORAGE_KEYS.SESSION)
  secureMMKVStorage.delete(STORAGE_KEYS.USER)
}

/**
 * Check if there's a stored session
 */
export const hasStoredSession = (): boolean => {
  return secureMMKVStorage.getString(STORAGE_KEYS.SESSION) !== undefined
}
