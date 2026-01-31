import { cn } from '@/shared/lib/utils'
import { Pressable, Text, View } from '@/tw'
import React from 'react'

interface PushNotificationProps {
  title: string
  body: string
  icon?: string
  onPress?: () => void
  onDismiss?: () => void
  className?: string
}

export function PushNotification({
  title,
  body,
  icon = '🔔',
  onPress,
  onDismiss,
  className,
}: PushNotificationProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'bg-card border border-border rounded-xl shadow-lg mx-4 my-2 overflow-hidden',
        className,
      )}
    >
      <View className="flex-row items-start p-4">
        <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
          <Text className="text-xl">{icon}</Text>
        </View>

        <View className="flex-1">
          <Text className="font-semibold text-foreground" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-sm text-muted-foreground mt-0.5" numberOfLines={2}>
            {body}
          </Text>
        </View>

        {onDismiss && (
          <Pressable
            onPress={(e) => {
              e.stopPropagation()
              onDismiss()
            }}
            className="w-6 h-6 items-center justify-center"
          >
            <Text className="text-muted-foreground">✕</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  )
}
