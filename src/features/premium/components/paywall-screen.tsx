import { Paywall } from '@/features/payments/components/paywall'
import { Pressable, SafeAreaView, Text, View } from '@/tw'
import { useRouter } from 'expo-router'
import React from 'react'

interface PaywallScreenProps {
  onSuccess?: () => void
  showCloseButton?: boolean
}

export function PaywallScreen({ onSuccess, showCloseButton = true }: PaywallScreenProps) {
  const router = useRouter()

  const handleSuccess = () => {
    onSuccess?.()
    router.back()
  }

  const handleClose = () => {
    router.back()
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {showCloseButton && (
        <View className="absolute top-4 right-4 z-10">
          <Pressable
            onPress={handleClose}
            className="w-8 h-8 rounded-full bg-muted items-center justify-center"
          >
            <Text className="text-muted-foreground text-lg">✕</Text>
          </Pressable>
        </View>
      )}

      <Paywall
        onPurchaseSuccess={handleSuccess}
        onPurchaseError={(_error: string) => {
          // Error is displayed within Paywall component
        }}
        onRestore={handleSuccess}
        onClose={showCloseButton ? handleClose : undefined}
      />
    </SafeAreaView>
  )
}
