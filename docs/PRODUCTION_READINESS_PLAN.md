# Production Readiness Plan

> Generated from React Native Best Practices Review

## Overview

This plan addresses critical issues before production launch. Estimated effort: **2-3 weeks**.

---

## Phase 1: Security Fixes (Priority: CRITICAL)

**Estimated Time**: 3-4 days

### 1.1 Input Validation for Auth Functions

**File**: `src/shared/context/auth-context.tsx`

**Current Problem**:

```tsx
// No validation before sending to Supabase
const signIn = async (credentials: SignInCredentials) => {
  const { error } = await supabase.auth.signInWithPassword(credentials)
}
```

**Solution**: Add Zod validation

```tsx
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const signUpSchema = z
  .object({
    email: z.string().email('Invalid email format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[0-9]/, 'Must contain number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
```

**Benefits**:

- Prevents malformed data from reaching Supabase
- Type-safe validation with meaningful error messages
- Consistent validation patterns across app

### 1.2 OAuth Redirect Validation

**File**: `src/shared/context/auth-context.tsx:194`

**Current Problem**:

```tsx
redirectTo: 'seaguntechexpotemplate://auth/callback'
```

**Solution**:

```tsx
const ALLOWED_REDIRECT_HOSTS = ['seaguntechexpotemplate://']

const validateRedirectUrl = (url: string): boolean => {
  return ALLOWED_REDIRECT_HOSTS.some((host) => url.startsWith(host))
}

// Usage
const redirectTo = 'seaguntechexpotemplate://auth/callback'
if (!validateRedirectUrl(redirectTo)) {
  throw new Error('Invalid redirect URL')
}
```

### 1.3 Remove Production console.warn

**Files**: `config/supabase.ts`, `src/shared/context/stripe-context.tsx`, `src/shared/context/revenue-cat-context.tsx`

**Solution**:

```tsx
// Replace console.warn with proper error handling
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (__DEV__) {
    console.warn('Missing Supabase configuration')
  }
  // In production, throw or use error reporting
  Sentry.captureMessage('Missing Supabase configuration')
}
```

---

## Phase 2: Performance Optimization (Priority: HIGH)

**Estimated Time**: 2-3 days

### 2.1 Extract Inline Styles

**Files**:

- `src/features/tasks/components/task-list.tsx:54`
- `src/features/notifications/components/notification-center.tsx:59`

**Current Problem**:

```tsx
contentContainerStyle={{ padding: 16 }} // Creates new object every render
```

**Solution**:

```tsx
const styles = {
  listContent: { padding: 16 },
} as const

// Usage
contentContainerStyle={styles.listContent}
```

**Benefits**:

- Prevents FlashList re-renders
- Stable object references for memoization
- Better performance on list scroll

### 2.2 Memoize List Item Components

**File**: `src/features/tasks/components/task-card.tsx:14`

**Current**:

```tsx
export function TaskCard({ task, onPress }: TaskCardProps) {
```

**Solution**:

```tsx
export const TaskCard = memo(function TaskCard({ task, onPress }: TaskCardProps) {
  // component body
})
```

**Note**: `NotificationItem` already correctly uses `memo`.

### 2.3 Fix Inline Handlers in PromptLabels

**File**: `src/features/ai-chat/components/prompt-labels.tsx:24`

**Current Problem**:

```tsx
onPress={() => onSelect(preset)} // New function every render
```

**Solution**:

```tsx
const PromptLabel = memo(function PromptLabel({
  preset,
  onSelect,
}: {
  preset: Preset
  onSelect: (preset: Preset) => void
}) {
  const handlePress = useCallback(() => onSelect(preset), [preset, onSelect])

  return <Pressable onPress={handlePress}>{/* content */}</Pressable>
})
```

### 2.4 Async i18n Initialization

**File**: `app/_layout.tsx:1`

**Current**:

```tsx
import '@/config/i18n' // Blocks initial render
```

**Solution**:

```tsx
// config/i18n.ts - export init function
export const initI18n = async () => {
  await i18n.init(/* config */)
}

// app/_layout.tsx
const [i18nReady, setI18nReady] = useState(false)

useEffect(() => {
  initI18n().then(() => setI18nReady(true))
}, [])

if (!i18nReady) return null // Or splash screen
```

**Benefits**:

- Reduces TTI by 100-300ms
- Non-blocking initial render
- Better perceived performance

### 2.5 Context Provider Optimization

**File**: `app/_layout.tsx:50-68`

**Current**: 5 nested providers cause re-render cascade

**Solution**: Split contexts or add memo boundaries

```tsx
// Option 1: Split AuthContext
const AuthStateContext = createContext<AuthState>(null)
const AuthActionsContext = createContext<AuthActions>(null)

// Option 2: Memoize provider children
const MemoizedRootLayoutNav = memo(RootLayoutNav)

// In layout:
<SidebarProvider>
  <MemoizedRootLayoutNav />
</SidebarProvider>
```

---

## Phase 3: Animation Improvements (Priority: MEDIUM)

**Estimated Time**: 1-2 days

