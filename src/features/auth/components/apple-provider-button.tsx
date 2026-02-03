import { cn } from '@/shared/lib/utils'
import { Pressable, Text, View } from '@/tw'
import AntDesign from '@expo/vector-icons/AntDesign'
import * as AppleAuthentication from 'expo-apple-authentication'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'

interface AppleProviderButtonProps {
  onPress: () => Promise<void>
  isLoading?: boolean
  className?: string
}

export function AppleProviderButton({
  onPress,
  isLoading = false,
  className,
}: AppleProviderButtonProps) {
  const { t } = useTranslation()

  // Only show on iOS
  if (Platform.OS !== 'ios') {
    return null
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      testID="auth-apple-button"
      className={cn(
        'flex-row items-center justify-center bg-black py-3.5 px-4 rounded-xl',
        isLoading && 'opacity-50',
        className,
      )}
    >
      <AntDesign name="apple" size={20} color="#FFFFFF" style={{ marginRight: 12 }} />
      <Text className="text-white font-semibold text-base">{t('auth.continueWithApple')}</Text>
    </Pressable>
  )
}

// Native Apple Sign In Button (alternative)
export function NativeAppleSignInButton({
  onPress,
  className,
}: {
  onPress: (credential: AppleAuthentication.AppleAuthenticationCredential) => void
  className?: string
}) {
  if (Platform.OS !== 'ios') {
    return null
  }

  return (
    <View className={cn('w-full', className)}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={12}
        style={{ width: '100%', height: 50 }}
        onPress={async () => {
          try {
            const credential = await AppleAuthentication.signInAsync({
              requestedScopes: [
                AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                AppleAuthentication.AppleAuthenticationScope.EMAIL,
              ],
            })
            onPress(credential)
          } catch (e: unknown) {
            const error = e as { code?: string }
            if (error.code === 'ERR_REQUEST_CANCELED') {
              // User canceled the sign-in flow
            } else {
              // Other error
              throw e
            }
          }
        }}
      />
    </View>
  )
}
