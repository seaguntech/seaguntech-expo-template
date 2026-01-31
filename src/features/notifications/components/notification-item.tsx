import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import React, { memo } from 'react'

interface Notification {
  id: string
  title: string
  body: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: string
}

interface NotificationItemProps {
  item: Notification
  onNotificationPress?: (notification: Notification) => void
  onMarkAsRead?: (id: string) => void
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export const NotificationItem = memo(function NotificationItem({
  item,
  onNotificationPress,
  onMarkAsRead,
}: NotificationItemProps) {
  return (
    <Pressable
      onPress={() => {
        onNotificationPress?.(item)
        if (!item.read) {
          onMarkAsRead?.(item.id)
        }
      }}
    >
      <Card className={cn(!item.read && 'border-l-4 border-l-primary')}>
        <CardContent className="py-3">
          <View className="flex-row items-start">
            {!item.read && <View className="w-2 h-2 rounded-full bg-primary mr-2 mt-2" />}
            <View className="flex-1">
              <Text
                className={cn(
                  'text-base',
                  item.read ? 'text-muted-foreground' : 'text-foreground font-semibold',
                )}
              >
                {item.title}
              </Text>
              <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
                {item.body}
              </Text>
              <Text className="text-xs text-muted-foreground mt-2">
                {formatTime(item.createdAt)}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </Pressable>
  )
})
