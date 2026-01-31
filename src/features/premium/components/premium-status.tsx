import { usePremiumStatus } from '@/features/premium/hooks/use-premium-status'
import { cn } from '@/shared/lib/utils'
import { Badge, Button, Card, CardContent } from '@/shared/ui/primitives'
import { Text, View } from '@/tw'
import { useRouter } from 'expo-router'

interface PremiumStatusProps {
  showManageButton?: boolean
  className?: string
}

export function PremiumStatus({ showManageButton = true, className }: PremiumStatusProps) {
  const { isPremium, isOnTrial, subscriptionStatus, expirationDate, daysRemaining, isLoading } =
    usePremiumStatus()
  const router = useRouter()

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-4">
          <View className="h-16 justify-center items-center">
            <Text className="text-muted-foreground">Loading...</Text>
          </View>
        </CardContent>
      </Card>
    )
  }

  const getStatusColor = () => {
    switch (subscriptionStatus) {
      case 'active':
        return 'success'
      case 'trial':
        return 'warning'
      case 'expired':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = () => {
    switch (subscriptionStatus) {
      case 'active':
        return 'Active'
      case 'trial':
        return 'Trial'
      case 'expired':
        return 'Expired'
      default:
        return 'Free'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <Card className={className}>
      <CardContent className="py-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <View
              className={cn(
                'w-10 h-10 rounded-full items-center justify-center mr-3',
                isPremium || isOnTrial ? 'bg-primary/10' : 'bg-muted',
              )}
            >
              <Text className="text-xl">{isPremium || isOnTrial ? '✨' : '👤'}</Text>
            </View>
            <View>
              <Text className="font-semibold text-foreground">
                {isPremium || isOnTrial ? 'Premium Member' : 'Free Plan'}
              </Text>
              <Badge
                variant={getStatusColor() as 'success' | 'warning' | 'destructive' | 'secondary'}
              >
                {getStatusLabel()}
              </Badge>
            </View>
          </View>
        </View>

        {(isPremium || isOnTrial) && expirationDate && (
          <View className="bg-muted/50 rounded-lg p-3 mb-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm text-muted-foreground">
                {isOnTrial ? 'Trial ends' : 'Renews'}
              </Text>
              <Text className="text-sm font-medium text-foreground">
                {formatDate(expirationDate)}
              </Text>
            </View>
            {daysRemaining !== null && daysRemaining <= 7 && (
              <View className="mt-2">
                <Text
                  className={cn(
                    'text-xs',
                    daysRemaining <= 3 ? 'text-destructive' : 'text-warning',
                  )}
                >
                  {daysRemaining === 0
                    ? 'Expires today!'
                    : `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining`}
                </Text>
              </View>
            )}
          </View>
        )}

        {showManageButton && (
          <View>
            {isPremium || isOnTrial ? (
              <Button
                variant="outline"
                size="sm"
                onPress={() => {
                  // Open subscription management
                }}
              >
                Manage Subscription
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onPress={() => router.push('/(protected)/(tabs)/premium')}
              >
                Upgrade to Premium
              </Button>
            )}
          </View>
        )}
      </CardContent>
    </Card>
  )
}
