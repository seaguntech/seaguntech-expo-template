// Tasks Types

export interface Task {
  id: string
  userId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: Date | null
  tags: string[]
  order: number
  createdAt: Date
  updatedAt: Date
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface CreateTaskDTO {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: Date
  tags?: string[]
}

export interface UpdateTaskDTO {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: Date | null
  tags?: string[]
}

export interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
  tags?: string[]
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'order'
  sortOrder?: 'asc' | 'desc'
}

// Database row type (snake_case)
export interface TaskRow {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  due_date: string | null
  tags: string[]
  order: number
  created_at: string
  updated_at: string
}
