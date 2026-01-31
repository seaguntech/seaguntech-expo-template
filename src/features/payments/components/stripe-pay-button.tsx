import { useStripe } from '@/shared/context/stripe-context'
import { cn } from '@/shared/lib/utils'
import { ActivityIndicator, Pressable, Text, View } from '@/tw'
import React, { useState } from 'react'

interface StripePayButtonProps {
  amount: number
  currency?: string
  productId?: string
  productName?: string
  onSuccess?: (paymentIntentId: string) => void
  onError?: (error: string) => void
  className?: string
  children?: React.ReactNode
}

export function StripePayButton({
  amount,
  currency = 'usd',
  productId,
  productName,
  onSuccess,
  onError,
  className,
  children,
}: StripePayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { createPaymentIntent, presentPaymentSheet, isInitialized } = useStripe()

  const handlePress = async () => {
    if (!isInitialized || isProcessing) return

    setIsProcessing(true)

    try {
      const { clientSecret, paymentIntentId } = await createPaymentIntent({
        amount,
        currency,
        metadata: {
          ...(productId && { productId }),
          ...(productName && { productName }),
        },
      })

      const result = await presentPaymentSheet(clientSecret)

      if (result.success) {
        onSuccess?.(paymentIntentId)
      } else if (result.error && result.error !== 'Payment canceled') {
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
    currency: currency.toUpperCase(),
  }).format(amount / 100)

  return (
    <Pressable
      onPress={handlePress}
      disabled={!isInitialized || isProcessing}
      className={cn(
        'bg-[#635BFF] rounded-lg py-4 px-6 flex-row items-center justify-center',
        (!isInitialized || isProcessing) && 'opacity-50',
        className,
      )}
    >
      {isProcessing ? (
        <ActivityIndicator color="#ffffff" />
      ) : (
        <>
          <View className="mr-2">
            <Text className="text-white font-bold text-lg">S</Text>
          </View>
          {children ?? (
            <Text className="text-white font-semibold text-base">
              Pay with Stripe {formattedPrice}
            </Text>
          )}
        </>
      )}
    </Pressable>
  )
}
