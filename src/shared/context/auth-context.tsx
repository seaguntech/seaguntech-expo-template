import { supabase } from '@/config/supabase'
import { queryClient } from '@/shared/lib/query-client'
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
import * as Linking from 'expo-linking'
import * as WebBrowser from 'expo-web-browser'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { Platform } from 'react-native'

WebBrowser.maybeCompleteAuthSession()

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

const getStringParam = (value: string | string[] | null | undefined): string | null => {
  if (typeof value === 'string' && value.length > 0) return value
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) return value[0]
  return null
}

const extractSessionTokens = (
  callbackUrl: string,
): { accessToken: string | null; refreshToken: string | null } => {
  const parsed = Linking.parse(callbackUrl)
  const queryAccessToken = getStringParam(parsed.queryParams?.access_token)
  const queryRefreshToken = getStringParam(parsed.queryParams?.refresh_token)

  if (queryAccessToken && queryRefreshToken) {
    return {
      accessToken: queryAccessToken,
      refreshToken: queryRefreshToken,
    }
  }

  const hashParams = callbackUrl.split('#')[1]
  if (!hashParams) {
    return { accessToken: null, refreshToken: null }
  }

  const parsedHash = new URLSearchParams(hashParams)
  return {
    accessToken: parsedHash.get('access_token'),
    refreshToken: parsedHash.get('refresh_token'),
  }
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isInitializing: true,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  })

  const hydrate = useProfileStore((state) => state.hydrate)
  const clearProfile = useProfileStore((state) => state.clearProfile)
  const currentUserIdRef = useRef<string | null>(null)

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
          isInitializing: false,
          isLoading: false,
          isAuthenticated: !!session,
          error: null,
        })
        currentUserIdRef.current = session?.user?.id ?? null

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
          isInitializing: false,
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
      const nextUserId = session?.user?.id ?? null
      const didUserChange = currentUserIdRef.current !== nextUserId

      // Prevent cross-user data leakage by clearing all server caches on auth principal change.
      if (didUserChange) {
        await queryClient.cancelQueries()
        queryClient.clear()
      }
      currentUserIdRef.current = nextUserId

      setState({
        user: transformUser(session?.user ?? null),
        session,
        isInitializing: false,
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

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    // Validate input
    const validated = signInSchema.parse(credentials)

    const { error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    // Validate input with password confirmation
    const validated = signUpSchema.parse(credentials)
    const { email, password, displayName } = validated

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
        emailRedirectTo: getValidatedRedirectUrl('callback'),
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      await queryClient.cancelQueries()
      queryClient.clear()
      clearAuthStorage()
      clearProfile()
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Sign out failed',
      }))
      throw error
    }
  }, [clearProfile])

  const signInWithOAuth = useCallback(async (provider: OAuthProvider) => {
    // Validate redirect URL
    const redirectTo = getValidatedRedirectUrl('callback')

    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider.provider,
        options: {
          scopes: provider.scopes?.join(' '),
          redirectTo,
        },
      })
      if (error) throw error
      return
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider.provider,
      options: {
        scopes: provider.scopes?.join(' '),
        redirectTo,
        skipBrowserRedirect: true,
      },
    })
    if (error) throw error

    if (!data?.url) {
      throw new Error('OAuth sign in URL is missing')
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)
    if (result.type !== 'success' || !result.url) {
      return
    }

    const { accessToken, refreshToken } = extractSessionTokens(result.url)
    if (!accessToken || !refreshToken) {
      throw new Error('OAuth callback is missing session tokens')
    }

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (sessionError) throw sessionError
  }, [])

  const resetPassword = useCallback(async (credentials: ResetPasswordCredentials) => {
    // Validate email
    const validated = resetPasswordSchema.parse(credentials)

    // Validate redirect URL
    const redirectTo = getValidatedRedirectUrl('callback')

    const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
      redirectTo,
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (credentials: UpdatePasswordCredentials) => {
    // Validate password with confirmation
    const validated = updatePasswordSchema.parse(credentials)

    const { error } = await supabase.auth.updateUser({
      password: validated.password,
    })
    if (error) throw error
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

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }))
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
      clearError,
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
      clearError,
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
