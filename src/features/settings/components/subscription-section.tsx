import { useRevenueCat } from '@/shared/context/revenue-cat-context'
import { formatDate } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { SettingsSection } from './settings-section'

interface SubscriptionSectionProps {
  className?: string
}

export function SubscriptionSection({ className }: SubscriptionSectionProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const { isPremium, isOnTrial, expirationDate } = useRevenueCat()

  return (
    <View className={className}>
      <SettingsSection title="Subscription">
        <Pressable
          onPress={() => router.push('/(protected)/(tabs)/premium')}
          className="flex-row items-center justify-between py-2"
        >
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-3">{isPremium ? '👑' : '⭐'}</Text>
            <View>
              <Text className="text-base font-medium text-foreground">
                {isPremium ? 'Premium Plan' : 'Free Plan'}
              </Text>
              {isPremium && expirationDate && (
                <Text className="text-sm text-muted-foreground">
                  {t('premium.expiresOn', { date: formatDate(expirationDate) })}
                </Text>
              )}
            </View>
          </View>
          <View className="flex-row items-center">
            <Badge variant={isPremium ? (isOnTrial ? 'warning' : 'success') : 'secondary'}>
              {isPremium ? (isOnTrial ? t('premium.trial') : t('premium.active')) : 'Free'}
            </Badge>
            <Text className="text-muted-foreground ml-2">→</Text>
          </View>
        </Pressable>
      </SettingsSection>
    </View>
  )
}
