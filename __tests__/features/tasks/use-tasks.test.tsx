// @ts-nocheck
import { useTasks } from '@/features/tasks/hooks/use-tasks'
import type { Task, TaskPriority, TaskStatus } from '@/types'
import { notifyManager } from '@tanstack/query-core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import type { ReactNode } from 'react'

// Mock tasks API
const mockGetTasks = jest.fn()
const mockCreateTask = jest.fn()
const mockUpdateTask = jest.fn()
const mockDeleteTask = jest.fn()
const mockReorderTasks = jest.fn()
const mockUseAuth = jest.fn()

jest.mock('@/features/tasks/api/tasks-api', () => ({
  tasksApi: {
    getTasks: (filter: unknown) => mockGetTasks(filter),
    createTask: (dto: unknown) => mockCreateTask(dto),
    updateTask: (id: string, dto: unknown) => mockUpdateTask(id, dto),
    deleteTask: (id: string) => mockDeleteTask(id),
    reorderTasks: (taskIds: string[]) => mockReorderTasks(taskIds),
  },
}))

jest.mock('@/shared/context', () => ({
  useAuth: () => mockUseAuth(),
}))

const createTestTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  userId: 'user-1',
  title: 'Test Task',
  description: 'Test description',
  status: 'pending' as TaskStatus,
  priority: 'medium' as TaskPriority,
  dueDate: null,
  completedAt: null,
  tags: [],
  order: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides,
})

let queryClient: QueryClient | null = null

const createWrapper = () => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
        gcTime: 0,
      },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useTasks', () => {
  beforeAll(() => {
    notifyManager.setNotifyFunction((callback) => {
      act(() => {
        callback()
      })
    })
  })

  afterAll(() => {
    notifyManager.setNotifyFunction((callback) => callback())
  })

  afterEach(() => {
    queryClient?.clear()
    queryClient = null
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      user: { id: 'user-1' },
    })
  })

  describe('fetching tasks', () => {
    it('fetches tasks on mount', async () => {
      const mockTasks = [createTestTask({ id: 'task-1' }), createTestTask({ id: 'task-2' })]
      mockGetTasks.mockResolvedValue(mockTasks)

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.tasks).toEqual(mockTasks)
      expect(mockGetTasks).toHaveBeenCalledWith({})
    })

    it('fetches tasks with initial filter', async () => {
      mockGetTasks.mockResolvedValue([])

      const filter = { status: 'pending' as TaskStatus }
      const { result } = renderHook(() => useTasks(filter), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(mockGetTasks).toHaveBeenCalledWith(filter)
    })

    it('returns empty array when no tasks', async () => {
      mockGetTasks.mockResolvedValue([])

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.tasks).toEqual([])
    })

    it('sets error on fetch failure', async () => {
      mockGetTasks.mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.error).toBe('Network error')
    })
  })

  describe('createTask', () => {
    it('creates a new task', async () => {
      const newTask = createTestTask({ id: 'new-task', title: 'New Task' })
      mockGetTasks.mockResolvedValue([])
      mockCreateTask.mockResolvedValue(newTask)

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let createdTask: Task | undefined
      await act(async () => {
        createdTask = await result.current.createTask({
          title: 'New Task',
          description: 'New description',
          priority: 'high',
        })
      })

      expect(createdTask).toEqual(newTask)
      expect(mockCreateTask).toHaveBeenCalledWith({
        title: 'New Task',
        description: 'New description',
        priority: 'high',
      })
    })

    it('throws error on create failure', async () => {
      mockGetTasks.mockResolvedValue([])
      mockCreateTask.mockRejectedValue(new Error('Create failed'))

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        result.current.createTask({
          title: 'New Task',
          priority: 'medium',
        }),
      ).rejects.toThrow('Create failed')
    })
  })

  describe('updateTask', () => {
    it('updates an existing task', async () => {
      const existingTask = createTestTask()
      const updatedTask = { ...existingTask, title: 'Updated Title' }
      mockGetTasks.mockResolvedValue([existingTask])
      mockUpdateTask.mockResolvedValue(updatedTask)

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      let updated: Task | undefined
      await act(async () => {
        updated = await result.current.updateTask('task-1', { title: 'Updated Title' })
      })

      expect(updated).toEqual(updatedTask)
      expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { title: 'Updated Title' })
    })

    it('updates task status', async () => {
      const existingTask = createTestTask({ status: 'pending' })
      const completedTask = { ...existingTask, status: 'completed' as TaskStatus }
      mockGetTasks.mockResolvedValue([existingTask])
      mockUpdateTask.mockResolvedValue(completedTask)

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updateTask('task-1', { status: 'completed' })
      })

      expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { status: 'completed' })
    })
  })

  describe('deleteTask', () => {
    it('deletes a task', async () => {
      mockGetTasks.mockResolvedValue([createTestTask()])
      mockDeleteTask.mockResolvedValue(undefined)

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.deleteTask('task-1')
      })

      expect(mockDeleteTask).toHaveBeenCalledWith('task-1')
    })
  })

  describe('reorderTasks', () => {
    it('reorders tasks', async () => {
      mockGetTasks.mockResolvedValue([])
      mockReorderTasks.mockResolvedValue(undefined)

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.reorderTasks(['task-2', 'task-1', 'task-3'])
      })

      expect(mockReorderTasks).toHaveBeenCalledWith(['task-2', 'task-1', 'task-3'])
    })
  })

  describe('filter management', () => {
    it('updates filter', async () => {
      mockGetTasks.mockResolvedValue([])

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      act(() => {
        result.current.setFilter({ status: 'completed' })
      })

      expect(result.current.filter).toEqual({ status: 'completed' })
    })

    it('clears filter', async () => {
      mockGetTasks.mockResolvedValue([])

      const { result } = renderHook(() => useTasks({ status: 'pending' }), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      expect(result.current.filter).toEqual({ status: 'pending' })

      act(() => {
        result.current.clearFilter()
      })

      expect(result.current.filter).toEqual({})
    })
  })

  describe('refreshTasks', () => {
    it('invalidates and refetches tasks', async () => {
      mockGetTasks.mockResolvedValue([createTestTask()])

      const { result } = renderHook(() => useTasks(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      const initialCallCount = mockGetTasks.mock.calls.length

      await act(async () => {
        await result.current.refreshTasks()
      })

      // Should have been called again after refresh
      expect(mockGetTasks.mock.calls.length).toBeGreaterThan(initialCallCount)
    })
  })
})
