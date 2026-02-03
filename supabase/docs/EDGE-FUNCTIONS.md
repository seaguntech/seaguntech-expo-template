# Edge Functions Guide

This document describes the Supabase Edge Functions available in this project.

## Overview

Edge Functions are serverless functions running on Deno Deploy. They handle:

- AI completions via OpenAI
- Payment processing via Stripe
- Email sending via Resend
- Push notifications via Expo

**Important**: All Edge Functions (except `stripe-webhooks`) require user authentication.

## Authentication

All Edge Functions (except `stripe-webhooks`) require authentication via Bearer token.

**Client-side**: The Supabase client automatically includes the user's JWT token when using `supabase.functions.invoke()`. No manual token handling is required if the user is signed in.

```typescript
// Client-side (React Native) - token is automatically included
const { data, error } = await supabase.functions.invoke('ai-completion', {
  body: { messages: [...] }
})
```

**Direct API call** (for testing):

```bash
curl -X POST https://your-project.supabase.co/functions/v1/ai-completion \
  -H "Authorization: Bearer <user-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

### Getting a User JWT

```typescript
const {
  data: { session },
} = await supabase.auth.getSession()
const token = session?.access_token
```

## Rate Limiting

All authenticated functions have rate limiting per user:

| Function               | Limit       | Window   |
| ---------------------- | ----------- | -------- |
| ai-completion          | 10 requests | 1 minute |
| send-notifications     | 30 requests | 1 minute |
| resend-email           | 5 requests  | 1 minute |
| create-payment-intent  | 10 requests | 1 minute |
| create-stripe-checkout | 10 requests | 1 minute |

Rate limit headers are included in responses:

- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Function Reference

### ai-completion

OpenAI chat completions proxy with user tracking.

**Endpoint**: `POST /functions/v1/ai-completion`

**Authentication**: Required

**Rate Limit**: 10 req/min

**Request Body**:

```json
{
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user", "content": "Hello!" }
  ],
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "maxTokens": 2048,
  "stream": false
}
```

| Field              | Type    | Required | Default       | Description                       |
| ------------------ | ------- | -------- | ------------- | --------------------------------- |
| messages           | array   | Yes      | -             | Chat messages array               |
| messages[].role    | string  | Yes      | -             | "user", "assistant", or "system"  |
| messages[].content | string  | Yes      | -             | Message content (max 10000 chars) |
| model              | string  | No       | "gpt-4o-mini" | OpenAI model ID                   |
| temperature        | number  | No       | 0.7           | 0-2, higher = more random         |
| maxTokens          | number  | No       | 2048          | Max tokens to generate (1-4096)   |
| stream             | boolean | No       | false         | Enable streaming response         |

**Response (non-streaming)**:

```json
{
  "content": "Hello! How can I help you today?",
  "usage": {
    "promptTokens": 25,
    "completionTokens": 10,
    "totalTokens": 35
  }
}
```

**Response (streaming)**: Server-Sent Events stream

---

### create-payment-intent

Create a Stripe PaymentIntent for one-time payments.

**Endpoint**: `POST /functions/v1/create-payment-intent`

**Authentication**: Required

**Rate Limit**: 10 req/min

**Request Body**:

```json
{
  "amount": 1999,
  "currency": "usd",
  "customerId": "cus_xxx",
  "metadata": {
    "productId": "prod_123"
  }
}
```

| Field      | Type   | Required | Description                                         |
| ---------- | ------ | -------- | --------------------------------------------------- |
| amount     | number | Yes      | Amount in cents (positive, max 99999999)            |
| currency   | string | Yes      | 3-letter ISO currency code                          |
| customerId | string | No       | Existing Stripe customer ID                         |
| metadata   | object | No       | Key-value pairs (max 40 char keys, 500 char values) |

**Response**:

```json
{
  "clientSecret": "pi_xxx_secret_xxx",
  "paymentIntentId": "pi_xxx"
}
```

---

### create-stripe-checkout

Create a Stripe Checkout Session for subscriptions or one-time purchases.

**Endpoint**: `POST /functions/v1/create-stripe-checkout`

**Authentication**: Required

**Rate Limit**: 10 req/min

**Request Body**:

```json
{
  "priceId": "price_xxx",
  "successUrl": "https://example.com/success",
  "cancelUrl": "https://example.com/cancel",
  "mode": "subscription",
  "customerId": "cus_xxx",
  "metadata": {}
}
```

| Field      | Type   | Required | Description                                 |
| ---------- | ------ | -------- | ------------------------------------------- |
| priceId    | string | Yes      | Stripe Price ID (must start with "price\_") |
| successUrl | string | Yes      | Redirect URL on success                     |
| cancelUrl  | string | Yes      | Redirect URL on cancel                      |
| mode       | string | No       | "subscription" (default) or "payment"       |
| customerId | string | No       | Existing Stripe customer ID                 |
| metadata   | object | No       | Additional metadata                         |

**Response**:

```json
{
  "sessionId": "cs_xxx",
  "url": "https://checkout.stripe.com/c/pay/cs_xxx"
}
```

---

### send-notifications

Send push notifications via Expo Push API.

**Endpoint**: `POST /functions/v1/send-notifications`

**Authentication**: Required

**Rate Limit**: 30 req/min

**Request Body**:

```json
{
  "userId": "uuid-here",
  "userIds": ["uuid1", "uuid2"],
  "title": "New Message",
  "body": "You have a new message!",
  "data": { "screen": "messages" },
  "badge": 1,
  "sound": "default",
  "channelId": "default"
}
```

| Field     | Type     | Required                 | Description                             |
| --------- | -------- | ------------------------ | --------------------------------------- |
| userId    | string   | Either userId or userIds | Single recipient                        |
| userIds   | string[] | Either userId or userIds | Multiple recipients (max 100)           |
| title     | string   | Yes                      | Notification title (max 100 chars)      |
| body      | string   | Yes                      | Notification body (max 500 chars)       |
| data      | object   | No                       | Custom data payload                     |
| badge     | number   | No                       | iOS badge count                         |
| sound     | string   | No                       | Sound name (default: "default")         |
| channelId | string   | No                       | Android channel ID (default: "default") |

**Response**:

```json
{
  "success": true,
  "sent": 2,
  "tickets": [...]
}
```

---

### resend-email

Send emails via Resend API with template support.

**Endpoint**: `POST /functions/v1/resend-email`

**Authentication**: Required

**Rate Limit**: 5 req/min

**Request Body (with template)**:

```json
{
  "to": "user@example.com",
  "templateId": "welcome",
  "templateData": {
    "name": "John",
    "appUrl": "https://example.com"
  }
}
```

**Request Body (with HTML)**:

```json
{
  "to": ["user1@example.com", "user2@example.com"],
  "subject": "Hello!",
  "html": "<h1>Hello World</h1>",
  "text": "Hello World"
}
```

| Field        | Type               | Required | Description                                          |
| ------------ | ------------------ | -------- | ---------------------------------------------------- |
| to           | string or string[] | Yes      | Recipient(s) (max 50)                                |
| subject      | string             | No       | Email subject (max 200 chars)                        |
| templateId   | string             | No       | Template name: "welcome", "passwordReset", "invoice" |
| templateData | object             | No       | Data to inject into template                         |
| html         | string             | No       | HTML content (max 50000 chars)                       |
| text         | string             | No       | Plain text content (max 10000 chars)                 |

At least one of `templateId`, `html`, or `text` must be provided.

**Available Templates**:

- `welcome` - Welcome email with name, appUrl
- `passwordReset` - Password reset with name, resetUrl
- `invoice` - Invoice receipt with name, invoiceNumber, amount, date, invoiceUrl

**Response**:

```json
{
  "success": true,
  "messageId": "abc123"
}
```

---

### stripe-webhooks

Handle Stripe webhook events. **Does NOT require user authentication** - uses Stripe signature verification.

**Endpoint**: `POST /functions/v1/stripe-webhooks`

**Authentication**: Stripe signature

**Handled Events**:

- `payment_intent.succeeded` - Log successful payment
- `payment_intent.payment_failed` - Log failed payment
- `customer.subscription.created` - Create/update subscription
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Mark subscription canceled
- `invoice.payment_succeeded` - Log successful invoice payment
- `invoice.payment_failed` - Log failed invoice, update subscription

**Response**:

```json
{
  "received": true
}
```

## Error Handling

All functions return consistent error responses:

**400 Bad Request** - Validation error

```json
{
  "error": "Amount must be a positive number",
  "errors": ["Amount must be a positive number"]
}
```

**401 Unauthorized** - Missing or invalid auth

```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

