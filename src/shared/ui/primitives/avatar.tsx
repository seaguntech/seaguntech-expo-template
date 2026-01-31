import { cn, getInitials } from '@/shared/lib/utils'
import { Text, View } from '@/tw'
import { Image } from '@/tw/image'
import React from 'react'

interface AvatarProps {
  src?: string | null
  alt?: string
  fallback?: string | null
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeStyles = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
}

const textSizes = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-2xl',
}

export function Avatar({ src, alt, fallback, size = 'md', className }: AvatarProps) {
  const initials = fallback ? getInitials(fallback) : alt ? getInitials(alt) : '?'

  if (src) {
    return (
      <Image
        source={{ uri: src }}
        className={cn('rounded-full bg-muted', sizeStyles[size], className)}
        contentFit="cover"
        alt={alt}
      />
    )
  }

  return (
    <View
      className={cn(
        'rounded-full bg-primary items-center justify-center',
        sizeStyles[size],
        className,
      )}
    >
      <Text className={cn('font-semibold text-primary-foreground', textSizes[size])}>
        {initials}
      </Text>
    </View>
  )
}
