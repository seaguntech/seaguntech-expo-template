import { cn } from '@/shared/lib/utils'
import { Text } from '@/tw'
import React from 'react'

interface LabelProps {
  children: React.ReactNode
  required?: boolean
  className?: string
}

export function Label({ children, required, className }: LabelProps) {
  return (
    <Text className={cn('text-sm font-medium text-foreground', className)}>
      {children}
      {required && <Text className="text-destructive ml-1">*</Text>}
    </Text>
  )
}
