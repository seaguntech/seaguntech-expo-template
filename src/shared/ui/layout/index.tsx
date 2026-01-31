import { cn } from '@/shared/lib/utils'
import { SafeAreaView, ScrollView, View } from '@/tw'
import React from 'react'

/**
 * LayoutWrapper provides a consistent layout structure for screens.
 *
 * NOTE: This wrapper uses @/tw components consistently.
 * Safe area is handled via SafeAreaView to avoid RN/TW mixing.
 */

interface LayoutWrapperProps {
  children: React.ReactNode
  className?: string
  scrollable?: boolean
  safeArea?: boolean
  keyboardAvoiding?: boolean
  contentContainerClassName?: string
}

export function LayoutWrapper({
  children,
  className = 'bg-background',
  scrollable = false,
  safeArea = true,
  keyboardAvoiding: _keyboardAvoiding = false,
  contentContainerClassName = 'justify-center px-6 py-12',
}: LayoutWrapperProps) {
  const contentWrapperClassName = cn('flex-1', contentContainerClassName)

  const content = scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerClassName={cn('flex-grow', contentContainerClassName)}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className={contentWrapperClassName}>{children}</View>
  )

  const containerClassName = cn('flex-1 bg-background', className)
  const Container = safeArea ? SafeAreaView : View

  return <Container className={containerClassName}>{content}</Container>
}
