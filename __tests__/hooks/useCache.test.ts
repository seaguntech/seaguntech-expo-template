import { act, renderHook } from '@testing-library/react-native'

// Mock MMKV
jest.mock('react-native-mmkv', () => {
  const storage = {
    getString: jest.fn(),
    setString: jest.fn(),
    getBoolean: jest.fn(),
    setBoolean: jest.fn(),
    getNumber: jest.fn(),
    setNumber: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    contains: jest.fn(),
    clearAll: jest.fn(),
    getAllKeys: jest.fn(() => []),
  }

  return {
    MMKV: jest.fn().mockImplementation(() => storage),
    createMMKV: jest.fn().mockImplementation(() => storage),
  }
})

describe('useCache', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return null for non-existent cache key', () => {
    const { useCache } = require('@/shared/hooks/use-cache')
    const { result } = renderHook(() => useCache())

    const value = result.current.get('non-existent-key')
    expect(value).toBeNull()
  })

  it('should set and get cached values', () => {
    const { useCache } = require('@/shared/hooks/use-cache')
    const { result } = renderHook(() => useCache())

    act(() => {
      result.current.set('test-key', { foo: 'bar' })
    })

    // Memory cache should have the value
    const value = result.current.get('test-key')
    expect(value).toEqual({ foo: 'bar' })
  })

  it('should remove cached values', () => {
    const { useCache } = require('@/shared/hooks/use-cache')
    const { result } = renderHook(() => useCache())

    act(() => {
      result.current.set('test-key', { foo: 'bar' })
      result.current.remove('test-key')
    })

    const value = result.current.get('test-key')
    expect(value).toBeNull()
  })
})
