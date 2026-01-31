import { cn } from '@/shared/lib/utils'
import { Pressable, Text, TextInput, View } from '@/tw'
import React, { useCallback, useState } from 'react'
import { type NativeSyntheticEvent, type TextInputContentSizeChangeEventData } from 'react-native'

interface AutoResizingInputProps {
  value: string
  onChangeText: (text: string) => void
  onSend: () => void
  placeholder?: string
  isLoading?: boolean
  isDisabled?: boolean
  maxHeight?: number
  className?: string
}

export function AutoResizingInput({
  value,
  onChangeText,
  onSend,
  placeholder = 'Type a message...',
  isLoading = false,
  isDisabled = false,
  maxHeight = 120,
  className,
}: AutoResizingInputProps) {
  const [inputHeight, setInputHeight] = useState(40)

  const handleContentSizeChange = useCallback(
    (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      const newHeight = Math.min(e.nativeEvent.contentSize.height, maxHeight)
      setInputHeight(Math.max(40, newHeight))
    },
    [maxHeight],
  )

  const handleSend = () => {
    if (value.trim() && !isLoading && !isDisabled) {
      onSend()
    }
  }

  const canSend = value.trim().length > 0 && !isLoading && !isDisabled

  return (
    <View
      className={cn(
        'flex-row items-end bg-card border border-border rounded-2xl px-3 py-2',
        className,
      )}
    >
      <TextInput
        className="flex-1 text-foreground text-base px-1"
        style={{ height: inputHeight, maxHeight }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        multiline
        onContentSizeChange={handleContentSizeChange}
        editable={!isDisabled}
      />

      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        className={cn(
          'w-9 h-9 rounded-full items-center justify-center ml-2',
          canSend ? 'bg-primary' : 'bg-muted',
        )}
      >
        {isLoading ? (
          <View className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Text className={canSend ? 'text-primary-foreground' : 'text-muted-foreground'}>↑</Text>
        )}
      </Pressable>
    </View>
  )
}
