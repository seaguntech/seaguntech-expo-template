import { useAuth } from '@/shared/context'
import { isValidEmail } from '@/shared/lib/utils'
import { FormInput } from '@/shared/ui/forms'
import { LayoutWrapper } from '@/shared/ui/layout'
import { BackButton, Button } from '@/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type ResetPasswordValues = {
  email: string
}

export default function ResetPasswordScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { resetPassword } = useAuth()
  const [success, setSuccess] = useState(false)

  const emailRequired = t('auth.emailRequired') || 'Email is required'
  const invalidEmail = t('auth.invalidEmail') || 'Please enter a valid email address'
  const resetFailed = t('auth.resetPasswordFailed') || 'Failed to send reset email'

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: { email: '' },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await resetPassword({ email: values.email })
      setSuccess(true)
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : resetFailed,
      })
    }
  })

  const rootError = errors.root?.message

  if (success) {
    return (
      <LayoutWrapper className="bg-background">
        <View className="flex-1 justify-center items-center px-6">
          <View className="w-20 h-20 bg-success/20 rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">✉️</Text>
          </View>
          <Text className="text-2xl font-bold text-foreground text-center">
            {t('auth.emailSent')}
          </Text>
          <Text className="text-base text-muted-foreground text-center mt-2 mb-8">
            We&apos;ve sent password reset instructions to your email. Please check your inbox.
          </Text>
          <Pressable onPress={() => router.replace('/(auth)/sign-in')}>
            <Text className="text-primary font-semibold">Back to Sign In</Text>
          </Pressable>
        </View>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper
      className="bg-background"
      scrollable={true}
      contentContainerClassName="justify-center px-6 py-12"
    >
      <BackButton />

      <View className="mb-8">
        <Text className="text-3xl font-bold text-foreground">{t('auth.resetPassword')}</Text>
        <Text className="text-base text-muted-foreground mt-2">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </Text>
      </View>

      <View className="gap-4">
        <FormInput
          control={control}
          name="email"
          rules={{
            required: emailRequired,
            validate: (value) => isValidEmail(value ?? '') || invalidEmail,
          }}
          inputProps={{
            label: t('auth.email'),
            placeholder: 'email@example.com',
            keyboardType: 'email-address',
            autoCapitalize: 'none',
            autoComplete: 'email',
            returnKeyType: 'done',
            onSubmitEditing: submit,
          }}
        />

        {rootError && (
          <View className="bg-destructive/10 p-3 rounded-lg">
            <Text className="text-destructive text-sm">{rootError}</Text>
          </View>
        )}

        <Button
          variant="primary"
          size="lg"
          onPress={submit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Send Reset Link
        </Button>
      </View>

      <Pressable onPress={() => router.replace('/(auth)/sign-in')} className="mt-8">
        <Text className="text-muted-foreground text-center">
          Remember your password?{' '}
          <Text className="text-primary font-semibold">{t('auth.signIn')}</Text>
        </Text>
      </Pressable>
    </LayoutWrapper>
  )
}
