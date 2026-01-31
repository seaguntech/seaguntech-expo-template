import { cn } from '@/shared/lib/utils'
import { View } from '@/tw'
import React from 'react'
import { AppleProviderButton } from './apple-provider-button'
import { GoogleProviderButton } from './google-provider-button'

interface SocialLoginButtonsProps {
  onGooglePress: () => Promise<void>
  onApplePress: () => Promise<void>
  isLoading?: boolean
  className?: string
}

export function SocialLoginButtons({
  onGooglePress,
  onApplePress,
  isLoading = false,
  className,
}: SocialLoginButtonsProps) {
  return (
    <View className={cn('w-full gap-3', className)}>
      <GoogleProviderButton onPress={onGooglePress} isLoading={isLoading} />
      <AppleProviderButton onPress={onApplePress} isLoading={isLoading} />
    </View>
  )
}
