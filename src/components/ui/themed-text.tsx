// ThemedText - Text with theme colors
import { Text, type TextProps } from '@/tw'

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle' | 'link' | 'defaultSemiBold'
  children: React.ReactNode
}

const typeStyles = {
  default: 'text-base text-foreground',
  title: 'text-3xl font-bold text-foreground',
  subtitle: 'text-xl font-semibold text-foreground',
  link: 'text-base text-primary underline',
  defaultSemiBold: 'text-base font-semibold text-foreground',
}

export function ThemedText({ type = 'default', children, className, ...props }: ThemedTextProps) {
  return (
    <Text className={`${typeStyles[type]} ${className ?? ''}`} {...props}>
      {children}
    </Text>
  )
}
