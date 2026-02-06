import { useAuth } from '@/shared/context/auth-context'
import { queryKeys } from '@/shared/lib/query-client'
import { useProfileStore } from '@/shared/stores/profile-store'
import type { Profile, ProfileUpdatePayload } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteAvatar, fetchProfile, updateProfile, uploadAvatar } from '../api/profile-api'

export function useProfile() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const profileStore = useProfileStore()
  const profileQueryKey = queryKeys.profile.detail(user?.id ?? null)

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => fetchProfile(user?.id ?? ''),
    enabled: isAuthenticated && !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data) => {
      // Sync with profile store
      if (data) {
        profileStore.hydrate({
          displayName: data.displayName,
          avatarUrl: data.avatarUrl,
          email: data.email,
          isPremium: data.isPremium,
          locale: data.locale,
        })
      }
      return data
    },
  })

  const updateProfileMutation = useMutation({
    mutationFn: (payload: ProfileUpdatePayload) => updateProfile(user?.id ?? '', payload),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(profileQueryKey, updatedProfile)
      // Update store
      profileStore.hydrate({
        displayName: updatedProfile.displayName,
        avatarUrl: updatedProfile.avatarUrl,
        locale: updatedProfile.locale,
      })
    },
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: (uri: string) => uploadAvatar(user?.id ?? '', uri),
    onSuccess: (avatarUrl) => {
      queryClient.setQueryData(profileQueryKey, (old: Profile | undefined) =>
        old ? { ...old, avatarUrl } : old,
      )
      profileStore.setAvatarUrl(avatarUrl)
    },
  })

  const deleteAvatarMutation = useMutation({
    mutationFn: () => deleteAvatar(user?.id ?? ''),
    onSuccess: () => {
      queryClient.setQueryData(profileQueryKey, (old: Profile | undefined) =>
        old ? { ...old, avatarUrl: null } : old,
      )
      profileStore.setAvatarUrl(null)
    },
  })

  return {
    profile: profileQuery.data ?? null,
    isLoading: profileQuery.isLoading,
    isError: profileQuery.isError,
    error: profileQuery.error,
    refetch: profileQuery.refetch,

    updateProfile: updateProfileMutation.mutateAsync,
    isUpdating: updateProfileMutation.isPending,
    updateError: updateProfileMutation.error,

    uploadAvatar: uploadAvatarMutation.mutateAsync,
    isUploadingAvatar: uploadAvatarMutation.isPending,

    deleteAvatar: deleteAvatarMutation.mutateAsync,
    isDeletingAvatar: deleteAvatarMutation.isPending,
  }
}
