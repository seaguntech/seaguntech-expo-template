// ThemedView - View with theme colors
import { View, type ViewProps } from '@/tw'

interface ThemedViewProps extends ViewProps {
  children?: React.ReactNode
}

export function ThemedView({ children, className, ...props }: ThemedViewProps) {
  return (
    <View className={`bg-background ${className ?? ''}`} {...props}>
      {children}
    </View>
  )
}
