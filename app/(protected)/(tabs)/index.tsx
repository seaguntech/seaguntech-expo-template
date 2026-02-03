import { HOME_QUICK_ACTIONS } from '@/constants/quick-actions'
import { useAuth } from '@/shared/context'
import { useProfileStore } from '@/shared/stores'
import { Avatar, Card, CardContent, ProgressBar } from '@/shared/ui'
import { Pressable, ScrollView, Text, View } from '@/tw'
import { useRouter } from 'expo-router'
import React from 'react'

export default function HomeScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { displayName, avatarUrl, isPremium } = useProfileStore()
  const { email } = user ?? {}

  const greeting = getGreeting()

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="p-4 pb-8"
      testID="home-screen"
    >
      <View className="flex-row items-center justify-between mb-6">
        <View className="flex-1">
          <Text className="text-muted-foreground text-base">{greeting}</Text>
          <Text className="text-2xl font-bold text-foreground">
            {displayName ?? email?.split('@')[0] ?? 'User'}
          </Text>
        </View>
        <Pressable onPress={() => router.push('/(protected)/(tabs)/profile')}>
          <Avatar src={avatarUrl} fallback={displayName ?? email} size="lg" />
        </Pressable>
      </View>

      {!isPremium && (
        <Pressable onPress={() => router.push('/(protected)/(tabs)/premium')}>
          <Card variant="elevated" className="mb-6 bg-primary/10">
            <CardContent className="flex-row items-center">
              <View className="flex-1">
                <Text className="text-lg font-semibold text-foreground">Upgrade to Premium</Text>
                <Text className="text-sm text-muted-foreground mt-1">
                  Unlock all features and boost your productivity
                </Text>
              </View>
              <Text className="text-3xl">⭐</Text>
            </CardContent>
          </Card>
        </Pressable>
      )}

      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap gap-3">
          {HOME_QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.id}
              onPress={() => router.push(action.route as never)}
              className="flex-1 min-w-[45%]"
            >
              <Card variant="outlined" padding="md">
                <View className="items-center">
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mb-2"
                    style={{ backgroundColor: `${action.color}20` }}
                  >
                    <Text className="text-2xl">{getActionEmoji(action.id)}</Text>
                  </View>
                  <Text className="text-sm font-medium text-foreground text-center">
                    {action.label}
                  </Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="mb-6">
        <Text className="text-lg font-semibold text-foreground mb-3">Today&apos;s Progress</Text>
        <Card variant="outlined">
          <CardContent>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted-foreground">Tasks Completed</Text>
              <Text className="text-sm font-medium text-foreground">3/5</Text>
            </View>
            <ProgressBar value={60} variant="success" />
          </CardContent>
        </Card>
      </View>

      <View>
        <Text className="text-lg font-semibold text-foreground mb-3">Recent Activity</Text>
        <Card variant="outlined">
          <CardContent>
            <ActivityItem
              icon="✅"
              title="Task completed"
              description="Review project requirements"
              time="2 hours ago"
            />
            <ActivityItem
              icon="💬"
              title="AI Chat"
              description="Asked about React Native best practices"
              time="5 hours ago"
            />
            <ActivityItem
              icon="📝"
              title="Task created"
              description="Design new dashboard layout"
              time="Yesterday"
              isLast
            />
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  )
}

function ActivityItem({
  icon,
  title,
  description,
  time,
  isLast = false,
}: {
  icon: string
  title: string
  description: string
  time: string
  isLast?: boolean
}) {
  return (
    <View className={`flex-row items-start py-3 ${!isLast ? 'border-b border-border' : ''}`}>
      <Text className="text-xl mr-3">{icon}</Text>
      <View className="flex-1">
        <Text className="text-sm font-medium text-foreground">{title}</Text>
        <Text className="text-sm text-muted-foreground">{description}</Text>
      </View>
      <Text className="text-xs text-muted-foreground">{time}</Text>
    </View>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function getActionEmoji(id: string): string {
  const emojis: Record<string, string> = {
    'add-task': '➕',
    'ai-chat': '🤖',
    'view-premium': '⭐',
    notifications: '🔔',
  }
  return emojis[id] ?? '📱'
}
