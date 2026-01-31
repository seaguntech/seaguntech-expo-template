import { supabase } from '@/config/supabase'
import type { Profile, ProfileUpdatePayload } from '@/types'

/**
 * Fetch user profile from Supabase
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No profile found, return null
      return null
    }
    throw error
  }

  return transformProfile(data)
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  payload: ProfileUpdatePayload,
): Promise<Profile> {
  const updateData = {
    display_name: payload.displayName,
    first_name: payload.firstName,
    last_name: payload.lastName,
    phone: payload.phone,
    avatar_url: payload.avatarUrl,
    bio: payload.bio,
    locale: payload.locale,
    timezone: payload.timezone,
    notifications_enabled: payload.notificationsEnabled,
    email_notifications_enabled: payload.emailNotificationsEnabled,
    updated_at: new Date().toISOString(),
  }

  // Remove undefined values
  const cleanData = Object.fromEntries(
    Object.entries(updateData).filter(([_, v]) => v !== undefined),
  )

  const { data, error } = await supabase
    .from('profiles')
    .update(cleanData)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error

  return transformProfile(data)
}

/**
 * Create user profile (called after signup)
 */
export async function createProfile(
  userId: string,
  email: string,
  displayName?: string,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      email,
      display_name: displayName ?? null,
      locale: 'en',
      is_premium: false,
      notifications_enabled: true,
      email_notifications_enabled: true,
    })
    .select()
    .single()

  if (error) throw error

  return transformProfile(data)
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  // Convert URI to blob
  const response = await fetch(uri)
  const blob = await response.blob()

  // Generate unique filename
  const fileExt = uri.split('.').pop() ?? 'jpg'
  const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob, {
    contentType: `image/${fileExt}`,
    upsert: true,
  })

  if (uploadError) throw uploadError

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(fileName)

  // Update profile with new avatar URL
  await updateProfile(userId, { avatarUrl: publicUrl })

  return publicUrl
}

/**
 * Delete avatar from Supabase Storage
 */
export async function deleteAvatar(userId: string): Promise<void> {
  // List all files in user's avatar folder
  const { data: files, error: listError } = await supabase.storage.from('avatars').list(userId)

  if (listError) throw listError

  if (files && files.length > 0) {
    // Delete all avatar files
    const filePaths = files.map((file) => `${userId}/${file.name}`)
    const { error: deleteError } = await supabase.storage.from('avatars').remove(filePaths)

    if (deleteError) throw deleteError
  }

  // Update profile to remove avatar URL
  await updateProfile(userId, { avatarUrl: null })
}

/**
 * Transform database row to Profile type
 */
function transformProfile(data: Record<string, unknown>): Profile {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    displayName: data.display_name as string | null,
    firstName: data.first_name as string | null,
    lastName: data.last_name as string | null,
    email: data.email as string,
    phone: data.phone as string | null,
    avatarUrl: data.avatar_url as string | null,
    bio: data.bio as string | null,
    locale: data.locale as string,
    timezone: data.timezone as string | null,
    isPremium: data.is_premium as boolean,
    premiumExpiresAt: data.premium_expires_at as string | null,
    notificationsEnabled: data.notifications_enabled as boolean,
    emailNotificationsEnabled: data.email_notifications_enabled as boolean,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
