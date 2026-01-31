import { cn } from '@/shared/lib/utils'
import { View } from '@/tw'
import React, { useEffect } from 'react'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated'

interface ThinkingAnimationProps {
  dotCount?: number
  dotSize?: number
  className?: string
}

function ThinkingDot({ index, dotSize }: { index: number; dotSize: number }) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(0.4)

  useEffect(() => {
    // Staggered animation start
    const delay = index * 150

    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1.3, { duration: 300, easing: Easing.ease }),
          withTiming(1, { duration: 300, easing: Easing.ease }),
        ),
        -1, // infinite
      ),
    )

    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 300, easing: Easing.ease }),
          withTiming(0.4, { duration: 300, easing: Easing.ease }),
        ),
        -1, // infinite
      ),
    )
  }, [index, scale, opacity])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={[
        {
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize / 2,
          backgroundColor: '#9ca3af',
        },
        animatedStyle,
      ]}
    />
  )
}

export function ThinkingAnimation({
  dotCount = 3,
  dotSize = 8,
  className,
}: ThinkingAnimationProps) {
  return (
    <View className={cn('flex-row items-center gap-1', className)}>
      {Array.from({ length: dotCount }).map((_, index) => (
        <ThinkingDot key={index} index={index} dotSize={dotSize} />
      ))}
    </View>
  )
}
