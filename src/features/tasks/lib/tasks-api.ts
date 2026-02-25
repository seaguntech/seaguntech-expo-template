import { supabase } from '@/config/supabase'
import type { CreateTaskDto, Task, TaskFilter, UpdateTaskDto } from '@/types'

// Explicit column selection for better performance (avoid SELECT *)
const TASK_COLUMNS = `
  id,
  user_id,
  title,
  description,
  status,
  priority,
  due_date,
  completed_at,
  tags,
  "order",
  created_at,
  updated_at
` as const

// Default pagination limit
const DEFAULT_LIMIT = 100

export const tasksApi = {
  async getTasks(filter: TaskFilter = {}): Promise<Task[]> {
    let query = supabase
      .from('tasks')
      .select(TASK_COLUMNS)
      .order(filter.sortBy ?? 'order', { ascending: filter.sortOrder !== 'desc' })
      .limit(filter.limit ?? DEFAULT_LIMIT)

    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status]
      query = query.in('status', statuses)
    }

    if (filter.priority) {
      const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority]
      query = query.in('priority', priorities)
    }

    if (filter.search) {
      query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`)
    }

    if (filter.tags && filter.tags.length > 0) {
      query = query.contains('tags', filter.tags)
    }

    if (filter.dueBefore) {
      query = query.lte('due_date', filter.dueBefore)
    }

    if (filter.dueAfter) {
      query = query.gte('due_date', filter.dueAfter)
    }

    const { data, error } = await query

    if (error) throw error

    return (data ?? []).map(transformTask)
  },

  async getTask(id: string): Promise<Task> {
    const { data, error } = await supabase.from('tasks').select(TASK_COLUMNS).eq('id', id).single()

    if (error) throw error

    return transformTask(data)
  },

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userData.user.id,
        title: dto.title,
        description: dto.description ?? null,
        priority: dto.priority ?? 'medium',
        due_date: dto.dueDate ?? null,
        tags: dto.tags ?? [],
        status: 'pending',
        order: Date.now(),
      })
      .select()
      .single()

    if (error) throw error

    return transformTask(data)
  },

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (dto.title !== undefined) updateData.title = dto.title
    if (dto.description !== undefined) updateData.description = dto.description
    if (dto.status !== undefined) {
      updateData.status = dto.status
      if (dto.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      } else {
        updateData.completed_at = null
      }
    }
    if (dto.priority !== undefined) updateData.priority = dto.priority
    if (dto.dueDate !== undefined) updateData.due_date = dto.dueDate
    if (dto.tags !== undefined) updateData.tags = dto.tags
    if (dto.order !== undefined) updateData.order = dto.order

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return transformTask(data)
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) throw error
  },

  async reorderTasks(taskIds: string[]): Promise<void> {
    // Batch update using Promise.all for better performance
    const now = new Date().toISOString()
    const updates = taskIds.map((id, index) =>
      supabase.from('tasks').update({ order: index, updated_at: now }).eq('id', id),
    )

    const results = await Promise.all(updates)
    const error = results.find((r) => r.error)?.error
    if (error) throw error
  },

  /**
   * Batch create multiple tasks at once (for offline sync)
   * More efficient than creating tasks one by one
   */
  async createTasksBatch(tasks: CreateTaskDto[]): Promise<Task[]> {
    if (tasks.length === 0) return []

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error('Not authenticated')

    const baseOrder = Date.now()
    const tasksToInsert = tasks.map((dto, index) => ({
      user_id: userData.user.id,
      title: dto.title,
      description: dto.description ?? null,
      priority: dto.priority ?? 'medium',
      due_date: dto.dueDate ?? null,
      tags: dto.tags ?? [],
      status: 'pending' as const,
      order: baseOrder + index,
    }))

    const { data, error } = await supabase.from('tasks').insert(tasksToInsert).select(TASK_COLUMNS)

    if (error) throw error

    return (data ?? []).map(transformTask)
  },

  /**
   * Batch update multiple tasks at once (for offline sync)
   */
  async updateTasksBatch(updates: { id: string; dto: UpdateTaskDto }[]): Promise<Task[]> {
    if (updates.length === 0) return []

    const now = new Date().toISOString()
    const updatePromises = updates.map(({ id, dto }) => {
      const updateData: Record<string, unknown> = {
        updated_at: now,
      }

      if (dto.title !== undefined) updateData.title = dto.title
      if (dto.description !== undefined) updateData.description = dto.description
      if (dto.status !== undefined) {
        updateData.status = dto.status
        updateData.completed_at = dto.status === 'completed' ? now : null
      }
      if (dto.priority !== undefined) updateData.priority = dto.priority
      if (dto.dueDate !== undefined) updateData.due_date = dto.dueDate
      if (dto.tags !== undefined) updateData.tags = dto.tags
      if (dto.order !== undefined) updateData.order = dto.order

      return supabase.from('tasks').update(updateData).eq('id', id).select(TASK_COLUMNS).single()
    })

    const results = await Promise.all(updatePromises)
    const error = results.find((r) => r.error)?.error
    if (error) throw error

    return results
      .filter((r) => r.data !== null)
      .map((r) => transformTask(r.data as Record<string, unknown>))
  },

  /**
   * Batch delete multiple tasks at once (for offline sync)
   */
  async deleteTasksBatch(ids: string[]): Promise<void> {
    if (ids.length === 0) return

    const { error } = await supabase.from('tasks').delete().in('id', ids)

    if (error) throw error
  },
}

function transformTask(data: Record<string, unknown>): Task {
  return {
    id: data.id as string,
    userId: data.user_id as string,
    title: data.title as string,
    description: data.description as string | null,
    status: data.status as Task['status'],
    priority: data.priority as Task['priority'],
    dueDate: data.due_date as string | null,
    completedAt: data.completed_at as string | null,
    tags: (data.tags as string[]) ?? [],
    order: data.order as number,
    createdAt: data.created_at as string,
    updatedAt: data.updated_at as string,
  }
}
