import { useRevenueCat } from '@/shared/context'
import { Button } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import React, { useState } from 'react'

interface RestorePurchaseButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RestorePurchaseButton({
  onSuccess,
  onError,
  variant = 'ghost',
  size = 'sm',
  className,
}: RestorePurchaseButtonProps) {
  const [isRestoring, setIsRestoring] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { restorePurchases, isPremium } = useRevenueCat()

  const handleRestore = async () => {
    setIsRestoring(true)
    setMessage(null)

    try {
      await restorePurchases()

      if (isPremium) {
        setMessage({ type: 'success', text: 'Purchases restored successfully!' })
        onSuccess?.()
      } else {
        setMessage({ type: 'error', text: 'No active purchases found.' })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to restore purchases'
      setMessage({ type: 'error', text: errorMessage })
      onError?.(errorMessage)
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <View className={className}>
      <Button variant={variant} size={size} onPress={handleRestore} isLoading={isRestoring}>
        Restore Purchases
      </Button>

      {message && (
        <Text
          className={`text-xs text-center mt-2 ${
            message.type === 'success' ? 'text-success' : 'text-destructive'
          }`}
        >
          {message.text}
        </Text>
      )}
    </View>
  )
}
