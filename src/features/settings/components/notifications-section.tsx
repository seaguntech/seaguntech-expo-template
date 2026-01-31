import { Toggle } from '@/shared/ui/primitives'
import { View } from '@/tw'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SettingsSection } from './settings-section'

interface NotificationsSectionProps {
  pushEnabled: boolean
  emailEnabled: boolean
  onPushChange: (value: boolean) => void
  onEmailChange: (value: boolean) => void
  className?: string
}

export function NotificationsSection({
  pushEnabled,
  emailEnabled,
  onPushChange,
  onEmailChange,
  className,
}: NotificationsSectionProps) {
  const { t } = useTranslation()

  return (
    <View className={className}>
      <SettingsSection title={t('settings.notifications')}>
        <Toggle
          label={t('settings.pushNotifications')}
          description="Receive push notifications for updates and reminders"
          value={pushEnabled}
          onValueChange={onPushChange}
        />
        <View className="h-px bg-border my-2" />
        <Toggle
          label={t('settings.emailNotifications')}
          description="Receive email notifications for important updates"
          value={emailEnabled}
          onValueChange={onEmailChange}
        />
      </SettingsSection>
    </View>
  )
}
