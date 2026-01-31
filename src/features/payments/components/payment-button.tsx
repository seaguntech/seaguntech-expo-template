import { useStripe } from '@/shared/context/stripe-context'
import { Button } from '@/shared/ui/primitives'
import { View } from '@/tw'
import type { PaymentProduct } from '@/types'
import React, { useState } from 'react'

interface PaymentButtonProps {
  product: PaymentProduct
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
  className?: string
}

export function PaymentButton({ product, onSuccess, onError, className }: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { createPaymentIntent, presentPaymentSheet, isInitialized } = useStripe()

  const handlePress = async () => {
    if (!isInitialized) {
      onError?.('Payment system not initialized')
      return
    }

    setIsProcessing(true)

    try {
      const { clientSecret, paymentIntentId } = await createPaymentIntent({
        amount: product.amount,
        currency: product.currency,
        metadata: {
          productId: product.id,
          productName: product.name,
        },
      })

      const result = await presentPaymentSheet(clientSecret)

      if (result.success) {
        onSuccess?.(paymentIntentId)
      } else if (result.error) {
        onError?.(result.error)
      }
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Payment failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency.toUpperCase(),
  }).format(product.amount / 100)

  return (
    <View className={className}>
      <Button
        variant="primary"
        size="lg"
        onPress={handlePress}
        isLoading={isProcessing}
        disabled={!isInitialized}
      >
        {isProcessing ? 'Processing...' : `Pay ${formattedPrice}`}
      </Button>
    </View>
  )
}
