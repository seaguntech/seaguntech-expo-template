import { cn } from '@/shared/lib/utils'
import { Pressable, Text } from '@/tw'
import AntDesign from '@expo/vector-icons/AntDesign'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface GoogleProviderButtonProps {
  onPress: () => Promise<void>
  isLoading?: boolean
  className?: string
}

export function GoogleProviderButton({
  onPress,
  isLoading = false,
  className,
}: GoogleProviderButtonProps) {
  const { t } = useTranslation()

  return (
    <Pressable
      onPress={onPress}
      disabled={isLoading}
      testID="auth-google-button"
      className={cn(
        'flex-row items-center justify-center bg-white border border-border py-3.5 px-4 rounded-xl',
        isLoading && 'opacity-50',
        className,
      )}
    >
      <AntDesign name="google" size={20} color="red" style={{ marginRight: 12 }} />
      <Text className="text-foreground font-semibold text-base">
        {t('auth.continueWithGoogle')}
      </Text>
    </Pressable>
  )
}
