import type { DeepLinkConfig } from '@/types'
import { DEEP_LINK_PREFIXES, NAVIGATION_CONFIG } from '@/constants/navigation'

export const linkingConfig: DeepLinkConfig = {
  prefixes: DEEP_LINK_PREFIXES,
  config: NAVIGATION_CONFIG,
}

// Helper to build a deep link URL
export const buildDeepLink = (path: string, params?: Record<string, string>): string => {
  const baseUrl = DEEP_LINK_PREFIXES[0]
  let url = `${baseUrl}${path}`

  if (params && Object.keys(params).length > 0) {
    const queryString = new URLSearchParams(params).toString()
    url += `?${queryString}`
  }

  return url
}

// Helper to parse a deep link URL
export const parseDeepLink = (
  url: string,
): { path: string; params: Record<string, string> } | null => {
  try {
    // Remove any prefix
    let cleanUrl = url
    for (const prefix of DEEP_LINK_PREFIXES) {
      if (url.startsWith(prefix)) {
        cleanUrl = url.replace(prefix, '')
        break
      }
    }

    // Parse path and query params
    const [path, queryString] = cleanUrl.split('?')
    const params: Record<string, string> = {}

    if (queryString) {
      const searchParams = new URLSearchParams(queryString)
      searchParams.forEach((value, key) => {
        params[key] = value
      })
    }

    return { path: path || '/', params }
  } catch {
    return null
  }
}

// Deep link routes for common actions
export const DeepLinks = {
  // Auth
  welcome: () => buildDeepLink('welcome'),
  signIn: () => buildDeepLink('sign-in'),
  signUp: () => buildDeepLink('sign-up'),
  authCallback: () => buildDeepLink('callback'),
  authConfirm: () => buildDeepLink('confirm'),
  resetPassword: (token?: string) => buildDeepLink('reset-password', token ? { token } : undefined),
  setPassword: () => buildDeepLink('set-password'),

  // Protected
  home: () => buildDeepLink(''),
  profile: () => buildDeepLink('profile'),
  settings: () => buildDeepLink('settings'),
  ai: () => buildDeepLink('ai'),
  tasks: () => buildDeepLink('tasks'),
  task: (id: string) => buildDeepLink('tasks', { id }),
  premium: () => buildDeepLink('premium'),
  notifications: () => buildDeepLink('notifications'),

  // Legal
  privacyPolicy: () => buildDeepLink('privacy-policy'),
  termsOfService: () => buildDeepLink('terms-of-service'),

  // Onboarding
  onboarding: () => buildDeepLink('onboarding'),
} as const
