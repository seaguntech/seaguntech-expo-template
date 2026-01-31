import { cn } from '@/shared/lib/utils'
import { Pressable, Text, View } from '@/tw'
import React from 'react'

interface ChatHeaderProps {
  title?: string
  subtitle?: string
  onClear?: () => void
  onSettings?: () => void
  isStreaming?: boolean
  className?: string
}

export function ChatHeader({
  title = 'AI Assistant',
  subtitle,
  onClear,
  onSettings,
  isStreaming = false,
  className,
}: ChatHeaderProps) {
  return (
    <View
      className={cn(
        'flex-row items-center justify-between px-4 py-3 border-b border-border bg-card',
        className,
      )}
    >
      <View className="flex-1">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-primary/10 rounded-full items-center justify-center mr-2">
            <Text className="text-lg">🤖</Text>
          </View>
          <View>
            <Text className="font-semibold text-foreground">{title}</Text>
            {subtitle && <Text className="text-xs text-muted-foreground">{subtitle}</Text>}
            {isStreaming && <Text className="text-xs text-primary">Generating response...</Text>}
          </View>
        </View>
      </View>

      <View className="flex-row gap-2">
        {onClear && (
          <Pressable
            onPress={onClear}
            className="w-8 h-8 rounded-full bg-muted items-center justify-center"
          >
            <Text className="text-muted-foreground">🗑</Text>
          </Pressable>
        )}
        {onSettings && (
          <Pressable
            onPress={onSettings}
            className="w-8 h-8 rounded-full bg-muted items-center justify-center"
          >
            <Text className="text-muted-foreground">⚙</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}
