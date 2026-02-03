import { Button, Card, CardContent } from '@/shared/ui'
import { ScrollView, Text, View } from '@/tw'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function AIScreen() {
  const { t } = useTranslation()

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-1 justify-center items-center p-6"
      testID="ai-screen"
    >
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
          <Text className="text-5xl">🤖</Text>
        </View>
        <Text className="text-2xl font-bold text-foreground text-center">{t('ai.title')}</Text>
        <Text className="text-base text-muted-foreground text-center mt-2">
          Chat with AI to boost your productivity
        </Text>
      </View>

      <Card variant="outlined" className="w-full mb-6">
        <CardContent>
          <Text className="text-sm text-muted-foreground text-center">
            AI chat functionality will be implemented in Phase 9. This screen will feature:
          </Text>
          <View className="mt-4 gap-2">
            <FeatureItem text="Real-time streaming responses" />
            <FeatureItem text="Multiple prompt presets" />
            <FeatureItem text="Message history" />
            <FeatureItem text="Copy & regenerate actions" />
          </View>
        </CardContent>
      </Card>

      <Button variant="primary" size="lg" disabled>
        Coming Soon
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
