import { Button } from '@/shared/ui'
import { Text, View } from '@/tw'
import { useRouter } from 'expo-router'

export default function NotFoundScreen() {
  const router = useRouter()

  return (
    <View className="flex-1 items-center justify-center bg-background p-6">
      <Text className="text-6xl mb-4">🔍</Text>
      <Text className="text-2xl font-bold text-foreground mb-2">Page Not Found</Text>
      <Text className="text-base text-muted-foreground text-center mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </Text>
      <Button variant="primary" size="lg" onPress={() => router.replace('/')}>
        Go Home
      </Button>
    </View>
  )
}
