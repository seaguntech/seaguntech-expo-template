export interface Profile {
  id: string
  userId: string
  displayName: string | null
  firstName: string | null
  lastName: string | null
  email: string
  phone: string | null
  avatarUrl: string | null
  bio: string | null
  locale: string
  timezone: string | null
  isPremium: boolean
  premiumExpiresAt: string | null
  notificationsEnabled: boolean
  emailNotificationsEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface ProfileUpdatePayload {
  displayName?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  avatarUrl?: string | null
  bio?: string | null
  locale?: string
  timezone?: string | null
  notificationsEnabled?: boolean
  emailNotificationsEnabled?: boolean
}

export interface ProfileContextValue {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>
  refreshProfile: () => Promise<void>
  uploadAvatar: (uri: string) => Promise<string>
  deleteAvatar: () => Promise<void>
}

export interface ProfileFormData {
  displayName: string
  firstName: string
  lastName: string
  phone: string
  bio: string
}

export type ProfileField = keyof ProfileFormData
