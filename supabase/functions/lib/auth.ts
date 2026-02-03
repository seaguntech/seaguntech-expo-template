// Authentication middleware for Supabase Edge Functions
// Provides JWT verification and user extraction from Bearer tokens

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

export interface AuthUser {
  id: string
  email?: string
  role?: string
}

export interface AuthResult {
  user: AuthUser | null
  error: string | null
}

/**
 * Verify the Authorization header and return the authenticated user
 * @param req - The incoming request
 * @returns AuthResult with user data or error message
 */
export async function verifyAuth(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    return { user: null, error: 'Missing Authorization header' }
  }

  if (!authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'Invalid Authorization header format. Expected: Bearer <token>' }
  }

  const token = authHeader.replace('Bearer ', '')

  if (!token || token.trim() === '') {
    return { user: null, error: 'Empty token provided' }
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    })

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      return { user: null, error: error.message }
    }

    if (!user) {
      return { user: null, error: 'Invalid or expired token' }
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      error: null,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Token verification failed'
    return { user: null, error: message }
  }
}

/**
 * Create a standard 401 Unauthorized response
 * @param message - Error message to include in the response
 * @param corsHeaders - CORS headers to include
 * @returns Response object with 401 status
 */
export function unauthorizedResponse(
  message: string,
  corsHeaders: Record<string, string> = {},
): Response {
  return new Response(
    JSON.stringify({
      error: 'Unauthorized',
      message,
    }),
    {
      status: 401,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  )
}

/**
 * Higher-order function that wraps a handler with authentication
 * @param handler - The request handler that requires authentication
 * @param corsHeaders - CORS headers to include in responses
 * @returns Wrapped handler that checks auth before executing
 */
export function requireAuth(
  handler: (req: Request, user: AuthUser) => Promise<Response>,
  corsHeaders: Record<string, string> = {},
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const { user, error } = await verifyAuth(req)

    if (error || !user) {
      return unauthorizedResponse(error ?? 'Authentication required', corsHeaders)
    }

    return handler(req, user)
  }
}

/**
 * Extract user ID from request for rate limiting purposes
 * Returns null if authentication fails
 * @param req - The incoming request
 * @returns User ID or null
 */
export async function extractUserId(req: Request): Promise<string | null> {
  const { user } = await verifyAuth(req)
  return user?.id ?? null
}
