# Coding Conventions & Rules

> Guidelines for Feature-First Architecture to ensure consistency and prevent conflicts

## Table of Contents

- [Import Rules](#import-rules)
- [Feature Module Rules](#feature-module-rules)
- [Shared Code Rules](#shared-code-rules)
- [Naming Conventions](#naming-conventions)
- [File Organization](#file-organization)
- [Component Patterns](#component-patterns)
- [UI Layout & Styling Rules](#ui-layout--styling-rules)
- [State Management Rules](#state-management-rules)
- [API & Data Fetching Rules](#api--data-fetching-rules)
- [Testing Conventions](#testing-conventions)
- [Common Anti-Patterns](#common-anti-patterns)

---

## Import Rules

### Import Hierarchy (CRITICAL)

Imports MUST follow this order, separated by blank lines:

```typescript
// 1. External packages
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// 2. Shared modules
import { Button, Card } from '@/shared/ui'
import { useCache } from '@/shared/hooks'

// 3. Feature modules (via public API only)
import { useAuth } from '@/features/auth'
import { TaskCard } from '@/features/tasks'

// 4. Local imports (relative)
import { useLocalHook } from './hooks'
import { LocalComponent } from './components'
import type { LocalType } from './types'
```

### Dependency Direction (CRITICAL)

```
┌─────────────────────────────────────────────────────┐
│                     app/ (routes)                    │
│                         │                            │
│                         ▼ can import                 │
│                    features/                         │
│                         │                            │
│                         ▼ can import                 │
│                     shared/                          │
│                         │                            │
│                         ▼ can import                 │
│              config/, constants/, tw/                │
└─────────────────────────────────────────────────────┘
```

| From         | Can Import                                                                   | CANNOT Import                  |
| ------------ | ---------------------------------------------------------------------------- | ------------------------------ |
| `app/`       | `features/`, `shared/`, `config/`, `constants/`, `tw/`                       | -                              |
| `features/`  | Other `features/` (index.ts only), `shared/`, `config/`, `constants/`, `tw/` | `app/`                         |
| `shared/`    | Other `shared/` modules, `config/`, `constants/`, `tw/`                      | `features/`, `app/`            |
| `config/`    | `constants/`, external packages                                              | `shared/`, `features/`, `app/` |
| `constants/` | External packages only                                                       | Everything else                |

### Cross-Feature Imports (CRITICAL)

```typescript
// ✅ CORRECT: Import from feature's public API (index.ts)
import { useAuth, AuthButton } from '@/features/auth'
import { TaskCard, useTasks } from '@/features/tasks'

// ❌ WRONG: Import internal implementation
import { authApi } from '@/features/auth/api/auth-api'
import { TaskCardInner } from '@/features/tasks/components/task-card'
import { useAuthInternal } from '@/features/auth/hooks/use-auth-internal'
```

### Circular Import Prevention

**Rule**: If Feature A needs Feature B, and Feature B needs Feature A, extract shared logic to `shared/`.

```typescript
// ❌ WRONG: Circular dependency
// features/tasks/hooks/use-tasks.ts
import { useProfile } from '@/features/profile' // Profile imports tasks somewhere

// ✅ CORRECT: Extract to shared
// shared/hooks/use-user-context.ts
export function useUserContext() {
  // Shared logic that both features need
}

// features/tasks/hooks/use-tasks.ts
import { useUserContext } from '@/shared/hooks'

// features/profile/hooks/use-profile.ts
import { useUserContext } from '@/shared/hooks'
```

---

## Feature Module Rules

### Structure Requirements

Every feature MUST have this structure:

```
features/{feature-name}/
├── components/
│   ├── {component}.tsx
│   └── index.ts          # REQUIRED: Barrel export
├── hooks/
│   ├── use-{feature}.ts
│   └── index.ts          # REQUIRED: Barrel export
├── api/                   # Optional
│   ├── {feature}-api.ts
│   └── index.ts
├── stores/                # Optional
│   ├── {feature}-store.ts
│   └── index.ts
├── types.ts              # REQUIRED: Feature types
└── index.ts              # REQUIRED: Public API
```

### Public API (index.ts)

The feature's `index.ts` is the ONLY entry point for external consumers.

```typescript
// features/tasks/index.ts

// ✅ Export public components
export { TaskCard } from './components'
export { TaskList } from './components'
export { CreateTaskForm } from './components'

// ✅ Export public hooks
export { useTasks } from './hooks'
export { useCreateTask } from './hooks'
export { useUpdateTask } from './hooks'

// ✅ Export public types
export type { Task, TaskStatus, TaskPriority } from './types'
export type { CreateTaskDTO, UpdateTaskDTO } from './types'

// ❌ NEVER export internal implementations
// export { tasksApi } from './api'           // WRONG
// export { useTasksInternal } from './hooks' // WRONG
// export { TaskCardInner } from './components' // WRONG
```

### Internal vs Public

| Type               | Location                            | Exported in index.ts | Accessible by              |
| ------------------ | ----------------------------------- | -------------------- | -------------------------- |
| Public Component   | `components/task-card.tsx`          | ✅ Yes               | Any module                 |
| Internal Component | `components/task-card-skeleton.tsx` | ❌ No                | Only this feature          |
| Public Hook        | `hooks/use-tasks.ts`                | ✅ Yes               | Any module                 |
| Internal Hook      | `hooks/use-tasks-internal.ts`       | ❌ No                | Only this feature          |
| API Layer          | `api/tasks-api.ts`                  | ❌ Never             | Only hooks in this feature |
| Store              | `stores/tasks-store.ts`             | ❌ Never             | Only hooks in this feature |

### Feature Independence

Each feature should work independently:

```typescript
// ✅ CORRECT: Feature is self-contained
// features/tasks/hooks/use-tasks.ts
import { tasksApi } from '../api'
import { useTasksStore } from '../stores'
import type { Task } from '../types'

export function useTasks() {
  // All dependencies are local to this feature
}

// ❌ WRONG: Feature depends on another feature's internals
// features/tasks/hooks/use-tasks.ts
import { profileStore } from '@/features/profile/stores' // WRONG!
```

---

## Shared Code Rules

### When to Put Code in Shared

Code belongs in `shared/` if:

1. **Used by 3+ features** - Not just 2 features
2. **Truly generic** - No business logic specific to any feature
3. **Stable interface** - Won't change frequently
4. **No feature dependencies** - Doesn't import from `features/`

```typescript
// ✅ Belongs in shared/
// - Generic UI components (Button, Card, Input)
// - Utility hooks (useCache, useDebounce, useNetworkStatus)
// - Core utilities (formatDate, validateEmail)
// - Global context (AuthContext, ThemeContext)

// ❌ Does NOT belong in shared/
// - TaskCard (specific to tasks feature)
// - useTaskFilters (specific to tasks feature)
// - ProfileHeader (specific to profile feature)
```

### Shared Module Structure

```
shared/
├── ui/
│   ├── primitives/        # Atomic components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── index.ts
│   ├── layout/            # Layout components
│   │   ├── layout-wrapper.tsx
│   │   └── index.ts
│   ├── feedback/          # User feedback
│   │   ├── toast.tsx
│   │   ├── loading.tsx
│   │   └── index.ts
│   └── index.ts           # Re-export all
│
├── hooks/
│   ├── use-cache.ts
│   ├── use-debounce.ts
│   ├── use-network-status.ts
│   └── index.ts
│
├── lib/
│   ├── storage/
│   │   ├── mmkv.ts
│   │   └── index.ts
│   ├── query-client.ts
│   └── utils.ts
│
├── context/
│   ├── auth-context.tsx
│   ├── theme-context.tsx
│   └── index.ts
│
├── stores/
│   ├── offline-store.ts   # Global offline queue
│   └── index.ts
│
└── types/
    ├── common.d.ts
    └── index.ts
```

### Moving Code to Shared

Before moving code to `shared/`:

1. **Check usage** - Is it used by 3+ features?
2. **Remove feature-specific logic** - Make it generic
3. **Create stable interface** - Define clear props/API
4. **Update all imports** - Use search-replace carefully
5. **Add tests** - Shared code needs thorough testing

---

## Naming Conventions

### Files

| Type      | Convention                  | Example              |
| --------- | --------------------------- | -------------------- |
| Component | `kebab-case.tsx`            | `task-card.tsx`      |
| Hook      | `use-{name}.ts`             | `use-tasks.ts`       |
| Store     | `{feature}-store.ts`        | `tasks-store.ts`     |
| API       | `{feature}-api.ts`          | `tasks-api.ts`       |
| Types     | `types.ts` or `{name}.d.ts` | `types.ts`           |
| Utility   | `{name}.ts`                 | `format-date.ts`     |
| Test      | `{name}.test.ts(x)`         | `task-card.test.tsx` |
| Index     | `index.ts`                  | `index.ts`           |

### Components

```typescript
// File: task-card.tsx
// Component: TaskCard (PascalCase)

export function TaskCard({ task }: TaskCardProps) {
  return <View>...</View>
}

// Props: {Component}Props
interface TaskCardProps {
  task: Task
  onPress?: () => void
}
```

### Hooks

```typescript
// File: use-tasks.ts
// Hook: useTasks (camelCase with 'use' prefix)

export function useTasks(filters?: TaskFilters) {
  // ...
}

// Return type: {Hook}Result (optional, for complex returns)
interface UseTasksResult {
  tasks: Task[]
  isLoading: boolean
  createTask: (dto: CreateTaskDTO) => Promise<Task>
}
```

### Types

```typescript
// Entity: PascalCase
interface Task {
  id: string
  title: string
}

// DTO: {Action}{Entity}DTO
interface CreateTaskDTO {
  title: string
}

interface UpdateTaskDTO {
  title?: string
}

// Enum-like: PascalCase with union
type TaskStatus = 'pending' | 'in_progress' | 'completed'

// Props: {Component}Props
interface TaskCardProps {
  task: Task
}
```

### Variables and Functions

```typescript
// Variables: camelCase
const taskList = []
const isLoading = false

// Functions: camelCase, verb prefix
function createTask() {}
function handleSubmit() {}
function transformTask() {}

// Constants: SCREAMING_SNAKE_CASE
const MAX_TASKS = 100
const API_TIMEOUT = 5000

// Booleans: is/has/can/should prefix
const isActive = true
const hasPermission = false
const canEdit = true
```

---

## File Organization

### Component File Structure

```typescript
// components/task-card.tsx

// 1. Imports (following import hierarchy)
import { View, Text, Pressable } from '@/tw'
import { Badge } from '@/shared/ui'
import type { Task } from '../types'

// 2. Types (if not in separate file)
interface TaskCardProps {
  task: Task
  onPress?: () => void
}

// 3. Component
export function TaskCard({ task, onPress }: TaskCardProps) {
  // 3a. Hooks
  const { colors } = useTheme()

  // 3b. Derived state
  const isOverdue = task.dueDate && task.dueDate < new Date()

  // 3c. Handlers
  const handlePress = () => {
    onPress?.()
  }

  // 3d. Render
  return (
    <Pressable onPress={handlePress}>
      <View>
        <Text>{task.title}</Text>
        {isOverdue && <Badge variant="error">Overdue</Badge>}
      </View>
    </Pressable>
  )
}

// 4. Sub-components (if small, otherwise separate file)
function TaskCardSkeleton() {
  return <View />
}

// 5. Styles (if using StyleSheet, at bottom)
```

### Hook File Structure

```typescript
// hooks/use-tasks.ts

// 1. Imports
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '../api'
import type { Task, CreateTaskDTO } from '../types'

// 2. Types
interface UseTasksOptions {
  enabled?: boolean
}

// 3. Hook
export function useTasks(filters?: TaskFilters, options?: UseTasksOptions) {
  // Implementation
}

// 4. Related hooks (or separate files if complex)
export function useCreateTask() {
  // Implementation
}
```

### Maximum File Size

| File Type | Max Lines | Action if Exceeded       |
| --------- | --------- | ------------------------ |
| Component | 200       | Extract sub-components   |
| Hook      | 150       | Extract helper functions |
| API       | 200       | Split by entity          |
| Store     | 100       | Split by concern         |
| Utility   | 100       | Split by function group  |

---

## Component Patterns

### Composition over Props

```typescript
// ❌ WRONG: Too many props
<TaskCard
  task={task}
  showBadge={true}
  showDate={true}
  showDescription={false}
  variant="compact"
  onPress={handlePress}
  onDelete={handleDelete}
  onEdit={handleEdit}
/>

// ✅ CORRECT: Composition
<TaskCard task={task} onPress={handlePress}>
  <TaskCard.Badge status={task.status} />
  <TaskCard.Date date={task.dueDate} />
  <TaskCard.Actions>
    <TaskCard.EditButton onPress={handleEdit} />
    <TaskCard.DeleteButton onPress={handleDelete} />
  </TaskCard.Actions>
</TaskCard>
```

### Container/Presenter Pattern

```typescript
// Container: handles logic
// features/tasks/components/task-list-container.tsx
export function TaskListContainer() {
  const { tasks, isLoading } = useTasks()

  if (isLoading) return <TaskListSkeleton />
  return <TaskList tasks={tasks} />
}

// Presenter: pure UI
// features/tasks/components/task-list.tsx
export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <FlatList
      data={tasks}
      renderItem={({ item }) => <TaskCard task={item} />}
    />
  )
}
```

### Props Drilling Prevention

```typescript
// ❌ WRONG: Props drilling through many levels
<Screen>
  <Section user={user}>
    <Card user={user}>
      <Header user={user}>
        <Avatar user={user} />
      </Header>
    </Card>
  </Section>
</Screen>

// ✅ CORRECT: Context for deep data
const UserContext = createContext<User | null>(null)

<UserContext.Provider value={user}>
  <Screen>
    <Section>
      <Card>
        <Header>
          <Avatar /> {/* Uses useContext(UserContext) */}
        </Header>
      </Card>
    </Section>
  </Screen>
</UserContext.Provider>
```

---

## UI Layout & Styling Rules

### @/tw Consistency (CRITICAL)

- Use `@/tw` primitives (`View`, `Text`, `ScrollView`, `Pressable`, `FlatList`, `Modal`, etc.) for layout and UI.
- **Do not mix** React Native layout primitives (`View`, `Text`, `ScrollView`, `Pressable`) with `@/tw` in the same component or section.
- React Native utilities (`Platform`, `StyleSheet`, `Dimensions`, `Linking`, etc.) are allowed.
- React Native components without `@/tw` wrappers (e.g. `Switch`) are allowed, but must not use `className`.

```tsx
// ✅ Correct: consistent @/tw layout primitives
import { View, Text, Pressable } from '@/tw'

// ❌ Wrong: mixing RN View/Text with @/tw
import { View, Text } from 'react-native'
import { Pressable } from '@/tw'
```

### LayoutWrapper Usage (CRITICAL)

- Use `LayoutWrapper` for screen-level layout.
- **Never nest** a `ScrollView` inside `LayoutWrapper` when `scrollable={true}`.
- Set screen padding via `contentContainerClassName` on `LayoutWrapper`.

```tsx
// ✅ Correct
<LayoutWrapper scrollable contentContainerClassName="justify-center px-6 py-12">
  <View>...</View>
</LayoutWrapper>

// ❌ Wrong: nested ScrollView
<LayoutWrapper scrollable>
  <ScrollView>...</ScrollView>
</LayoutWrapper>
```

---

## State Management Rules

### State Location Decision Tree

```
Is it server data (from API)?
  └── Yes → React Query
  └── No → Is it needed by multiple features?
              └── Yes → Is it UI state (theme, sidebar)?
                          └── Yes → Context
                          └── No → Zustand in shared/stores
              └── No → Is it needed across component tree?
                          └── Yes → Zustand in feature/stores
                          └── No → useState in component
```

### Zustand Store Rules

```typescript
// 1. Always use selectors
// ❌ WRONG
const { tasks, isLoading, error } = useTasksStore()

// ✅ CORRECT
const tasks = useTasksStore(selectTasks)
const isLoading = useTasksStore(selectIsLoading)

// 2. Never mutate state
// ❌ WRONG
set((state) => {
  state.tasks.push(newTask) // MUTATION!
  return state
})

// ✅ CORRECT
set((state) => ({
  tasks: [...state.tasks, newTask],
}))

// 3. Keep stores focused
// ❌ WRONG: Kitchen sink store
const useAppStore = create(() => ({
  user: null,
  tasks: [],
  settings: {},
  theme: 'light',
  sidebar: false,
  // ... 50 more fields
}))

// ✅ CORRECT: Focused stores
const useUserStore = create(() => ({ user: null }))
const useTasksStore = create(() => ({ tasks: [] }))
const useSettingsStore = create(() => ({ settings: {} }))
```

### React Query Rules

```typescript
// 1. Consistent query keys
const QUERY_KEYS = {
  tasks: {
    all: ['tasks'] as const,
    list: (filters: TaskFilters) => ['tasks', 'list', filters] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
}

// 2. Proper invalidation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tasks.all })
}

// 3. Optimistic updates for better UX
onMutate: async (newTask) => {
  await queryClient.cancelQueries({ queryKey: QUERY_KEYS.tasks.all })
  const previous = queryClient.getQueryData(QUERY_KEYS.tasks.all)
  queryClient.setQueryData(QUERY_KEYS.tasks.all, (old) => [...old, newTask])
  return { previous }
},
onError: (err, newTask, context) => {
  queryClient.setQueryData(QUERY_KEYS.tasks.all, context.previous)
},
```

---

## API & Data Fetching Rules

### API Layer Encapsulation

```typescript
// ✅ API layer is ONLY accessed by hooks
// features/tasks/hooks/use-tasks.ts
import { tasksApi } from '../api'

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getTasks,
  })
}

// ❌ Components NEVER access API directly
// features/tasks/components/task-list.tsx
import { tasksApi } from '../api' // WRONG!
```

### Error Handling

```typescript
// Centralized error transformation
// shared/lib/error-handler.ts
export function handleApiError(error: unknown): ApiError {
  if (error instanceof AuthError) {
    return { code: 'AUTH_ERROR', message: 'Authentication required' }
  }
  // ...
}

// Usage in hooks
export function useCreateTask() {
  return useMutation({
    mutationFn: tasksApi.createTask,
    onError: (error) => {
      const apiError = handleApiError(error)
      Toast.show({ type: 'error', text1: apiError.message })
    },
  })
}
```

### Data Transformation

```typescript
// Transform at API layer boundary
// features/tasks/api/tasks-api.ts
export const tasksApi = {
  getTasks: async (): Promise<Task[]> => {
    const { data } = await supabase.from('tasks').select('*')
    return data.map(transformTask) // snake_case → camelCase
  },
}

function transformTask(row: TaskRow): Task {
  return {
    id: row.id,
    userId: row.user_id, // Transform here
    createdAt: new Date(row.created_at),
  }
}
```

---

## Testing Conventions

### Test File Location

```
features/tasks/
├── components/
│   ├── task-card.tsx
│   └── __tests__/
│       └── task-card.test.tsx
├── hooks/
│   ├── use-tasks.ts
│   └── __tests__/
│       └── use-tasks.test.ts
```

### Test Naming

```typescript
describe('TaskCard', () => {
  it('renders task title', () => {})
  it('shows overdue badge when task is past due', () => {})
  it('calls onPress when pressed', () => {})
})

describe('useTasks', () => {
  it('returns tasks from API', async () => {})
  it('filters tasks by status', async () => {})
  it('handles API errors gracefully', async () => {})
})
```

### Mock Patterns

```typescript
// Mock API at module level
jest.mock('../api', () => ({
  tasksApi: {
    getTasks: jest.fn(),
    createTask: jest.fn(),
  },
}))

// Mock feature imports
jest.mock('@/features/auth', () => ({
  useAuth: () => ({ user: { id: '123' } }),
}))
```

---

## Common Anti-Patterns

### ❌ Importing Feature Internals

```typescript
// WRONG
import { tasksApi } from '@/features/tasks/api/tasks-api'
import { TaskCardInner } from '@/features/tasks/components/internal/task-card-inner'

// CORRECT
import { useTasks, TaskCard } from '@/features/tasks'
```

### ❌ Circular Dependencies

```typescript
// WRONG: features/a imports features/b, and b imports a
// features/auth/index.ts
export { useProfile } from '@/features/profile' // Circular if profile imports auth

// CORRECT: Extract shared logic
// shared/hooks/use-user.ts
export function useUser() {}
```

### ❌ Business Logic in Components

```typescript
// WRONG
function TaskList() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    supabase.from('tasks').select('*').then(({ data }) => {
      setTasks(data.filter(t => t.status !== 'cancelled'))
    })
  }, [])
}

// CORRECT
function TaskList() {
  const { tasks } = useTasks({ excludeCancelled: true })
  return <FlatList data={tasks} />
}
```

### ❌ Prop Drilling

```typescript
// WRONG
<App user={user}>
  <Layout user={user}>
    <Page user={user}>
      <Header user={user}>
        <Avatar user={user} />

// CORRECT
<UserProvider value={user}>
  <App>
    <Layout>
      <Page>
        <Header>
          <Avatar /> // Uses useUser() hook
```

### ❌ Giant Components

```typescript
// WRONG: 500+ line component

// CORRECT: Split into smaller components
// task-list.tsx (container)
// task-list-header.tsx
// task-list-item.tsx
// task-list-empty.tsx
// task-list-skeleton.tsx
```

### ❌ Shared Code in Features

```typescript
// WRONG: Generic utility in feature folder
// features/tasks/utils/format-date.ts

// CORRECT: Move to shared
// shared/lib/format-date.ts
```

---

## Checklist for Code Review

### Feature Module Checklist

- [ ] Has `index.ts` with public API only
- [ ] Has `types.ts` with all type definitions
- [ ] All folders have barrel exports (`index.ts`)
- [ ] No internal implementations exported
- [ ] No circular dependencies
- [ ] No imports from `app/`

### Import Checklist

- [ ] Follows import hierarchy order
- [ ] Cross-feature imports use public API only
- [ ] No deep imports into feature internals
- [ ] Shared code doesn't import features

### Component Checklist

- [ ] Under 200 lines
- [ ] Uses composition over many props
- [ ] No business logic (uses hooks)
- [ ] No direct API calls
- [ ] Proper TypeScript props interface

### State Management Checklist

- [ ] Server data uses React Query
- [ ] Client data uses Zustand + MMKV
- [ ] Uses selectors for Zustand
- [ ] No state mutation
- [ ] Proper error handling

---

## Related Documents

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./api/API.md)
