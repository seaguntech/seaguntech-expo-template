import { cn } from '@/shared/lib/utils'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Button } from './button'

interface BackButtonProps {
  /**
   * Show back button text
   */
  showTextBack?: boolean
  /**
   * Custom onPress handler. If not provided, defaults to router.back()
   */
  onPress?: () => void
  /**
   * Additional className for styling customization
   */
  className?: string
}

export function BackButton({ showTextBack = false, onPress, className }: BackButtonProps) {
  const router = useRouter()

  const handlePress = () => {
    if (router.canGoBack()) {
      router.back()
    }

    onPress?.()
  }

  return (
    <Button
      variant="ghost"
      className={cn('justify-start px-0 absolute top-4 left-2', className)}
      size="lg"
      onPress={handlePress}
      leftIcon={<Ionicons name="chevron-back" size={24} color="#007AFF" />}
    >
      {showTextBack ? 'Back' : ''}
    </Button>
  )
}
