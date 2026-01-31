# API Documentation

> Complete API reference for the Expo React Native application

## Table of Contents

- [Overview](#overview)
- [Supabase Client](#supabase-client)
- [Authentication API](#authentication-api)
- [Profile API](#profile-api)
- [Tasks API](#tasks-api)
- [Storage API](#storage-api)
- [Edge Functions](#edge-functions)
- [Error Handling](#error-handling)
- [Type Definitions](#type-definitions)

---

## Overview

### API Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (React Native)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  React Query │    │   Supabase   │                   │
│  │   (Cache)    │───▶│   Client     │                   │
│  └──────────────┘    └──────────────┘                   │
│                             │                            │
└─────────────────────────────┼────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                      Supabase                            │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │   Auth   │  │ Database │  │ Storage  │  │  Edge  │  │
│  │  (GoTrue)│  │(Postgres)│  │  (S3)    │  │Functions│  │
│  └──────────┘  └──────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Base Configuration

```typescript
// config/supabase.ts
import { createClient } from '@supabase/supabase-js'
import { storage } from '@/shared/lib/storage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

---

## Supabase Client

### Installation

```bash
pnpm add @supabase/supabase-js
```

### Query Methods

| Method     | Description      | Example                                            |
| ---------- | ---------------- | -------------------------------------------------- |
| `select()` | Fetch data       | `supabase.from('tasks').select('*')`               |
| `insert()` | Create record    | `supabase.from('tasks').insert(data)`              |
| `update()` | Update record    | `supabase.from('tasks').update(data).eq('id', id)` |
| `delete()` | Delete record    | `supabase.from('tasks').delete().eq('id', id)`     |
| `upsert()` | Insert or update | `supabase.from('tasks').upsert(data)`              |

### Query Filters

```typescript
// Equality
.eq('column', value)
.neq('column', value)

// Comparison
.gt('column', value)    // Greater than
.gte('column', value)   // Greater than or equal
.lt('column', value)    // Less than
.lte('column', value)   // Less than or equal

// Pattern matching
.like('column', '%pattern%')
.ilike('column', '%pattern%')  // Case insensitive

// Arrays
.in('column', [value1, value2])
.contains('array_column', [value])

// Null checks
.is('column', null)
.not('column', 'is', null)

// Ordering
.order('column', { ascending: true })

// Pagination
.range(0, 9)  // First 10 records
.limit(10)

// Single record
.single()     // Returns object instead of array
.maybeSingle() // Returns null if not found
```

---

## Authentication API

### Sign Up

```typescript
interface SignUpCredentials {
  email: string
  password: string
  options?: {
    data?: {
      display_name?: string
    }
  }
}

async function signUp(credentials: SignUpCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
    options: credentials.options,
  })

  if (error) throw error
  return data
}

// Response
interface SignUpResponse {
  user: User | null
  session: Session | null
}
```

### Sign In

```typescript
// Email/Password
async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

// OAuth (Google, Apple)
async function signInWithOAuth(provider: 'google' | 'apple') {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: 'your-app://auth/callback',
      skipBrowserRedirect: true,
    },
  })

  if (error) throw error
  return data
}

// Magic Link
async function signInWithMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: 'your-app://auth/callback',
    },
  })

  if (error) throw error
  return data
}
```

### Sign Out

```typescript
async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
```

### Password Reset

```typescript
async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'your-app://auth/reset-password',
  })

  if (error) throw error
  return data
}

async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data
}
```

### Session Management

```typescript
// Get current session
async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

// Get current user
async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

// Listen to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  switch (event) {
    case 'SIGNED_IN':
      console.log('User signed in:', session?.user)
      break
    case 'SIGNED_OUT':
      console.log('User signed out')
      break
    case 'TOKEN_REFRESHED':
      console.log('Token refreshed')
      break
    case 'USER_UPDATED':
      console.log('User updated:', session?.user)
      break
  }
})
```

---

## Profile API

### Data Types

```typescript
interface Profile {
  id: string
  userId: string
  email: string
  displayName: string | null
  avatarUrl: string | null
  isPremium: boolean
  locale: string
  createdAt: Date
  updatedAt: Date
}

