import { mmkvStorage, secureMMKVStorage, STORAGE_KEYS } from '@/shared/lib/storage'
import { clearAuthStorage } from '@/shared/lib/storage/supabase'

/**
 * Clear all session data from storage
 * Call this when user signs out
 */
export function clearSession(): void {
  // Clear auth storage (tokens, session)
  clearAuthStorage()

  // Clear profile cache
  mmkvStorage.delete(STORAGE_KEYS.PROFILE_CACHE)

  // Clear premium status cache
  mmkvStorage.delete(STORAGE_KEYS.PREMIUM_STATUS)
  mmkvStorage.delete(STORAGE_KEYS.PREMIUM_EXPIRES)

  // Note: We intentionally keep these settings:
  // - Theme preference (STORAGE_KEYS.THEME_MODE)
  // - Locale preference (STORAGE_KEYS.LOCALE)
  // - Onboarding status (onboarding-store) - so they don't see it again
}

/**
 * Clear all app data including preferences
 * Call this for a complete reset
 */
export function clearAllData(): void {
  // Clear all regular storage
  mmkvStorage.clearAll()

  // Clear all secure storage
  secureMMKVStorage.clearAll()
}

/**
 * Clear offline queue data
 */
export function clearOfflineQueue(): void {
  mmkvStorage.delete(STORAGE_KEYS.OFFLINE_QUEUE)
  mmkvStorage.delete(STORAGE_KEYS.LAST_SYNC)
}
