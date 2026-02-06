import { EmailLoginForm, EmailLoginToggle, Separator, SocialLoginButtons } from '@/features/auth'
import { useAuth } from '@/shared/context'
import { LayoutWrapper } from '@/shared/ui/layout'
import { BackButton } from '@/src/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function SignInScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { signIn, signInWithOAuth } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [isOAuthLoading, setIsOAuthLoading] = useState(false)

  useFocusEffect(
    useCallback(() => {
      setAuthError(null)
    }, []),
  )

  const handleEmailSignIn = async (email: string, password: string) => {
    setAuthError(null)
    try {
      await signIn({ email, password })
      router.replace('/(protected)/(tabs)')
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : t('auth.invalidCredentials'))
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError(null)
    setIsOAuthLoading(true)
    try {
      await signInWithOAuth({ provider: 'google' })
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google sign in failed')
    } finally {
      setIsOAuthLoading(false)
    }
  }

  const handleAppleSignIn = async () => {
    setAuthError(null)
    setIsOAuthLoading(true)
    try {
      await signInWithOAuth({ provider: 'apple' })
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Apple sign in failed')
    } finally {
      setIsOAuthLoading(false)
    }
  }

  return (
    <LayoutWrapper scrollable={true}>
      <BackButton />

      <View className="mb-8">
        <Text className="text-3xl font-bold text-foreground">{t('auth.welcomeBack')}</Text>
        <Text className="text-base text-muted-foreground mt-2">
          Sign in to continue to your account
        </Text>
      </View>

      <SocialLoginButtons
        onGooglePress={handleGoogleSignIn}
        onApplePress={handleAppleSignIn}
        isLoading={isOAuthLoading}
      />

      <Separator />

      <EmailLoginForm
        mode="sign-in"
        onSubmit={handleEmailSignIn}
        isLoading={isOAuthLoading}
        error={authError}
      />

      <Pressable onPress={() => router.push('/(auth)/reset-password')} className="mt-4">
        <Text className="text-primary text-center font-medium">{t('auth.forgotPassword')}</Text>
      </Pressable>

      <EmailLoginToggle
        mode="sign-in"
        onToggle={() => router.push('/(auth)/sign-up')}
        className="mt-8"
      />
    </LayoutWrapper>
  )
}
