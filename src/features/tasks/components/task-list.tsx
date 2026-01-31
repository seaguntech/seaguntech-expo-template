import { ListSeparator } from '@/shared/ui/primitives'
import { FlashList, RefreshControl, Text, View } from '@/tw'
import type { Task, TaskStatus } from '@/types'
import React, { useCallback, useMemo } from 'react'
import { TaskCard } from './task-card'

const styles = {
  listContent: { padding: 16 },
} as const

interface TaskListProps {
  tasks: Task[]
  isLoading?: boolean
  onTaskPress?: (task: Task) => void
  onStatusChange?: (task: Task, status: TaskStatus) => void
  onDelete?: (task: Task) => void
  onRefresh?: () => void
  emptyMessage?: string
}

export function TaskList({
  tasks,
  isLoading = false,
  onTaskPress,
  onStatusChange,
  onDelete,
  onRefresh,
  emptyMessage = 'No tasks yet',
}: TaskListProps) {
  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskCard
        task={item}
        onPress={onTaskPress}
        onStatusChange={onStatusChange}
        onDelete={onDelete}
      />
    ),
    [onTaskPress, onStatusChange, onDelete],
  )

  const keyExtractor = useCallback((item: Task) => item.id, [])

  const renderEmpty = useCallback(
    () => (
      <View className="flex-1 justify-center items-center py-20">
        <View className="w-16 h-16 bg-muted rounded-full items-center justify-center mb-4">
          <Text className="text-3xl">📋</Text>
        </View>
        <Text className="text-muted-foreground text-center">{emptyMessage}</Text>
      </View>
    ),
    [emptyMessage],
  )

  const refreshControl = useMemo(
    () => (onRefresh ? <RefreshControl refreshing={isLoading} onRefresh={onRefresh} /> : undefined),
    [onRefresh, isLoading],
  )

  return (
    <FlashList
      data={tasks}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.listContent}
      ItemSeparatorComponent={ListSeparator}
      ListEmptyComponent={renderEmpty}
      refreshControl={refreshControl}
    />
  )
}
