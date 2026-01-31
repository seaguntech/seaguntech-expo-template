import { cn, debounce, formatDate, isValidEmail } from '../../src/shared/lib/utils'

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('base-class', 'additional-class')
      expect(result).toContain('base-class')
      expect(result).toContain('additional-class')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', false && 'hidden', true && 'visible')
      expect(result).toContain('base')
      expect(result).toContain('visible')
      expect(result).not.toContain('hidden')
    })

    it('should handle undefined and null', () => {
      const result = cn('base', undefined, null, 'end')
      expect(result).toContain('base')
      expect(result).toContain('end')
    })
  })

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const date = '2025-01-28T10:00:00Z'
      const result = formatDate(date)
      expect(result).toBeDefined()
      expect(typeof result).toBe('string')
    })

    it('should handle Date objects', () => {
      const date = new Date('2025-01-28T10:00:00Z')
      const result = formatDate(date)
      expect(result).toBeDefined()
    })
  })

  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should debounce function calls', () => {
      const fn = jest.fn()
      const debouncedFn = debounce(fn, 300)

      debouncedFn()
      debouncedFn()
      debouncedFn()

      expect(fn).not.toHaveBeenCalled()

      jest.advanceTimersByTime(300)

      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should call function with latest arguments', () => {
      const fn = jest.fn()
      const debouncedFn = debounce(fn, 300)

      debouncedFn('first')
      debouncedFn('second')
      debouncedFn('third')

      jest.advanceTimersByTime(300)

      expect(fn).toHaveBeenCalledWith('third')
    })
  })

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.org')).toBe(true)
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('invalid@')).toBe(false)
      expect(isValidEmail('@domain.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })
  })
})
