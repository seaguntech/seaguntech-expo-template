import { cn } from '@/shared/lib/utils'
import { AnimatedView, Pressable, ScrollView, Text, View } from '@/tw'
import React, { ReactNode, useEffect } from 'react'
import { Dimensions } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { runOnJS, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  position?: 'left' | 'right'
  width?: number
  className?: string
}

export function Sidebar({
  isOpen,
  onClose,
  children,
  position = 'left',
  width = SCREEN_WIDTH * 0.8,
  className,
}: SidebarProps) {
  const translateX = useSharedValue(position === 'left' ? -width : width)

  useEffect(() => {
    translateX.value = withSpring(isOpen ? 0 : position === 'left' ? -width : width, {
      damping: 20,
      stiffness: 200,
    })
  }, [isOpen, position, width, translateX])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withSpring(isOpen ? 1 : 0),
    pointerEvents: isOpen ? 'auto' : 'none',
  }))

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (position === 'left') {
        translateX.value = Math.min(0, Math.max(-width, event.translationX))
      } else {
        translateX.value = Math.max(0, Math.min(width, event.translationX))
      }
    })
    .onEnd((event) => {
      const shouldClose =
        position === 'left'
          ? event.translationX < -width / 3 || event.velocityX < -500
          : event.translationX > width / 3 || event.velocityX > 500

      if (shouldClose) {
        translateX.value = withSpring(position === 'left' ? -width : width)
        runOnJS(onClose)()
      } else {
        translateX.value = withSpring(0)
      }
    })

  if (!isOpen) return null

  return (
    <View className="absolute inset-0 z-50">
      <AnimatedView style={overlayAnimatedStyle} className="absolute inset-0 bg-black/50">
        <Pressable onPress={onClose} className="flex-1" />
      </AnimatedView>

      <GestureDetector gesture={panGesture}>
        <AnimatedView
          style={[
            animatedStyle,
            {
              width,
              position: 'absolute',
              top: 0,
              bottom: 0,
              [position]: 0,
            },
          ]}
          className={cn('bg-card', className)}
        >
          <ScrollView className="flex-1" contentContainerClassName="p-4">
            {children}
          </ScrollView>
        </AnimatedView>
      </GestureDetector>
    </View>
  )
}

interface SidebarHeaderProps {
  children: ReactNode
  className?: string
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return <View className={cn('pb-4 mb-4 border-b border-border', className)}>{children}</View>
}

interface SidebarItemProps {
  icon?: ReactNode
  label: string
  onPress?: () => void
  active?: boolean
  className?: string
}

export function SidebarItem({ icon, label, onPress, active = false, className }: SidebarItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center px-3 py-3 rounded-lg mb-1',
        active ? 'bg-primary/10' : 'bg-transparent',
        className,
      )}
    >
      {icon && <View className="mr-3">{icon}</View>}
      <Text className={cn('text-base', active ? 'text-primary font-semibold' : 'text-foreground')}>
        {label}
      </Text>
    </Pressable>
  )
}
