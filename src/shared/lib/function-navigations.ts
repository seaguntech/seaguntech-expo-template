import { router } from 'expo-router'
import { ROUTES } from '@/constants/navigation'

/**
 * Navigate to a specific route
 */
export function navigateTo(route: string, params?: Record<string, string>): void {
  if (params) {
    router.push({ pathname: route as never, params })
  } else {
    router.push(route as never)
  }
}

/**
 * Replace current route
 */
export function replaceTo(route: string): void {
  router.replace(route as never)
}

/**
 * Go back
 */
export function goBack(): void {
  if (router.canGoBack()) {
    router.back()
  } else {
    router.replace('/')
  }
}

/**
 * Navigate to auth flow
 */
export function navigateToAuth(): void {
  router.replace(ROUTES.AUTH.WELCOME as never)
}

/**
 * Navigate to main app (after login)
 */
export function navigateToApp(): void {
  router.replace(ROUTES.PROTECTED.HOME as never)
}

/**
 * Navigate to onboarding
 */
export function navigateToOnboarding(): void {
  router.replace(ROUTES.ONBOARDING as never)
}

/**
 * Navigate to a specific tab
 */
export function navigateToTab(tab: 'index' | 'tasks' | 'ai' | 'profile' | 'settings'): void {
  router.push(`/(protected)/(tabs)/${tab === 'index' ? '' : tab}` as never)
}

/**
 * Navigate to task detail
 */
export function navigateToTask(taskId: string): void {
  router.push({
    pathname: '/(protected)/(tabs)/tasks' as never,
    params: { id: taskId },
  })
}

/**
 * Navigate to premium page
 */
export function navigateToPremium(): void {
  router.push(ROUTES.PROTECTED.PREMIUM as never)
}

/**
 * Navigate to settings
 */
export function navigateToSettings(): void {
  router.push(ROUTES.PROTECTED.SETTINGS as never)
}

/**
 * Open external link
 */
export async function openExternalLink(url: string): Promise<void> {
  const { openBrowserAsync } = await import('expo-web-browser')
  await openBrowserAsync(url)
}
