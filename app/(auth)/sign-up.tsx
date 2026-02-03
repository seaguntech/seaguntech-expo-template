import { EmailLoginForm, EmailLoginToggle, Separator, SocialLoginButtons } from '@/features/auth'
import { useAuth } from '@/shared/context'
import { LayoutWrapper } from '@/shared/ui/layout'
import { BackButton } from '@/src/shared/ui/primitives'
import { Text, View } from '@/tw'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function SignUpScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { signUp, signInWithOAuth, isLoading, error } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleEmailSignUp = async (
    email: string,
    password: string,
    displayName?: string,
    confirmPassword?: string,
  ) => {
    setAuthError(null)
    try {
      await signUp({ email, password, confirmPassword: confirmPassword ?? '', displayName })
      setSuccess(true)
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign up failed')
    }
  }

  const handleGoogleSignIn = async () => {
    setAuthError(null)
    try {
      await signInWithOAuth({ provider: 'google' })
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google sign in failed')
    }
  }

  const handleAppleSignIn = async () => {
    setAuthError(null)
    try {
      await signInWithOAuth({ provider: 'apple' })
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Apple sign in failed')
    }
  }

  if (success) {
    return (
      <LayoutWrapper className="bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-success/20 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">✉️</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground text-center">Check your email</Text>
          <Text className="text-base text-muted-foreground text-center mt-2 mb-8">
            We&apos;ve sent you a verification link. Please check your inbox to verify your account.
          </Text>
          <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
            <Text className="text-primary font-semibold">Back to Sign In</Text>
          </Pressable>
        </View>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper scrollable={true}>
      <BackButton />

      <View className="mb-8">
        <Text className="text-3xl font-bold text-foreground">{t('auth.createAccount')}</Text>
        <Text className="text-base text-muted-foreground mt-2">
          Start your journey with us today
        </Text>
      </View>

      <SocialLoginButtons
        onGooglePress={handleGoogleSignIn}
        onApplePress={handleAppleSignIn}
        isLoading={isLoading}
      />

      <Separator />

      <EmailLoginForm
        mode="sign-up"
        onSubmit={handleEmailSignUp}
        isLoading={isLoading}
        error={authError || error}
      />

      <Text className="text-xs text-muted-foreground text-center mt-4">
        {t('auth.termsAgreement')}
      </Text>

      <EmailLoginToggle
        mode="sign-up"
        onToggle={() => router.push('/(auth)/sign-in')}
        className="mt-8"
      />
    </LayoutWrapper>
  )
}

function Pressable({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  return (
    <View>
      <Text onPress={onPress}>{children}</Text>
    </View>
  )
}
