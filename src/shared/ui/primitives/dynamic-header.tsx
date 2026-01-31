import { cn } from '@/shared/lib/utils'
import { AnimatedView, Text, View } from '@/tw'
import React from 'react'
import { interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface HeaderProps {
  title?: string
  subtitle?: string
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
  transparent?: boolean
  className?: string
}

export function Header({
  title,
  subtitle,
  leftAction,
  rightAction,
  transparent = false,
  className,
}: HeaderProps) {
  const insets = useSafeAreaInsets()

  return (
    <View
      className={cn('w-full', !transparent && 'bg-background border-b border-border', className)}
      style={{ paddingTop: insets.top }}
    >
      <View className="flex-row items-center justify-between h-14 px-4">
        <View className="w-12">{leftAction}</View>
        <View className="flex-1 items-center">
          {title && (
            <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        <View className="w-12 items-end">{rightAction}</View>
      </View>
    </View>
  )
}

interface DynamicHeaderProps extends HeaderProps {
  scrollY: SharedValue<number>
  headerHeight?: number
}

export function DynamicHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  scrollY,
  headerHeight = 200,
  className,
}: DynamicHeaderProps) {
  const insets = useSafeAreaInsets()

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, headerHeight - 100], [0, 1], 'clamp')
    return { opacity }
  })

  const animatedTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [headerHeight - 100, headerHeight - 50],
      [0, 1],
      'clamp',
    )
    return { opacity }
  })

  return (
    <AnimatedView
      style={[animatedHeaderStyle, { paddingTop: insets.top }]}
      className={cn(
        'absolute top-0 left-0 right-0 z-10 bg-background/95 border-b border-border',
        className,
      )}
    >
      <View className="flex-row items-center justify-between h-14 px-4">
        <View className="w-12">{leftAction}</View>
        <AnimatedView style={animatedTitleStyle} className="flex-1 items-center">
          {title && (
            <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </AnimatedView>
        <View className="w-12 items-end">{rightAction}</View>
      </View>
    </AnimatedView>
  )
}
