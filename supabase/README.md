# Supabase Backend

This directory contains the Supabase backend configuration, including database migrations, Edge Functions, and documentation.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli) v1.100+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local development)
- [Deno](https://deno.land/) v1.40+ (for Edge Functions development)
- pnpm 8+

## Quick Start

### 1. Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# npm (cross-platform)
npm install -g supabase
```

### 2. Start Local Supabase

```bash
# Start local Supabase (requires Docker)
supabase start

# This will output connection details:
# - API URL: http://localhost:54321
# - anon key: eyJhbGci...
# - service_role key: eyJhbGci...
```

### 3. Apply Migrations

```bash
# Push migrations to local database
supabase db push

# Or use pnpm script
pnpm supabase:migrate
```

### 4. Seed Data (Optional)

```bash
pnpm supabase:seed
```

## Directory Structure

```
supabase/
├── config.toml           # Supabase project configuration
├── migrations/           # Database migrations (chronological)
│   ├── 20250202000000_init_supabase.sql
│   ├── 20250202000001_add_performance_indexes.sql
│   └── 20260203100000_security_fixes.sql
├── functions/            # Edge Functions (Deno)
│   ├── lib/              # Shared libraries
│   │   ├── auth.ts       # Authentication middleware
│   │   ├── rate-limit.ts # Rate limiting
│   │   └── validation.ts # Request validation
│   ├── ai-completion/    # OpenAI chat completions
│   ├── create-payment-intent/
│   ├── create-stripe-checkout/
│   ├── resend-email/
│   ├── send-notifications/
│   └── stripe-webhooks/
├── docs/                 # Documentation
│   ├── SCHEMA.md         # Database schema documentation
│   ├── EDGE-FUNCTIONS.md # Edge Functions guide
│   └── SECURITY.md       # Security policies
└── scripts/              # Utility scripts
    └── seed.ts           # Database seeding
```

## Environment Variables

### Local Development (.env)

Copy from `.env.example` and fill in values:

```bash
# Supabase (auto-provided by supabase start)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Edge Function Secrets (for local testing)
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
EXPO_ACCESS_TOKEN=...
```

### Production Secrets

Set secrets via Supabase CLI or Dashboard:

```bash
# Set individual secrets
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set RESEND_API_KEY=re_...

# List current secrets
supabase secrets list
```

## Development Workflow

### Database Migrations

```bash
# Create new migration
supabase migration new my_migration_name

# Apply migrations locally
supabase db push

# Reset local database (drops all data!)
supabase db reset

# Generate TypeScript types
pnpm supabase:types
```

### Edge Functions

```bash
# Serve functions locally (with hot reload)
supabase functions serve

# Serve specific function
supabase functions serve ai-completion

# Test function locally
curl -X POST http://localhost:54321/functions/v1/ai-completion \
  -H "Authorization: Bearer <user-jwt>" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'

# Deploy single function
supabase functions deploy ai-completion

# Deploy all functions
supabase functions deploy
```

### Database Access

```bash
# Open psql console
supabase db psql

# Run SQL file
supabase db psql -f my_query.sql

# Generate diff from remote
supabase db diff
```

## Deployment

### Staging

```bash
# Link to staging project
supabase link --project-ref your-staging-ref

# Push migrations
supabase db push

# Deploy functions
supabase functions deploy
```

### Production

```bash
# Link to production project
supabase link --project-ref your-production-ref

# Push migrations (review carefully!)
supabase db push

# Deploy functions
supabase functions deploy

# Set production secrets
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
```

## Troubleshooting

### Docker Issues

```bash
# Reset Docker containers
supabase stop --no-backup
supabase start
```

### Migration Conflicts

```bash
# Check migration status
supabase migration list

# Repair migration history (use with caution)
supabase migration repair --status applied 20250202000000
```

### Function Deployment Errors

```bash
# Check function logs
supabase functions logs ai-completion

# Test function locally first
supabase functions serve ai-completion --debug
```

### Type Generation Fails

```bash
# Ensure local DB is running
supabase start

# Regenerate types
supabase gen types typescript --local > src/shared/types/database.types.ts
```

## Documentation

- [Schema Documentation](./docs/SCHEMA.md) - Database tables, RLS policies, indexes
- [Edge Functions Guide](./docs/EDGE-FUNCTIONS.md) - API reference and development
- [Security Guide](./docs/SECURITY.md) - Authentication, authorization, best practices

## Useful Commands

```bash
# Status check
supabase status

# View logs
supabase logs

# Open Supabase Studio (local)
open http://localhost:54323

# Generate migration from schema changes
supabase db diff -f new_migration_name
```
