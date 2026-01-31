import { cn } from '@/shared/lib/utils'
import { Pressable, Text, View } from '@/tw'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking } from 'react-native'
import { SettingsSection } from './settings-section'

interface AssistanceSectionProps {
  onContactSupport?: () => void
  onRateApp?: () => void
  className?: string
}

export function AssistanceSection({
  onContactSupport,
  onRateApp,
  className,
}: AssistanceSectionProps) {
  const { t } = useTranslation()

  const handleContactSupport = () => {
    if (onContactSupport) {
      onContactSupport()
    } else {
      Linking.openURL('mailto:support@seaguntech.com')
    }
  }

  const handleRateApp = () => {
    if (onRateApp) {
      onRateApp()
    }
    // TODO: Open App Store / Play Store
  }

  return (
    <View className={className}>
      <SettingsSection title={t('settings.help')}>
        <AssistanceRow
          icon="📖"
          label="Documentation"
          onPress={() => Linking.openURL('https://docs.seaguntech.com')}
        />
        <AssistanceRow
          icon="💬"
          label={t('settings.contactSupport')}
          onPress={handleContactSupport}
        />
        <AssistanceRow icon="⭐" label={t('settings.rateApp')} onPress={handleRateApp} isLast />
      </SettingsSection>
    </View>
  )
}

function AssistanceRow({
  icon,
  label,
  onPress,
  isLast = false,
}: {
  icon: string
  label: string
  onPress: () => void
  isLast?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn('flex-row items-center py-3', !isLast && 'border-b border-border')}
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className="flex-1 text-foreground">{label}</Text>
      <Text className="text-muted-foreground">→</Text>
    </Pressable>
  )
}
