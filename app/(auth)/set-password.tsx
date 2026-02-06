import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/shared/context'
import { FormInput } from '@/shared/ui/forms'
import { LayoutWrapper } from '@/shared/ui/layout'
import { BackButton, Button } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'

type SetPasswordValues = {
  password: string
  confirmPassword: string
}

export default function SetPasswordScreen() {
  const router = useRouter()
  const { updatePassword } = useAuth()
  const [success, setSuccess] = useState(false)

  const {
    control,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordValues>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    shouldFocusError: true,
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const submit = handleSubmit(async (values) => {
    try {
      await updatePassword({
        password: values.password,
        confirmPassword: values.confirmPassword,
      })
      setSuccess(true)
    } catch (err) {
      setError('root', {
        message: err instanceof Error ? err.message : 'Failed to update password',
      })
    }
  })

  if (success) {
    return (
      <LayoutWrapper className="bg-background">
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-center text-foreground">Password updated</Text>
          <Text className="mt-2 text-base text-center text-muted-foreground">
            Your password has been changed successfully.
          </Text>
          <Button
            className="mt-8"
            variant="primary"
            size="lg"
            onPress={() => router.replace('/(protected)/(tabs)')}
          >
            Continue
          </Button>
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
        <Text className="text-3xl font-bold text-foreground">Set new password</Text>
        <Text className="text-base text-muted-foreground mt-2">
          Choose a strong password to secure your account.
        </Text>
      </View>

      <View className="gap-4">
        <FormInput
          control={control}
          name="password"
          testID="auth-newpassword-input"
          rules={{
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters',
            },
          }}
          inputProps={{
            label: 'New password',
            placeholder: 'Enter your new password',
            secureTextEntry: true,
            autoCapitalize: 'none',
            autoComplete: 'password',
            returnKeyType: 'next',
          }}
        />

        <FormInput
          control={control}
          name="confirmPassword"
          testID="auth-reset-confirmpassword-input"
          rules={{
            required: 'Please confirm your password',
            validate: (value) => value === getValues('password') || 'Passwords do not match',
          }}
          inputProps={{
            label: 'Confirm password',
            placeholder: 'Re-enter your new password',
            secureTextEntry: true,
            autoCapitalize: 'none',
            autoComplete: 'password',
            returnKeyType: 'done',
            onSubmitEditing: submit,
          }}
        />

        {errors.root?.message && (
          <View className="bg-destructive/10 p-3 rounded-lg">
            <Text className="text-destructive text-sm">{errors.root.message}</Text>
          </View>
        )}

        <Button
          variant="primary"
          size="lg"
          onPress={submit}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          testID="auth-updatepassword-button"
        >
          Update password
        </Button>
      </View>
    </LayoutWrapper>
  )
}
