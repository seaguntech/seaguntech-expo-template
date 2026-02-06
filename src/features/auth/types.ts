import type {
  AuthSession,
  AuthState,
  OAuthProvider,
  SignInCredentials,
  SignUpCredentials,
  User,
} from '@/types'

// Keep feature-level type exports aligned with shared canonical auth types.
export type Session = AuthSession
export type { AuthState, OAuthProvider, SignInCredentials, SignUpCredentials, User }