**413 Payload Too Large** - Request body too large

```json
{
  "error": "Request body too large (2000000 bytes, max 1048576 bytes)"
}
```

**429 Too Many Requests** - Rate limit exceeded

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "retryAfter": 45
}
```

**500 Internal Server Error** - Server error

```json
{
  "error": "OpenAI API error"
}
```

## Local Development

### Start Functions Locally

```bash
# Serve all functions
supabase functions serve

# Serve specific function with debug output
supabase functions serve ai-completion --debug

# With environment variables
supabase functions serve --env-file .env.local
```

### Testing Locally

```bash
# Get a test JWT (requires local Supabase running)
# Sign in via your app or use the Supabase Studio

# Test ai-completion
curl -X POST http://localhost:54321/functions/v1/ai-completion \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Test without auth (should return 401)
curl -X POST http://localhost:54321/functions/v1/ai-completion \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

### Environment Variables

Required secrets for local development:

```bash
# .env.local
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
EXPO_ACCESS_TOKEN=...
FROM_EMAIL=noreply@yourdomain.com
```

## Deployment

### Deploy All Functions

```bash
supabase functions deploy
```

### Deploy Single Function

```bash
supabase functions deploy ai-completion
```

### Set Production Secrets

```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set RESEND_API_KEY=re_...
supabase secrets set EXPO_ACCESS_TOKEN=...
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
```

### View Logs

```bash
# All functions
supabase functions logs

# Specific function
supabase functions logs ai-completion
```

## Shared Libraries

### lib/auth.ts

Authentication middleware for verifying JWT tokens.

```typescript
import { verifyAuth, unauthorizedResponse, AuthUser } from '../lib/auth.ts'

const { user, error } = await verifyAuth(req)
if (error || !user) {
  return unauthorizedResponse(error ?? 'Authentication required', corsHeaders)
}
// user.id, user.email, user.role available
```

### lib/rate-limit.ts

In-memory rate limiting per user.

```typescript
import { checkRateLimit, rateLimitResponse, addRateLimitHeaders } from '../lib/rate-limit.ts'

const result = checkRateLimit(user.id, 'my-function')
if (!result.allowed) {
  return rateLimitResponse(result, corsHeaders)
}
// Add headers to successful response
return addRateLimitHeaders(response, result)
```

### lib/validation.ts

Request body validation utilities.

```typescript
import { validateAICompletion, checkPayloadSize } from '../lib/validation.ts'

const sizeCheck = checkPayloadSize(bodyText, 1024 * 1024)
if (!sizeCheck.valid) return errorResponse(sizeCheck.error)

const validation = validateAICompletion(JSON.parse(bodyText))
if (!validation.valid) return errorResponse(validation.error)

const { messages, model } = validation.data
```
