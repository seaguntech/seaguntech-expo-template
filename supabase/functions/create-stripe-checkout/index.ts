import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import {
  validateCreateCheckout,
  checkPayloadSize,
  CreateCheckoutRequest,
} from '../lib/validation.ts'
import { verifyAuth, unauthorizedResponse, AuthUser } from '../lib/auth.ts'
import { checkRateLimit, rateLimitResponse, addRateLimitHeaders } from '../lib/rate-limit.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const FUNCTION_NAME = 'create-stripe-checkout'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function handleRequest(req: Request, user: AuthUser): Promise<Response> {
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

  const validation = validateCreateCheckout(body)
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

  const { priceId, successUrl, cancelUrl, customerId, metadata, mode } =
    validation.data as CreateCheckoutRequest

  // Create checkout session with user tracking
  const session = await stripe.checkout.sessions.create({
    mode,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    ...(customerId && { customer: customerId }),
    metadata: {
      ...metadata,
      user_id: user.id, // Track which user initiated the checkout
    },
    allow_promotion_codes: true,
    billing_address_collection: 'auto',
  })

  return new Response(
    JSON.stringify({
      sessionId: session.id,
      url: session.url,
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
