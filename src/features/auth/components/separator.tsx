import { cn } from '@/shared/lib/utils'
import { Text, View } from '@/tw'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface SeparatorProps {
  className?: string
}

export function Separator({ className }: SeparatorProps) {
  const { t } = useTranslation()

  return (
    <View className={cn('flex-row items-center my-6', className)}>
      <View className="flex-1 h-px bg-border" />
      <Text className="mx-4 text-muted-foreground text-sm">{t('auth.orContinueWith')}</Text>
      <View className="flex-1 h-px bg-border" />
    </View>
  )
}
