// Vitest setup file
import { vi } from 'vitest'

// Expo/web globals expected by native modules
;(globalThis as Record<string, unknown>).__DEV__ = false
;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

// Mock react-native to avoid Flow syntax parsing in Vitest
vi.mock('react-native', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('react-native-web')

  return {
    ...actual,
    Platform: {
      OS: 'ios',
      select: (options: Record<string, unknown>) => options?.ios ?? options?.default,
    },
    StyleSheet: {
      create: (styles: Record<string, unknown>) => styles,
      flatten: (style: unknown) => style,
    },
    Alert: {
      alert: vi.fn(),
    },
    TouchableOpacity: actual.Pressable,
    TurboModuleRegistry: {
      get: vi.fn(),
      getEnforcing: vi.fn(),
    },
  }
})

vi.mock('expo-linking', () => ({
  createURL: vi.fn((path?: string) => `seaguntechexpotemplate://${path ?? ''}`),
  parse: vi.fn(() => ({ queryParams: {} })),
}))

vi.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: vi.fn(),
  openAuthSessionAsync: vi.fn(async () => ({ type: 'dismiss' })),
}))

vi.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: vi.fn(() => vi.fn()),
    fetch: vi.fn(async () => ({ isConnected: true })),
  },
}))

// Mock react-native-mmkv
vi.mock('react-native-mmkv', () => ({
  MMKV: vi.fn().mockImplementation(() => ({
    getString: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    contains: vi.fn().mockReturnValue(false),
    getAllKeys: vi.fn().mockReturnValue([]),
  })),
  createMMKV: vi.fn().mockImplementation(() => ({
    getString: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    contains: vi.fn().mockReturnValue(false),
    getAllKeys: vi.fn().mockReturnValue([]),
  })),
}))

// Mock @react-navigation/native
vi.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: vi.fn(),
    goBack: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}))

// Mock expo-router
vi.mock('expo-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: vi.fn(),
}))
