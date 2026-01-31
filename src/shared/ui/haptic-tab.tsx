// HapticTab - Tab bar button with haptic feedback
import * as Haptics from 'expo-haptics'
import { Platform, Pressable, type PressableProps } from 'react-native'

interface HapticTabProps extends PressableProps {
  children: React.ReactNode
}

export function HapticTab({ children, onPressIn, ...props }: HapticTabProps) {
  return (
    <Pressable
      onPressIn={(e) => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        }
        onPressIn?.(e)
      }}
      {...props}
    >
      {children}
    </Pressable>
  )
}
