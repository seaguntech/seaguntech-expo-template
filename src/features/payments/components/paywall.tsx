import { useRevenueCat } from '@/shared/context/revenue-cat-context'
import { cn } from '@/shared/lib/utils'
import { Button, Card, CardContent } from '@/shared/ui/primitives'
import { Pressable, ScrollView, Text, View } from '@/tw'
import type { Offering, Package } from '@/types'
import React, { useEffect, useState } from 'react'

interface PaywallProps {
  onPurchaseSuccess?: () => void
  onPurchaseError?: (error: string) => void
  onRestore?: () => void
  onClose?: () => void
  className?: string
}

export function Paywall({
  onPurchaseSuccess,
  onPurchaseError,
  onRestore,
  onClose,
  className,
}: PaywallProps) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [currentOffering, setCurrentOffering] = useState<Offering | null>(null)
  const { getOfferings, purchasePackage, restorePurchases, isLoading, error, offerings } =
    useRevenueCat()

  useEffect(() => {
    loadOfferings()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (offerings?.current) {
      setCurrentOffering(offerings.current)
      // Auto-select annual package if available
      if (offerings.current.annual) {
        setSelectedPackage(offerings.current.annual)
      } else if (offerings.current.availablePackages.length > 0) {
        setSelectedPackage(offerings.current.availablePackages[0])
      }
    }
  }, [offerings])

  const loadOfferings = async () => {
    try {
      await getOfferings()
    } catch (err) {
      onPurchaseError?.(err instanceof Error ? err.message : 'Failed to load offerings')
    }
  }

  const handlePurchase = async () => {
    if (!selectedPackage) return

    try {
      await purchasePackage(selectedPackage)
      onPurchaseSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Purchase failed'
      if (!message.includes('cancelled') && !message.includes('canceled')) {
        onPurchaseError?.(message)
      }
    }
  }

  const handleRestore = async () => {
    try {
      await restorePurchases()
      onRestore?.()
    } catch (err) {
      onPurchaseError?.(err instanceof Error ? err.message : 'Restore failed')
    }
  }

  const getPackageLabel = (pkg: Package): string => {
    switch (pkg.packageType) {
      case 'LIFETIME':
        return 'Lifetime'
      case 'ANNUAL':
        return 'Annual'
      case 'SIX_MONTH':
        return '6 Months'
      case 'THREE_MONTH':
        return '3 Months'
      case 'TWO_MONTH':
        return '2 Months'
      case 'MONTHLY':
        return 'Monthly'
      case 'WEEKLY':
        return 'Weekly'
      default:
        return pkg.identifier
    }
  }

  const getSavingsPercentage = (pkg: Package): number | null => {
    if (!currentOffering?.monthly || pkg.packageType === 'MONTHLY') return null

    const monthlyPrice = currentOffering.monthly.product.price
    let months = 1

    switch (pkg.packageType) {
      case 'ANNUAL':
        months = 12
        break
      case 'SIX_MONTH':
        months = 6
        break
      case 'THREE_MONTH':
        months = 3
        break
      case 'TWO_MONTH':
        months = 2
        break
      default:
        return null
    }

    const equivalentMonthly = pkg.product.price / months
    const savings = ((monthlyPrice - equivalentMonthly) / monthlyPrice) * 100

    return Math.round(savings)
  }

  if (!currentOffering) {
    return (
      <View className={cn('flex-1 justify-center items-center', className)}>
        <Text className="text-muted-foreground">Loading...</Text>
      </View>
    )
  }

  return (
    <ScrollView className={cn('flex-1', className)} contentContainerClassName="p-6">
      <View className="items-center mb-8">
        <View className="w-20 h-20 bg-primary/10 rounded-full items-center justify-center mb-4">
          <Text className="text-4xl">✨</Text>
        </View>
        <Text className="text-2xl font-bold text-foreground text-center">Unlock Premium</Text>
        <Text className="text-muted-foreground text-center mt-2">
          Get access to all features and content
        </Text>
      </View>

      <Card className="mb-6">
        <CardContent className="py-4">
          <FeatureItem icon="🚀" text="Unlimited access to all features" />
          <FeatureItem icon="🎨" text="Premium themes and customization" />
          <FeatureItem icon="☁️" text="Cloud sync across devices" />
          <FeatureItem icon="🔒" text="Priority support" />
          <FeatureItem icon="🚫" text="No ads" isLast />
        </CardContent>
      </Card>

      <View className="gap-3 mb-6">
        {currentOffering.availablePackages.map((pkg) => {
          const isSelected = selectedPackage?.identifier === pkg.identifier
          const savings = getSavingsPercentage(pkg)

          return (
            <Pressable
              key={pkg.identifier}
              onPress={() => setSelectedPackage(pkg)}
              className={cn(
                'border-2 rounded-xl p-4 flex-row items-center',
                isSelected ? 'border-primary bg-primary/5' : 'border-border',
              )}
            >
              <View
                className={cn(
                  'w-6 h-6 rounded-full border-2 mr-3 items-center justify-center',
                  isSelected ? 'border-primary' : 'border-muted-foreground',
                )}
              >
                {isSelected && <View className="w-3 h-3 rounded-full bg-primary" />}
              </View>

              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-semibold text-foreground">{getPackageLabel(pkg)}</Text>
                  {savings && savings > 0 && (
                    <View className="bg-success/20 px-2 py-0.5 rounded ml-2">
                      <Text className="text-success text-xs font-medium">Save {savings}%</Text>
                    </View>
                  )}
                </View>
                <Text className="text-sm text-muted-foreground mt-0.5">
                  {pkg.product.description}
                </Text>
              </View>

              <Text className="font-bold text-foreground">{pkg.product.priceString}</Text>
            </Pressable>
          )
        })}
      </View>

      {error && (
        <View className="bg-destructive/10 p-3 rounded-lg mb-4">
          <Text className="text-destructive text-sm text-center">{error}</Text>
        </View>
      )}

      <Button
        variant="primary"
        size="lg"
        onPress={handlePurchase}
        isLoading={isLoading}
        disabled={!selectedPackage}
        className="mb-3"
      >
        {isLoading ? 'Processing...' : 'Continue'}
      </Button>

      <Button variant="ghost" size="sm" onPress={handleRestore} disabled={isLoading}>
        Restore Purchases
      </Button>

      {onClose && (
        <Button variant="link" size="sm" onPress={onClose} className="mt-2">
          Maybe Later
        </Button>
      )}

      <Text className="text-xs text-muted-foreground text-center mt-4 px-4">
        By continuing, you agree to our Terms of Service and Privacy Policy. Subscriptions
        auto-renew unless cancelled.
      </Text>
    </ScrollView>
  )
}

function FeatureItem({
  icon,
  text,
  isLast = false,
}: {
  icon: string
  text: string
  isLast?: boolean
}) {
  return (
    <View className={cn('flex-row items-center py-3', !isLast && 'border-b border-border')}>
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className="text-foreground">{text}</Text>
    </View>
  )
}
