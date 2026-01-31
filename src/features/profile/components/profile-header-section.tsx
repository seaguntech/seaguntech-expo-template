import { cn } from '@/shared/lib/utils'
import { Avatar, Badge } from '@/shared/ui'
import { Pressable, Text, View } from '@/tw'
import React from 'react'

interface ProfileHeaderSectionProps {
  displayName?: string
  email?: string
  avatarUrl?: string
  isPremium: boolean
  onEditAvatar?: () => void
  className?: string
}

export function ProfileHeaderSection({
  displayName,
  email,
  avatarUrl,
  isPremium,
  onEditAvatar,
  className,
}: ProfileHeaderSectionProps) {
  return (
    <View className={cn('items-center', className)}>
      <Pressable onPress={onEditAvatar} className="relative">
        <Avatar src={avatarUrl} fallback={displayName ?? email} size="xl" />
        <View className="absolute bottom-0 right-0 bg-primary rounded-full p-2">
          <Text className="text-primary-foreground text-xs">📷</Text>
        </View>
        {isPremium && (
          <View className="absolute -top-1 -right-1 bg-warning rounded-full p-1">
            <Text className="text-sm">👑</Text>
          </View>
        )}
      </Pressable>

      <Text className="text-2xl font-bold text-foreground mt-4">{displayName ?? 'User'}</Text>

      <Text className="text-base text-muted-foreground mt-1">{email}</Text>

      {isPremium && (
        <Badge variant="warning" className="mt-3">
          Premium Member
        </Badge>
      )}
    </View>
  )
}
