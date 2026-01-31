import { cn } from '@/shared/lib/utils'
import { Pressable, Text, View } from '@/tw'
import React from 'react'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  className?: string
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  label,
  description,
  disabled = false,
  className,
}: CheckboxProps) {
  const scale = useSharedValue(1)

  const handlePress = () => {
    if (disabled) return
    scale.value = withSpring(0.9, { damping: 15 }, () => {
      scale.value = withSpring(1)
    })
    onCheckedChange?.(!checked)
  }

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn('flex-row items-start', disabled && 'opacity-50', className)}
    >
      <Animated.View style={animatedStyle}>
        <View
          className={cn(
            'w-5 h-5 rounded border-2 items-center justify-center mr-3',
            checked ? 'bg-primary border-primary' : 'bg-background border-input',
          )}
        >
          {checked && <Text className="text-primary-foreground text-xs font-bold">✓</Text>}
        </View>
      </Animated.View>
      {(label || description) && (
        <View className="flex-1">
          {label && <Text className="text-base text-foreground">{label}</Text>}
          {description && (
            <Text className="text-sm text-muted-foreground mt-0.5">{description}</Text>
          )}
        </View>
      )}
    </Pressable>
  )
}
