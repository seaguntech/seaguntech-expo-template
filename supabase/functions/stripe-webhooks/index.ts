import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { checkPayloadSize } from '../lib/validation.ts'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? ''
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

/**
 * Log database errors without failing the webhook
 * Stripe will retry if we return non-2xx, so we log errors but return success
 */
function logDbError(operation: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[stripe-webhooks] Database error in ${operation}: ${message}`)
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response(JSON.stringify({ error: 'No signature provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!endpointSecret) {
    console.error('[stripe-webhooks] STRIPE_WEBHOOK_SECRET not configured')
    return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    // Check payload size (2MB limit for webhooks)
    const body = await req.text()
    const sizeCheck = checkPayloadSize(body, 2 * 1024 * 1024)
    if (!sizeCheck.valid) {
      return new Response(JSON.stringify({ error: sizeCheck.error }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Log successful payment
        const { error } = await supabase.from('payment_logs').insert({
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'succeeded',
          metadata: paymentIntent.metadata,
          created_at: new Date().toISOString(),
        })

        if (error) logDbError('payment_intent.succeeded', error)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Log failed payment
        const { error } = await supabase.from('payment_logs').insert({
          stripe_payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: 'failed',
          error_message: paymentIntent.last_payment_error?.message,
          metadata: paymentIntent.metadata,
          created_at: new Date().toISOString(),
        })

        if (error) logDbError('payment_intent.payment_failed', error)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription

        // Update user subscription status
        const customerId = subscription.customer as string
        const status = subscription.status
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()

        const { error } = await supabase.from('subscriptions').upsert(
          {
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status,
            current_period_end: currentPeriodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'stripe_subscription_id',
          },
        )

        if (error) logDbError(event.type, error)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        // Mark subscription as cancelled
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) logDbError('customer.subscription.deleted', error)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        // Log invoice payment
        if (invoice.subscription) {
          const { error } = await supabase.from('invoice_logs').insert({
            stripe_invoice_id: invoice.id,
            stripe_subscription_id: invoice.subscription as string,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            status: 'paid',
            created_at: new Date().toISOString(),
          })

          if (error) logDbError('invoice.payment_succeeded', error)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        // Log failed invoice
        if (invoice.subscription) {
          const { error: insertError } = await supabase.from('invoice_logs').insert({
            stripe_invoice_id: invoice.id,
            stripe_subscription_id: invoice.subscription as string,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
            status: 'failed',
            created_at: new Date().toISOString(),
          })

          if (insertError) logDbError('invoice.payment_failed (insert)', insertError)

          // Update subscription status
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_subscription_id', invoice.subscription)

          if (updateError) logDbError('invoice.payment_failed (update)', updateError)
        }
        break
      }

      default:
        // Unhandled event type - log for monitoring
        console.log(`[stripe-webhooks] Unhandled event type: ${event.type}`)
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`[stripe-webhooks] Error: ${errorMessage}`)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
