import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type RootStackParamList = {
  '(auth)': NavigatorScreenParams<AuthStackParamList>
  '(protected)': NavigatorScreenParams<ProtectedStackParamList>
  onboarding: undefined
  '+not-found': undefined
}

export type AuthStackParamList = {
  welcome: undefined
  'sign-in': undefined
  'sign-up': undefined
  'reset-password': undefined
}

export type ProtectedStackParamList = {
  '(tabs)': NavigatorScreenParams<TabParamList>
  'privacy-policy': undefined
  'terms-of-service': undefined
}

export type TabParamList = {
  index: undefined
  ai: undefined
  notifications: undefined
  offline: undefined
  payment: undefined
  premium: undefined
  profile: undefined
  settings: undefined
  tasks: undefined
}

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<AuthStackParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>

export type ProtectedStackScreenProps<T extends keyof ProtectedStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProtectedStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  ProtectedStackScreenProps<keyof ProtectedStackParamList>
>

export interface DeepLinkConfig {
  prefixes: string[]
  config: {
    screens: Record<string, string | object>
  }
}

export interface TabItem {
  name: keyof TabParamList
  title: string
  icon: string
  iconFocused: string
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
