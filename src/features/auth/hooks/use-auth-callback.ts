import { useState, useEffect, useRef } from 'react'
import { useRouter, useRootNavigationState, useLocalSearchParams } from 'expo-router'
import * as Linking from 'expo-linking'
import { supabase } from '@/config/supabase'
import {
  toStringParam,
  extractVerificationType,
  extractSessionTokens,
  isVerificationType,
} from '@/shared/lib/auth-helpers'

type VerificationStatus = 'loading' | 'success' | 'error'
type RouterReplaceHref = Parameters<ReturnType<typeof useRouter>['replace']>[0]

const ATTEMPT_COOLDOWN_MS = 2000 // Simple rate limit
let lastAttemptTimestamp = 0

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

const replaceWithRetry = async (
  replace: (href: RouterReplaceHref) => void,
  href: RouterReplaceHref,
  maxAttempts = 10,
): Promise<void> => {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      replace(href)
      return
    } catch (error) {
      lastError = error
      await sleep(100)
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Navigation failed')
}

export const useAuthCallback = () => {
  const router = useRouter()
  const rootNavigationState = useRootNavigationState()
  const isNavigationReady = Boolean(rootNavigationState?.key)
  const rawUrl = Linking.useLinkingURL()
  const hasHandledRef = useRef(false)
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('Processing authentication...')

  const params = useLocalSearchParams<{
    access_token?: string | string[]
    refresh_token?: string | string[]
    token_hash?: string | string[]
    token?: string | string[]
    type?: string | string[]
    error?: string | string[]
    error_description?: string | string[]
    e2e_bypass?: string | string[]
  }>()

  const hasCallbackPayload =
    Boolean(params.access_token) ||
    Boolean(params.refresh_token) ||
    Boolean(params.token_hash) ||
    Boolean(params.token) ||
    Boolean(params.type) ||
    Boolean(params.error) ||
    Boolean(params.error_description) ||
    Boolean(params.e2e_bypass) ||
    rawUrl?.includes('access_token=') === true ||
    rawUrl?.includes('token_hash=') === true ||
    rawUrl?.includes('token=') === true ||
    rawUrl?.includes('type=') === true ||
    rawUrl?.includes('e2e_bypass=') === true

  useEffect(() => {
    if (!isNavigationReady || !hasCallbackPayload || hasHandledRef.current) return

    // Rate limiting check
    const now = Date.now()
    if (now - lastAttemptTimestamp < ATTEMPT_COOLDOWN_MS) {
      console.warn('Auth callback rate limited')
      return
    }
    lastAttemptTimestamp = now
    hasHandledRef.current = true

    const handleAuthCallback = async () => {
      const accessTokenParam = toStringParam(params.access_token)
      const refreshTokenParam = toStringParam(params.refresh_token)
      const tokenHash = toStringParam(params.token_hash) ?? toStringParam(params.token)
      const verificationType = extractVerificationType(toStringParam(params.type), rawUrl)
      const oauthError = toStringParam(params.error_description) ?? toStringParam(params.error)
      const e2eBypass = __DEV__ && toStringParam(params.e2e_bypass) === '1'

      if (oauthError) {
        setStatus('error')
        setMessage(oauthError)
        return
      }

      try {
        // Handle E2E Bypass
        if (e2eBypass && verificationType === 'recovery') {
          await replaceWithRetry(router.replace, '/(auth)/set-password')
          return
        }

        // Handle OTP Verification
        if (tokenHash && isVerificationType(verificationType)) {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: verificationType,
          })
          if (error) throw error

          if (verificationType === 'recovery') {
            await replaceWithRetry(router.replace, '/(auth)/set-password')
            return
          }

          setStatus('success')
          setMessage('Authentication successful. Redirecting...')
          setTimeout(() => router.replace('/(protected)/(tabs)'), 1000)
          return
        }

        // Handle Session Tokens
        const { accessToken, refreshToken } = extractSessionTokens(
          accessTokenParam,
          refreshTokenParam,
          rawUrl,
        )

        if (!accessToken || !refreshToken) {
          throw new Error('Authentication callback is missing session tokens')
        }

        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) throw error

        if (verificationType === 'recovery') {
          await replaceWithRetry(router.replace, '/(auth)/set-password')
          return
        }

        setStatus('success')
        setMessage('Authentication successful. Redirecting...')
        setTimeout(() => router.replace('/(protected)/(tabs)'), 1000)
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Authentication callback failed')
      }
    }

    handleAuthCallback()
  }, [isNavigationReady, hasCallbackPayload, params, rawUrl, router])

  return { status, message, router }
}
