import * as Linking from 'expo-linking'
import { Button } from '@/shared/ui'
import { Text, View } from '@/tw'
import { useRouter, useRootNavigationState } from 'expo-router'
import { useEffect, useMemo } from 'react'
import { toStringParam } from '@/shared/lib/auth-helpers'

export default function NotFoundScreen() {
  const router = useRouter()
  const navigationState = useRootNavigationState()
  const rawUrl = Linking.useLinkingURL()

  const callbackHref = useMemo(() => {
    if (!rawUrl) return null

    const parsed = Linking.parse(rawUrl)
    const hashParams = rawUrl.split('#')[1]
    const parsedHash = hashParams ? new URLSearchParams(hashParams) : null

    const tokenHash =
      toStringParam(parsed.queryParams?.token_hash) ??
      toStringParam(parsed.queryParams?.token) ??
      parsedHash?.get('token_hash') ??
      parsedHash?.get('token')
    const accessToken =
      toStringParam(parsed.queryParams?.access_token) ?? parsedHash?.get('access_token')
    const refreshToken =
      toStringParam(parsed.queryParams?.refresh_token) ?? parsedHash?.get('refresh_token')
    const type = toStringParam(parsed.queryParams?.type) ?? parsedHash?.get('type')
    const error =
      toStringParam(parsed.queryParams?.error_description) ??
      toStringParam(parsed.queryParams?.error) ??
      parsedHash?.get('error_description') ??
      parsedHash?.get('error')
    const e2eBypass = toStringParam(parsed.queryParams?.e2e_bypass) ?? parsedHash?.get('e2e_bypass')

    if (!tokenHash && !accessToken && !error) {
      return null
    }

    const callbackParams = new URLSearchParams()
    if (tokenHash) callbackParams.set('token_hash', tokenHash)
    if (accessToken) callbackParams.set('access_token', accessToken)
    if (refreshToken) callbackParams.set('refresh_token', refreshToken)
    if (type) callbackParams.set('type', type)
    if (error) callbackParams.set('error', error)
    if (e2eBypass) callbackParams.set('e2e_bypass', e2eBypass)

    const query = callbackParams.toString()
    return query.length > 0 ? `/(auth)/callback?${query}` : '/(auth)/callback'
  }, [rawUrl])

  useEffect(() => {
    if (!callbackHref || !navigationState?.key) return

    // Use setTimeout to ensure navigation happens after mount to avoid "Attempted to navigate before mounting" error
    const timer = setTimeout(() => {
      router.replace(callbackHref as Parameters<typeof router.replace>[0])
    }, 0)

    return () => clearTimeout(timer)
  }, [callbackHref, router, navigationState?.key])

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-6xl mb-4">🔍</Text>
      <Text className="text-2xl font-bold text-foreground mb-2">Page Not Found</Text>
      <Text className="text-base text-muted-foreground text-center mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </Text>

      <Button variant="primary" size="lg" onPress={() => router.replace('/')}>
        Go Home
      </Button>
    </View>
  )
}
