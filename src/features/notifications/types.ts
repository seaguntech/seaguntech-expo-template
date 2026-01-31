// Notifications Types

export interface PushToken {
  id: string
  userId: string
  token: string
  platform: 'ios' | 'android' | 'web'
  createdAt: Date
}

export interface NotificationPayload {
  title: string
  body: string
  data?: Record<string, unknown>
}

export interface NotificationSettings {
  enabled: boolean
  marketing: boolean
  updates: boolean
  reminders: boolean
}

export interface NotificationPermissionStatus {
  status: 'granted' | 'denied' | 'undetermined'
  canAskAgain: boolean
}

export interface ScheduledNotification {
  id: string
  title: string
  body: string
  trigger: Date | number
}
