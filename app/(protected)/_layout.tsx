import { useOnboardingStore } from '@/features/onboarding'
import { useAuth } from '@/shared/context'
import { ActivityIndicator, Text, View } from '@/tw'
import { Stack, useRouter } from 'expo-router'
import { useEffect } from 'react'

export default function ProtectedLayout() {
  const router = useRouter()
  const { isAuthenticated, isInitializing } = useAuth()
  const { isCompleted: onboardingCompleted } = useOnboardingStore()

  useEffect(() => {
    if (isInitializing) return

    // If not authenticated, redirect to auth
    if (!isAuthenticated) {
      router.replace('/(auth)/welcome')
      return
    }

    // If onboarding not completed, redirect to onboarding
    if (!onboardingCompleted) {
      router.replace('/onboarding')
      return
    }
  }, [router, isAuthenticated, isInitializing, onboardingCompleted])

  // Show loading while checking auth
  if (isInitializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="text-muted-foreground mt-4">Loading...</Text>
      </View>
    )
  }

  // Don't render protected content if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="privacy-policy"
        options={{
          headerShown: true,
          title: 'Privacy Policy',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="terms-of-service"
        options={{
          headerShown: true,
          title: 'Terms of Service',
          presentation: 'card',
        }}
      />
    </Stack>
  )
}
