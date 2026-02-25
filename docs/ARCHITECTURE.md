# Architecture Documentation

> Feature-First Architecture for Expo React Native Application

## Table of Contents

- [Overview](#overview)
- [Architecture Principles](#architecture-principles)
- [Folder Structure](#folder-structure)
- [Feature Module Structure](#feature-module-structure)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Routing](#routing)
- [Dependency Graph](#dependency-graph)

---

## Overview

This project follows a **Feature-First Architecture** pattern, which organizes code by business domain rather than technical type. This approach improves:

- **Colocation**: Related code lives together
- **Scalability**: Easy to add new features without affecting existing ones
- **Team Ownership**: Clear boundaries for team responsibilities
- **Maintainability**: Isolated modules with explicit public APIs

### Tech Stack

| Layer         | Technology                                         |
| ------------- | -------------------------------------------------- |
| Framework     | React Native + Expo 54                             |
| Routing       | Expo Router (file-based)                           |
| Styling       | NativeWind v5 + Tailwind CSS v4                    |
| Backend       | Supabase (Auth, Database, Storage, Edge Functions) |
| Server State  | React Query (TanStack Query)                       |
| Client State  | Zustand + MMKV                                     |
| Payments      | RevenueCat (subscriptions) + Stripe (one-time)     |
| Notifications | Expo Notifications                                 |

---

## Architecture Principles

### 1. Feature Isolation

Each feature is a self-contained module with its own components, hooks, API calls, and types.

```
features/tasks/
├── components/     # UI specific to tasks
├── hooks/         # Business logic for tasks
├── lib/           # Data fetching for tasks (API, services)
├── store/         # Local state for tasks (Zustand)
├── types.ts       # Type definitions
└── index.ts       # Public API (only exports)
```

### 2. Explicit Public APIs

Features only expose what's necessary through `index.ts`:

```typescript
// features/tasks/index.ts
export { TaskCard, TaskList } from './components'
export { useTasks } from './hooks'
export type { Task, TaskStatus } from './types'

// ❌ Never export internal implementations
// ❌ Never export api/ directly
// ❌ Never export stores/ directly
```

### 3. Unidirectional Dependencies

```
app/ (routes)
  ↓ imports from
features/ (business modules)
  ↓ imports from
components/, hooks/, lib/, store/, context/, types/
  ↓ imports from
config/, constants/, tw/, locales/
```

**Rules:**

- `components/`, `hooks/`, `lib/`, `store/`, `context/`, `types/` NEVER import from `features/`
- `features/` NEVER imports from `app/`
- Features can import from other features ONLY through their public API

### 4. Separation of Concerns

| Layer         | Responsibility                         |
| ------------- | -------------------------------------- |
| `app/`        | Route definitions, layouts, navigation |
| `features/`   | Business logic, feature-specific UI    |
| `components/` | Reusable UI components                 |
| `hooks/`      | Shared hooks                           |
| `lib/`        | Utility functions, storage, query      |
| `store/`      | Global Zustand stores                  |
| `context/`    | React Context providers                |
| `types/`      | Shared type definitions                |
| `config/`     | Environment configuration              |
| `constants/`  | Static values                          |
| `tw/`         | NativeWind wrappers                    |
| `locales/`    | i18n translations                      |

---

## Folder Structure

```
src/
├── app/                          # Expo Router
│   ├── (auth)/                   # Public routes
│   │   ├── welcome.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── reset-password.tsx
│   ├── (protected)/              # Auth-guarded routes
│   │   ├── (tabs)/               # Tab navigation
│   │   │   ├── index.tsx         # Home
│   │   │   ├── tasks.tsx
│   │   │   ├── profile.tsx
│   │   │   └── settings.tsx
│   │   └── _layout.tsx            # Auth guard
│   ├── onboarding/
│   └── _layout.tsx               # Root layout with providers
│
├── features/                     # Business Modules
│   ├── auth/
│   ├── tasks/
│   ├── profile/
│   ├── notifications/
│   ├── payments/
│   ├── premium/
│   ├── ai-chat/
│   ├── onboarding/
│   └── settings/
│
├── components/                   # UI Components
│   ├── ui/
│   │   ├── primitives/           # Button, Input, Card, etc.
│   │   ├── layout/              # LayoutWrapper, containers
│   │   ├── forms/              # FormInput
│   │   ├── feedback/            # Toast, Loading, Error
│   │   └── optimized/           # OptimizedImage
│   ├── navigation/               # (optional)
│   └── providers/                # (optional)
│
├── hooks/                        # Shared Hooks
│
├── lib/                         # Utilities
│   ├── storage/                 # MMKV storage
│   ├── utils.ts
│   ├── query-client.ts
│   ├── auth-helpers.ts
│   └── validation/
│
├── store/                       # Global Stores
│   ├── profile-store.ts
│   └── offline-store.ts
│
├── context/                     # Context Providers
│   ├── auth-context.tsx
│   ├── theme-context.tsx
│   ├── revenue-cat-context.tsx
│   ├── stripe-context.tsx
│   └── sidebar-context.tsx
│
├── types/                       # Shared Types
│
├── constants/                   # Constants
│
├── tw/                         # NativeWind Wrappers
│
└── locales/                    # i18n Translations
```

│
├── config/ # Configuration
├── constants/ # Static constants
├── assets/ # Images, fonts
├── locales/ # i18n translations
├── tw/ # NativeWind wrappers
└── supabase/ # Backend
├── functions/ # Edge Functions
├── migrations/ # Database migrations
└── templates/ # Email templates

```

---

## Feature Module Structure

### Standard Feature Layout

```

features/{feature-name}/
├── components/
│ ├── {component-name}.tsx
│ └── index.ts # Barrel export
│
├── hooks/
│ ├── use-{feature}.ts # Main hook
│ ├── use-{feature}-{action}.ts # Action-specific hooks
│ └── index.ts
│
├── api/
│ ├── {feature}-api.ts # Supabase calls
│ └── index.ts
│
├── stores/ # Optional
│ ├── {feature}-store.ts
│ └── index.ts
│
├── utils/ # Optional
│ └── {feature}-helpers.ts
│
├── types.ts # Feature types
│
└── index.ts # PUBLIC API ONLY

```

### Example: Tasks Feature

```

features/tasks/
├── components/
│ ├── task-card.tsx
│ ├── task-list.tsx
│ ├── create-task-form.tsx
│ ├── edit-task-modal.tsx
│ ├── status-badges.tsx
│ └── index.ts
│
├── hooks/
│ ├── use-tasks.ts # CRUD operations
│ ├── use-task-filters.ts # Filter state
│ └── index.ts
│
├── api/
│ ├── tasks-api.ts
│ └── index.ts
│
├── stores/
│ ├── tasks-filter-store.ts
│ └── index.ts
│
├── types.ts
└── index.ts

```

---

## Data Flow

### Three-Tier State Strategy

```

┌─────────────────────────────────────────────────────────────┐
│ Components │
└─────────────────────────────────────────────────────────────┘
│
┌─────────────────────┼─────────────────────┐
▼ ▼ ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ React Query │ │ Zustand │ │ Context │
│ (Server Data) │ │ (Client Data) │ │ (Global UI) │
└───────────────┘ └───────────────┘ └───────────────┘
│ │ │
▼ ▼ │
┌───────────────┐ ┌───────────────┐ │
│ Supabase │ │ MMKV │ │
│ (Remote) │ │ (Persisted) │ │
└───────────────┘ └───────────────┘ │
│
┌──────────────────────┘
▼
┌───────────────┐
│ Memory │
│ (Runtime) │
└───────────────┘

```

### Data Flow by Type

| Data Type        | Source        | Management  | Persistence |
| ---------------- | ------------- | ----------- | ----------- |
| User Profile     | Supabase      | React Query | Remote DB   |
| Tasks            | Supabase      | React Query | Remote DB   |
| Auth Session     | Supabase Auth | Context     | MMKV        |
| Onboarding State | Local         | Zustand     | MMKV        |
| Offline Queue    | Local         | Zustand     | MMKV        |
| Theme Preference | Local         | Context     | MMKV        |
| Premium Status   | RevenueCat    | Context     | Memory      |

### Server Data Flow (React Query)

```

Component
│
▼ calls
useQuery/useMutation (hooks/{feature})
│
▼ fetches via
api/{feature}-api.ts
│
▼ calls
Supabase Client
│
▼ returns
Data → Cache → Component re-renders

```

### Client State Flow (Zustand)

```

Component
│
▼ calls
useStore (hooks/{feature} or stores/)
│
▼ updates
Zustand Store
│
▼ persists to
MMKV Storage
│
▼ triggers
Component re-render via selectors

````

---

## State Management

### When to Use What

| Scenario                         | Solution           |
| -------------------------------- | ------------------ |
| Data from server                 | React Query        |
| User preferences                 | Zustand + MMKV     |
| Auth session                     | Context + MMKV     |
| Form state                       | Local useState     |
| Complex form                     | React Hook Form    |
| Global UI state (theme, sidebar) | Context            |
| Feature-local state              | Zustand in feature |

### Zustand Store Pattern

```typescript
// stores/{feature}-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { zustandStorage } from '@/lib/storage'

interface TasksFilterState {
  status: TaskStatus | null
  sortBy: SortOption
  setStatus: (status: TaskStatus | null) => void
  setSortBy: (sort: SortOption) => void
  reset: () => void
}

export const useTasksFilterStore = create<TasksFilterState>()(
  persist(
    (set) => ({
      status: null,
      sortBy: 'createdAt',
      setStatus: (status) => set({ status }),
      setSortBy: (sortBy) => set({ sortBy }),
      reset: () => set({ status: null, sortBy: 'createdAt' }),
    }),
    {
      name: 'tasks-filter',
      storage: zustandStorage,
    },
  ),
)

// Selectors for performance
export const selectStatus = (state: TasksFilterState) => state.status
export const selectSortBy = (state: TasksFilterState) => state.sortBy
````

### React Query Pattern

```typescript
// api/tasks-api.ts
export const tasksApi = {
  getTasks: async (filters: TaskFilters): Promise<Task[]> => {
    const { data, error } = await supabase.from('tasks').select('*').match(filters)

    if (error) throw error
    return data.map(transformTask)
  },

  createTask: async (dto: CreateTaskDTO): Promise<Task> => {
    const { data, error } = await supabase.from('tasks').insert(dto).select().single()

    if (error) throw error
    return transformTask(data)
  },
}

// hooks/use-tasks.ts
export function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tasksApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
```

---

## Routing

### Route Groups

| Group                 | Purpose                       | Auth Required |
| --------------------- | ----------------------------- | ------------- |
| `(auth)/`             | Login, signup, password reset | No            |
| `(protected)/`        | All authenticated routes      | Yes           |
| `(protected)/(tabs)/` | Main tab navigation           | Yes           |
| `onboarding/`         | First-time user flow          | No            |

### Layout Hierarchy

```
app/_layout.tsx (Root)
├── Providers: Theme → Auth → RevenueCat → Stripe → Sidebar
│
├── app/(auth)/_layout.tsx
│   └── Stack Navigator (no header)
│
├── app/(protected)/_layout.tsx
│   ├── Auth Guard (redirects to sign-in if not authenticated)
│   │
│   └── app/(protected)/(tabs)/_layout.tsx
│       └── Tab Navigator
│
└── app/onboarding/_layout.tsx
    └── Stack Navigator
```

### Navigation Pattern

```typescript
// Navigate programmatically
import { router } from 'expo-router'

// Push to route
router.push('/tasks')

// Replace current route
router.replace('/(auth)/sign-in')

// Go back
router.back()

// Navigate with params
router.push({
  pathname: '/tasks/[id]',
  params: { id: taskId },
})
```

---

## Dependency Graph

### Import Rules

```
Level 0: External packages (react, expo, etc.)
    ↑
Level 1: config/, constants/, tw/, locales/
    ↑
Level 2: components/, hooks/, lib/, store/, context/, types/
    ↑
Level 3: features/
    ↑
Level 4: app/
```

### Allowed Imports

| From          | Can Import                                                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `app/`        | `features/`, `components/`, `hooks/`, `lib/`, `store/`, `context/`, `config/`, `constants/`                                     |
| `features/`   | Other `features/` (via index.ts only), `components/`, `hooks/`, `lib/`, `store/`, `context/`, `types/`, `config/`, `constants/` |
| `components/` | `lib/`, `types/`, `constants/`                                                                                                  |
| `hooks/`      | `lib/`, `types/`, `constants/`                                                                                                  |
| `lib/`        | `types/`, `constants/`, external packages                                                                                       |
| `store/`      | `lib/`, `types/`                                                                                                                |
| `context/`    | `lib/`, `types/`, `store/`                                                                                                      |
| `config/`     | `constants/`, external packages                                                                                                 |
| `constants/`  | External packages only                                                                                                          |

### Cross-Feature Dependencies

When a feature needs another feature:

```typescript
// ✅ CORRECT: Import from public API
import { useAuth, AuthButton } from '@/features/auth'

// ❌ WRONG: Import internal implementation
import { authApi } from '@/features/auth/api/auth-api'
```

---

## Best Practices

### 1. Keep Features Independent

- Each feature should work in isolation
- Minimize cross-feature dependencies
- Use components/, hooks/, lib/ for truly common code

### 2. Prefer Composition

```typescript
// ✅ Compose features in app/ routes
import { TaskList } from '@/features/tasks'
import { PremiumGate } from '@/features/premium'

export default function TasksScreen() {
  return (
    <PremiumGate feature="unlimited-tasks">
      <TaskList />
    </PremiumGate>
  )
}
```

### 3. Use Barrel Exports

Every folder with multiple files should have an `index.ts`:

```typescript
// components/index.ts
export { TaskCard } from './task-card'
export { TaskList } from './task-list'
export { CreateTaskForm } from './create-task-form'
```

### 4. Type Everything

```typescript
// types.ts in each feature
export interface Task {
  id: string
  title: string
  status: TaskStatus
  createdAt: Date
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed'

export interface CreateTaskDTO {
  title: string
  description?: string
}
```

---

## Diagrams

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Mobile App                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Expo Router (app/)                    │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ (auth)  │  │(protect)│  │onboard  │  │  modal  │    │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────┐  │
│  │                    Features Layer                         │  │
│  │  ┌──────┐ ┌──────┐ ┌────────┐ ┌─────────┐ ┌──────────┐  │  │
│  │  │ auth │ │tasks │ │profile │ │payments │ │ai-chat   │  │  │
│  │  └──────┘ └──────┘ └────────┘ └─────────┘ └──────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────┐  │
│  │                    Shared Layer                           │  │
│  │  ┌────┐ ┌───────┐ ┌────────┐ ┌───────┐ ┌───────┐        │  │
│  │  │ ui │ │ hooks │ │context │ │ lib   │ │stores │        │  │
│  │  └────┘ └───────┘ └────────┘ └───────┘ └───────┘        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  ┌───────────────────────────▼──────────────────────────────┐  │
│  │              Infrastructure Layer                         │  │
│  │  ┌────────┐ ┌───────────┐ ┌────┐ ┌──────────────────┐   │  │
│  │  │ config │ │ constants │ │ tw │ │ assets/locales   │   │  │
│  │  └────────┘ └───────────┘ └────┘ └──────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Supabase                                 │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌───────────────────┐   │
│  │   Auth   │ │ Database │ │ Storage │ │  Edge Functions   │   │
│  └──────────┘ └──────────┘ └─────────┘ └───────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Feature Module Internals

```
┌────────────────────────────────────────────────────────────┐
│                    Feature Module                           │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   index.ts                           │   │
│  │              (Public API Only)                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                          │                                  │
│         ┌────────────────┼────────────────┐                │
│         ▼                ▼                ▼                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │ components │  │   hooks    │  │   types    │           │
│  │   index    │  │   index    │  │            │           │
│  └────────────┘  └────────────┘  └────────────┘           │
│         │                │                                  │
│         │                ▼                                  │
│         │        ┌────────────┐                            │
│         │        │    api     │ ◄── Only accessed by hooks │
│         │        │   index    │                            │
│         │        └────────────┘                            │
│         │                │                                  │
│         │                ▼                                  │
│         │        ┌────────────┐                            │
│         │        │   stores   │ ◄── Only accessed by hooks │
│         │        │   index    │                            │
│         │        └────────────┘                            │
│         │                                                   │
│         └────────────────────────────────────────────────► │
│                    Uses components/ui                          │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## Related Documents

- [API Documentation](./api/API.md)
- [Conventions Guide](./CONVENTIONS.md)
- [Project README](../README.md)
