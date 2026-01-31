# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm start                    # Start Expo dev server
pnpm ios                      # Run on iOS simulator (requires prebuild)
pnpm android                  # Run on Android emulator (requires prebuild)

# Build Native App (required for native modules like expo-audio)
npx expo prebuild --clean     # Generate native projects
npx expo run:ios              # Build and run iOS
npx expo run:android          # Build and run Android

# Code Quality
pnpm lint                     # Run ESLint
pnpm lint:fix                 # Fix linting issues
pnpm check-types              # TypeScript type checking

# Testing
pnpm test                     # Run all tests
pnpm test -- --watch          # Watch mode
pnpm test -- path/to/file     # Run single test file

# Supabase (requires supabase CLI)
supabase start                # Start local Supabase
supabase db push              # Apply migrations
supabase functions serve      # Run Edge Functions locally
```

## Architecture Overview

This project uses **Feature-First Architecture**. See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) for full details.

### Tech Stack

- **Framework**: React Native 0.81 + Expo 54 with Expo Router (file-based routing)
- **Styling**: NativeWind v5 + Tailwind CSS v4 with `react-native-css`
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions, Realtime)
- **State**: Zustand + MMKV (persistent), React Query (server data)
- **Payments**: RevenueCat (subscriptions) + Stripe (one-time purchases)

### Folder Structure

```
src/
├── features/                 # Business modules (auth, tasks, profile, etc.)
│   ├── {feature}/
│   │   ├── components/       # Feature-specific UI
│   │   ├── hooks/            # Feature hooks
│   │   ├── api/              # Data fetching (internal)
│   │   ├── stores/           # Feature state (internal)
│   │   ├── types.ts          # Type definitions
│   │   └── index.ts          # Public API
│   └── index.ts
│
└── shared/                   # Cross-feature code
    ├── ui/                   # Design system (Button, Card, Input, etc.)
    ├── hooks/                # Shared hooks (useCache, useNetworkStatus)
    ├── context/              # Global providers (Auth, Theme, Stripe)
    ├── stores/               # Global stores (offline-store)
    ├── lib/                  # Utilities (storage, query-client)
    └── types/                # Common types

app/                          # Expo Router (routes only)
├── (auth)/                   # Public routes
├── (protected)/              # Auth-guarded routes
│   └── (tabs)/               # Main tab navigation
└── onboarding/               # Onboarding flow

tw/                           # NativeWind CSS-wrapped components
```

### Key Patterns

**Feature-First Imports**: Import from feature's public API only:

```tsx
// ✅ Correct
import { TaskCard, useTasks } from '@/features/tasks'
import { Button, Card } from '@/shared/ui'
import { useAuth } from '@/shared/context'

// ❌ Wrong - don't import internals
import { tasksApi } from '@/features/tasks/api/tasks-api'
```

**CSS-Wrapped Components**: Import from `@/tw` for Tailwind className support:

```tsx
import { View, Text, Pressable, ScrollView } from '@/tw' // NOT from 'react-native'
```

**Context Providers**: App wraps 5 contexts in order:
`ThemeProvider` → `AuthProvider` → `RevenueCatProvider` → `StripeProvider` → `SidebarProvider`

### NativeWind v5 Setup

This project uses NativeWind v5 with react-native-css. Key files:

- `global.css` - Tailwind imports and custom theme variables
- `tw/index.tsx` - CSS-wrapped React Native components using `useCssElement`
- `metro.config.js` - `withNativewind` configuration
- `postcss.config.mjs` - `@tailwindcss/postcss` plugin

Components must be wrapped with `useCssElement` for className to work.

### Available Features

| Feature                    | Components | Hooks              | Description                  |
| -------------------------- | ---------- | ------------------ | ---------------------------- |
| `@/features/auth`          | 6          | -                  | Login, signup, OAuth buttons |
| `@/features/ai-chat`       | 8          | `useAiChat`        | AI chat interface            |
| `@/features/tasks`         | 5          | `useTasks`         | Task CRUD                    |
| `@/features/profile`       | 6          | `useProfile`       | Profile management           |
| `@/features/notifications` | 8          | `useNotifications` | Push notifications           |
| `@/features/onboarding`    | 7          | `useOnboarding`    | Onboarding flow              |
| `@/features/payments`      | 4          | -                  | Stripe payments              |
| `@/features/premium`       | 4          | `usePremiumStatus` | RevenueCat subscriptions     |
| `@/features/settings`      | 7          | -                  | App settings                 |
| `@/features/email`         | 1          | -                  | Email sending                |

### Data Flow

1. **Server Data**: Supabase → React Query (features/\*/api) → Components
2. **Client State**: MMKV → Zustand stores (features/\*/stores) → Components
3. **Auth State**: Supabase Auth → `@/shared/context` → Session in MMKV

### Supabase Edge Functions

Located in `supabase/functions/`:

- `ai-completion` - OpenAI chat completions
- `create-payment-intent` - Stripe PaymentIntent
- `stripe-webhooks` - Handle Stripe events
- `send-notifications` - Expo Push API
- `resend-email` - Email via Resend

### Type Definitions

Feature types in `src/features/*/types.ts`. Shared types in `src/shared/types/`:

```tsx
import type { Task, TaskStatus } from '@/features/tasks'
import type { Profile } from '@/features/profile'
import type { ApiResponse } from '@/shared/types'
```

### Storage Keys

Defined in `src/shared/lib/storage/index.ts` as `STORAGE_KEYS`. Use these constants for MMKV operations.

## Configuration

- `app.config.ts` - Expo configuration (no app.json)
- `metro.config.js` - Metro bundler with NativeWind
- `postcss.config.mjs` - Tailwind PostCSS plugin
- `global.css` - Tailwind theme and custom CSS variables

## Documentation

- [Architecture Guide](./docs/ARCHITECTURE.md) - Full architecture documentation
- [API Reference](./docs/api/API.md) - Supabase and Edge Functions API
- [Conventions](./docs/CONVENTIONS.md) - Coding standards and import rules

## Environment Variables

Copy `.env.example` to `.env` and fill in values. Key variables:

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `EXPO_PUBLIC_REVENUECAT_IOS_KEY` / `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`

Edge Function secrets (set via `supabase secrets set`):

- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `OPENAI_API_KEY`, `RESEND_API_KEY`
