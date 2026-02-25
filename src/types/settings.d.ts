import type { ThemeMode } from './theme'

export interface SettingsSection {
  id: string
  title: string
  rows: SettingRow[]
}

export interface SettingRow {
  id: string
  type: SettingRowType
  label: string
  description?: string
  icon?: string
  iconColor?: string
  value?: unknown
  options?: SettingOption[]
  onPress?: () => void
  onChange?: (value: unknown) => void
  disabled?: boolean
  destructive?: boolean
}

export type SettingRowType = 'navigation' | 'toggle' | 'select' | 'button' | 'info' | 'custom'

export interface SettingOption {
  label: string
  value: string | number | boolean
  icon?: string
}

export interface AppSettings {
  theme: ThemeMode
  language: string
  notifications: NotificationSettings
  privacy: PrivacySettings
  accessibility: AccessibilitySettings
}

export interface NotificationSettings {
  pushEnabled: boolean
  emailEnabled: boolean
  marketingEnabled: boolean
  reminderEnabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
}

export interface PrivacySettings {
  analyticsEnabled: boolean
  crashReportingEnabled: boolean
  personalizedAdsEnabled: boolean
}

export interface AccessibilitySettings {
  reduceMotion: boolean
  increaseContrast: boolean
  largeText: boolean
  screenReaderEnabled: boolean
}

export interface SettingsContextValue {
  settings: AppSettings
  isLoading: boolean
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>
  updateNotificationSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K],
  ) => Promise<void>
  updatePrivacySetting: <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K],
  ) => Promise<void>
  resetSettings: () => Promise<void>
}

export interface SettingsRowProps {
  row: SettingRow
  isFirst?: boolean
  isLast?: boolean
}

export interface SettingsSectionProps {
  section: SettingsSection
}
