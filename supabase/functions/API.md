# Seaguntech Edge Functions API Documentation

This directory contains the OpenAPI specification for all Supabase Edge Functions in the Seaguntech Expo Template.

## API Specification

The complete API specification is available in [`openapi.yaml`](./openapi.yaml).

### Viewing the Documentation

You can view the interactive API documentation using Swagger UI or Redoc:

#### Option 1: Swagger Editor (Online)

1. Go to [https://editor.swagger.io/](https://editor.swagger.io/)
2. Copy the contents of `openapi.yaml`
3. Paste into the editor

#### Option 2: Swagger UI (Local)

```bash
# Install swagger-ui
npm install -g swagger-ui

# Serve the documentation
swagger-ui serve supabase/functions/openapi.yaml
```

#### Option 3: Redoc (Local)

```bash
# Install redoc-cli
npm install -g @redocly/cli

# Build static documentation
redocly build-docs supabase/functions/openapi.yaml --output api-docs.html

# Or serve with hot reload
redocly preview-docs supabase/functions/openapi.yaml
```

## API Overview

### Authentication

All API endpoints require a Supabase anonymous API key passed in the `apikey` header:

```
apikey: your-anon-key
```

### Base URL

```
https://{your-project-ref}.supabase.co/functions/v1
```

## Endpoints

### Payments

#### POST `/create-payment-intent`

Creates a Stripe Payment Intent for processing payments.

**Key Features:**

- Validates amount and currency
- Supports metadata for custom data
- Optional customer association
- Returns client secret for client-side completion

**Validation:**

- Amount must be a positive integer (max: 99,999,999)
- Currency must be a valid 3-letter ISO code
- Metadata keys limited to 40 characters
- Metadata values limited to 500 characters

#### POST `/create-stripe-checkout`

Creates a Stripe Checkout session for subscriptions or one-time payments.

**Key Features:**

- Supports both payment and subscription modes
- Configurable success/cancel URLs
- Promotion code support
- Automatic billing address collection

**Validation:**

- Price ID must start with 'price\_'
- URLs must be valid HTTP(S) URLs

#### POST `/stripe-webhooks`

Handles Stripe webhook events.

**Important:**

- Requires valid Stripe signature in `stripe-signature` header
- Processes payment and subscription events
- Updates database records accordingly
- Payload size limit: 2MB

**Supported Events:**

- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### AI

#### POST `/ai-completion`

Generates AI text completions using OpenAI's API.

**Key Features:**

- Supports multiple models
- Configurable temperature and max tokens
- Optional streaming responses
- Token usage tracking

**Validation:**

- At least 1 message required (max: 50)
- Each message requires role and content
- Content limited to 10,000 characters
- Temperature must be between 0 and 2
- Max tokens must be between 1 and 4,096

**Rate Limits:**

- Request body size limit: 2MB

### Email

#### POST `/resend-email`

Sends emails using Resend service.

**Key Features:**

- Template-based emails (welcome, passwordReset, invoice)
- Custom HTML/text content
- Multiple recipients (up to 50)
- Template variable substitution

**Templates:**

- `welcome` - Welcome email for new users
- `passwordReset` - Password reset instructions
- `invoice` - Payment invoice

**Validation:**

- Valid email address(es) required
- At least one of: templateId, html, or text
- Subject limited to 200 characters
- HTML content limited to 50,000 characters
- Text content limited to 10,000 characters

### Notifications

#### POST `/send-notifications`

Sends push notifications via Expo Push Service.

**Key Features:**

- Single or multiple user targeting
- Badge count support
- Custom sound and channel IDs
- Additional data payload

**Validation:**

- At least one userId or userIds required
- Title required (max: 100 characters)
- Body required (max: 500 characters)
- Up to 100 users can be targeted at once

**Process:**

1. Validates user IDs
2. Retrieves push tokens from database
3. Builds Expo push messages
4. Sends to Expo Push API
5. Logs notifications in database

## Validation & Security

### Request Validation

All endpoints include comprehensive input validation:

- Type checking for all parameters
- Length limits on strings
- Range validation for numbers
- Format validation for emails and URLs
- Payload size limits

### Security Headers

All responses include appropriate CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type
```

### Error Responses

Standardized error response format:

```json
{
  "error": "Human-readable error message",
  "errors": ["Detailed validation error 1", "Detailed validation error 2"]
}
```

HTTP Status Codes:

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found (e.g., no push tokens)
- `413` - Payload Too Large
- `500` - Internal Server Error

## Environment Variables

Each function requires specific environment variables:

### Payments

```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

### AI

```
OPENAI_API_KEY
```

### Email

```
RESEND_API_KEY
FROM_EMAIL
```

### Notifications

```
EXPO_ACCESS_TOKEN
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

## Testing

You can test the endpoints using curl:

### Payment Intent Example

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/create-payment-intent \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "currency": "usd",
    "metadata": {"orderId": "12345"}
  }'
```

### AI Completion Example

```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/ai-completion \
  -H "apikey: your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello!"}],
    "model": "gpt-4o-mini"
  }'
```

## Contributing

When adding new edge functions:

1. Add the function implementation to the appropriate subdirectory
2. Update `openapi.yaml` with the new endpoint
3. Include comprehensive validation
4. Add error handling with appropriate HTTP status codes
5. Document the function in this README
