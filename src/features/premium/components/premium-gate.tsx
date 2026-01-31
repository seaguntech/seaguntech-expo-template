import { usePremiumStatus } from '@/features/premium/hooks/use-premium-status'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import { useRouter } from 'expo-router'
import React from 'react'

interface PremiumGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  showUpgradePrompt?: boolean
  featureName?: string
  className?: string
}

export function PremiumGate({
  children,
  fallback,
  showUpgradePrompt = true,
  featureName = 'this feature',
  className,
}: PremiumGateProps) {
  const { canAccessPremiumFeatures, isLoading } = usePremiumStatus()
  const router = useRouter()

  if (isLoading) {
    return (
      <View className={cn('flex-1 justify-center items-center', className)}>
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    )
  }

  if (canAccessPremiumFeatures) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showUpgradePrompt) {
    return null
  }

  return (
    <View className={cn('flex-1 justify-center items-center p-6', className)}>
      <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-6">
        <Text className="text-4xl">🔒</Text>
      </View>

      <Text className="text-xl font-bold text-foreground text-center mb-2">Premium Feature</Text>

      <Text className="text-muted-foreground text-center mb-6">
        Upgrade to Premium to unlock {featureName} and many more features.
      </Text>

      <Button
        variant="primary"
        size="lg"
        onPress={() => router.push('/(protected)/(tabs)/premium')}
      >
        Upgrade to Premium
      </Button>

      <Pressable onPress={() => router.back()} className="mt-4">
        <Text className="text-muted-foreground">Maybe Later</Text>
      </Pressable>
    </View>
  )
}
