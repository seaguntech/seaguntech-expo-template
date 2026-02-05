import { supabase } from '@/config/supabase'
import { LayoutWrapper } from '@/shared/ui/layout'
import { ActivityIndicator, Text, View } from '@/tw'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'

type VerificationStatus = 'loading' | 'success' | 'error'
type VerificationType = 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change'

export default function ConfirmEmailScreen() {
  const { token_hash, type, redirect_to } = useLocalSearchParams<{
    token_hash: string
    type: string
    redirect_to?: string
  }>()
  const router = useRouter()
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function verifyEmail() {
      if (!token_hash || !type) {
        setStatus('error')
        setMessage('Invalid verification link')
        return
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as VerificationType,
        })

        if (error) {
          setStatus('error')
          setMessage(error.message)
          return
        }

        setStatus('success')
        setMessage(getSuccessMessage(type as VerificationType))

        // Redirect after success
        setTimeout(() => {
          if (redirect_to) {
            router.replace(redirect_to as Parameters<typeof router.replace>[0])
          } else {
            router.replace('/(protected)/(tabs)')
          }
        }, 2000)
      } catch (err) {
        setStatus('error')
        setMessage(err instanceof Error ? err.message : 'Verification failed')
      }
    }

    verifyEmail()
  }, [token_hash, type, redirect_to, router])

  return (
    <LayoutWrapper className="bg-background">
      <View className="flex-1 items-center justify-center px-6">
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="mt-4 text-base text-muted-foreground">Verifying...</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Text className="text-4xl">✓</Text>
            </View>
            <Text className="text-center text-2xl font-bold text-foreground">Success!</Text>
            <Text className="mt-2 text-center text-base text-muted-foreground">{message}</Text>
            <Text className="mt-4 text-sm text-muted-foreground">Redirecting...</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-red-100">
              <Text className="text-4xl">✕</Text>
            </View>
            <Text className="text-center text-2xl font-bold text-foreground">
              Verification failed
            </Text>
            <Text className="mt-2 text-center text-base text-muted-foreground">{message}</Text>
            <Text
              className="mt-6 font-semibold text-primary"
              onPress={() => router.replace('/(auth)/sign-in')}
            >
              Back to login
            </Text>
          </>
        )}
      </View>
    </LayoutWrapper>
  )
}

function getSuccessMessage(type: VerificationType): string {
  switch (type) {
    case 'signup':
      return 'Your email has been verified successfully!'
    case 'recovery':
      return 'You can now reset your password.'
    case 'magiclink':
      return 'Login successful!'
    case 'email_change':
      return 'Your email has been changed successfully!'
    case 'invite':
      return 'Invitation accepted!'
    default:
      return 'Verification successful!'
  }
}
