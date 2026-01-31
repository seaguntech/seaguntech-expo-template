import { cn } from '@/shared/lib/utils'
import { Button, Card, CardContent, Toggle } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import React from 'react'
import { Platform } from 'react-native'

interface NotificationSettingsProps {
  pushEnabled: boolean
  onPushChange: (enabled: boolean) => void
  onRequestPermission: () => Promise<void>
  hasPermission: boolean
  isRequesting: boolean
  className?: string
}

export function NotificationSettings({
  pushEnabled,
  onPushChange,
  onRequestPermission,
  hasPermission,
  isRequesting,
  className,
}: NotificationSettingsProps) {
  return (
    <View className={className}>
      <Card variant="outlined">
        <CardContent>
          <View className="flex-row items-center mb-4 pb-4 border-b border-border">
            <View
              className={cn(
                'w-10 h-10 rounded-full items-center justify-center mr-3',
                hasPermission ? 'bg-success/20' : 'bg-warning/20',
              )}
            >
              <Text className="text-lg">{hasPermission ? '✓' : '!'}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-foreground">Notification Permission</Text>
              <Text className="text-sm text-muted-foreground">
                {hasPermission ? 'Granted' : 'Not granted'}
              </Text>
            </View>
            {!hasPermission && (
              <Button
                variant="primary"
                size="sm"
                onPress={onRequestPermission}
                isLoading={isRequesting}
              >
                Enable
              </Button>
            )}
          </View>

          <Toggle
            label="Push Notifications"
            description="Receive push notifications for updates"
            value={pushEnabled && hasPermission}
            onValueChange={onPushChange}
            disabled={!hasPermission}
          />

          {Platform.OS === 'ios' && !hasPermission && (
            <Text className="text-xs text-muted-foreground mt-4">
              To enable notifications, tap &quot;Enable&quot; and allow notifications in the system
              prompt.
            </Text>
          )}
        </CardContent>
      </Card>
    </View>
  )
}
