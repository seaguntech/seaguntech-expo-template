import { ListSeparator } from '@/shared/ui/primitives'
import { FlashList, RefreshControl, Text, View } from '@/tw'
import React, { useCallback, useMemo } from 'react'
import { NotificationItem } from './notification-item'

// Extracted styles to prevent re-renders
const styles = {
  listContent: { padding: 16 },
} as const

interface Notification {
  id: string
  title: string
  body: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  isLoading?: boolean
  onNotificationPress?: (notification: Notification) => void
  onMarkAsRead?: (id: string) => void
  onRefresh?: () => void
  emptyMessage?: string
}

export function NotificationCenter({
  notifications,
  isLoading = false,
  onNotificationPress,
  onMarkAsRead,
  onRefresh,
  emptyMessage = 'No notifications',
}: NotificationCenterProps) {
  const renderItem = useCallback(
    ({ item }: { item: Notification }) => (
      <NotificationItem
        item={item}
        onNotificationPress={onNotificationPress}
        onMarkAsRead={onMarkAsRead}
      />
    ),
    [onNotificationPress, onMarkAsRead],
  )

  const keyExtractor = useCallback((item: Notification) => item.id, [])

  const renderEmpty = useCallback(
    () => (
      <View className="flex-1 justify-center items-center py-20">
        <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
          <Text className="text-3xl">🔔</Text>
        </View>
        <Text className="text-muted-foreground text-center">{emptyMessage}</Text>
      </View>
    ),
    [emptyMessage],
  )

  const refreshControl = useMemo(
    () => (onRefresh ? <RefreshControl refreshing={isLoading} onRefresh={onRefresh} /> : undefined),
    [onRefresh, isLoading],
  )

  return (
    <FlashList
      data={notifications}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={ListSeparator}
      ListEmptyComponent={renderEmpty}
      refreshControl={refreshControl}
    />
  )
}
