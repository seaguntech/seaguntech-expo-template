import { cn } from '@/shared/lib/utils'
import { Pressable, Text, View } from '@/tw'
import React from 'react'

interface NotificationHeaderProps {
  title?: string
  unreadCount?: number
  onMarkAllRead?: () => void
  onSettings?: () => void
  className?: string
}

export function NotificationHeader({
  title = 'Notifications',
  unreadCount = 0,
  onMarkAllRead,
  onSettings,
  className,
}: NotificationHeaderProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between px-4 py-3 border-b border-border',
        className,
      )}
    >
      <View className="flex-row items-center">
        <Text className="text-xl font-bold text-foreground">{title}</Text>
        {unreadCount > 0 && (
          <View className="bg-primary px-2 py-0.5 rounded-full ml-2">
            <Text className="text-xs text-primary-foreground font-medium">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row gap-2">
        {onMarkAllRead && unreadCount > 0 && (
          <Pressable onPress={onMarkAllRead} className="px-3 py-1">
            <Text className="text-primary text-sm">Mark all read</Text>
          </Pressable>
        )}
        {onSettings && (
          <Pressable
            onPress={onSettings}
            className="w-8 h-8 rounded-full bg-muted items-center justify-center"
          >
            <Text className="text-muted-foreground">⚙</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
