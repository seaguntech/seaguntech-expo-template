import { useProfile } from '@/features/profile'
import { useAuth } from '@/shared/context'
import { formatDate } from '@/shared/lib/utils'
import { useProfileStore } from '@/shared/stores'
import { Avatar, Badge, Button, Card, CardContent } from '@/shared/ui'
import { Pressable, ScrollView, Text, View } from '@/tw'
import { useRouter } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function ProfileScreen() {
  const router = useRouter()
  const { t } = useTranslation()
  const { user, signOut } = useAuth()
  const { profile } = useProfile()
  const { displayName, avatarUrl, isPremium } = useProfileStore()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/(auth)/welcome')
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-6"
      testID="profile-screen"
    >
      <View className="items-center mb-6">
        <View className="relative">
          <Avatar src={avatarUrl} fallback={displayName ?? user?.email} size="xl" />
          {isPremium && (
            <View className="absolute -bottom-1 -right-1 bg-warning rounded-full p-1">
              <Text className="text-sm">👑</Text>
            </View>
          )}
        </View>
        <Text className="text-2xl font-bold text-foreground mt-4">{displayName ?? 'User'}</Text>
        <Text className="text-base text-muted-foreground">{user?.email}</Text>
        {isPremium && (
          <Badge variant="warning" className="mt-2">
            Premium Member
          </Badge>
        )}
      </View>

      <Button
        variant="outline"
        size="md"
        onPress={() => {
          /* TODO: Navigate to edit profile */
        }}
        className="mb-6"
      >
        {t('profile.editProfile')}
      </Button>

      <Text className="text-lg font-semibold text-foreground mb-3">{t('profile.accountInfo')}</Text>
      <Card variant="outlined" className="mb-6">
        <CardContent>
          <ProfileRow label="Email" value={user?.email ?? '-'} />
          <ProfileRow label="Display Name" value={displayName ?? 'Not set'} />
          <ProfileRow label="Phone" value={profile?.phone ?? 'Not set'} />
          <ProfileRow
            label={t('profile.memberSince')}
            value={user?.createdAt ? formatDate(user.createdAt) : '-'}
            isLast
          />
        </CardContent>
      </Card>

      <Card variant="outlined" className="mb-6">
        <CardContent>
          <QuickLink
            icon="⭐"
            label="Premium Status"
            onPress={() => router.push('/(protected)/(tabs)/premium')}
          />
          <QuickLink
            icon="🔔"
            label="Notifications"
            onPress={() => router.push('/(protected)/(tabs)/notifications')}
          />
          <QuickLink
            icon="⚙️"
            label="Settings"
            onPress={() => router.push('/(protected)/(tabs)/settings')}
            isLast
          />
        </CardContent>
      </Card>

      <Button variant="destructive" size="lg" onPress={handleSignOut}>
        {t('auth.signOut')}
      </Button>
    </ScrollView>
  )
}

function ProfileRow({
  label,
  value,
  isLast = false,
}: {
  label: string
  value: string
  isLast?: boolean
}) {
  return (
    <View className={`flex-row justify-between py-3 ${!isLast ? 'border-b border-border' : ''}`}>
      <Text className="text-muted-foreground">{label}</Text>
      <Text className="text-foreground font-medium">{value}</Text>
    </View>
  )
}

function QuickLink({
  icon,
  label,
  onPress,
  isLast = false,
}: {
  icon: string
  label: string
  onPress: () => void
  isLast?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center py-3 ${!isLast ? 'border-b border-border' : ''}`}
    >
      <Text className="text-xl mr-3">{icon}</Text>
      <Text className="flex-1 text-foreground">{label}</Text>
      <Text className="text-muted-foreground">→</Text>
    </Pressable>
  )
}
