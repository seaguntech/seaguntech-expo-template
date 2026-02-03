import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { validateAICompletion, checkPayloadSize, AICompletionRequest } from '../lib/validation.ts'
import { verifyAuth, unauthorizedResponse, AuthUser } from '../lib/auth.ts'
import { checkRateLimit, rateLimitResponse, addRateLimitHeaders } from '../lib/rate-limit.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') ?? ''
const FUNCTION_NAME = 'ai-completion'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function handleRequest(req: Request, user: AuthUser): Promise<Response> {
  // Check payload size (2MB limit for AI requests)
  const bodyText = await req.text()
  const sizeCheck = checkPayloadSize(bodyText, 2 * 1024 * 1024)
  if (!sizeCheck.valid) {
    return new Response(JSON.stringify({ error: sizeCheck.error }), {
      status: 413,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
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

  const validation = validateAICompletion(body)
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

  const { messages, model, temperature, maxTokens, stream } = validation.data as AICompletionRequest

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream,
      user: user.id, // Track usage per user
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message ?? 'OpenAI API error')
  }

  if (stream) {
    // Return streaming response
    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content ?? ''

  return new Response(
    JSON.stringify({
      content,
      usage: {
        promptTokens: data.usage?.prompt_tokens,
        completionTokens: data.usage?.completion_tokens,
        totalTokens: data.usage?.total_tokens,
      },
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
