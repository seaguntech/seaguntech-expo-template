import { useStripe } from '@/shared/context/stripe-context'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import type { PaymentProduct } from '@/types'
import React, { useEffect, useState } from 'react'

interface PaymentSheetProps {
  product: PaymentProduct
  onSuccess?: (paymentIntentId: string) => void
  onCancel?: () => void
  onError?: (error: string) => void
  visible: boolean
}

export function PaymentSheet({
  product,
  onSuccess,
  onCancel,
  onError,
  visible,
}: PaymentSheetProps) {
  const [isReady, setIsReady] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const { createPaymentIntent, presentPaymentSheet, isLoading, error } = useStripe()

  useEffect(() => {
    if (visible && !clientSecret) {
      initializePayment()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, clientSecret])

  const initializePayment = async () => {
    try {
      const { clientSecret: secret, paymentIntentId: id } = await createPaymentIntent({
        amount: product.amount,
        currency: product.currency,
        metadata: {
          productId: product.id,
          productName: product.name,
        },
      })

      setClientSecret(secret)
      setPaymentIntentId(id)
      setIsReady(true)
    } catch (err) {
      onError?.(err instanceof Error ? err.message : 'Failed to initialize payment')
    }
  }

  const handlePay = async () => {
    if (!clientSecret || !paymentIntentId) return

    const result = await presentPaymentSheet(clientSecret)

    if (result.success) {
      onSuccess?.(paymentIntentId)
      // Reset state
      setClientSecret(null)
      setPaymentIntentId(null)
      setIsReady(false)
    } else if (result.error && result.error !== 'Payment canceled') {
      onError?.(result.error)
    }
  }

  const handleCancel = () => {
    setClientSecret(null)
    setPaymentIntentId(null)
    setIsReady(false)
    onCancel?.()
  }

  if (!visible) return null

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: product.currency.toUpperCase(),
  }).format(product.amount / 100)

  return (
    <View className="flex-1 justify-center items-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{product.name}</CardTitle>
          <CardDescription>{product.description}</CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="py-4 items-center">
            <Text className="text-3xl font-bold text-foreground">{formattedPrice}</Text>
            <Text className="text-sm text-muted-foreground mt-1">One-time payment</Text>
          </View>

          {error && (
            <View className="bg-destructive/10 p-3 rounded-lg">
              <Text className="text-destructive text-sm">{error}</Text>
            </View>
          )}

          <View className="gap-3">
            <Button
              variant="primary"
              size="lg"
              onPress={handlePay}
              isLoading={isLoading}
              disabled={!isReady}
            >
              {isLoading ? 'Processing...' : `Pay ${formattedPrice}`}
            </Button>

            <Button variant="ghost" size="lg" onPress={handleCancel} disabled={isLoading}>
              Cancel
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  )
}
