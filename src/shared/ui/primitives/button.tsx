import { cn } from '@/shared/lib/utils'
import { ActivityIndicator, Pressable, Text, View } from '@/tw'
import type { ButtonSize, ButtonVariant } from '@/types'
import React from 'react'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  disabled?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
  className?: string
  textClassName?: string
  onPress?: () => void
  testID?: string
}

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-primary',
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  outline: 'border-2 border-border bg-transparent',
  ghost: 'bg-transparent',
  destructive: 'bg-destructive',
  link: 'bg-transparent',
}

const variantTextStyles: Record<ButtonVariant, string> = {
  default: 'text-primary-foreground',
  primary: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  destructive: 'text-destructive-foreground',
  link: 'text-primary underline',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 rounded-md',
  md: 'px-4 py-2.5 rounded-lg',
  lg: 'px-6 py-3.5 rounded-xl',
  icon: 'p-2.5 rounded-lg',
}

const sizeTextStyles: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  icon: 'text-base',
}

export function Button({
  variant = 'default',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className,
  textClassName,
  onPress,
  testID,
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      className={cn(
        'flex-row items-center justify-center',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-50',
        className,
      )}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? '#000' : '#fff'}
        />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          {typeof children === 'string' ? (
            <Text
              className={cn(
                'font-semibold',
                variantTextStyles[variant],
                sizeTextStyles[size],
                textClassName,
              )}
            >
              {children}
            </Text>
          ) : (
            children
          )}
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </Pressable>
  )
}
