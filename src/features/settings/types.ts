// Settings Types

export interface SettingsSection {
  id: string
  title: string
  rows: SettingsRow[]
}

export interface SettingsRow {
  id: string
  label: string
  type: 'toggle' | 'select' | 'navigation' | 'action'
  value?: boolean | string
  options?: string[]
  icon?: string
  onPress?: () => void
  onChange?: (value: boolean | string) => void
}

export interface AppPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: NotificationPreferences
  haptics: boolean
  sounds: boolean
}

export interface NotificationPreferences {
  enabled: boolean
  marketing: boolean
  updates: boolean
  reminders: boolean
}