interface UpdateProfileDTO {
  displayName?: string
  avatarUrl?: string
  locale?: string
}

// Database schema (snake_case)
interface ProfileRow {
  id: string
  user_id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  is_premium: boolean
  locale: string
  created_at: string
  updated_at: string
}
```

### API Methods

```typescript
// features/profile/api/profile-api.ts

export const profileApi = {
  /**
   * Fetch user profile
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) throw error
    return data ? transformProfile(data) : null
  },

  /**
   * Create new profile
   */
  async createProfile(userId: string, email: string, displayName?: string): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email,
        display_name: displayName ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return transformProfile(data)
  },

  /**
   * Update profile
   */
  async updateProfile(userId: string, payload: UpdateProfileDTO): Promise<Profile> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: payload.displayName,
        avatar_url: payload.avatarUrl,
        locale: payload.locale,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return transformProfile(data)
  },

  /**
   * Upload avatar image
   */
  async uploadAvatar(userId: string, uri: string): Promise<string> {
    const fileName = `${userId}/avatar-${Date.now()}.jpg`
    const formData = new FormData()
    formData.append('file', {
      uri,
      name: fileName,
      type: 'image/jpeg',
    } as any)

    const { data, error } = await supabase.storage.from('avatars').upload(fileName, formData, {
      contentType: 'image/jpeg',
      upsert: true,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(data.path)

    return publicUrl
  },

  /**
   * Delete avatar
   */
  async deleteAvatar(userId: string): Promise<void> {
    const { error } = await supabase.storage.from('avatars').remove([`${userId}/avatar.jpg`])

    if (error) throw error
  },
}

// Transform snake_case to camelCase
function transformProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    isPremium: row.is_premium,
    locale: row.locale,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}
```

### React Query Hooks

```typescript
// features/profile/hooks/use-profile.ts

export function useProfile() {
  const { session } = useAuth()
  const userId = session?.user.id

  const query = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => profileApi.getProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return query
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const { session } = useAuth()

  return useMutation({
    mutationFn: (payload: UpdateProfileDTO) => profileApi.updateProfile(session!.user.id, payload),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', session!.user.id], data)
    },
  })
}

export function useUploadAvatar() {
  const queryClient = useQueryClient()
  const { session } = useAuth()
  const updateProfile = useUpdateProfile()

  return useMutation({
    mutationFn: (uri: string) => profileApi.uploadAvatar(session!.user.id, uri),
    onSuccess: async (avatarUrl) => {
      await updateProfile.mutateAsync({ avatarUrl })
    },
  })
}
```

---

## Tasks API

### Data Types

```typescript
interface Task {
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

type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

interface CreateTaskDTO {
  title: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: Date
  tags?: string[]
}

interface UpdateTaskDTO {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: Date | null
  tags?: string[]
}

interface TaskFilters {
  status?: TaskStatus
  priority?: TaskPriority
  search?: string
  tags?: string[]
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'order'
  sortOrder?: 'asc' | 'desc'
}
```

### API Methods

```typescript
// features/tasks/api/tasks-api.ts

export const tasksApi = {
  /**
   * Get all tasks with filters
   */
  async getTasks(filters: TaskFilters = {}): Promise<Task[]> {
    let query = supabase.from('tasks').select('*')

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.priority) {
      query = query.eq('priority', filters.priority)
    }

    if (filters.search) {
      query = query.ilike('title', `%${filters.search}%`)
    }

    if (filters.tags?.length) {
      query = query.contains('tags', filters.tags)
    }

    // Apply sorting
    const sortBy = filters.sortBy ?? 'order'
    const sortOrder = filters.sortOrder ?? 'asc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    const { data, error } = await query

    if (error) throw error
    return data.map(transformTask)
  },

  /**
   * Get single task by ID
   */
  async getTask(id: string): Promise<Task> {
    const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single()

    if (error) throw error
    return transformTask(data)
  },

