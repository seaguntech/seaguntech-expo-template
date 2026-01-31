import { changeLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/config/i18n'
import { useTheme as useThemeContext } from '@/shared/context'
import { useProfileStore } from '@/shared/stores'
import { Card, CardContent, Toggle } from '@/shared/ui'
import { Pressable, ScrollView, Text, View } from '@/tw'
import type { ThemeMode } from '@/types'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function SettingsScreen() {
  const router = useRouter()
  const { t, i18n } = useTranslation()
  const { themeMode, setThemeMode } = useThemeContext()
  const { setLocale } = useProfileStore()

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
  }

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await changeLanguage(lang)
    setLocale(lang)
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="p-6">
      <Text className="text-lg font-semibold text-foreground mb-3">{t('settings.appearance')}</Text>
      <Card variant="outlined" className="mb-6">
        <CardContent>
          <Text className="text-sm font-medium text-foreground mb-3">{t('settings.theme')}</Text>
          <View className="flex-row gap-2 mb-4">
            <ThemeOption
              label={t('settings.themeLight')}
              icon="☀️"
              selected={themeMode === 'light'}
              onPress={() => handleThemeChange('light')}
            />
            <ThemeOption
              label={t('settings.themeDark')}
              icon="🌙"
              selected={themeMode === 'dark'}
              onPress={() => handleThemeChange('dark')}
            />
            <ThemeOption
              label={t('settings.themeSystem')}
              icon="📱"
              selected={themeMode === 'system'}
              onPress={() => handleThemeChange('system')}
            />
          </View>

          <Text className="text-sm font-medium text-foreground mb-3">{t('settings.language')}</Text>
          <View className="flex-row flex-wrap gap-2">
            {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((lang) => (
              <LanguageOption
                key={lang}
                code={lang}
                name={SUPPORTED_LANGUAGES[lang].nativeName}
                selected={i18n.language === lang}
                onPress={() => handleLanguageChange(lang)}
              />
            ))}
          </View>
        </CardContent>
      </Card>

      <Text className="text-lg font-semibold text-foreground mb-3">
        {t('settings.notifications')}
      </Text>
      <Card variant="outlined" className="mb-6">
        <CardContent>
          <Toggle
            label={t('settings.pushNotifications')}
            description="Receive push notifications for updates"
            value={true}
            onValueChange={() => {}}
          />
          <View className="h-px bg-border my-2" />
          <Toggle
            label={t('settings.emailNotifications')}
            description="Receive email notifications"
            value={true}
            onValueChange={() => {}}
          />
        </CardContent>
      </Card>

      <Text className="text-lg font-semibold text-foreground mb-3">{t('settings.help')}</Text>
      <Card variant="outlined" className="mb-6">
        <CardContent>
          <SettingsLink icon="📖" label="Documentation" onPress={() => {}} />
          <SettingsLink icon="💬" label={t('settings.contactSupport')} onPress={() => {}} />
          <SettingsLink icon="⭐" label={t('settings.rateApp')} onPress={() => {}} isLast />
        </CardContent>
      </Card>

      <Text className="text-lg font-semibold text-foreground mb-3">Legal</Text>
      <Card variant="outlined" className="mb-6">
        <CardContent>
          <SettingsLink
            icon="📜"
            label={t('settings.termsOfService')}
            onPress={() => router.push('/(protected)/terms-of-service')}
          />
          <SettingsLink
            icon="🔒"
            label={t('settings.privacyPolicy')}
            onPress={() => router.push('/(protected)/privacy-policy')}
            isLast
          />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <View className="flex-row justify-between items-center">
            <Text className="text-muted-foreground">{t('settings.version')}</Text>
            <Text className="text-foreground">1.0.0</Text>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  )
}

function ThemeOption({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string
  icon: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 items-center py-3 rounded-lg border ${
        selected ? 'border-primary bg-primary/10' : 'border-border'
      }`}
    >
      <Text className="text-xl mb-1">{icon}</Text>
      <Text className={`text-sm ${selected ? 'text-primary font-medium' : 'text-foreground'}`}>
        {label}
      </Text>
    </Pressable>
  )
}

function LanguageOption({
  code,
  name,
  selected,
  onPress,
}: {
  code: string
  name: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-2 rounded-full border ${
        selected ? 'border-primary bg-primary/10' : 'border-border'
      }`}
    >
      <Text className={`text-sm ${selected ? 'text-primary font-medium' : 'text-foreground'}`}>
        {name}
      </Text>
    </Pressable>
  )
}

function SettingsLink({
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
      className={`flex-row items-center py-3 ${!isLast ? 'border-b border-border' : ''}`}
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className="flex-1 text-foreground">{label}</Text>
      <Text className="text-muted-foreground">→</Text>
    </Pressable>
  )
}
