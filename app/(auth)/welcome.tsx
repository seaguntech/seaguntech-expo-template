import { LayoutWrapper } from '@/shared/ui/layout'
import { Button } from '@/shared/ui/primitives'
import { Image, Text, View } from '@/tw'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function WelcomeScreen() {
  const router = useRouter()
  const { t } = useTranslation()

  return (
    <LayoutWrapper
      className="bg-background"
      safeArea={true}
      scrollable={true}
      contentContainerClassName="justify-center px-6 py-12"
    >
      <View className="items-center mb-12">
        <Image
          source={require('@/assets/logo/tran-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <Text className="text-3xl font-bold text-foreground text-center">Seaguntech</Text>
        <Text className="text-base text-muted-foreground text-center mt-2">
          Your all-in-one productivity app
        </Text>
      </View>

      <View className="mb-12">
        <FeatureItem
          icon="🤖"
          title="AI Assistant"
          description="Chat with AI to boost your productivity"
        />
        <FeatureItem
          icon="✅"
          title="Task Management"
          description="Organize and track your tasks effortlessly"
        />
        <FeatureItem
          icon="☁️"
          title="Cloud Sync"
          description="Your data synced across all devices"
        />
      </View>

      <View className="gap-3">
        <Button variant="primary" size="lg" onPress={() => router.push('/(auth)/sign-up')}>
          {t('auth.createAccount')}
        </Button>
        <Button variant="outline" size="lg" onPress={() => router.push('/(auth)/sign-in')}>
          {t('auth.signIn')}
        </Button>
      </View>

      <Text className="text-xs text-muted-foreground text-center mt-8 px-4">
        {t('auth.termsAgreement')}
      </Text>
    </LayoutWrapper>
  )
}

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <View className="flex-row items-center mb-4">
      <View className="w-12 h-12 bg-primary/10 rounded-xl items-center justify-center mr-4">
        <Text className="text-2xl">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground">{description}</Text>
      </View>
    </View>
  )
}
