// Validation helpers for Supabase Edge Functions
// Provides type-safe input validation without external dependencies

export interface ValidationResult<T> {
  valid: boolean
  data?: T
  error?: string
  errors?: string[]
}

// Helper functions for common validations
export const validators = {
  isString: (value: unknown): value is string => typeof value === 'string',

  isNumber: (value: unknown): value is number =>
    typeof value === 'number' && !isNaN(value) && isFinite(value),

  isPositiveNumber: (value: unknown): value is number => validators.isNumber(value) && value > 0,

  isObject: (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value),

  isArray: <T>(value: unknown): value is T[] => Array.isArray(value),

  isStringArray: (value: unknown): value is string[] =>
    Array.isArray(value) && value.every((item) => typeof item === 'string'),

  isBoolean: (value: unknown): value is boolean => typeof value === 'boolean',

  isEnum: <T extends string>(value: unknown, allowedValues: readonly T[]): value is T =>
    typeof value === 'string' && allowedValues.includes(value as T),

  isUrl: (value: unknown): value is string => {
    if (typeof value !== 'string') return false
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  isEmail: (value: unknown): value is string => {
    if (typeof value !== 'string') return false
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  hasMinLength: (value: string, min: number): boolean => value.length >= min,

  hasMaxLength: (value: string, max: number): boolean => value.length <= max,
}

// Validation error builder
export class ValidationError {
  errors: string[] = []

  add(message: string): void {
    this.errors.push(message)
  }

  addIf(condition: boolean, message: string): void {
    if (condition) this.errors.push(message)
  }

  isValid(): boolean {
    return this.errors.length === 0
  }

  getError(): string {
    return this.errors.join(', ')
  }

  getErrors(): string[] {
    return [...this.errors]
  }
}

// Generic request body validator
export function validateRequestBody<T>(
  body: unknown,
  validate: (data: Record<string, unknown>, errors: ValidationError) => T | null,
): ValidationResult<T> {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body: expected object' }
  }

  const errors = new ValidationError()
  const data = validate(body as Record<string, unknown>, errors)

  if (!errors.isValid()) {
    return { valid: false, error: errors.getError(), errors: errors.getErrors() }
  }

  if (data === null) {
    return { valid: false, error: 'Validation failed' }
  }

  return { valid: true, data }
}

// Specific validation schemas
export interface CreatePaymentIntentRequest {
  amount: number
  currency: string
  metadata?: Record<string, string>
  customerId?: string
}

export function validateCreatePaymentIntent(
  body: unknown,
): ValidationResult<CreatePaymentIntentRequest> {
  return validateRequestBody<CreatePaymentIntentRequest>(body, (data, errors) => {
    const { amount, currency, metadata, customerId } = data

    // Validate amount
    if (!validators.isPositiveNumber(amount)) {
      errors.add('Amount must be a positive number')
    } else if (amount > 99999999) {
      errors.add('Amount exceeds maximum allowed value')
    }

    // Validate currency
    if (!validators.isString(currency)) {
      errors.add('Currency is required')
    } else if (currency.length !== 3) {
      errors.add('Currency must be a valid 3-letter ISO code')
    }

    // Validate metadata (optional)
    if (metadata !== undefined && !validators.isObject(metadata)) {
      errors.add('Metadata must be an object')
    } else if (metadata !== undefined) {
      // Validate metadata values are strings
      for (const [key, value] of Object.entries(metadata)) {
        if (!validators.isString(value)) {
          errors.add(`Metadata value for "${key}" must be a string`)
        }
        if (key.length > 40) {
          errors.add(`Metadata key "${key}" exceeds 40 character limit`)
        }
        if (typeof value === 'string' && value.length > 500) {
          errors.add(`Metadata value for "${key}" exceeds 500 character limit`)
        }
      }
    }

    // Validate customerId (optional)
    if (customerId !== undefined && !validators.isString(customerId)) {
      errors.add('Customer ID must be a string')
    }

    return {
      amount: amount as number,
      currency: currency as string,
      metadata: metadata as Record<string, string> | undefined,
      customerId: customerId as string | undefined,
    }
  })
}

export interface CreateCheckoutRequest {
  priceId: string
  successUrl: string
  cancelUrl: string
  customerId?: string
  metadata?: Record<string, string>
  mode?: 'payment' | 'subscription'
}

export function validateCreateCheckout(body: unknown): ValidationResult<CreateCheckoutRequest> {
  return validateRequestBody<CreateCheckoutRequest>(body, (data, errors) => {
    const { priceId, successUrl, cancelUrl, customerId, metadata, mode } = data

    // Validate priceId
    if (!validators.isString(priceId)) {
      errors.add('Price ID is required')
    } else if (!priceId.startsWith('price_')) {
      errors.add('Invalid Price ID format')
    }

    // Validate URLs
    if (!validators.isString(successUrl)) {
      errors.add('Success URL is required')
    } else if (!validators.isUrl(successUrl)) {
      errors.add('Success URL must be a valid URL')
    }

    if (!validators.isString(cancelUrl)) {
      errors.add('Cancel URL is required')
    } else if (!validators.isUrl(cancelUrl)) {
      errors.add('Cancel URL must be a valid URL')
    }

    // Validate customerId (optional)
    if (customerId !== undefined && !validators.isString(customerId)) {
      errors.add('Customer ID must be a string')
    }

    // Validate metadata (optional)
    if (metadata !== undefined && !validators.isObject(metadata)) {
      errors.add('Metadata must be an object')
    }

    // Validate mode (optional)
    const validModes = ['payment', 'subscription'] as const
    if (mode !== undefined && !validators.isEnum(mode, validModes)) {
      errors.add('Mode must be either "payment" or "subscription"')
    }

    return {
      priceId: priceId as string,
      successUrl: successUrl as string,
      cancelUrl: cancelUrl as string,
      customerId: customerId as string | undefined,
      metadata: metadata as Record<string, string> | undefined,
      mode: (mode as 'payment' | 'subscription') ?? 'subscription',
    }
  })
}

export interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AICompletionRequest {
  messages: Message[]
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export function validateAICompletion(body: unknown): ValidationResult<AICompletionRequest> {
  return validateRequestBody<AICompletionRequest>(body, (data, errors) => {
    const { messages, model, temperature, maxTokens, stream } = data

    // Validate messages
    if (!validators.isArray(messages)) {
      errors.add('Messages array is required')
    } else if (messages.length === 0) {
      errors.add('At least one message is required')
    } else if (messages.length > 50) {
      errors.add('Too many messages (max 50)')
    } else {
      // Validate each message
      messages.forEach((msg, index) => {
        if (!validators.isObject(msg)) {
          errors.add(`Message ${index} must be an object`)
          return
        }

        const { role, content } = msg as Record<string, unknown>
        const validRoles = ['user', 'assistant', 'system'] as const

        if (!validators.isEnum(role, validRoles)) {
          errors.add(`Message ${index}: role must be "user", "assistant", or "system"`)
        }

        if (!validators.isString(content)) {
          errors.add(`Message ${index}: content is required`)
        } else if (content.length === 0) {
          errors.add(`Message ${index}: content cannot be empty`)
        } else if (content.length > 10000) {
          errors.add(`Message ${index}: content exceeds 10000 characters`)
        }
      })
    }

    // Validate model (optional)
    if (model !== undefined && !validators.isString(model)) {
      errors.add('Model must be a string')
    }

    // Validate temperature (optional)
    if (temperature !== undefined) {
      if (!validators.isNumber(temperature)) {
        errors.add('Temperature must be a number')
      } else if (temperature < 0 || temperature > 2) {
        errors.add('Temperature must be between 0 and 2')
      }
    }

    // Validate maxTokens (optional)
    if (maxTokens !== undefined) {
      if (!validators.isNumber(maxTokens)) {
        errors.add('Max tokens must be a number')
      } else if (maxTokens < 1 || maxTokens > 4096) {
        errors.add('Max tokens must be between 1 and 4096')
      }
    }

    // Validate stream (optional)
    if (stream !== undefined && !validators.isBoolean(stream)) {
      errors.add('Stream must be a boolean')
    }

    return {
      messages: messages as Message[],
      model: (model as string) ?? 'gpt-4o-mini',
      temperature: (temperature as number) ?? 0.7,
      maxTokens: (maxTokens as number) ?? 2048,
      stream: (stream as boolean) ?? false,
    }
  })
}

export interface SendEmailRequest {
  to: string | string[]
  subject?: string
  templateId?: string
  templateData?: Record<string, unknown>
  html?: string
  text?: string
}

export function validateSendEmail(body: unknown): ValidationResult<SendEmailRequest> {
  return validateRequestBody<SendEmailRequest>(body, (data, errors) => {
    const { to, subject, templateId, templateData, html, text } = data

    // Validate to (required)
    if (to === undefined) {
      errors.add('Recipient (to) is required')
    } else if (validators.isString(to)) {
      if (!validators.isEmail(to)) {
        errors.add('Invalid recipient email address')
      }
    } else if (validators.isArray(to)) {
      if (to.length === 0) {
        errors.add('At least one recipient is required')
      } else if (to.length > 50) {
        errors.add('Too many recipients (max 50)')
      } else {
        to.forEach((email, index) => {
          if (!validators.isString(email) || !validators.isEmail(email)) {
            errors.add(`Invalid email address at index ${index}`)
          }
        })
      }
    } else {
      errors.add('Recipient (to) must be an email string or array of emails')
    }

    // Validate subject
    if (subject !== undefined && !validators.isString(subject)) {
      errors.add('Subject must be a string')
    } else if (validators.isString(subject) && subject.length > 200) {
      errors.add('Subject exceeds 200 characters')
    }

    // Validate templateId (optional)
    if (templateId !== undefined && !validators.isString(templateId)) {
      errors.add('Template ID must be a string')
    }

    // Validate templateData (optional)
    if (templateData !== undefined && !validators.isObject(templateData)) {
      errors.add('Template data must be an object')
    }

    // Validate html (optional)
    if (html !== undefined && !validators.isString(html)) {
      errors.add('HTML content must be a string')
    } else if (validators.isString(html) && html.length > 50000) {
      errors.add('HTML content exceeds 50000 characters')
    }

    // Validate text (optional)
    if (text !== undefined && !validators.isString(text)) {
      errors.add('Text content must be a string')
    } else if (validators.isString(text) && text.length > 10000) {
      errors.add('Text content exceeds 10000 characters')
    }

    // Ensure at least one content type is provided
    const hasTemplate = templateId !== undefined
    const hasHtml = html !== undefined
    const hasText = text !== undefined

    if (!hasTemplate && !hasHtml && !hasText) {
      errors.add('At least one of templateId, html, or text must be provided')
    }

    return {
      to: to as string | string[],
      subject: subject as string | undefined,
      templateId: templateId as string | undefined,
      templateData: templateData as Record<string, unknown> | undefined,
      html: html as string | undefined,
      text: text as string | undefined,
    }
  })
}

export interface SendNotificationRequest {
  userId?: string
  userIds?: string[]
  title: string
  body: string
  data?: Record<string, unknown>
  badge?: number
  sound?: string
  channelId?: string
}

export function validateSendNotification(body: unknown): ValidationResult<SendNotificationRequest> {
  return validateRequestBody<SendNotificationRequest>(body, (data, errors) => {
    const { userId, userIds, title, body, data: payload, badge, sound, channelId } = data

    // Validate userId or userIds (at least one required)
    const hasUserId = userId !== undefined
    const hasUserIds = userIds !== undefined

    if (!hasUserId && !hasUserIds) {
      errors.add('Either userId or userIds is required')
    }

    if (hasUserId && !validators.isString(userId)) {
      errors.add('userId must be a string')
    }

    if (hasUserIds) {
      if (!validators.isStringArray(userIds)) {
        errors.add('userIds must be an array of strings')
      } else if (userIds.length === 0) {
        errors.add('userIds array cannot be empty')
      } else if (userIds.length > 100) {
        errors.add('Too many user IDs (max 100)')
      }
    }

    // Validate title (required)
    if (!validators.isString(title)) {
      errors.add('Title is required')
    } else if (title.length === 0) {
      errors.add('Title cannot be empty')
    } else if (title.length > 100) {
      errors.add('Title exceeds 100 characters')
    }

    // Validate body (required)
    if (!validators.isString(body)) {
      errors.add('Body is required')
    } else if (body.length === 0) {
      errors.add('Body cannot be empty')
    } else if (body.length > 500) {
      errors.add('Body exceeds 500 characters')
    }

    // Validate data/payload (optional)
    if (payload !== undefined && !validators.isObject(payload)) {
      errors.add('Data must be an object')
    }

    // Validate badge (optional)
    if (badge !== undefined) {
      if (!validators.isNumber(badge)) {
        errors.add('Badge must be a number')
      } else if (badge < 0 || !Number.isInteger(badge)) {
        errors.add('Badge must be a non-negative integer')
      }
    }

    // Validate sound (optional)
    if (sound !== undefined && !validators.isString(sound)) {
      errors.add('Sound must be a string')
    }

    // Validate channelId (optional)
    if (channelId !== undefined && !validators.isString(channelId)) {
      errors.add('Channel ID must be a string')
    }

    // Convert single userId to array for consistent processing
    const targetUserIds = hasUserIds ? (userIds as string[]) : hasUserId ? [userId as string] : []

    return {
      userId: userId as string | undefined,
      userIds: targetUserIds,
      title: title as string,
      body: body as string,
      data: payload as Record<string, unknown> | undefined,
      badge: badge as number | undefined,
      sound: sound as string | undefined,
      channelId: channelId as string | undefined,
    }
  })
}

// Payload size limit check
export function checkPayloadSize(
  body: string,
  maxSizeBytes: number = 1024 * 1024,
): ValidationResult<never> {
  const size = new TextEncoder().encode(body).length
  if (size > maxSizeBytes) {
    return {
      valid: false,
      error: `Request body too large (${size} bytes, max ${maxSizeBytes} bytes)`,
    }
  }
  return { valid: true }
}
