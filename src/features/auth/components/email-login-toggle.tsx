import { cn } from '@/shared/lib/utils'
import { Pressable, Text, View } from '@/tw'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface EmailLoginToggleProps {
  mode: 'sign-in' | 'sign-up'
  onToggle: () => void
  className?: string
}

export function EmailLoginToggle({ mode, onToggle, className }: EmailLoginToggleProps) {
  const { t } = useTranslation()

  return (
    <View className={cn('flex-row justify-center items-center', className)}>
      <Text className="text-muted-foreground">
        {mode === 'sign-in' ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
      </Text>
      <Pressable onPress={onToggle} className="ml-1">
        <Text className="text-primary font-semibold">
          {mode === 'sign-in' ? t('auth.signUp') : t('auth.signIn')}
        </Text>
      </Pressable>
    </View>
  )
}
