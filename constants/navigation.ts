import type { TabItem } from '@/types'

export const ROUTES = {
  // Auth routes
  AUTH: {
    WELCOME: '/(auth)/welcome',
    SIGN_IN: '/(auth)/sign-in',
    SIGN_UP: '/(auth)/sign-up',
    CALLBACK: '/(auth)/callback',
    CONFIRM: '/(auth)/confirm',
    RESET_PASSWORD: '/(auth)/reset-password',
    SET_PASSWORD: '/(auth)/set-password',
  },
  // Protected routes
  PROTECTED: {
    HOME: '/(protected)/(tabs)',
    AI: '/(protected)/(tabs)/ai',
    NOTIFICATIONS: '/(protected)/(tabs)/notifications',
    OFFLINE: '/(protected)/(tabs)/offline',
    PAYMENT: '/(protected)/(tabs)/payment',
    PREMIUM: '/(protected)/(tabs)/premium',
    PROFILE: '/(protected)/(tabs)/profile',
    SETTINGS: '/(protected)/(tabs)/settings',
    TASKS: '/(protected)/(tabs)/tasks',
    PRIVACY_POLICY: '/(protected)/privacy-policy',
    TERMS_OF_SERVICE: '/(protected)/terms-of-service',
  },
  // Onboarding
  ONBOARDING: '/onboarding',
} as const

export const TAB_ITEMS: TabItem[] = [
  {
    id: 'index',
    label: 'Home',
    icon: 'house',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: 'checkmark.circle',
  },
  {
    id: 'ai',
    label: 'AI Chat',
    icon: 'bubble.left.and.bubble.right',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: 'person.circle',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'gear',
  },
]

export const DEEP_LINK_PREFIXES = [
  'seaguntechexpotemplate://',
  'https://seaguntech.com',
  'https://*.seaguntech.com',
]

export const NAVIGATION_CONFIG = {
  screens: {
    '(auth)': {
      screens: {
        welcome: 'welcome',
        'sign-in': 'sign-in',
        'sign-up': 'sign-up',
        callback: 'callback',
        confirm: 'confirm',
        'reset-password': 'reset-password',
        'set-password': 'set-password',
      },
    },
    '(protected)': {
      screens: {
        '(tabs)': {
          screens: {
            index: '',
            ai: 'ai',
            notifications: 'notifications',
            offline: 'offline',
            payment: 'payment',
            premium: 'premium',
            profile: 'profile',
            settings: 'settings',
            tasks: 'tasks',
          },
        },
        'privacy-policy': 'privacy-policy',
        'terms-of-service': 'terms-of-service',
      },
    },
    onboarding: 'onboarding',
    '+not-found': '*',
  },
} as const

export type RouteKey = keyof typeof ROUTES
export type AuthRoute = (typeof ROUTES.AUTH)[keyof typeof ROUTES.AUTH]
export type ProtectedRoute = (typeof ROUTES.PROTECTED)[keyof typeof ROUTES.PROTECTED]
