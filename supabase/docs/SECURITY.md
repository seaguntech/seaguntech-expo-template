# Security Guide

This document describes the security architecture and best practices for the Supabase backend.

## Authentication

### Supabase Auth

The project uses Supabase Auth for user authentication, supporting:

- Email/password authentication
- OAuth providers (Google, Apple)
- Magic links
- Phone authentication (optional)

### JWT Tokens

User sessions are managed via JWT tokens:

- **Access Token**: Short-lived (default 1 hour), used for API requests
- **Refresh Token**: Long-lived, used to obtain new access tokens

### Edge Function Authentication

All Edge Functions (except `stripe-webhooks`) require authentication:

```typescript
// lib/auth.ts
const { user, error } = await verifyAuth(req)
if (error || !user) {
  return unauthorizedResponse(error, corsHeaders)
}
```

The `verifyAuth` function:

1. Extracts the Bearer token from the Authorization header
2. Validates the token with Supabase Auth
3. Returns the authenticated user or an error

## Authorization

### Row Level Security (RLS)

All user-facing tables have RLS enabled with policies that enforce:

- Users can only access their own data
- Service role bypasses RLS for server-side operations

Example policy:

```sql
CREATE POLICY "Users can view their own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id);
```

### Policy Summary

| Table             | SELECT   | INSERT   | UPDATE   | DELETE   |
| ----------------- | -------- | -------- | -------- | -------- |
| profiles          | Own only | Own only | Own only | -        |
| tasks             | Own only | Own only | Own only | Own only |
| push_tokens       | Own only | Own only | Own only | Own only |
| subscriptions     | Own only | -        | -        | -        |
| notification_logs | Own only | -        | -        | -        |

**Note**: `subscriptions` are managed by Stripe webhooks using the service role.

## Rate Limiting

Edge Functions implement per-user rate limiting:

| Function               | Limit  | Window |
| ---------------------- | ------ | ------ |
| ai-completion          | 10 req | 1 min  |
| send-notifications     | 30 req | 1 min  |
| resend-email           | 5 req  | 1 min  |
| create-payment-intent  | 10 req | 1 min  |
| create-stripe-checkout | 10 req | 1 min  |

Rate limiting prevents:

- API abuse
- Cost overruns (especially for AI/payment functions)
- DoS attacks

## Input Validation

### Request Validation

All Edge Functions validate input using `lib/validation.ts`:

```typescript
const validation = validateAICompletion(body)
if (!validation.valid) {
  return new Response(
    JSON.stringify({
      error: validation.error,
      errors: validation.errors,
    }),
    { status: 400 },
  )
}
```

### Validation Rules

- **Email**: RFC 5322 format validation
- **URLs**: Valid URL format with protocol
- **Strings**: Length limits enforced
- **Numbers**: Range and type validation
- **Arrays**: Max length limits
- **Enums**: Allowed values only

### Payload Size Limits

All functions check payload size:

- AI completion: 2MB
- Email: 2MB
- Notifications: 1MB
- Payment: 1MB
- Webhooks: 2MB

## Secrets Management

### Environment Variables

Secrets are stored as Supabase secrets, never in code:

```bash
# Set secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set STRIPE_SECRET_KEY=sk_live_...

# Access in code
const apiKey = Deno.env.get('OPENAI_API_KEY')
```

### Required Secrets

| Secret                | Purpose              | Where to Get     |
| --------------------- | -------------------- | ---------------- |
| OPENAI_API_KEY        | AI completions       | OpenAI Dashboard |
| STRIPE_SECRET_KEY     | Stripe payments      | Stripe Dashboard |
| STRIPE_WEBHOOK_SECRET | Webhook verification | Stripe Dashboard |
| RESEND_API_KEY        | Email sending        | Resend Dashboard |
| EXPO_ACCESS_TOKEN     | Push notifications   | Expo Dashboard   |

### Secret Rotation

To rotate secrets:

1. Generate new secret in the provider dashboard
2. Update in Supabase: `supabase secrets set SECRET_NAME=new_value`
3. Revoke old secret in provider dashboard

## Stripe Webhook Security

Webhooks use Stripe signature verification instead of JWT:

```typescript
const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
```

This ensures:

- Request came from Stripe
- Payload wasn't tampered with
- Replay attacks are prevented

## Known Vulnerabilities Fixed

### Email Enumeration (Fixed)

**Issue**: The `check_email_exists()` function allowed attackers to enumerate registered emails.

**Fix**: Function removed in migration `20260203100000_security_fixes.sql`.

**Alternative**: Use Supabase Auth error messages which don't distinguish between "email not found" and "wrong password".

### Multi-Device Push Tokens (Fixed)

**Issue**: `push_tokens.user_id` was UNIQUE, preventing multi-device support.

**Fix**: Changed to `UNIQUE(user_id, token)` to allow multiple tokens per user.

### Orphaned Subscriptions (Fixed)

**Issue**: `subscriptions.user_id` allowed NULL values.

**Fix**: Column now NOT NULL, preventing orphaned records.

## Security Checklist

### Before Deploying

- [ ] All secrets are set via `supabase secrets set`
- [ ] No hardcoded API keys in code
- [ ] RLS enabled on all user tables
- [ ] Edge Functions have auth checks
- [ ] Rate limiting configured appropriately
- [ ] Input validation in place

### Regular Audits

- [ ] Review RLS policies monthly
- [ ] Rotate API keys quarterly
- [ ] Check for unused secrets
- [ ] Review Edge Function logs for abuse
- [ ] Update dependencies for security patches

### Adding New Features

When adding new features:

1. **New Table**:
   - Enable RLS: `ALTER TABLE new_table ENABLE ROW LEVEL SECURITY`
   - Add policies for each operation
   - Add appropriate indexes

2. **New Edge Function**:
   - Add auth verification
   - Add rate limiting
   - Add input validation
   - Add payload size check

3. **New API Endpoint**:
   - Validate all inputs
   - Check user permissions
   - Log sensitive operations
   - Handle errors gracefully

## CORS Configuration

Edge Functions use permissive CORS for development:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
```

For production, consider restricting to your domains:

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://yourdomain.com',
  // ...
}
```

## Logging and Monitoring

### What's Logged

- Payment attempts (payment_logs table)
- Invoice events (invoice_logs table)
- Notification sends (notification_logs table)
- Edge Function errors (Supabase Logs)

### What's NOT Logged

- Full request bodies (privacy)
- User passwords (security)
- Full JWT tokens (security)

### Viewing Logs

```bash
# Edge Function logs
supabase functions logs ai-completion

# Database logs (via Supabase Dashboard)
# Project Settings > Database > Logs
```

## Incident Response

### Suspected Breach

1. **Immediate**:
   - Rotate affected secrets
   - Review recent logs
   - Check for unauthorized data access

2. **Investigation**:
   - Identify attack vector
   - Scope of data exposed
   - Timeline of events

3. **Remediation**:
   - Fix vulnerability
   - Notify affected users (if required)
   - Document and learn

### Contact

For security issues, contact: security@seaguntech.com
