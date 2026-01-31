import { AnimatedView, View } from '@/tw'
import React from 'react'
import { type StyleProp, type ViewStyle } from 'react-native'
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated'

const HEADER_HEIGHT = 250

interface ParallaxScrollViewProps {
  headerImage: React.ReactNode
  headerBackgroundColor: { dark: string; light: string }
  children: React.ReactNode
  contentContainerStyle?: StyleProp<ViewStyle>
}

export function ParallaxScrollView({
  headerImage,
  headerBackgroundColor,
  children,
  contentContainerStyle,
}: ParallaxScrollViewProps) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>()
  const scrollOffset = useScrollViewOffset(scrollRef)

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    }
  })

  return (
    <View className="flex-1">
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentContainerStyle={contentContainerStyle}
      >
        <AnimatedView
          style={[{ height: HEADER_HEIGHT, overflow: 'hidden' }, headerAnimatedStyle]}
          className="bg-background"
        >
          {headerImage}
        </AnimatedView>
        <View className="flex-1 p-8 gap-4 overflow-hidden bg-background">{children}</View>
      </Animated.ScrollView>
    </View>
  )
}
