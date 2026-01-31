// Auth Types

export interface User {
  id: string
  email: string
  emailConfirmedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface Session {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: User
}

export interface SignUpCredentials {
  email: string
  password: string
  displayName?: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface AuthActions {
  signIn: (credentials: SignInCredentials) => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
}

export type OAuthProvider = 'google' | 'apple'
