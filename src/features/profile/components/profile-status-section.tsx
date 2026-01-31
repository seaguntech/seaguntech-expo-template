import { formatDate } from '@/shared/lib/utils'
import { Badge, Card, CardContent } from '@/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import { useTranslation } from 'react-i18next'

interface ProfileStatusSectionProps {
  isPremium: boolean
  isOnTrial?: boolean
  expirationDate: string | null
  onManageSubscription?: () => void
  onUpgrade?: () => void
  className?: string
}

export function ProfileStatusSection({
  isPremium,
  isOnTrial = false,
  expirationDate,
  onManageSubscription,
  onUpgrade,
  className,
}: ProfileStatusSectionProps) {
  const { t } = useTranslation()

  return (
    <View className={className}>
      <Text className="text-lg font-semibold text-foreground mb-3">{t('premium.status')}</Text>
      <Card variant="outlined">
        <CardContent>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">{isPremium ? '👑' : '⭐'}</Text>
              <View>
                <Text className="text-lg font-semibold text-foreground">
                  {isPremium ? 'Premium' : 'Free Plan'}
                </Text>
                {isPremium && expirationDate && (
                  <Text className="text-sm text-muted-foreground">
                    {t('premium.expiresOn', {
                      date: formatDate(expirationDate),
                    })}
                  </Text>
                )}
              </View>
            </View>
            <Badge variant={isPremium ? (isOnTrial ? 'warning' : 'success') : 'secondary'}>
              {isPremium ? (isOnTrial ? t('premium.trial') : t('premium.active')) : 'Free'}
            </Badge>
          </View>

          {isPremium ? (
            <Pressable
              onPress={onManageSubscription}
              className="flex-row items-center justify-between py-2"
            >
              <Text className="text-primary font-medium">{t('premium.manageSubscription')}</Text>
              <Text className="text-primary">→</Text>
            </Pressable>
          ) : (
            <Pressable onPress={onUpgrade} className="bg-primary py-3 rounded-lg items-center">
              <Text className="text-primary-foreground font-semibold">{t('premium.upgrade')}</Text>
            </Pressable>
          )}
        </CardContent>
      </Card>
    </View>
  )
}
