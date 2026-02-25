import { createJSONStorage, type StateStorage } from 'zustand/middleware'
import { storage } from './index'

/**
 * Zustand storage adapter using MMKV
 * Use this with Zustand's persist middleware for fast, synchronous persistence
 */
export const zustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name)
    return value ?? null
  },

  setItem: (name: string, value: string): void => {
    storage.set(name, value)
  },

  removeItem: (name: string): void => {
    storage.remove(name)
  },
}

export const persistStorage = createJSONStorage(() => zustandStorage)

/**
 * Create a namespaced storage for a specific store
 * Useful when you want to prefix all keys with a store name
 */
export const createNamespacedStorage = (namespace: string): StateStorage => ({
  getItem: (name: string): string | null => {
    const key = `${namespace}:${name}`
    const value = storage.getString(key)
    return value ?? null
  },

  setItem: (name: string, value: string): void => {
    const key = `${namespace}:${name}`
    storage.set(key, value)
  },

  removeItem: (name: string): void => {
    const key = `${namespace}:${name}`
    storage.remove(key)
  },
})

/**
 * Helper to create persist options for Zustand stores
 */
export const createPersistOptions = <T, P = T>(name: string, partialize?: (state: T) => P) => ({
  name,
  storage: createJSONStorage<P>(() => zustandStorage),
  partialize,
})
