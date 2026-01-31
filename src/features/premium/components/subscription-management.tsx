import { useRevenueCat } from '@/shared/context/revenue-cat-context'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/shared/ui/primitives/card'
import { Text, View } from '@/tw'

export function SubscriptionManagement() {
  const {
    isPremium,
    isOnTrial,
    expirationDate,
    isLoading,
    presentPaywall,
    presentCustomerCenter,
    restorePurchases,
  } = useRevenueCat()

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Loading subscription info...</Text>
      </View>
    )
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <Text className="text-xl font-bold">{isPremium ? 'Premium Active' : 'Go Premium'}</Text>
      </CardHeader>
      <CardContent>
        {isPremium ? (
          <View>
            <Text className="text-gray-600">You have active access to seaguntech Pro.</Text>
            {isOnTrial && (
              <Text className="mt-2 text-blue-600 font-medium">
                You are currently on a free trial.
              </Text>
            )}
            {expirationDate && (
              <Text className="mt-2 text-gray-500 text-sm">
                Expires on: {new Date(expirationDate).toLocaleDateString()}
              </Text>
            )}
          </View>
        ) : (
          <Text className="text-gray-600">
            Unlock all features with seaguntech Pro. Choose from Monthly, Yearly, or Lifetime plans.
          </Text>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-3">
        {!isPremium ? (
          <Button onPress={presentPaywall} variant="primary">
            <Text>Show Subscription Options</Text>
          </Button>
        ) : (
          <Button onPress={presentCustomerCenter} variant="outline">
            <Text>Manage Subscription</Text>
          </Button>
        )}

        <Button onPress={restorePurchases} variant="ghost">
          <Text>Restore Purchases</Text>
        </Button>
      </CardFooter>
    </Card>
  )
}
