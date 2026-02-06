import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useState } from 'react'
import { useAuth } from '@/shared/context'
import { queryKeys } from '@/shared/lib/query-client'
import type { CreateTaskDto, Task, TaskFilter, UpdateTaskDto } from '@/types'
import { tasksApi } from '../api/tasks-api'

export function useTasks(initialFilter: TaskFilter = {}) {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<TaskFilter>(initialFilter)
  const tasksListQueryKey = queryKeys.tasks.list(user?.id ?? null, filter)

  const tasksQuery = useQuery({
    queryKey: tasksListQueryKey,
    queryFn: () => tasksApi.getTasks(filter),
    enabled: isAuthenticated && !!user?.id,
  })

  const createMutation = useMutation({
    mutationFn: (dto: CreateTaskDto) => tasksApi.createTask(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDto }) => tasksApi.updateTask(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksApi.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
  })

  const createTask = useCallback(
    async (dto: CreateTaskDto): Promise<Task> => {
      return createMutation.mutateAsync(dto)
    },
    [createMutation],
  )

  const updateTask = useCallback(
    async (id: string, dto: UpdateTaskDto): Promise<Task> => {
      return updateMutation.mutateAsync({ id, dto })
    },
    [updateMutation],
  )

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      return deleteMutation.mutateAsync(id)
    },
    [deleteMutation],
  )

  const reorderTasks = useCallback(
    async (taskIds: string[]): Promise<void> => {
      await tasksApi.reorderTasks(taskIds)
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
    },
    [queryClient],
  )

  const clearFilter = useCallback(() => {
    setFilter({})
  }, [])

  const refreshTasks = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all })
  }, [queryClient])

  return {
    tasks: tasksQuery.data ?? [],
    isLoading: tasksQuery.isLoading || createMutation.isPending || updateMutation.isPending,
    error: tasksQuery.error?.message ?? null,
    filter,
    setFilter,
    clearFilter,
    createTask,
    updateTask,
    deleteTask,
    reorderTasks,
    refreshTasks,
  }
}
