export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'canceled'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  userId: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  dueDate: string | null
  completedAt: string | null
  tags: string[]
  order: number
  createdAt: string
  updatedAt: string
}

export interface CreateTaskDto {
  title: string
  description?: string
  priority?: TaskPriority
  dueDate?: string
  tags?: string[]
}

export interface UpdateTaskDto {
  title?: string
  description?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: string | null
  tags?: string[]
  order?: number
}

export interface TaskFilter {
  status?: TaskStatus | TaskStatus[]
  priority?: TaskPriority | TaskPriority[]
  search?: string
  tags?: string[]
  dueBefore?: string
  dueAfter?: string
  sortBy?: TaskSortField
  limit?: number
  offset?: number
  sortOrder?: 'asc' | 'desc'
}

export type TaskSortField = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title' | 'order'

export interface TasksState {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  filter: TaskFilter
}

export interface TasksContextValue extends TasksState {
  createTask: (dto: CreateTaskDto) => Promise<Task>
  updateTask: (id: string, dto: UpdateTaskDto) => Promise<Task>
  deleteTask: (id: string) => Promise<void>
  reorderTasks: (taskIds: string[]) => Promise<void>
  setFilter: (filter: TaskFilter) => void
  clearFilter: () => void
  refreshTasks: () => Promise<void>
}

export interface TaskCardProps {
  task: Task
  onPress?: (task: Task) => void
  onStatusChange?: (task: Task, status: TaskStatus) => void
  onDelete?: (task: Task) => void
}

export interface TaskListProps {
  tasks: Task[]
  isLoading?: boolean
  onTaskPress?: (task: Task) => void
  onRefresh?: () => void
  emptyMessage?: string
}
