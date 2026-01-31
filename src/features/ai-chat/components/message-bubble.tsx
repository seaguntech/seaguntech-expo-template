import { cn } from '@/shared/lib/utils'
import { Text, View } from '@/tw'
import type { Message } from '@/types'
import React from 'react'
import { MessageActions } from './message-actions'
import { TypewriterText } from './typewriter-text'

interface MessageBubbleProps {
  message: Message
  isLast?: boolean
  onCopy?: (content: string) => void
  onRegenerate?: () => void
  showActions?: boolean
}

export function MessageBubble({
  message,
  isLast = false,
  onCopy,
  onRegenerate,
  showActions = true,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <View className={cn('mb-3 px-4', isUser ? 'items-end' : 'items-start')}>
      {isAssistant && (
        <View className="flex-row items-center mb-1">
          <View className="w-6 h-6 bg-primary/10 rounded-full items-center justify-center mr-1">
            <Text className="text-xs">🤖</Text>
          </View>
          <Text className="text-xs text-muted-foreground">AI</Text>
        </View>
      )}

      <View
        className={cn(
          'rounded-2xl px-4 py-3 max-w-[85%]',
          isUser ? 'bg-primary rounded-tr-sm' : 'bg-muted/50 rounded-tl-sm',
          message.error && 'bg-destructive/10',
        )}
      >
        {message.error ? (
          <Text className="text-destructive text-sm">{message.error}</Text>
        ) : message.isStreaming ? (
          <TypewriterText
            text={message.content}
            className={isUser ? 'text-primary-foreground' : 'text-foreground'}
          />
        ) : (
          <Text
            className={cn(
              'text-base leading-6',
              isUser ? 'text-primary-foreground' : 'text-foreground',
            )}
          >
            {message.content}
          </Text>
        )}
      </View>

      <Text className="text-xs text-muted-foreground mt-1">{formatTime(message.createdAt)}</Text>

      {isAssistant && showActions && !message.isStreaming && !message.error && (
        <MessageActions
          onCopy={onCopy ? () => onCopy(message.content) : undefined}
          onRegenerate={isLast ? onRegenerate : undefined}
          className="mt-1"
        />
      )}
    </View>
  )
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
