import { mmkvStorage } from '@/shared/lib/storage'
import { useCallback, useRef } from 'react'

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  prefix?: string
}

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export function useCache<T>(options: CacheOptions = {}) {
  const { ttl = DEFAULT_TTL, prefix = 'cache' } = options
  const memoryCache = useRef<Map<string, CacheEntry<T>>>(new Map())

  const getCacheKey = useCallback((key: string) => `${prefix}:${key}`, [prefix])

  const get = useCallback(
    (key: string): T | null => {
      const cacheKey = getCacheKey(key)

      // Check memory cache first
      const memoryEntry = memoryCache.current.get(cacheKey)
      if (memoryEntry) {
        if (Date.now() - memoryEntry.timestamp < memoryEntry.ttl) {
          return memoryEntry.data
        }
        memoryCache.current.delete(cacheKey)
      }

      // Check persistent cache
      try {
        const stored = mmkvStorage.getString(cacheKey)
        if (stored) {
          const entry: CacheEntry<T> = JSON.parse(stored)
          if (Date.now() - entry.timestamp < entry.ttl) {
            // Restore to memory cache
            memoryCache.current.set(cacheKey, entry)
            return entry.data
          }
          // Expired, remove it
          mmkvStorage.delete(cacheKey)
        }
      } catch {
        // Invalid cache entry
      }

      return null
    },
    [getCacheKey],
  )

  const set = useCallback(
    (key: string, data: T, customTtl?: number) => {
      const cacheKey = getCacheKey(key)
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: customTtl ?? ttl,
      }

      // Store in memory
      memoryCache.current.set(cacheKey, entry)

      // Store persistently
      try {
        mmkvStorage.setString(cacheKey, JSON.stringify(entry))
      } catch {
        // Storage full or error
      }
    },
    [getCacheKey, ttl],
  )

  const remove = useCallback(
    (key: string) => {
      const cacheKey = getCacheKey(key)
      memoryCache.current.delete(cacheKey)
      mmkvStorage.delete(cacheKey)
    },
    [getCacheKey],
  )

  const clear = useCallback(() => {
    memoryCache.current.clear()
    // Note: This clears ALL storage, not just cache
    // In production, you'd want to iterate and delete only cache keys
  }, [])

  const getOrFetch = useCallback(
    async (key: string, fetcher: () => Promise<T>, customTtl?: number): Promise<T> => {
      const cached = get(key)
      if (cached !== null) {
        return cached
      }

      const data = await fetcher()
      set(key, data, customTtl)
      return data
    },
    [get, set],
  )

  return {
    get,
    set,
    remove,
    clear,
    getOrFetch,
  }
}
