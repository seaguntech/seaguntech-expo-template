import { zustandStorage } from '@/shared/lib/storage/zustand'
import type { ProfileStoreState } from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type ProfileStorePersistedState = Pick<
  ProfileStoreState,
  'displayName' | 'avatarUrl' | 'email' | 'isPremium' | 'locale'
>

export const useProfileStore = create<ProfileStoreState>()(
  persist<ProfileStoreState, [], [], ProfileStorePersistedState>(
    (set) => ({
      // State
      displayName: null,
      avatarUrl: null,
      email: null,
      isPremium: false,
      locale: 'en',

      // Actions
      setDisplayName: (displayName) => set({ displayName }),
      setAvatarUrl: (avatarUrl) => set({ avatarUrl }),
      setEmail: (email) => set({ email }),
      setIsPremium: (isPremium) => set({ isPremium }),
      setLocale: (locale) => set({ locale }),

      clearProfile: () =>
        set({
          displayName: null,
          avatarUrl: null,
          email: null,
          isPremium: false,
          locale: 'en',
        }),

      hydrate: (data) => set(data),
    }),
    {
      name: 'profile-store',
      storage: createJSONStorage<ProfileStorePersistedState>(() => zustandStorage),
      partialize: (state) => ({
        displayName: state.displayName,
        avatarUrl: state.avatarUrl,
        email: state.email,
        isPremium: state.isPremium,
        locale: state.locale,
      }),
    },
  ),
)

// Selectors
export const selectDisplayName = (state: ProfileStoreState) => state.displayName
export const selectAvatarUrl = (state: ProfileStoreState) => state.avatarUrl
export const selectEmail = (state: ProfileStoreState) => state.email
export const selectIsPremium = (state: ProfileStoreState) => state.isPremium
export const selectLocale = (state: ProfileStoreState) => state.locale

// Helper to get user initials
export const selectInitials = (state: ProfileStoreState) => {
  const name = state.displayName
  if (!name) return '?'
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
