import * as Sentry from '@sentry/react-native'

const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? ''

export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('Sentry DSN not configured')
    return
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: __DEV__,
    enabled: !__DEV__, // Only enable in production
    environment: __DEV__ ? 'development' : 'production',
    tracesSampleRate: 1.0,
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000,
    attachStacktrace: true,
    enableNativeCrashHandling: true,
    enableAutoPerformanceTracing: true,
    integrations: [Sentry.reactNativeTracingIntegration()],
    beforeSend(event) {
      // Filter out sensitive data
      if (event.request?.headers) {
        delete event.request.headers['Authorization']
        delete event.request.headers['Cookie']
      }
      return event
    },
  })
}

// Helper to capture errors with context
export function captureError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  })
}

// Helper to capture messages
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level)
}

// Helper to set user context
export function setUser(user: { id: string; email?: string; username?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    })
  } else {
    Sentry.setUser(null)
  }
}

// Helper to add breadcrumb
export function addBreadcrumb(message: string, category: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  })
}

// Helper to start a transaction
export function startTransaction(name: string, op: string) {
  return Sentry.startInactiveSpan({
    name,
    op,
  })
}

// Wrap component with Sentry error boundary
export const withSentry = Sentry.wrap

export { Sentry }
