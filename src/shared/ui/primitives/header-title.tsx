import { cn } from '@/shared/lib/utils'
import { Text } from '@/tw'
import React from 'react'
import Animated, { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'

interface HeaderTitleProps {
  title: string
  scrollY?: SharedValue<number>
  fadeStart?: number
  fadeEnd?: number
  className?: string
}

export function HeaderTitle({
  title,
  scrollY,
  fadeStart = 0,
  fadeEnd = 100,
  className,
}: HeaderTitleProps) {
  const animatedStyle = useAnimatedStyle(() => {
    if (!scrollY) return {}

    const opacity = interpolate(scrollY.value, [fadeStart, fadeEnd], [0, 1], 'clamp')

    const translateY = interpolate(scrollY.value, [fadeStart, fadeEnd], [10, 0], 'clamp')

    return {
      opacity,
      transform: [{ translateY }],
    }
  })

  if (scrollY) {
    return (
      <Animated.View style={animatedStyle}>
        <Text className={cn('text-lg font-semibold text-foreground', className)}>{title}</Text>
      </Animated.View>
    )
  }

  return <Text className={cn('text-lg font-semibold text-foreground', className)}>{title}</Text>
}
