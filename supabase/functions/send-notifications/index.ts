import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import {
  validateSendNotification,
  checkPayloadSize,
  SendNotificationRequest,
} from '../lib/validation.ts'
import { verifyAuth, unauthorizedResponse, AuthUser } from '../lib/auth.ts'
import { checkRateLimit, rateLimitResponse, addRateLimitHeaders } from '../lib/rate-limit.ts'

const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN') ?? ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const FUNCTION_NAME = 'send-notifications'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExpoPushMessage {
  to: string
  title: string
  body: string
  data?: Record<string, unknown>
  badge?: number
  sound?: string
  channelId?: string
}

async function handleRequest(req: Request, _user: AuthUser): Promise<Response> {
  // Check payload size (1MB limit)
  const bodyText = await req.text()
  const sizeCheck = checkPayloadSize(bodyText, 1024 * 1024)
  if (!sizeCheck.valid) {
    return new Response(JSON.stringify({ error: sizeCheck.error }), {
      status: 413,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Parse and validate request body
  let body: unknown
  try {
    body = JSON.parse(bodyText)
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const validation = validateSendNotification(body)
  if (!validation.valid) {
    return new Response(
      JSON.stringify({
        error: validation.error,
        errors: validation.errors,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }

  const {
    userIds,
    title,
    body: notificationBody,
    data,
    badge,
    sound = 'default',
    channelId = 'default',
  } = validation.data as SendNotificationRequest

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  // Get push tokens for users
  const { data: tokens, error: tokensError } = await supabase
    .from('push_tokens')
    .select('token')
    .in('user_id', userIds)

  if (tokensError) throw tokensError

  if (!tokens || tokens.length === 0) {
    return new Response(JSON.stringify({ error: 'No push tokens found for specified users' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  // Build Expo push messages
  const messages: ExpoPushMessage[] = tokens.map((t) => ({
    to: t.token,
    title,
    body: notificationBody,
    data,
    badge,
    sound,
    channelId,
  }))

  // Send to Expo Push API
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      ...(EXPO_ACCESS_TOKEN && { Authorization: `Bearer ${EXPO_ACCESS_TOKEN}` }),
    },
    body: JSON.stringify(messages),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.errors?.[0]?.message ?? 'Expo Push API error')
  }

  const result = await response.json()

  // Log notifications (non-blocking, don't fail if logging fails)
  try {
    const { error: logError } = await supabase.from('notification_logs').insert(
      userIds.map((uid) => ({
        user_id: uid,
        title,
        body: notificationBody,
        data,
        status: 'sent',
        created_at: new Date().toISOString(),
      })),
    )
    if (logError) {
      console.error('Failed to log notifications:', logError.message)
    }
  } catch (logErr) {
    console.error('Failed to log notifications:', logErr)
  }

  return new Response(
    JSON.stringify({
      success: true,
      sent: tokens.length,
      tickets: result.data,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  )
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const { user, error: authError } = await verifyAuth(req)
    if (authError || !user) {
      return unauthorizedResponse(authError ?? 'Authentication required', corsHeaders)
    }

    // Check rate limit
    const rateLimitResult = checkRateLimit(user.id, FUNCTION_NAME)
    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult, corsHeaders)
    }

    // Handle the request
    const response = await handleRequest(req, user)

    // Add rate limit headers to response
    return addRateLimitHeaders(response, rateLimitResult)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
