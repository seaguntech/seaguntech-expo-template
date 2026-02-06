// @ts-nocheck
import { AuthProvider, useAuth } from '@/shared/context/auth-context'
import { act, renderHook, waitFor } from '@testing-library/react-native'
import type { ReactNode } from 'react'

// Mock Supabase
const mockSignInWithPassword = jest.fn()
const mockSignUp = jest.fn()
const mockSignOut = jest.fn()
const mockResetPasswordForEmail = jest.fn()
const mockUpdateUser = jest.fn()
const mockGetSession = jest.fn()
const mockRefreshSession = jest.fn()
const mockOnAuthStateChange = jest.fn()
const mockQueryClientCancelQueries = jest.fn()
const mockQueryClientClear = jest.fn()
const mockHydrate = jest.fn()
const mockClearProfile = jest.fn()
let authStateChangeHandler: ((event: string, session: unknown) => Promise<void> | void) | null =
  null

jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockGetSession(),
      signInWithPassword: (credentials: unknown) => mockSignInWithPassword(credentials),
      signUp: (data: unknown) => mockSignUp(data),
      signOut: () => mockSignOut(),
      signInWithOAuth: jest.fn(),
      resetPasswordForEmail: (email: string, options: unknown) =>
        mockResetPasswordForEmail(email, options),
      updateUser: (data: unknown) => mockUpdateUser(data),
      refreshSession: () => mockRefreshSession(),
      onAuthStateChange: (callback: (event: string, session: unknown) => Promise<void> | void) =>
        mockOnAuthStateChange(callback),
    },
  },
}))

jest.mock('@/shared/lib/query-client', () => ({
  queryClient: {
    cancelQueries: () => mockQueryClientCancelQueries(),
    clear: () => mockQueryClientClear(),
  },
}))

jest.mock('@/shared/lib/storage/supabase', () => ({
  clearAuthStorage: jest.fn(),
}))

jest.mock('@/shared/stores/profile-store', () => ({
  useProfileStore: jest.fn((selector) =>
    selector({
      hydrate: mockHydrate,
      clearProfile: mockClearProfile,
    }),
  ),
}))

const wrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    authStateChangeHandler = null
    mockGetSession.mockResolvedValue({ data: { session: null } })
    mockQueryClientCancelQueries.mockResolvedValue(undefined)
    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateChangeHandler = callback
      return {
        data: { subscription: { unsubscribe: jest.fn() } },
      }
    })
  })

  describe('initialization', () => {
    it('initializes with no session', async () => {
      mockGetSession.mockResolvedValue({ data: { session: null } })
      const { result } = renderHook(() => useAuth(), { wrapper })

      expect(result.current.isInitializing).toBe(true)

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false)
          expect(result.current.isInitializing).toBe(false)
        },
        { timeout: 10000 },
      )

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.user).toBeNull()
    })

    it('sets user when session exists', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        email_confirmed_at: '2024-01-01',
        created_at: '2024-01-01',
        user_metadata: {
          display_name: 'Test User',
          avatar_url: 'https://example.com/avatar.png',
        },
      }

      mockGetSession.mockResolvedValue({
        data: { session: { user: mockUser } },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(
        () => {
          expect(result.current.isLoading).toBe(false)
          expect(result.current.isInitializing).toBe(false)
        },
        { timeout: 10000 },
      )

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.user?.id).toBe('user-123')
      expect(result.current.user?.email).toBe('test@example.com')
    })
  })

  describe('signIn', () => {
    it('calls supabase signInWithPassword with valid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.signIn({
          email: 'test@example.com',
          password: 'password123',
        })
      })

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('rejects invalid email format', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.signIn({
            email: 'invalid-email',
            password: 'password123',
          })
        }),
      ).rejects.toThrow()
    })

    it('rejects empty password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.signIn({
            email: 'test@example.com',
            password: '',
          })
        }),
      ).rejects.toThrow()
    })
  })

  describe('signUp', () => {
    it('calls supabase signUp with valid data', async () => {
      mockSignUp.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.signUp({
          email: 'new@example.com',
          password: 'Password1',
          confirmPassword: 'Password1',
          displayName: 'New User',
        })
      })

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'Password1',
        options: {
          data: {
            display_name: 'New User',
          },
          emailRedirectTo: 'seaguntechexpotemplate://callback',
        },
      })
    })

    it('rejects weak password', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.signUp({
            email: 'new@example.com',
            password: 'weak',
            confirmPassword: 'weak',
          })
        }),
      ).rejects.toThrow()
    })

    it('rejects mismatched passwords', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.signUp({
            email: 'new@example.com',
            password: 'Password1',
            confirmPassword: 'Password2',
          })
        }),
      ).rejects.toThrow()
    })
  })

  describe('signOut', () => {
    it('calls supabase signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSignOut).toHaveBeenCalled()
    })

    it('clears query cache on sign out', async () => {
      mockSignOut.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockQueryClientCancelQueries).toHaveBeenCalled()
      expect(mockQueryClientClear).toHaveBeenCalled()
    })
  })

  describe('auth state change', () => {
    it('clears query cache when authenticated user changes', async () => {
      const firstUser = {
        id: 'user-1',
        email: 'first@example.com',
        created_at: '2024-01-01',
        user_metadata: {},
      }

      const secondUser = {
        id: 'user-2',
        email: 'second@example.com',
        created_at: '2024-01-01',
        user_metadata: {},
      }

      mockGetSession.mockResolvedValue({
        data: { session: { user: firstUser } },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await authStateChangeHandler?.('SIGNED_IN', { user: secondUser })
      })

      expect(mockQueryClientCancelQueries).toHaveBeenCalledTimes(1)
      expect(mockQueryClientClear).toHaveBeenCalledTimes(1)
    })

    it('does not clear query cache when auth event keeps same user', async () => {
      const firstUser = {
        id: 'user-1',
        email: 'first@example.com',
        created_at: '2024-01-01',
        user_metadata: {},
      }

      mockGetSession.mockResolvedValue({
        data: { session: { user: firstUser } },
      })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await authStateChangeHandler?.('TOKEN_REFRESHED', { user: firstUser })
      })

      expect(mockQueryClientCancelQueries).not.toHaveBeenCalled()
      expect(mockQueryClientClear).not.toHaveBeenCalled()
    })
  })

  describe('resetPassword', () => {
    it('calls supabase resetPasswordForEmail with valid email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.resetPassword({ email: 'test@example.com' })
      })

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'seaguntechexpotemplate://callback',
      })
    })

    it('rejects invalid email', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.resetPassword({ email: 'not-an-email' })
        }),
      ).rejects.toThrow()
    })
  })

  describe('updatePassword', () => {
    it('calls supabase updateUser with valid password', async () => {
      mockUpdateUser.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.updatePassword({
          password: 'NewPassword1',
          confirmPassword: 'NewPassword1',
        })
      })

      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'NewPassword1',
      })
    })

    it('rejects mismatched passwords', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.updatePassword({
            password: 'NewPassword1',
            confirmPassword: 'DifferentPassword1',
          })
        }),
      ).rejects.toThrow()
    })
  })
})

describe('useAuth hook', () => {
  it('throws error when used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')

    consoleSpy.mockRestore()
  })
})
