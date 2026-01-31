import { cn } from '@/shared/lib/utils'
import { Pressable, Text, View } from '@/tw'
import React from 'react'

interface MessageActionsProps {
  onCopy?: () => void
  onRegenerate?: () => void
  onShare?: () => void
  className?: string
}

export function MessageActions({ onCopy, onRegenerate, onShare, className }: MessageActionsProps) {
  if (!onCopy && !onRegenerate && !onShare) {
    return null
  }

  return (
    <View className={cn('flex-row gap-2', className)}>
      {onCopy && <ActionButton icon="📋" label="Copy" onPress={onCopy} />}
      {onRegenerate && <ActionButton icon="🔄" label="Regenerate" onPress={onRegenerate} />}
      {onShare && <ActionButton icon="📤" label="Share" onPress={onShare} />}
    </View>
  )
}

interface ActionButtonProps {
  icon: string
  label: string
  onPress: () => void
}

function ActionButton({ icon, label, onPress }: ActionButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-2 py-1 rounded-lg bg-muted/50 active:bg-muted"
    >
      <Text className="text-xs mr-1">{icon}</Text>
      <Text className="text-xs text-muted-foreground">{label}</Text>
    </Pressable>
  )
}
