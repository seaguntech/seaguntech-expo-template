// Profile Types

export interface Profile {
  id: string
  userId: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  isPremium: boolean
  locale: string
  createdAt: Date
  updatedAt: Date
}

export interface UpdateProfileDTO {
  displayName?: string
  avatarUrl?: string
  locale?: string
}

export interface CreateProfileDTO {
  userId: string
  email: string
  displayName?: string
}

// Database row type (snake_case)
export interface ProfileRow {
  id: string
  user_id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  is_premium: boolean
  locale: string
  created_at: string
  updated_at: string
}

// Profile store state
export interface ProfileStoreState {
  displayName: string | null
  avatarUrl: string | null
  email: string | null
  isPremium: boolean
  locale: string
}

export interface ProfileStoreActions {
  hydrate: (profile: Profile) => void
  clearProfile: () => void
  setDisplayName: (name: string) => void
  setAvatarUrl: (url: string | null) => void
  setLocale: (locale: string) => void
}
