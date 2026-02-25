import { useCache } from '@/hooks/use-cache'
import { act, renderHook } from '../react-native-testing'

// Mock MMKV
vi.mock('react-native-mmkv', () => {
  const storage = {
    getString: vi.fn(),
    setString: vi.fn(),
    getBoolean: vi.fn(),
    setBoolean: vi.fn(),
    getNumber: vi.fn(),
    setNumber: vi.fn(),
    delete: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(),
    clearAll: vi.fn(),
    getAllKeys: vi.fn(() => []),
  }

  return {
    MMKV: vi.fn().mockImplementation(() => storage),
    createMMKV: vi.fn().mockImplementation(() => storage),
  }
})

describe('useCache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null for non-existent cache key', () => {
    const { result } = renderHook(() => useCache())

    const value = result.current.get('non-existent-key')
    expect(value).toBeNull()
  })

  it('should set and get cached values', () => {
    const { result } = renderHook(() => useCache())

    act(() => {
      result.current.set('test-key', { foo: 'bar' })
    })

    // Memory cache should have the value
    const value = result.current.get('test-key')
    expect(value).toEqual({ foo: 'bar' })
  })

  it('should remove cached values', () => {
    const { result } = renderHook(() => useCache())

    act(() => {
      result.current.set('test-key', { foo: 'bar' })
      result.current.remove('test-key')
    })

    const value = result.current.get('test-key')
    expect(value).toBeNull()
  })
})
