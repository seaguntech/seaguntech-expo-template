import { cn } from '@/shared/lib/utils'
import { Button, Card, CardContent } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import type * as Notifications from 'expo-notifications'
import React from 'react'

interface PermissionStatusCardProps {
  permission: Notifications.PermissionStatus | null
  onRequestPermission: () => Promise<void>
  isLoading?: boolean
  className?: string
}

export function PermissionStatusCard({
  permission,
  onRequestPermission,
  isLoading = false,
  className,
}: PermissionStatusCardProps) {
  const isGranted = permission === 'granted'
  const isDenied = permission === 'denied'

  return (
    <Card className={className}>
      <CardContent className="py-4">
        <View className="flex-row items-center">
          <View
            className={cn(
              'w-12 h-12 rounded-full items-center justify-center mr-4',
              isGranted ? 'bg-success/20' : isDenied ? 'bg-destructive/20' : 'bg-warning/20',
            )}
          >
            <Text className="text-2xl">{isGranted ? '✓' : isDenied ? '✕' : '!'}</Text>
          </View>

          <View className="flex-1">
            <Text className="font-semibold text-foreground">
              {isGranted
                ? 'Notifications Enabled'
                : isDenied
                  ? 'Notifications Blocked'
                  : 'Notifications Not Set Up'}
            </Text>
            <Text className="text-sm text-muted-foreground mt-0.5">
              {isGranted
                ? 'You will receive push notifications'
                : isDenied
                  ? 'Please enable in device settings'
                  : 'Tap to enable push notifications'}
            </Text>
          </View>

          {!isGranted && (
            <Button
              variant={isDenied ? 'outline' : 'primary'}
              size="sm"
              onPress={onRequestPermission}
              isLoading={isLoading}
            >
              {isDenied ? 'Settings' : 'Enable'}
            </Button>
          )}
        </View>
      </CardContent>
    </Card>
  )
}
