// Tasks Feature - Public API

// Components
export { CreateTaskForm, EditTaskModal, StatusBadge, TaskCard, TaskList } from './components'

// Hooks
export { useTasks } from './hooks'

// Types
export type {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskDTO,
  UpdateTaskDTO,
  TaskFilters,
} from './types'

// Note: API layer is internal - access via useTasks hook
