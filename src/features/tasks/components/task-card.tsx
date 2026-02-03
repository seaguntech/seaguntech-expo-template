import { cn } from '@/shared/lib/utils'
import { Card, CardContent } from '@/shared/ui/primitives'
import { Pressable, Text, View } from '@/tw'
import type { Task, TaskStatus } from '@/types'
import { memo, useCallback } from 'react'
import { PriorityBadge, StatusBadge } from './status-badges'

interface TaskCardProps {
  task: Task
  onPress?: (task: Task) => void
  onStatusChange?: (task: Task, status: TaskStatus) => void
  onDelete?: (task: Task) => void
}

export const TaskCard = memo(function TaskCard({
  task,
  onPress,
  onStatusChange,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === 'completed'

  const handleToggleComplete = useCallback(() => {
    if (onStatusChange) {
      onStatusChange(task, isCompleted ? 'pending' : 'completed')
    }
  }, [onStatusChange, task, isCompleted])

  const handlePress = useCallback(() => {
    onPress?.(task)
  }, [onPress, task])

  const handleDelete = useCallback(() => {
    onDelete?.(task)
  }, [onDelete, task])

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return 'Overdue'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted

  return (
    <Card className={cn(isCompleted && 'opacity-60')} testID={`task-card-${task.id}`}>
      <CardContent className="py-3">
        <Pressable
          onPress={handlePress}
          className="flex-row items-start"
          testID={`task-card-press-${task.id}`}
        >
          <Pressable
            onPress={handleToggleComplete}
            testID={`task-complete-button-${task.id}`}
            className={cn(
              'w-6 h-6 rounded-full border-2 mr-3 mt-0.5 items-center justify-center',
              isCompleted ? 'bg-success border-success' : 'border-muted-foreground',
            )}
          >
            {isCompleted && <Text className="text-white text-xs">✓</Text>}
          </Pressable>

          <View className="flex-1">
            <Text
              className={cn(
                'text-base font-medium',
                isCompleted ? 'text-muted-foreground line-through' : 'text-foreground',
              )}
            >
              {task.title}
            </Text>

            {task.description && (
              <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
                {task.description}
              </Text>
            )}

            <View className="flex-row items-center flex-wrap gap-2 mt-2">
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />

              {task.dueDate && (
                <View
                  className={cn(
                    'px-2 py-0.5 rounded',
                    isOverdue ? 'bg-destructive/10' : 'bg-muted',
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs',
                      isOverdue ? 'text-destructive' : 'text-muted-foreground',
                    )}
                  >
                    {formatDueDate(task.dueDate)}
                  </Text>
                </View>
              )}

              {task.tags.length > 0 && (
                <View className="flex-row gap-1">
                  {task.tags.slice(0, 2).map((tag) => (
                    <View key={tag} className="bg-primary/10 px-2 py-0.5 rounded">
                      <Text className="text-xs text-primary">{tag}</Text>
                    </View>
                  ))}
                  {task.tags.length > 2 && (
                    <Text className="text-xs text-muted-foreground">+{task.tags.length - 2}</Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {onDelete && (
            <Pressable
              onPress={handleDelete}
              className="w-8 h-8 items-center justify-center"
              testID={`task-delete-button-${task.id}`}
            >
              <Text className="text-muted-foreground">🗑</Text>
            </Pressable>
          )}
        </Pressable>
      </CardContent>
    </Card>
  )
})