### 3.1 Add AnimatedPressable

**File**: `tw/index.tsx`

```tsx
// Add after line 264
export type AnimatedPressableProps = React.ComponentProps<typeof RNPressable> &
  ReanimatedLayoutProps & {
    className?: string
  }

export const AnimatedPressable = (props: AnimatedPressableProps) => {
  const element = useCssElement(RNPressable, props, { className: 'style' })
  const { style, ...otherProps } = element.props
  const flattenedStyle = StyleSheet.flatten(style)

  return <Animated.View {...otherProps} style={flattenedStyle} />
}
AnimatedPressable.displayName = 'CSS(AnimatedPressable)'
```

### 3.2 Export AnimatedText

**File**: `tw/index.tsx:318`

```tsx
export const CSSAnimated = {
  ...Animated,
  View: AnimatedView,
  ScrollView: AnimatedScrollView,
  Text: AnimatedText, // ADD THIS
  Pressable: AnimatedPressable, // ADD THIS
}
```

### 3.3 Document GPU-Friendly Properties

**File**: `tw/README.md` (create new)

````markdown
# Animation Best Practices

## GPU-Optimized Properties (Use These)

- `transform: [{ translateX }, { translateY }, { scale }, { rotate }]`
- `opacity`

## Layout-Triggering Properties (Avoid Animating)

- `width`, `height`
- `margin`, `padding`
- `borderWidth`

## Example

```tsx
// ✅ Good - GPU accelerated
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateY: withSpring(offset.value) }],
  opacity: withTiming(visible.value ? 1 : 0),
}))

// ❌ Bad - Triggers layout recalculation
const badStyle = useAnimatedStyle(() => ({
  width: withSpring(expanded.value ? 200 : 100), // AVOID
}))
```
````

````

---

## Phase 4: Testing Coverage (Priority: CRITICAL)

**Estimated Time**: 5-7 days

### 4.1 Unit Tests for Auth Functions

**File**: `__tests__/context/auth-context.test.tsx` (create)

```tsx
describe('Auth Context', () => {
  describe('signIn', () => {
    it('validates email format', async () => {
      const { result } = renderHook(() => useAuth())

      await expect(
        result.current.signIn({ email: 'invalid', password: 'test' })
      ).rejects.toThrow('Invalid email format')
    })

    it('requires minimum password length', async () => {
      const { result } = renderHook(() => useAuth())

      await expect(
        result.current.signIn({ email: 'test@test.com', password: '123' })
      ).rejects.toThrow('Password must be at least 8 characters')
    })
  })
})
````

### 4.2 Integration Tests for API

**File**: `__tests__/features/tasks/use-tasks.test.tsx` (create)

```tsx
describe('useTasks', () => {
  it('fetches tasks from Supabase', async () => {
    // Mock Supabase response
    mockSupabase.from('tasks').select.mockResolvedValue({
      data: [{ id: '1', title: 'Test Task' }],
      error: null,
    })

    const { result, waitFor } = renderHook(() => useTasks())

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.tasks).toHaveLength(1)
  })
})
```

### 4.3 E2E Tests for Critical Flows

**File**: `e2e/auth.test.ts` (create with Maestro or Detox)

```yaml
# maestro/auth-flow.yaml
appId: com.app.seaguntechexpotemplate
---
- launchApp
- tapOn: 'Sign In'
- inputText:
    id: 'email-input'
    text: 'test@example.com'
- inputText:
    id: 'password-input'
    text: 'testpassword123'
- tapOn: 'Submit'
- assertVisible: 'Welcome'
```

### 4.4 Coverage Target

| Area              | Current | Target         |
| ----------------- | ------- | -------------- |
| Unit Tests        | ~20%    | 80%            |
| Integration Tests | 0%      | 60%            |
| E2E Tests         | 0%      | Critical flows |

---

## Summary Checklist

### Must Complete Before Launch

- [ ] Phase 1.1: Input validation with Zod
- [ ] Phase 1.2: OAuth redirect validation
- [ ] Phase 1.3: Remove production console.warn
- [ ] Phase 4: Achieve 80% test coverage

### High Priority (Week 1-2)

- [ ] Phase 2.1: Extract inline styles
- [ ] Phase 2.2: Memoize TaskCard
- [ ] Phase 2.3: Fix inline handlers
- [ ] Phase 2.4: Async i18n init
- [ ] Phase 2.5: Context optimization

### Medium Priority (Week 2-3)

- [ ] Phase 3.1: Add AnimatedPressable
- [ ] Phase 3.2: Export AnimatedText
- [ ] Phase 3.3: Animation documentation

---

## Estimated Timeline

| Week   | Focus                  | Deliverables                   |
| ------ | ---------------------- | ------------------------------ |
| Week 1 | Security + Performance | Phase 1 + Phase 2              |
| Week 2 | Testing + Animation    | Phase 3 + Phase 4 (unit tests) |
| Week 3 | Testing Completion     | Phase 4 (integration + E2E)    |

**Total Estimated Effort**: 2-3 weeks with 1 developer
