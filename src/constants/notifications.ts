export const NOTIFICATION_CHANNELS = {
  GENERAL: {
    id: 'general',
    name: 'General',
    description: 'General notifications',
    importance: 'high',
    sound: true,
    vibration: true,
    badge: true,
  },
  REMINDERS: {
    id: 'reminders',
    name: 'Reminders',
    description: 'Task reminders and alerts',
    importance: 'high',
    sound: true,
    vibration: true,
    badge: true,
  },
  MARKETING: {
    id: 'marketing',
    name: 'Marketing',
    description: 'Promotional offers and updates',
    importance: 'low',
    sound: false,
    vibration: false,
    badge: false,
  },
  UPDATES: {
    id: 'updates',
    name: 'Updates',
    description: 'App updates and new features',
    importance: 'default',
    sound: true,
    vibration: false,
    badge: true,
  },
} as const

export const NOTIFICATION_TYPES = {
  TASK_REMINDER: 'task_reminder',
  TASK_DUE: 'task_due',
  SUBSCRIPTION_EXPIRING: 'subscription_expiring',
  SUBSCRIPTION_EXPIRED: 'subscription_expired',
  NEW_FEATURE: 'new_feature',
  PROMO: 'promo',
  SYSTEM: 'system',
} as const

export const PERMISSION_STATUS = {
  GRANTED: 'granted',
  DENIED: 'denied',
  UNDETERMINED: 'undetermined',
} as const

export const DEFAULT_NOTIFICATION_SETTINGS = {
  pushEnabled: true,
  emailEnabled: true,
  marketingEnabled: false,
  reminderEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
} as const

export const NOTIFICATION_ACTIONS = {
  OPEN_APP: 'open_app',
  OPEN_TASK: 'open_task',
  OPEN_SETTINGS: 'open_settings',
  OPEN_PREMIUM: 'open_premium',
  DISMISS: 'dismiss',
} as const

export type NotificationChannelId = keyof typeof NOTIFICATION_CHANNELS
export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]
export type PermissionStatus = (typeof PERMISSION_STATUS)[keyof typeof PERMISSION_STATUS]
export type NotificationAction = (typeof NOTIFICATION_ACTIONS)[keyof typeof NOTIFICATION_ACTIONS]
