import type { TaskFilter } from '@/types'
import NetInfo from '@react-native-community/netinfo'
import { QueryClient, onlineManager } from '@tanstack/react-query'

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(state.isConnected ?? true)
  })
})

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache is garbage collected after 30 minutes
      gcTime: 30 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: 3,
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus (when app comes to foreground)
      refetchOnWindowFocus: true,
      // Don't refetch on reconnect by default (handle manually for offline support)
      refetchOnReconnect: false,
      // Keep previous data while fetching new data
      placeholderData: (previousData: unknown) => previousData,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
})

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    session: (userId?: string | null) =>
      [...queryKeys.auth.all, 'session', userId ?? 'anonymous'] as const,
    user: (userId?: string | null) =>
      [...queryKeys.auth.all, 'user', userId ?? 'anonymous'] as const,
  },

  // Profile
  profile: {
    all: ['profile'] as const,
    detail: (userId?: string | null) =>
      [...queryKeys.profile.all, 'detail', userId ?? 'anonymous'] as const,
    avatar: (userId?: string | null) =>
      [...queryKeys.profile.all, 'avatar', userId ?? 'anonymous'] as const,
  },

  // Tasks
  tasks: {
    all: ['tasks'] as const,
    list: (userId?: string | null, filters?: Record<string, unknown> | TaskFilter) =>
      [...queryKeys.tasks.all, 'list', userId ?? 'anonymous', filters] as const,
    detail: (userId: string | null | undefined, id: string) =>
      [...queryKeys.tasks.all, 'detail', userId ?? 'anonymous', id] as const,
  },

  // Premium
  premium: {
    all: ['premium'] as const,
    status: () => [...queryKeys.premium.all, 'status'] as const,
    offerings: () => [...queryKeys.premium.all, 'offerings'] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    list: () => [...queryKeys.notifications.all, 'list'] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread'] as const,
  },

  // AI
  ai: {
    all: ['ai'] as const,
    conversations: () => [...queryKeys.ai.all, 'conversations'] as const,
    conversation: (id: string) => [...queryKeys.ai.all, 'conversation', id] as const,
  },
} as const

// Helper to invalidate all queries for a specific domain
export const invalidateQueries = async (domain: keyof typeof queryKeys) => {
  await queryClient.invalidateQueries({ queryKey: queryKeys[domain].all })
}

// Helper to prefetch common data
export const prefetchCommonData = async () => {
  // Add prefetch calls here for data that should be loaded early
  // Example: await queryClient.prefetchQuery({ queryKey: queryKeys.profile.detail(), queryFn: fetchProfile })
}
