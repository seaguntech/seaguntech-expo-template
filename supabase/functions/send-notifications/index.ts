import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const EXPO_ACCESS_TOKEN = Deno.env.get('EXPO_ACCESS_TOKEN') ?? ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendNotificationRequest {
  userId?: string
  userIds?: string[]
  title: string
  body: string
  data?: Record<string, unknown>
  badge?: number
  sound?: string
  channelId?: string
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const {
      userId,
      userIds,
      title,
      body,
      data,
      badge,
      sound = 'default',
      channelId = 'default',
    }: SendNotificationRequest = await req.json()

    if (!title || !body) {
      return new Response(JSON.stringify({ error: 'Title and body are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const targetUserIds = userIds ?? (userId ? [userId] : [])

    if (targetUserIds.length === 0) {
      return new Response(JSON.stringify({ error: 'At least one userId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get push tokens for users
    const { data: tokens, error: tokensError } = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', targetUserIds)

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
      body,
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

    // Log notifications
    await supabase.from('notification_logs').insert(
      targetUserIds.map((uid) => ({
        user_id: uid,
        title,
        body,
        data,
        status: 'sent',
        created_at: new Date().toISOString(),
      })),
    )

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
