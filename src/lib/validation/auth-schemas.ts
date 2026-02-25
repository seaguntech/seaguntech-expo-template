import { z } from 'zod'

// Email validation
const emailSchema = z.string().email('Invalid email format')

// Password validation with strength requirements
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// Sign in schema - less strict password (user may have old password)
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Sign up schema - strict password requirements
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// Reset password schema
export const resetPasswordSchema = z.object({
  email: emailSchema,
})

// Update password schema
export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

// OAuth redirect validation
const ALLOWED_REDIRECT_SCHEMES = ['seaguntechexpotemplate://'] as const

export function validateRedirectUrl(url: string): boolean {
  return ALLOWED_REDIRECT_SCHEMES.some((scheme) => url.startsWith(scheme))
}

export function getValidatedRedirectUrl(path: string): string {
  const redirectUrl = `seaguntechexpotemplate://${path}`
  if (!validateRedirectUrl(redirectUrl)) {
    throw new Error('Invalid redirect URL')
  }
  return redirectUrl
}

// Type exports
export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
