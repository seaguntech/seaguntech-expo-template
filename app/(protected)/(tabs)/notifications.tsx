import { Button, Card, CardContent } from '@/shared/ui'
import { ScrollView, Text, View } from '@/tw'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function NotificationsScreen() {
  const { t } = useTranslation()

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-1 justify-center items-center p-6"
    >
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
          <Text className="text-5xl">🔔</Text>
        </View>
        <Text className="text-2xl font-bold text-foreground text-center">
          {t('notifications.title')}
        </Text>
        <Text className="text-base text-muted-foreground text-center mt-2">
          {t('notifications.noNotifications')}
        </Text>
      </View>

      <Card variant="outlined" className="w-full mb-6">
        <CardContent>
          <Text className="text-sm text-muted-foreground text-center">
            Notifications will be implemented in Phase 9. Features include:
          </Text>
          <View className="mt-4 gap-2">
            <FeatureItem text="Push notification management" />
            <FeatureItem text="Notification center" />
            <FeatureItem text="Permission handling" />
            <FeatureItem text="In-app notifications" />
          </View>
        </CardContent>
      </Card>

      <Button variant="outline" size="lg">
        {t('notifications.enableNotifications')}
      </Button>
    </ScrollView>
  )
}

function FeatureItem({ text }: { text: string }) {
  return (
    <View className="flex-row items-center">
      <Text className="text-primary mr-2">•</Text>
      <Text className="text-sm text-foreground">{text}</Text>
    </View>
  )
}
