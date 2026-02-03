import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import {
  validateCreatePaymentIntent,
  checkPayloadSize,
  CreatePaymentIntentRequest,
} from '../lib/validation.ts'
import { verifyAuth, unauthorizedResponse, AuthUser } from '../lib/auth.ts'
import { checkRateLimit, rateLimitResponse, addRateLimitHeaders } from '../lib/rate-limit.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const FUNCTION_NAME = 'create-payment-intent'

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

  const validation = validateCreatePaymentIntent(body)
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

  const { amount, currency, metadata, customerId } = validation.data as CreatePaymentIntentRequest

  // Create payment intent with user tracking
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: currency.toLowerCase(),
    metadata: {
      ...metadata,
      user_id: user.id, // Track which user initiated the payment
    },
    ...(customerId && { customer: customerId }),
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return new Response(
    JSON.stringify({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
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
