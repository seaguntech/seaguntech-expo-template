import '@testing-library/jest-native/extend-expect'

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock')
  Reanimated.default.call = () => {}
  return Reanimated
})

// Mock expo modules that aren't available in test environment
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}))

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  addNotificationReceivedListener: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  removeNotificationSubscription: jest.fn(),
}))

jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  modelName: 'iPhone 14',
  osName: 'iOS',
  osVersion: '16.0',
}))

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
}))

// Mock react-native-mmkv globally
jest.mock('react-native-mmkv', () => {
  const createMockStorage = () => {
    const store = new Map()
    return {
      getString: jest.fn((key) => store.get(key)),
      setString: jest.fn((key, value) => store.set(key, value)),
      getBoolean: jest.fn((key) => store.get(key)),
      setBoolean: jest.fn((key, value) => store.set(key, value)),
      getNumber: jest.fn((key) => store.get(key)),
      setNumber: jest.fn((key, value) => store.set(key, value)),
      set: jest.fn((key, value) => store.set(key, value)),
      delete: jest.fn((key) => store.delete(key)),
      remove: jest.fn((key) => store.delete(key)),
      contains: jest.fn((key) => store.has(key)),
      clearAll: jest.fn(() => store.clear()),
      getAllKeys: jest.fn(() => [...store.keys()]),
    }
  }

  return {
    MMKV: jest.fn().mockImplementation(createMockStorage),
    createMMKV: jest.fn().mockImplementation(createMockStorage),
  }
})

// Mock @supabase/supabase-js
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

// Mock expo-audio
jest.mock('expo-audio', () => ({
  useAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  })),
}))

// Mock @react-native-community/netinfo
jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: {},
  }),
  useNetInfo: jest.fn(() => ({
    isConnected: true,
    isInternetReachable: true,
    type: 'wifi',
    details: {},
  })),
}))
