import { useRevenueCat } from '@/shared/context'
import { formatDate } from '@/shared/lib/utils'
import { Badge, Button, Card, CardContent } from '@/shared/ui'
import { ScrollView, Text, View } from '@/tw'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function PremiumScreen() {
  const { t } = useTranslation()
  const { isPremium, isOnTrial, expirationDate, isLoading, restorePurchases } = useRevenueCat()

  const handleRestore = async () => {
    try {
      await restorePurchases()
    } catch (error) {
      throw error
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-6"
      testID="premium-screen"
    >
      <Card variant="elevated" className="mb-6 bg-primary/5">
        <CardContent>
          <View className="items-center py-4">
            <Text className="text-5xl mb-4">{isPremium ? '👑' : '⭐'}</Text>
            <View className="flex-row items-center gap-2 mb-2">
              <Text className="text-2xl font-bold text-foreground">
                {isPremium ? 'Premium Member' : 'Free Plan'}
              </Text>
              {isOnTrial && <Badge variant="warning">{t('premium.trial')}</Badge>}
            </View>
            {isPremium && expirationDate && (
              <Text className="text-sm text-muted-foreground">
                {t('premium.expiresOn', { date: formatDate(expirationDate) })}
              </Text>
            )}
          </View>
        </CardContent>
      </Card>

      <Text className="text-lg font-semibold text-foreground mb-3">{t('premium.features')}</Text>
      <Card variant="outlined" className="mb-6">
        <CardContent>
          <PremiumFeature
            icon="🤖"
            title="Advanced AI"
            description="Access to GPT-4 and unlimited conversations"
            included={isPremium}
          />
          <PremiumFeature
            icon="☁️"
            title="Cloud Sync"
            description="Sync across unlimited devices"
            included={isPremium}
          />
          <PremiumFeature
            icon="📊"
            title="Analytics"
            description="Detailed productivity insights"
            included={isPremium}
          />
          <PremiumFeature
            icon="🎨"
            title="Themes"
            description="Custom themes and app icons"
            included={isPremium}
            isLast
          />
        </CardContent>
      </Card>

      {!isPremium && (
        <Button variant="primary" size="lg" className="mb-3">
          {t('premium.upgrade')}
        </Button>
      )}

      <Button variant="outline" size="lg" onPress={handleRestore} isLoading={isLoading}>
        {t('premium.restore')}
      </Button>

      {isPremium && (
        <Button variant="ghost" size="lg" className="mt-3">
          {t('premium.manageSubscription')}
        </Button>
      )}

      <Text className="text-xs text-muted-foreground text-center mt-6">
        {t('premium.cancelAnytime')}
      </Text>
    </ScrollView>
  )
}

function PremiumFeature({
  icon,
  title,
  description,
  included,
  isLast = false,
}: {
  icon: string
  title: string
  description: string
  included: boolean
  isLast?: boolean
}) {
  return (
    <View className={`flex-row items-center py-3 ${!isLast ? 'border-b border-border' : ''}`}>
      <Text className="text-2xl mr-3">{icon}</Text>
      <View className="flex-1">
        <Text className="text-base font-medium text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground">{description}</Text>
      </View>
      <Text className={included ? 'text-success' : 'text-muted-foreground'}>
        {included ? '✓' : '○'}
      </Text>
    </View>
  )
}
