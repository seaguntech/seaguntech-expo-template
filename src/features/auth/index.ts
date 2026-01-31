// Auth Feature - Public API

// Components
export {
  AppleProviderButton,
  EmailLoginForm,
  EmailLoginToggle,
  GoogleProviderButton,
  Separator,
  SocialLoginButtons,
} from './components'

// Types
export type {
  User,
  Session,
  SignUpCredentials,
  SignInCredentials,
  AuthState,
  OAuthProvider,
} from './types'

// Note: Auth context is in shared/context for app-wide access
// Use: import { useAuth } from '@/shared/context'
