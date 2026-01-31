import { Button, Card, CardContent } from '@/shared/ui'
import { ScrollView, Text, View } from '@/tw'
import React from 'react'

export default function PaymentScreen() {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-1 justify-center items-center p-6"
    >
      <View className="items-center mb-8">
        <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4">
          <Text className="text-5xl">💳</Text>
        </View>
        <Text className="text-2xl font-bold text-foreground text-center">One-Time Purchases</Text>
        <Text className="text-base text-muted-foreground text-center mt-2">
          Unlock individual features with Stripe
        </Text>
      </View>

      <Card variant="outlined" className="w-full mb-6">
        <CardContent>
          <Text className="text-sm text-muted-foreground text-center">
            Stripe payment integration will be implemented in Phase 8. Features include:
          </Text>
          <View className="mt-4 gap-2">
            <FeatureItem text="Secure payment sheet" />
            <FeatureItem text="Apple Pay & Google Pay" />
            <FeatureItem text="One-time purchases" />
            <FeatureItem text="Payment history" />
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
