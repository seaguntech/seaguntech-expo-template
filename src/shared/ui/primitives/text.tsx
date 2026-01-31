import { cn } from '@/shared/lib/utils'
import { Text as TWText } from '@/tw'
import React from 'react'

type TextVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodySmall' | 'caption' | 'label'

interface TextProps {
  variant?: TextVariant
  children: React.ReactNode
  className?: string
  numberOfLines?: number
}

const variantStyles: Record<TextVariant, string> = {
  h1: 'text-4xl font-bold text-foreground',
  h2: 'text-3xl font-bold text-foreground',
  h3: 'text-2xl font-semibold text-foreground',
  h4: 'text-xl font-semibold text-foreground',
  body: 'text-base text-foreground',
  bodySmall: 'text-sm text-foreground',
  caption: 'text-xs text-muted-foreground',
  label: 'text-sm font-medium text-foreground',
}

export function Typography({ variant = 'body', children, className, numberOfLines }: TextProps) {
  return (
    <TWText className={cn(variantStyles[variant], className)} numberOfLines={numberOfLines}>
      {children}
    </TWText>
  )
}

// Convenience components
export function H1({ children, className }: Omit<TextProps, 'variant'>) {
  return (
    <Typography variant="h1" className={className}>
      {children}
    </Typography>
  )
}

export function H2({ children, className }: Omit<TextProps, 'variant'>) {
  return (
    <Typography variant="h2" className={className}>
      {children}
    </Typography>
  )
}

export function H3({ children, className }: Omit<TextProps, 'variant'>) {
  return (
    <Typography variant="h3" className={className}>
      {children}
    </Typography>
  )
}

export function H4({ children, className }: Omit<TextProps, 'variant'>) {
  return (
    <Typography variant="h4" className={className}>
      {children}
    </Typography>
  )
}

export function Body({ children, className }: Omit<TextProps, 'variant'>) {
  return (
    <Typography variant="body" className={className}>
      {children}
    </Typography>
  )
}

export function Caption({ children, className }: Omit<TextProps, 'variant'>) {
  return (
    <Typography variant="caption" className={className}>
      {children}
    </Typography>
  )
}
