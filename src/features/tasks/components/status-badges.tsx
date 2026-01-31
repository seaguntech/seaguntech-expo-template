import { cn } from '@/shared/lib/utils'
import { Text, View } from '@/tw'
import type { TaskPriority, TaskStatus } from '@/types'
import React from 'react'

interface StatusBadgeProps {
  status: TaskStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    pending: { label: 'Pending', bg: 'bg-muted', text: 'text-muted-foreground' },
    in_progress: { label: 'In Progress', bg: 'bg-primary/20', text: 'text-primary' },
    completed: { label: 'Completed', bg: 'bg-success/20', text: 'text-success' },
    canceled: { label: 'Canceled', bg: 'bg-destructive/20', text: 'text-destructive' },
  }

  const { label, bg, text } = config[status]

  return (
    <View className={cn('px-2 py-0.5 rounded', bg, className)}>
      <Text className={cn('text-xs font-medium', text)}>{label}</Text>
    </View>
  )
}

interface PriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = {
    low: { label: 'Low', bg: 'bg-muted', text: 'text-muted-foreground', icon: '○' },
    medium: { label: 'Medium', bg: 'bg-primary/10', text: 'text-primary', icon: '◐' },
    high: { label: 'High', bg: 'bg-warning/20', text: 'text-warning', icon: '●' },
    urgent: { label: 'Urgent', bg: 'bg-destructive/20', text: 'text-destructive', icon: '⚠' },
  }

  const { label, bg, text, icon } = config[priority]

  return (
    <View className={cn('flex-row items-center px-2 py-0.5 rounded', bg, className)}>
      <Text className={cn('text-xs mr-1', text)}>{icon}</Text>
      <Text className={cn('text-xs font-medium', text)}>{label}</Text>
    </View>
  )
}
