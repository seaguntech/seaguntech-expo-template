import { Card, CardContent, CardHeader, CardTitle, Toggle } from '@/shared/ui/primitives'
import { Text } from '@/tw'
import React from 'react'

interface NotificationSettingsCardProps {
  pushEnabled: boolean
  onPushChange: (enabled: boolean) => void
  emailEnabled?: boolean
  onEmailChange?: (enabled: boolean) => void
  marketingEnabled?: boolean
  onMarketingChange?: (enabled: boolean) => void
  hasPermission?: boolean
  className?: string
}

export function NotificationSettingsCard({
  pushEnabled,
  onPushChange,
  emailEnabled = true,
  onEmailChange,
  marketingEnabled = false,
  onMarketingChange,
  hasPermission = true,
  className,
}: NotificationSettingsCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <Toggle
          label="Push Notifications"
          description="Receive push notifications on this device"
          value={pushEnabled && hasPermission}
          onValueChange={onPushChange}
          disabled={!hasPermission}
        />

        {!hasPermission && (
          <Text className="text-xs text-warning">
            Push notifications are disabled. Enable them in your device settings.
          </Text>
        )}

        {onEmailChange && (
          <Toggle
            label="Email Notifications"
            description="Receive important updates via email"
            value={emailEnabled}
            onValueChange={onEmailChange}
          />
        )}

        {onMarketingChange && (
          <Toggle
            label="Marketing Emails"
            description="Receive news, tips, and special offers"
            value={marketingEnabled}
            onValueChange={onMarketingChange}
          />
        )}
      </CardContent>
    </Card>
  )
}
