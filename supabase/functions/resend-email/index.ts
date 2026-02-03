import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@2.0.0'
import { validateSendEmail, checkPayloadSize, SendEmailRequest } from '../lib/validation.ts'
import { verifyAuth, unauthorizedResponse, AuthUser } from '../lib/auth.ts'
import { checkRateLimit, rateLimitResponse, addRateLimitHeaders } from '../lib/rate-limit.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? 'noreply@seaguntech.com'
const FUNCTION_NAME = 'resend-email'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailTemplate {
  subject: string
  html: string
}

// Email templates
const templates: Record<string, (data: Record<string, unknown>) => EmailTemplate> = {
  welcome: (data) => ({
    subject: 'Welcome to Seaguntech!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Welcome to Seaguntech!</h1>
          <p>Hi ${data.name ?? 'there'},</p>
          <p>Thank you for joining us! We're excited to have you on board.</p>
          <p>Get started by exploring our features and making the most of your experience.</p>
          <a href="${data.appUrl ?? 'https://seaguntech.com'}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Get Started</a>
          <p style="color: #6b7280; margin-top: 24px;">Best regards,<br>The Seaguntech Team</p>
        </body>
      </html>
    `,
  }),

  passwordReset: (data) => ({
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Reset Your Password</h1>
          <p>Hi ${data.name ?? 'there'},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${data.resetUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">Reset Password</a>
          <p style="color: #6b7280; margin-top: 24px;">If you didn't request this, please ignore this email.</p>
          <p style="color: #6b7280;">This link will expire in 1 hour.</p>
        </body>
      </html>
    `,
  }),

  invoice: (data) => ({
    subject: `Invoice #${data.invoiceNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3b82f6;">Invoice #${data.invoiceNumber}</h1>
          <p>Hi ${data.name ?? 'there'},</p>
          <p>Thank you for your payment!</p>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0;"><strong>Amount:</strong> ${data.amount}</p>
            <p style="margin: 8px 0 0;"><strong>Date:</strong> ${data.date}</p>
          </div>
          <a href="${data.invoiceUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Invoice</a>
        </body>
      </html>
    `,
  }),
}

async function handleRequest(req: Request, _user: AuthUser): Promise<Response> {
  // Check payload size (2MB limit for emails with HTML content)
  const bodyText = await req.text()
  const sizeCheck = checkPayloadSize(bodyText, 2 * 1024 * 1024)
  if (!sizeCheck.valid) {
    return new Response(JSON.stringify({ error: sizeCheck.error }), {
      status: 413,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!RESEND_API_KEY) {
    throw new Error('Resend API key not configured')
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

  const validation = validateSendEmail(body)
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

  const { to, subject, templateId, templateData, html, text } = validation.data as SendEmailRequest

  const resend = new Resend(RESEND_API_KEY)

  let emailContent: { subject: string; html?: string; text?: string }

  if (templateId && templates[templateId]) {
    const template = templates[templateId](templateData ?? {})
    emailContent = template
  } else if (html || text) {
    emailContent = { subject: subject ?? 'No Subject', html, text }
  } else {
    return new Response(
      JSON.stringify({ error: 'Either templateId or html/text content is required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const { data, error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  })

  if (error) throw error

  return new Response(JSON.stringify({ success: true, messageId: data?.id }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
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
