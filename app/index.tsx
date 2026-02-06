import { useOnboardingStore } from '@/features/onboarding'
import { useAuth } from '@/shared/context'
import { ActivityIndicator, Text, View } from '@/tw'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'

export default function IndexScreen() {
  const router = useRouter()
  const { isAuthenticated, isInitializing } = useAuth()
  const onboardingCompleted = useOnboardingStore((state) => state.isCompleted)

  useEffect(() => {
    if (isInitializing) return

    // Determine where to redirect
    if (!isAuthenticated) {
      // Not logged in -> go to welcome
      router.replace('/(auth)/welcome')
    } else if (!onboardingCompleted) {
      // Logged in but onboarding not done -> go to onboarding
      router.replace('/onboarding')
    } else {
      // Logged in and onboarding done -> go to main app
      router.replace('/(protected)/(tabs)')
    }
  }, [router, isAuthenticated, isInitializing, onboardingCompleted])

  // Show loading screen while checking auth
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="w-20 h-20 bg-primary rounded-2xl items-center justify-center mb-6">
        <Text className="text-3xl text-primary-foreground font-bold">S</Text>
      </View>
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="text-muted-foreground mt-4">Loading...</Text>
    </View>
  )
}
