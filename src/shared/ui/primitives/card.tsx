import { cn } from '@/shared/lib/utils'
import { Text, View } from '@/tw'
import React from 'react'

interface CardProps {
  variant?: 'default' | 'outlined' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: React.ReactNode
  className?: string
  testID?: string
}

const variantStyles = {
  default: 'bg-card',
  outlined: 'bg-card border border-border',
  elevated: 'bg-card shadow-md',
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export function Card({
  variant = 'default',
  padding = 'md',
  children,
  className,
  testID,
}: CardProps) {
  return (
    <View
      className={cn('rounded-xl', variantStyles[variant], paddingStyles[padding], className)}
      testID={testID}
    >
      {children}
    </View>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return <View className={cn('mb-4', className)}>{children}</View>
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <Text className={cn('text-xl font-semibold text-card-foreground', className)}>{children}</Text>
  )
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return <Text className={cn('text-sm text-muted-foreground mt-1', className)}>{children}</Text>
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return <View className={cn('', className)}>{children}</View>
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <View className={cn('flex-row items-center mt-4 pt-4 border-t border-border', className)}>
      {children}
    </View>
  )
}
