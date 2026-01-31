import { changeLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/config/i18n'
import { useThemeContext } from '@/shared/context/theme-context'
import { Pressable, Text, View } from '@/tw'
import type { ThemeMode } from '@/types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { SettingsSection } from './settings-section'

interface PreferencesSectionProps {
  className?: string
}

export function PreferencesSection({ className }: PreferencesSectionProps) {
  const { t, i18n } = useTranslation()
  const { themeMode, setThemeMode } = useThemeContext()

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode)
  }

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await changeLanguage(lang)
  }

  return (
    <View className={className}>
      <SettingsSection title={t('settings.appearance')}>
        <View className="mb-4">
          <Text className="text-sm font-medium text-foreground mb-3">{t('settings.theme')}</Text>
          <View className="flex-row gap-2">
            <ThemeButton
              label={t('settings.themeLight')}
              icon="☀️"
              selected={themeMode === 'light'}
              onPress={() => handleThemeChange('light')}
            />
            <ThemeButton
              label={t('settings.themeDark')}
              icon="🌙"
              selected={themeMode === 'dark'}
              onPress={() => handleThemeChange('dark')}
            />
            <ThemeButton
              label={t('settings.themeSystem')}
              icon="📱"
              selected={themeMode === 'system'}
              onPress={() => handleThemeChange('system')}
            />
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground mb-3">{t('settings.language')}</Text>
          <View className="flex-row flex-wrap gap-2">
            {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((lang) => (
              <Pressable
                key={lang}
                onPress={() => handleLanguageChange(lang)}
                className={`px-4 py-2 rounded-full border ${
                  i18n.language === lang ? 'border-primary bg-primary/10' : 'border-border'
                }`}
              >
                <Text
                  className={`text-sm ${
                    i18n.language === lang ? 'text-primary font-medium' : 'text-foreground'
                  }`}
                >
                  {SUPPORTED_LANGUAGES[lang].nativeName}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </SettingsSection>
    </View>
  )
}

function ThemeButton({
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
