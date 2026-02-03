import type { Session } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  emailVerified: boolean
  displayName: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  confirmPassword: string
  displayName?: string
}

export interface ResetPasswordCredentials {
  email: string
}

export interface UpdatePasswordCredentials {
  password: string
  confirmPassword: string
}

export interface OAuthProvider {
  provider: 'google' | 'apple'
  scopes?: string[]
}

export interface AuthContextValue extends AuthState {
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: OAuthProvider) => Promise<void>
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>
  updatePassword: (credentials: UpdatePasswordCredentials) => Promise<void>
  refreshSession: () => Promise<void>
}

export type AuthScreen = 'welcome' | 'sign-in' | 'sign-up' | 'reset-password'
