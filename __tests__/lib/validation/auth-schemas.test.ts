// @ts-nocheck
import {
  getValidatedRedirectUrl,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
  validateRedirectUrl,
} from '@/shared/lib/validation'

describe('Auth Validation Schemas', () => {
  describe('signInSchema', () => {
    it('validates correct email and password', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid email format', () => {
      const result = signInSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format')
      }
    })

    it('rejects empty password', () => {
      const result = signInSchema.safeParse({
        email: 'test@example.com',
        password: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required')
      }
    })

    it('rejects missing email', () => {
      const result = signInSchema.safeParse({
        password: 'password123',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('signUpSchema', () => {
    const validSignUp = {
      email: 'test@example.com',
      password: 'Password1',
      confirmPassword: 'Password1',
      displayName: 'John Doe',
    }

    it('validates correct signup data', () => {
      const result = signUpSchema.safeParse(validSignUp)
      expect(result.success).toBe(true)
    })

    it('rejects password without uppercase letter', () => {
      const result = signUpSchema.safeParse({
        ...validSignUp,
        password: 'password1',
        confirmPassword: 'password1',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('uppercase')
      }
    })

    it('rejects password without lowercase letter', () => {
      const result = signUpSchema.safeParse({
        ...validSignUp,
        password: 'PASSWORD1',
        confirmPassword: 'PASSWORD1',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('lowercase')
      }
    })

    it('rejects password without number', () => {
      const result = signUpSchema.safeParse({
        ...validSignUp,
        password: 'Password',
        confirmPassword: 'Password',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('number')
      }
    })

    it('rejects password shorter than 8 characters', () => {
      const result = signUpSchema.safeParse({
        ...validSignUp,
        password: 'Pass1',
        confirmPassword: 'Pass1',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8 characters')
      }
    })

    it('rejects mismatched passwords', () => {
      const result = signUpSchema.safeParse({
        ...validSignUp,
        password: 'Password1',
        confirmPassword: 'Password2',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match')
      }
    })

    it('rejects short display name', () => {
      const result = signUpSchema.safeParse({
        ...validSignUp,
        displayName: 'A',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('2 characters')
      }
    })

    it('allows optional display name', () => {
      const { displayName, ...withoutDisplayName } = validSignUp
      const result = signUpSchema.safeParse(withoutDisplayName)
      expect(result.success).toBe(true)
    })
  })

  describe('resetPasswordSchema', () => {
    it('validates correct email', () => {
      const result = resetPasswordSchema.safeParse({
        email: 'test@example.com',
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid email', () => {
      const result = resetPasswordSchema.safeParse({
        email: 'not-an-email',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('updatePasswordSchema', () => {
    it('validates matching strong passwords', () => {
      const result = updatePasswordSchema.safeParse({
        password: 'NewPassword1',
        confirmPassword: 'NewPassword1',
      })
      expect(result.success).toBe(true)
    })

    it('rejects mismatched passwords', () => {
      const result = updatePasswordSchema.safeParse({
        password: 'NewPassword1',
        confirmPassword: 'DifferentPassword1',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match')
      }
    })

    it('rejects weak passwords', () => {
      const result = updatePasswordSchema.safeParse({
        password: 'weak',
        confirmPassword: 'weak',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('validateRedirectUrl', () => {
    it('accepts valid app scheme URL', () => {
      expect(validateRedirectUrl('seaguntechexpotemplate://auth/callback')).toBe(true)
    })

    it('accepts any path with valid scheme', () => {
      expect(validateRedirectUrl('seaguntechexpotemplate://reset-password')).toBe(true)
      expect(validateRedirectUrl('seaguntechexpotemplate://deep/nested/path')).toBe(true)
    })

    it('rejects invalid scheme', () => {
      expect(validateRedirectUrl('https://malicious.com')).toBe(false)
      expect(validateRedirectUrl('http://example.com')).toBe(false)
      expect(validateRedirectUrl('otherapp://callback')).toBe(false)
    })

    it('rejects empty URL', () => {
      expect(validateRedirectUrl('')).toBe(false)
    })
  })

  describe('getValidatedRedirectUrl', () => {
    it('returns valid redirect URL for valid path', () => {
      expect(getValidatedRedirectUrl('auth/callback')).toBe(
        'seaguntechexpotemplate://auth/callback',
      )
    })

    it('returns valid redirect URL for reset-password', () => {
      expect(getValidatedRedirectUrl('reset-password')).toBe(
        'seaguntechexpotemplate://reset-password',
      )
    })
  })
})
