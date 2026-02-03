// Rate limiting middleware for Supabase Edge Functions
// In-memory rate limiting with configurable windows per user

interface RateLimitEntry {
  count: number
  resetAt: number
}

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

// In-memory store for rate limiting
// Note: This resets when the function cold starts
// For production, consider using Redis or Supabase table
const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupExpiredEntries(): void {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
  lastCleanup = now
}

/**
 * Default rate limit configurations per function
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'ai-completion': { maxRequests: 10, windowMs: 60 * 1000 }, // 10 req/min
  'send-notifications': { maxRequests: 30, windowMs: 60 * 1000 }, // 30 req/min
  'resend-email': { maxRequests: 5, windowMs: 60 * 1000 }, // 5 req/min
  'create-payment-intent': { maxRequests: 10, windowMs: 60 * 1000 }, // 10 req/min
  'create-stripe-checkout': { maxRequests: 10, windowMs: 60 * 1000 }, // 10 req/min
  default: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 req/min
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
}

/**
 * Check rate limit for a user/function combination
 * @param userId - The user ID to rate limit
 * @param functionName - The function name for config lookup
 * @param config - Optional custom config (overrides default)
 * @returns RateLimitResult with allowed status and metadata
 */
export function checkRateLimit(
  userId: string,
  functionName: string,
  config?: RateLimitConfig,
): RateLimitResult {
  cleanupExpiredEntries()

  const { maxRequests, windowMs } = config ?? RATE_LIMITS[functionName] ?? RATE_LIMITS.default
  const key = `${functionName}:${userId}`
  const now = Date.now()

  const entry = rateLimitStore.get(key)

  // No existing entry or window has expired
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(key, newEntry)

    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
    }
  }

  // Window still active
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfter,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(key, entry)

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Create a 429 Too Many Requests response
 * @param result - The rate limit result
 * @param corsHeaders - CORS headers to include
 * @returns Response object with 429 status
 */
export function rateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string> = {},
): Response {
  return new Response(
    JSON.stringify({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${result.retryAfter} seconds.`,
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter ?? 60),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.floor(result.resetAt / 1000)),
      },
    },
  )
}

/**
 * Add rate limit headers to a response
 * @param response - The original response
 * @param result - The rate limit result
 * @returns New response with rate limit headers
 */
export function addRateLimitHeaders(response: Response, result: RateLimitResult): Response {
  const headers = new Headers(response.headers)
  headers.set('X-RateLimit-Remaining', String(result.remaining))
  headers.set('X-RateLimit-Reset', String(Math.floor(result.resetAt / 1000)))

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Reset rate limit for a specific user/function (useful for testing)
 * @param userId - The user ID
 * @param functionName - The function name
 */
export function resetRateLimit(userId: string, functionName: string): void {
  const key = `${functionName}:${userId}`
  rateLimitStore.delete(key)
}

/**
 * Get current rate limit status without incrementing
 * @param userId - The user ID
 * @param functionName - The function name
 * @returns Current remaining requests or null if no entry
 */
export function getRateLimitStatus(
  userId: string,
  functionName: string,
): { remaining: number; resetAt: number } | null {
  const { maxRequests } = RATE_LIMITS[functionName] ?? RATE_LIMITS.default
  const key = `${functionName}:${userId}`
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < Date.now()) {
    return null
  }

  return {
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}
