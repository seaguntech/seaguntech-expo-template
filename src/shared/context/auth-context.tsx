import { supabase } from '@/config/supabase'
import { clearAuthStorage } from '@/shared/lib/storage/supabase'
import {
  getValidatedRedirectUrl,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from '@/shared/lib/validation'
import { useProfileStore } from '@/shared/stores/profile-store'
import type {
  AuthContextValue,
  AuthState,
  OAuthProvider,
  ResetPasswordCredentials,
  SignInCredentials,
  SignUpCredentials,
  UpdatePasswordCredentials,
  User,
} from '@/types'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const AuthContext = createContext<AuthContextValue | null>(null)

// Transform Supabase user to our User type
const transformUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null

  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    emailVerified: supabaseUser.email_confirmed_at !== null,
    displayName: supabaseUser.user_metadata?.display_name ?? null,
    avatarUrl: supabaseUser.user_metadata?.avatar_url ?? null,
    createdAt: supabaseUser.created_at,
    updatedAt: supabaseUser.updated_at ?? supabaseUser.created_at,
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const hydrate = useProfileStore((state) => state.hydrate)
  const clearProfile = useProfileStore((state) => state.clearProfile)

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        setState({
          user: transformUser(session?.user ?? null),
          session,
          isLoading: false,
          isAuthenticated: !!session,
          error: null,
        })

        // Update profile store
        if (session?.user) {
          hydrate({
            email: session.user.email ?? null,
            displayName: session.user.user_metadata?.display_name ?? null,
            avatarUrl: session.user.user_metadata?.avatar_url ?? null,
          })
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to initialize auth',
        }))
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setState({
        user: transformUser(session?.user ?? null),
        session,
        isLoading: false,
        isAuthenticated: !!session,
        error: null,
      })

      // Update profile store on auth change
      if (session?.user) {
        hydrate({
          email: session.user.email ?? null,
          displayName: session.user.user_metadata?.display_name ?? null,
          avatarUrl: session.user.user_metadata?.avatar_url ?? null,
        })
      } else {
        clearProfile()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [hydrate, clearProfile])

  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      // Validate input
      const validated = signInSchema.parse(credentials)

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: validated.email,
          password: validated.password,
        })
        if (error) throw error
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Sign in failed',
        }))
        throw error
      }
    },
    [setState],
  )

  const signUp = useCallback(
    async (credentials: SignUpCredentials) => {
      // Validate input with password confirmation
      const validated = signUpSchema.parse(credentials)

      setState((prev) => ({ ...prev, isLoading: true, error: null }))
      try {
        const { error } = await supabase.auth.signUp({
          email: validated.email,
          password: validated.password,
          options: {
            data: {
              display_name: validated.displayName,
            },
            emailRedirectTo: getValidatedRedirectUrl('auth/callback'),
          },
        })
        if (error) throw error
        setState((prev) => ({ ...prev, isLoading: false }))
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Sign up failed',
        }))
        throw error
      }
    },
    [setState],
  )

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      clearAuthStorage()
      clearProfile()
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }))
      throw error
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      // Validate redirect URL
      const redirectTo = getValidatedRedirectUrl('auth/callback')

      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider.provider,
        options: {
          scopes: provider.scopes?.join(' '),
          redirectTo,
        },
      })
      if (error) throw error
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'OAuth sign in failed',
      }))
      throw error
    }
  }, [])

  const resetPassword = useCallback(async (credentials: ResetPasswordCredentials) => {
    // Validate email
    const validated = resetPasswordSchema.parse(credentials)

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      // Validate redirect URL
      const redirectTo = getValidatedRedirectUrl('reset-password')

      const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
        redirectTo,
      })
      if (error) throw error
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password reset failed',
      }))
      throw error
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const updatePassword = useCallback(async (credentials: UpdatePasswordCredentials) => {
    // Validate password with confirmation
    const validated = updatePasswordSchema.parse(credentials)

    setState((prev) => ({ ...prev, isLoading: true, error: null }))
    try {
      const { error } = await supabase.auth.updateUser({
        password: validated.password,
      })
      if (error) throw error
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Password update failed',
      }))
      throw error
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [])

  const refreshSession = useCallback(async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.refreshSession()
      if (error) throw error

      setState((prev) => ({
        ...prev,
        session,
        user: transformUser(session?.user ?? null),
      }))
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Session refresh failed',
      }))
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
      resetPassword,
      updatePassword,
      refreshSession,
    }),
    [
      state,
      signIn,
      signUp,
      signOut,
      signInWithOAuth,
      resetPassword,
      updatePassword,
      refreshSession,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { AuthContext }