  /**
   * Create new task
   */
  async createTask(dto: CreateTaskDTO): Promise<Task> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user!.id,
        title: dto.title,
        description: dto.description ?? null,
        status: dto.status ?? 'pending',
        priority: dto.priority ?? 'medium',
        due_date: dto.dueDate?.toISOString() ?? null,
        tags: dto.tags ?? [],
      })
      .select()
      .single()

    if (error) throw error
    return transformTask(data)
  },

  /**
   * Update task
   */
  async updateTask(id: string, dto: UpdateTaskDTO): Promise<Task> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (dto.title !== undefined) updateData.title = dto.title
    if (dto.description !== undefined) updateData.description = dto.description
    if (dto.status !== undefined) updateData.status = dto.status
    if (dto.priority !== undefined) updateData.priority = dto.priority
    if (dto.dueDate !== undefined) {
      updateData.due_date = dto.dueDate?.toISOString() ?? null
    }
    if (dto.tags !== undefined) updateData.tags = dto.tags

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return transformTask(data)
  },

  /**
   * Delete task
   */
  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id)

    if (error) throw error
  },

  /**
   * Reorder tasks
   */
  async reorderTasks(taskIds: string[]): Promise<void> {
    const updates = taskIds.map((id, index) => ({
      id,
      order: index,
    }))

    const { error } = await supabase.from('tasks').upsert(updates, { onConflict: 'id' })

    if (error) throw error
  },
}
```

### React Query Hooks

```typescript
// features/tasks/hooks/use-tasks.ts

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => tasksApi.getTasks(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => tasksApi.getTask(id),
    enabled: !!id,
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

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTaskDTO }) => tasksApi.updateTask(id, dto),
    onSuccess: (data) => {
      queryClient.setQueryData(['tasks', data.id], data)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tasksApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
```

---

## Storage API

### Bucket Operations

```typescript
// Upload file
async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob | FormData,
): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error
  return data.path
}

// Download file
async function downloadFile(bucket: string, path: string): Promise<Blob> {
  const { data, error } = await supabase.storage.from(bucket).download(path)

  if (error) throw error
  return data
}

// Get public URL
function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

// Get signed URL (for private buckets)
async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600,
): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)

  if (error) throw error
  return data.signedUrl
}

// Delete file
async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path])

  if (error) throw error
}

// List files
async function listFiles(bucket: string, folder: string): Promise<FileObject[]> {
  const { data, error } = await supabase.storage.from(bucket).list(folder)

  if (error) throw error
  return data
}
```

### Storage Buckets

| Bucket        | Purpose               | Public |
| ------------- | --------------------- | ------ |
| `avatars`     | User profile pictures | Yes    |
| `attachments` | Task attachments      | No     |
| `exports`     | Data exports          | No     |

---

## Edge Functions

### Overview

Edge Functions are serverless functions running on Deno at the edge.

```
supabase/functions/
├── ai-completion/        # OpenAI chat completions
├── create-payment-intent/ # Stripe PaymentIntent
├── create-stripe-checkout/ # Stripe Checkout Session
├── stripe-webhooks/      # Stripe webhook handler
├── send-notifications/   # Expo Push API
└── resend-email/         # Email via Resend
```

### Calling Edge Functions

```typescript
async function invokeFunction<T>(functionName: string, body: Record<string, any>): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(functionName, {
    body,
  })

  if (error) throw error
  return data
}
```

### AI Completion

```typescript
// Request
interface AICompletionRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string
  }>
  model?: string
  temperature?: number
  maxTokens?: number
}

// Response
interface AICompletionResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

// Usage
const response = await supabase.functions.invoke<AICompletionResponse>('ai-completion', {
  body: {
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Hello!' },
    ],
    temperature: 0.7,
  },
})
```

### Create Payment Intent

```typescript
// Request
interface CreatePaymentIntentRequest {
  amount: number // in cents
  currency: string
  metadata?: Record<string, string>
}

// Response
interface CreatePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

