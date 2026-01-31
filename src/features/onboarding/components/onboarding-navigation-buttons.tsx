import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface OnboardingNavigationButtonsProps {
  onNext: () => void
  onPrevious: () => void
  onSkip: () => void
  canGoBack: boolean
  canSkip: boolean
  isLastStep: boolean
  isLoading?: boolean
  nextLabel?: string
  skipLabel?: string
  className?: string
}

export function OnboardingNavigationButtons({
  onNext,
  onPrevious,
  onSkip,
  canGoBack,
  canSkip,
  isLastStep,
  isLoading = false,
  nextLabel,
  skipLabel,
  className,
}: OnboardingNavigationButtonsProps) {
  const { t } = useTranslation()

  return (
    <View className={cn('gap-4', className)}>
      <Button variant="primary" size="lg" onPress={onNext} isLoading={isLoading}>
        {nextLabel ?? (isLastStep ? t('onboarding.getStarted') : t('onboarding.next'))}
      </Button>

      <View className="flex-row justify-between items-center">
        {canGoBack ? (
          <Pressable onPress={onPrevious} className="py-2 px-4">
            <Text className="text-muted-foreground font-medium">← Back</Text>
          </Pressable>
        ) : (
          <View className="py-2 px-4" />
        )}

        {canSkip && !isLastStep ? (
          <Pressable onPress={onSkip} className="py-2 px-4">
            <Text className="text-muted-foreground font-medium">
              {skipLabel ?? t('onboarding.skip')}
            </Text>
          </Pressable>
        ) : (
          <View className="py-2 px-4" />
        )}
      </View>
    </View>
  )
}
