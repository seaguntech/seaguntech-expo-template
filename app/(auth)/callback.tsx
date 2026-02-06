import { LayoutWrapper } from '@/shared/ui/layout'
import { ActivityIndicator, Text, View } from '@/tw'
import { useAuthCallback } from '@/features/auth/hooks/use-auth-callback'

export default function AuthCallbackScreen() {
  const { status, message, router } = useAuthCallback()

  return (
    <LayoutWrapper className="bg-background">
      <View className="flex-1 items-center justify-center px-6">
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" />
            <Text className="mt-4 text-base text-muted-foreground">{message}</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <Text className="text-center text-2xl font-bold text-foreground">Success</Text>
            <Text className="mt-2 text-center text-base text-muted-foreground">{message}</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <Text className="text-center text-2xl font-bold text-destructive">
              Authentication failed
            </Text>
            <Text className="mt-2 text-center text-base text-muted-foreground">{message}</Text>

            <Text
              className="mt-6 font-semibold text-primary text-center"
              onPress={() => router.replace('/(auth)/sign-in')}
            >
              Back to sign in
            </Text>
          </>
        )}
      </View>
    </LayoutWrapper>
  )
}