// Usage
const { data } = await supabase.functions.invoke<CreatePaymentIntentResponse>(
  'create-payment-intent',
  {
    body: {
      amount: 1999, // $19.99
      currency: 'usd',
      metadata: {
        productId: 'premium-upgrade',
      },
    },
  },
)
```

### Send Notifications

```typescript
// Request
interface SendNotificationRequest {
  tokens: string[]
  title: string
  body: string
  data?: Record<string, any>
}

// Response
interface SendNotificationResponse {
  successCount: number
  failureCount: number
  errors?: Array<{
    token: string
    error: string
  }>
}

// Usage
const { data } = await supabase.functions.invoke<SendNotificationResponse>('send-notifications', {
  body: {
    tokens: ['ExponentPushToken[xxx]'],
    title: 'New Task',
    body: 'You have a new task assigned.',
    data: { taskId: '123' },
  },
})
```

### Send Email (Resend)

```typescript
// Request
interface SendEmailRequest {
  to: string
  subject: string
  template: 'welcome' | 'invite' | 'reset-password'
  variables?: Record<string, string>
}

// Response
interface SendEmailResponse {
  id: string
  success: boolean
}

// Usage
const { data } = await supabase.functions.invoke<SendEmailResponse>('resend-email', {
  body: {
    to: 'user@example.com',
    subject: 'Welcome!',
    template: 'welcome',
    variables: {
      name: 'John',
    },
  },
})
```

---

## Error Handling

### Error Types

```typescript
interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

// Supabase error codes
type SupabaseErrorCode =
  | 'PGRST116' // No rows returned
  | 'PGRST301' // Row not found
  | '23505' // Unique violation
  | '23503' // Foreign key violation
  | '42501' // RLS violation
  | '42P01' // Table not found

// Auth error codes
type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'user_not_found'
  | 'weak_password'
  | 'email_exists'
```

### Error Handler

```typescript
// shared/lib/error-handler.ts

export function handleApiError(error: unknown): never {
  if (error instanceof AuthError) {
    throw new ApiError({
      code: error.status?.toString() ?? 'AUTH_ERROR',
      message: getAuthErrorMessage(error),
    })
  }

  if (error instanceof PostgrestError) {
    throw new ApiError({
      code: error.code,
      message: getPostgrestErrorMessage(error),
    })
  }

  throw new ApiError({
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  })
}

function getAuthErrorMessage(error: AuthError): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Email or password is incorrect'
    case 'Email not confirmed':
      return 'Please verify your email address'
    case 'User already registered':
      return 'An account with this email already exists'
    default:
      return error.message
  }
}

function getPostgrestErrorMessage(error: PostgrestError): string {
  switch (error.code) {
    case '23505':
      return 'This record already exists'
    case '23503':
      return 'Referenced record not found'
    case '42501':
      return 'You do not have permission for this action'
    default:
      return error.message
  }
}
```

### Usage in Hooks

```typescript
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: tasksApi.createTask,
    onError: (error) => {
      // Show user-friendly error message
      Alert.alert('Error', handleApiError(error).message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
```

---

## Type Definitions

### Common Response Types

```typescript
// Paginated response
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

// API response wrapper
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}
```

### Database Schema Types

```typescript
// Generated from Supabase CLI: supabase gen types typescript

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: Omit<ProfileRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ProfileRow, 'id'>>
      }
      tasks: {
        Row: TaskRow
        Insert: Omit<TaskRow, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TaskRow, 'id'>>
      }
      push_tokens: {
        Row: PushTokenRow
        Insert: Omit<PushTokenRow, 'id' | 'created_at'>
        Update: Partial<Omit<PushTokenRow, 'id'>>
      }
    }
    Functions: {
      // RPC functions
    }
    Enums: {
      task_status: TaskStatus
      task_priority: TaskPriority
    }
  }
}
```

---

## Related Documents

- [Architecture Documentation](../ARCHITECTURE.md)
- [Conventions Guide](../CONVENTIONS.md)
- [Supabase Documentation](https://supabase.com/docs)
