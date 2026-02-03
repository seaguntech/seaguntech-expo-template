import { cn, isValidEmail, validatePassword } from '@/shared/lib/utils'
import { FormInput } from '@/shared/ui/forms'
import { Button } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

interface EmailLoginFormProps {
  mode: 'sign-in' | 'sign-up'
  onSubmit: (
    email: string,
    password: string,
    displayName?: string,
    confirmPassword?: string,
  ) => Promise<void>
  isLoading?: boolean
  error?: string | null
  className?: string
}

type EmailLoginValues = {
  email: string
  password: string
  confirmPassword?: string
  displayName?: string
}

export function EmailLoginForm({
  mode,
  onSubmit,
  isLoading = false,
  error,
  className,
}: EmailLoginFormProps) {
  const { t } = useTranslation()
  const [showPassword] = useState(false)

  const emailRequired = t('auth.emailRequired') || 'Email is required'
  const passwordRequired = t('auth.passwordRequired') || 'Password is required'
  const invalidEmail = t('auth.invalidEmail') || 'Please enter a valid email address'
  const passwordMismatch = t('auth.passwordsDoNotMatch') || 'Passwords do not match'
  const displayNameInvalid =
    t('profile.displayNameRequired') || 'Display name must be at least 2 characters'
  const submitFailed = t('auth.signInFailed') || 'Authentication failed'

  const {
    control,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmailLoginValues>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
    },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(
        values.email,
        values.password,
        mode === 'sign-up' ? values.displayName : undefined,
        mode === 'sign-up' ? values.confirmPassword : undefined,
      )
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : submitFailed,
      })
    }
  })

  const rootError = errors.root?.message || error

  return (
    <View className={cn('w-full gap-4', className)}>
      {mode === 'sign-up' && (
        <FormInput
          control={control}
          name="displayName"
          testID="auth-displayname-input"
          rules={{
            validate: (value) => {
              if (!value) return true
              return value.trim().length >= 2 || displayNameInvalid
            },
          }}
          inputProps={{
            label: t('profile.displayName'),
            placeholder: 'John Doe',
            autoCapitalize: 'words',
            autoComplete: 'name',
            returnKeyType: 'next',
          }}
        />
      )}

      <FormInput
        control={control}
        name="email"
        testID="auth-email-input"
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
          returnKeyType: 'next',
        }}
      />

      <FormInput
        control={control}
        name="password"
        testID="auth-password-input"
        rules={{
          required: passwordRequired,
          validate: (value) => {
            if (mode !== 'sign-up') return true
            const validation = validatePassword(value ?? '')
            return validation.isValid || validation.errors[0] || passwordRequired
          },
        }}
        inputProps={{
          label: t('auth.password'),
          placeholder: '••••••••',
          secureTextEntry: !showPassword,
          autoCapitalize: 'none',
          autoComplete: 'password',
          returnKeyType: mode === 'sign-up' ? 'next' : 'done',
          onSubmitEditing: mode === 'sign-in' ? submit : undefined,
        }}
      />

      {mode === 'sign-up' && (
        <FormInput
          control={control}
          name="confirmPassword"
          testID="auth-confirmpassword-input"
          rules={{
            required: passwordRequired,
            validate: (value) => value === getValues('password') || passwordMismatch,
          }}
          inputProps={{
            label: t('auth.confirmPassword'),
            placeholder: '••••••••',
            secureTextEntry: !showPassword,
            autoCapitalize: 'none',
            autoComplete: 'password',
            returnKeyType: 'done',
            onSubmitEditing: submit,
          }}
        />
      )}

      {rootError && (
        <View className="bg-destructive/10 rounded-lg mb-[-10px]">
          <Text className="text-destructive text-lg text-center">{rootError}</Text>
        </View>
      )}

      <Button
        variant="primary"
        size="lg"
        onPress={submit}
        isLoading={isLoading || isSubmitting}
        disabled={isLoading || isSubmitting}
        className={cn('mt-2', rootError && 'mt-0')}
        testID={mode === 'sign-in' ? 'auth-signin-button' : 'auth-signup-button'}
      >
        {mode === 'sign-in' ? t('auth.signIn') : t('auth.createAccount')}
      </Button>
    </View>
  )
}
