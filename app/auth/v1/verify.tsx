import { LayoutWrapper } from '@/shared/ui/layout'
import { ActivityIndicator, Text, View } from '@/tw'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useMemo } from 'react'

type VerifyParams = {
  token?: string | string[]
  token_hash?: string | string[]
  type?: string | string[]
  error?: string | string[]
  error_description?: string | string[]
  e2e_bypass?: string | string[]
}

const toStringParam = (value: string | string[] | undefined): string | null => {
  if (typeof value === 'string' && value.length > 0) return value
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) return value[0]
  return null
}

export default function SupabaseVerifyScreen() {
  const router = useRouter()
  const params = useLocalSearchParams<VerifyParams>()

  const callbackHref = useMemo(() => {
    const tokenHash = toStringParam(params.token_hash) ?? toStringParam(params.token)
    const type = toStringParam(params.type)
    const error = toStringParam(params.error)
    const errorDescription = toStringParam(params.error_description)
    const e2eBypass = toStringParam(params.e2e_bypass)

    if (!tokenHash && !error && !errorDescription) {
      return null
    }

    const callbackParams = new URLSearchParams()
    if (tokenHash) callbackParams.set('token_hash', tokenHash)
    if (type) callbackParams.set('type', type)
    if (error) callbackParams.set('error', error)
    if (errorDescription) callbackParams.set('error_description', errorDescription)
    if (e2eBypass) callbackParams.set('e2e_bypass', e2eBypass)

    const query = callbackParams.toString()
    return query.length > 0 ? `/(auth)/callback?${query}` : '/(auth)/callback'
  }, [
    params.e2e_bypass,
    params.error,
    params.error_description,
    params.token,
    params.token_hash,
    params.type,
  ])

  useEffect(() => {
    if (!callbackHref) {
      router.replace('/(auth)/sign-in')
      return
    }

    router.replace(callbackHref as Parameters<typeof router.replace>[0])
  }, [callbackHref, router])

  return (
    <LayoutWrapper className="bg-background">
      <View className="flex-1 items-center justify-center px-6">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-base text-muted-foreground">
          Redirecting to authentication...
        </Text>
      </View>
    </LayoutWrapper>
  )
}
