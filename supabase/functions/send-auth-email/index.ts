import { Resend } from 'https://esm.sh/resend@4.0.0'
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0'
import { templates } from './templates.generated.ts'

const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)
// Hook secret format from Supabase is "v1,whsec_<base64>" - need to extract the base64 part
const rawHookSecret = Deno.env.get('SEND_EMAIL_HOOK_SECRET') || ''
const hookSecret = rawHookSecret.startsWith('v1,whsec_')
  ? rawHookSecret.replace('v1,whsec_', '')
  : rawHookSecret
const fromEmail = Deno.env.get('FROM_EMAIL') || 'noreply@seaguntech.com'
const appName = Deno.env.get('APP_NAME') || 'Seaguntech'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  user: {
    id: string
    email: string
    user_metadata?: {
      display_name?: string
    }
  }
  email_data: {
    token: string
    token_hash: string
    redirect_to?: string
    email_action_type: 'signup' | 'recovery' | 'invite' | 'magiclink' | 'email_change'
    site_url: string
    token_new?: string
    token_hash_new?: string
  }
}

const templateSubjects = {
  signup: `Confirm your email - ${appName}`,
  recovery: `Reset your password - ${appName}`,
  magiclink: `Sign in to ${appName}`,
  email_change: `Confirm your email change - ${appName}`,
  invite: `You are invited to ${appName}`,
} as const

function buildConfirmationUrl(
  siteUrl: string,
  tokenHash: string,
  type: string,
  redirectTo?: string,
): string {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  if (!supabaseUrl?.startsWith('http://') && !supabaseUrl?.startsWith('https://')) {
    throw new Error('Cannot build confirmation URL: missing valid SUPABASE_URL')
  }

  // Keep an https verification link for email clients (Gmail web can strip custom schemes).
  const verifyUrl = new URL(`${supabaseUrl}/auth/v1/verify`)
  verifyUrl.searchParams.set('token', tokenHash)
  verifyUrl.searchParams.set('type', type)
  verifyUrl.searchParams.set('redirect_to', redirectTo ?? siteUrl)
  return verifyUrl.toString()
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    // Verify webhook signature
    const payload = await req.text()
    const headers = Object.fromEntries(req.headers)

    const wh = new Webhook(hookSecret)
    const { user, email_data } = wh.verify(payload, headers) as EmailPayload

    const { token_hash, redirect_to, email_action_type, site_url } = email_data

    const displayName = user.user_metadata?.display_name || 'there'
    const currentYear = String(new Date().getFullYear())

    let emailContent: { subject: string; html: string }

    switch (email_action_type) {
      case 'signup': {
        const confirmationUrl = buildConfirmationUrl(site_url, token_hash, 'signup', redirect_to)
        emailContent = {
          subject: templateSubjects.signup,
          html: templates.signup({ appName, name: displayName, confirmationUrl, currentYear }),
        }
        break
      }
      case 'recovery': {
        const recoveryUrl = buildConfirmationUrl(site_url, token_hash, 'recovery', redirect_to)
        emailContent = {
          subject: templateSubjects.recovery,
          html: templates.recovery({ appName, name: displayName, recoveryUrl, currentYear }),
        }
        break
      }
      case 'magiclink': {
        const magicLinkUrl = buildConfirmationUrl(site_url, token_hash, 'magiclink', redirect_to)
        emailContent = {
          subject: templateSubjects.magiclink,
          html: templates.magiclink({ appName, name: displayName, magicLinkUrl, currentYear }),
        }
        break
      }
      case 'email_change': {
        const confirmationUrl = buildConfirmationUrl(
          site_url,
          token_hash,
          'email_change',
          redirect_to,
        )
        emailContent = {
          subject: templateSubjects.email_change,
          html: templates.emailChange({
            appName,
            name: displayName,
            confirmationUrl,
            newEmail: user.email,
            currentYear,
          }),
        }
        break
      }
      case 'invite': {
        const confirmationUrl = buildConfirmationUrl(site_url, token_hash, 'invite', redirect_to)
        emailContent = {
          subject: templateSubjects.invite,
          html: templates.invite({
            appName,
            name: displayName,
            confirmationUrl,
            currentYear,
            siteUrl: site_url,
          }),
        }
        break
      }
      default:
        return new Response(
          JSON.stringify({ error: { message: `Unknown email action type: ${email_action_type}` } }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        )
    }

    // Send email via Resend
    const { error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: [user.email],
      subject: emailContent.subject,
      html: emailContent.html,
    })

    if (resendError) {
      return new Response(JSON.stringify({ error: { message: resendError.message } }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
})
