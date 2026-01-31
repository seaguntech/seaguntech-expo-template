import { cn } from '@/shared/lib/utils'
import { Pressable, Text, useCSSVariable, View } from '@/tw'
import React from 'react'
import { Switch } from 'react-native'

interface ToggleProps {
  value?: boolean
  onValueChange?: (value: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Toggle({
  value = false,
  onValueChange,
  label,
  description,
  disabled = false,
  className,
}: ToggleProps) {
  const primaryColor = useCSSVariable('--color-primary')
  const mutedColor = useCSSVariable('--color-muted')

  const handlePress = () => {
    if (disabled) return
    onValueChange?.(!value)
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn(
        'flex-row items-center justify-between py-2',
        disabled && 'opacity-50',
        className,
      )}
    >
      {(label || description) && (
        <View className="flex-1 mr-4">
          {label && <Text className="text-base text-foreground">{label}</Text>}
          {description && (
            <Text className="text-sm text-muted-foreground mt-0.5">{description}</Text>
          )}
        </View>
      )}
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: mutedColor as string, true: primaryColor as string }}
        thumbColor="#ffffff"
      />
    </Pressable>
  )
}
