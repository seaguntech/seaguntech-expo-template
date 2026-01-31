import { useProfileStore } from '@/shared/stores/profile-store'
import { Avatar, Card, CardContent } from '@/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import { useRouter } from 'expo-router'

interface ProfileSectionProps {
  className?: string
}

export function ProfileSection({ className }: ProfileSectionProps) {
  const router = useRouter()
  const { displayName, email, avatarUrl, isPremium } = useProfileStore()

  return (
    <View className={className}>
      <Pressable onPress={() => router.push('/(protected)/(tabs)/profile')}>
        <Card variant="outlined">
          <CardContent>
            <View className="flex-row items-center">
              <Avatar src={avatarUrl} fallback={displayName ?? email} size="lg" />
              <View className="flex-1 ml-4">
                <Text className="text-lg font-semibold text-foreground">
                  {displayName ?? 'User'}
                </Text>
                <Text className="text-sm text-muted-foreground">{email}</Text>
                {isPremium && <Text className="text-xs text-warning mt-1">👑 Premium</Text>}
              </View>
              <Text className="text-muted-foreground">→</Text>
            </View>
          </CardContent>
        </Card>
      </Pressable>
    </View>
  )
}
