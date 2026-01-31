import { cn } from '@/shared/lib/utils'
import { Text, View } from '@/tw'
import React from 'react'
import { ThinkingAnimation } from './thinking-animation'

interface AIThinkingLoaderProps {
  message?: string
  className?: string
}

export function AIThinkingLoader({ message = 'Thinking...', className }: AIThinkingLoaderProps) {
  return (
    <View
      className={cn(
        'flex-row items-center bg-muted/50 rounded-2xl px-4 py-3 self-start max-w-[80%]',
        className,
      )}
    >
      <ThinkingAnimation />
      <Text className="text-muted-foreground ml-2 text-sm">{message}</Text>
    </View>
  )
}
