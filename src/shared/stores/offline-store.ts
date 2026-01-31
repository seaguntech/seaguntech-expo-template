import { zustandStorage } from '@/shared/lib/storage/zustand'
import { generateId } from '@/shared/lib/utils'
import type { OfflineAction, OfflineStoreState } from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const DEFAULT_MAX_RETRIES = 3

type OfflineStorePersistedState = Pick<OfflineStoreState, 'pendingActions' | 'lastSyncAt'>

export const useOfflineStore = create<OfflineStoreState>()(
  persist<OfflineStoreState, [], [], OfflineStorePersistedState>(
    (set, get) => ({
      // State
      isOnline: true,
      pendingActions: [],
      lastSyncAt: null,
      isSyncing: false,
      syncError: null,

      // Actions
      setOnline: (isOnline) => set({ isOnline }),

      addPendingAction: (action) => {
        const newAction: OfflineAction = {
          id: generateId(),
          type: action.type,
          payload: action.payload,
          createdAt: new Date().toISOString(),
          retryCount: 0,
          maxRetries: action.maxRetries ?? DEFAULT_MAX_RETRIES,
        }
        set((state) => ({
          pendingActions: [...state.pendingActions, newAction],
        }))
      },

      removePendingAction: (id) => {
        set((state) => ({
          pendingActions: state.pendingActions.filter((a) => a.id !== id),
        }))
      },

      incrementRetry: (id) => {
        set((state) => ({
          pendingActions: state.pendingActions.map((a) =>
            a.id === id ? { ...a, retryCount: a.retryCount + 1 } : a,
          ),
        }))
      },

      clearPendingActions: () => set({ pendingActions: [] }),

      startSync: () => set({ isSyncing: true, syncError: null }),

      finishSync: (error) =>
        set({
          isSyncing: false,
          syncError: error ?? null,
          lastSyncAt: error ? get().lastSyncAt : new Date().toISOString(),
        }),

      getActionsByType: (type) => {
        return get().pendingActions.filter((a) => a.type === type)
      },
    }),
    {
      name: 'offline-store',
      storage: createJSONStorage<OfflineStorePersistedState>(() => zustandStorage),
      partialize: (state) => ({
        pendingActions: state.pendingActions,
        lastSyncAt: state.lastSyncAt,
      }),
    },
  ),
)

// Selectors
export const selectIsOnline = (state: OfflineStoreState) => state.isOnline
export const selectPendingActions = (state: OfflineStoreState) => state.pendingActions
export const selectPendingCount = (state: OfflineStoreState) => state.pendingActions.length
export const selectIsSyncing = (state: OfflineStoreState) => state.isSyncing
export const selectHasPendingActions = (state: OfflineStoreState) => state.pendingActions.length > 0
