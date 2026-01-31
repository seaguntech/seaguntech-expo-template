# React Native Large-Scale Boilerplate – Architecture & Structure Spec

> This document describes the architecture, modules, and folder structure for a
> large-scale React Native (Expo) boilerplate.  
> The goal is to give an AI coding assistant (Cursor / Copilot / Codex…) a
> complete blueprint to generate and maintain a production-ready starter kit.

---

## 1. Goals

- Provide a **company-wide boilerplate** for React Native apps.
- Support **large-scale** feature growth (dozens of modules & screens).
- Use **best practices** for:
  - Authentication & security
  - Subscriptions & in-app payments
  - Offline-first experience
  - AI features (chat with streaming)
  - Monitoring, analytics, and legal compliance
- Offer a **modular architecture** so feature teams can plug in / remove modules
  without breaking the core.

Non-goals:

- No custom native modules in v1 (prefer managed Expo + well-supported SDKs).
- Not a complete design system, but a **solid UI kit** that can be branded.

---

## 2. Tech Stack Overview

- **React Native + Expo**
  - Expo Router (file-based navigation)
  - TypeScript everywhere
- **Data & Backend**
  - Supabase (Postgres, Auth, Storage, Edge Functions, RLS)
  - Supabase Realtime for live sync
- **Auth**
  - Supabase Auth (Email/Password + OAuth providers: Google, Apple)
  - JWT with Row Level Security
- **Payments & Premium**
  - RevenueCat (subscriptions, entitlement management, paywall analytics)
  - Stripe (in-app one-time purchases with native Stripe SDK)
- **State & Data Layer**
  - Context for global app concerns (auth, theme, stripe, revenuecat, sidebar)
  - Zustand + MMKV for persistent client-side stores
  - React Query (or similar) for server data fetching & caching
- **Storage & Offline**
  - MMKV (ultra-fast encrypted key-value store)
  - Supabase Storage buckets for media
- **UI / UX**
  - Tailwind (via nativewind or equivalent) with custom theme config
  - Framer Motion + React Native Reanimated for high-performance animations
  - Shadcn-style UI primitives (buttons, cards, dialogs, etc.)
  - Dark mode with theme toggle + system auto-detection
  - Toaster system + native haptics
- **AI**
  - OpenAI GPT integration (chat interface with streaming)
- **Internationalization**
  - i18n library (e.g., i18next) + JSON locale files
- **Notifications & Engagement**
  - Expo Push
  - Supabase Edge Functions for triggers
  - Deep linking & universal links
- **DevOps & Monitoring**
  - Sentry for crash reporting, logs & performance tracing
- **Legal**
  - In-app Terms of Service & Privacy Policy screens

---

## 3. Domain Modules

### 3.1 Authentication

**Module:** `Auth with Supabase`

- **Core responsibilities**
  - Centralize all authentication logic using Supabase.
  - Provide secure login / signup flows and manage session lifecycle.

- **Features**
  - **Email Auth**
    - Email + password registration & login.
    - Password reset (email link + reset screen).
  - **OAuth**
    - Google & Apple sign-in providers.
    - Secure token handling; link OAuth providers to existing accounts.
  - **Security**
    - Supabase **JWT** tokens with **Row Level Security (RLS)** policies.
    - RLS policies must be defined to restrict data by `user_id` or `tenant_id`.
  - **Integration**
    - Ready-to-use auth screens:
      - `welcome`, `sign-in`, `sign-up`, `resetPassword`.
    - Auth context (`AuthContext`) responsible for:
      - reading/writing session to MMKV
      - refreshing tokens
      - exposing `user`, `session`, `signIn`, `signOut`, etc.
    - Gate protected routes with:
      - `(auth)/` → public
      - `(protected)/` → authenticated area

---

### 3.2 Payments & Premium

#### 3.2.1 RevenueCat – Subscriptions

**Module:** `RevenueCat`

- **Purpose**
  - Manage **subscriptions** & entitlements; act as single source of truth for
    premium status.
- **Features**
  - **Support**
    - Subscription state **mirrored into DB** (store minimal snapshot in Supabase).
  - **Platforms**
    - iOS support (Android later but architecture should not block it).
  - **Analytics**
    - Track **paywall performance** (conversion, trials, churn).
- **Implementation notes**
  - `RevenueCatContext` handles:
    - fetching customer info
    - exposing `isPremium`, `isOnTrial`, `expirationDate`
    - syncing with Supabase user profile table.

#### 3.2.2 Stripe – One-Time Purchases

**Module:** `Stripe`

- **Purpose**
  - Handle **in-app one-time** payments (e.g., unlock single feature or pack).
- **Features**
  - **Type**
    - One-time purchase only; no recurring billing here.
  - **Integration**
    - **Native Stripe SDK** via Expo (stripe-react-native).
    - Payment sheet and/or direct card payments.
  - **Use case**
    - Unlock specific content/features (e.g., one-time upgrade).
- **Implementation notes**
  - `StripeContext` for configuration & client secret handling.
  - Supabase Edge Functions:
    - `create-payment-intent`
    - `create-stripe-checkout`
    - `stripe-webhooks` to confirm payment, update DB & RevenueCat if needed.

#### 3.2.3 Premium Status Page

**Module:** `Premium Status Page`

- **Purpose**
  - Central screen to show **user subscription status**.
- **Features**
  - **Status**
    - Display `Active` / `Expired` / `Trial`.
  - **Features**
    - List of premium benefits (what user has unlocked).
  - **Management**
    - Buttons for:
      - “Restore purchases” (RevenueCat restore)
      - “Manage subscription” (link to App Store settings if required).

---

### 3.3 Database & Storage

#### 3.3.1 Supabase – DB & Realtime

**Module:** `Supabase`

- **Auth & DB**
  - Supabase client configured in `config/supabase.ts`.
  - Use **typed tables** where possible (generated types or manual).
- **Realtime**
  - Live sync with Postgres using Supabase Realtime channels.
  - Leverage **RLS** for data security in real-time subscriptions.
- **Auth**
  - Email + OAuth + JWT as described in Authentication module.
- **Storage**
  - `users` & `profiles` tables:
    - user profile fields (name, avatar URL, premium flags, locale…)
  - Additional tables as needed, all protected by RLS.

#### 3.3.2 Emails via Supabase

**Module:** `Emails via Supabase`

- **Type:** `Email` – transactional emails only.
- **Events**
  - Trigger emails on:
    - Auth events (welcome, password reset)
    - Payment events (receipt, subscription changes)
    - Other app events when needed.
- **Providers**
  - Backed by **Supabase Email System Ready** (config in `supabase/templates`).
- **Edge functions**
  - `resend-email` (or similar) to send templated emails.

#### 3.3.3 Persistent Store – MMKV + Zustand

**Module:** `Persistent Store`

- **Type:** `Storage` backed by MMKV.
- **Features**
  - **Cache**
    - Ultra-fast MMKV for local key-value storage.
  - **Sync**
    - Zustand store with `Persist` middleware.
    - Selected slices persisted (auth tokens, theme, onboarding, offline data).
  - **Secure**
    - Encrypted MMKV for sensitive entries (tokens, user data).
- **Use cases**
  - `offlineStore`, `onboardingStore`, `profileStore` etc.

#### 3.3.4 Upload Image

**Module:** `Upload Image`

- **Type:** `Storage`
- **Features**
  - **Sources**
    - Camera + Photo library picker.
  - **Storage**
    - Uploads saved to **Supabase bucket**.
  - **Processing**
    - Client-side resize & compression before upload.
  - **Security**
    - Supabase **RLS protected uploads**:
      - only owner or admins can access uploaded media.
- **Hook**
  - `useImageUpload` encapsulates:
    - permission handling
    - picking image
    - preprocessing
    - uploading & returning public/protected URLs.

---

### 3.4 AI & Integrations

**Module:** `AI Wrapper Page`

- **Type:** `AI` – OpenAI integration ready.
- **API**
  - OpenAI GPT integration via Edge Function `ai-completion`.
  - Chat-style API (messages array, role: user/assistant/system).
- **Interface**
  - Chat interface with:
    - message bubbles
    - typing indicator
    - streaming tokens.
- **Streaming**
  - Real-time responses using server-sent events / streaming API.
- **Customizable**
  - Easy prompt management:
    - `promptData.ts` for prompt presets.
    - UI for selecting / tagging prompts.
- **Components** (under `components/ai/`)
  - `AIThinkingLoader`, `AutoResizingInput`, `ChatHeader`, `MessageBubble`,
    `MessageActions`, `PromptLabels`, `ThinkingAnimation`, `TypewriterText`, etc.
- **Hook**
  - `useAIChat` to handle conversation state, streaming, error handling.

---

### 3.5 UI & User Experience

#### 3.5.1 User Feedback

**Module:** `User Feedback`

- **Type:** `UX` – Toaster + Haptics.

- **Features**
  - **Toasts**
    - Global toast system for **success / error / info**.
  - **Feedback**
    - Native haptic vibration mapped to toast types.
  - **Global API**
    - Triggerable from any screen via helper functions
      (e.g., `showSuccessToast`, `showErrorToast`).

#### 3.5.2 Animated UI Components

**Module:** `Animated UI Components`

- **Type:** `UI/UX` – Framer + Reanimated.

- **Features**
  - **Entry effects**
    - Fade-in, zoom, slide-in for screens & cards.
  - **Gesture-based**
    - Gesture-driven animations (swipe, pull-to-reveal, drag, etc.).
  - **Smoothness**
    - Target **60fps animations**; avoid layout thrashing.
- **Implementation**
  - Shared animation primitives (e.g., `AnimatedCard`, `AnimatedListItem`).
  - Reusable variants for common transitions.

#### 3.5.3 Dark Mode + Theme

**Module:** `Dark Mode + Theme`

- **Type:** `UI`

- **Features**
  - **Toggle & adapt**
    - In-app theme toggle (light/dark/system).
  - **Tailwind Ready**
    - Custom Tailwind config: color tokens, font sizes, spacing scale.
  - **Persistence**
    - Theme preference stored in MMKV via Zustand.
  - **Auto detection**
    - Device theme detection & sync on app load.

#### 3.5.4 Onboarding System

**Module:** `Onboarding System`

- **Type:** `UX`

- **Features**
  - **Multi-step user flow**
    - Steps: `Welcome`, `Permissions`, `Tutorial`.
  - **Progress**
    - Visual step indicator (dots or progress bar).
  - **Skip option**
    - Optional walkthrough; allow user to skip.
  - **Animations**
    - Smooth transitions between steps, subtle motion.
- **Components**
  - `OnboardingFeatureCard`, `OnboardingNavigationButtons`,
    `OnboardingProgressBar`, `OnboardingStep1/2/3`.
- **Store**
  - `onboardingStore` to track completion + show only once.

#### 3.5.5 Internationalization with i18n

**Module:** `Internationalization`

- **Type:** `UI/UX`

- **Features**
  - Central i18n config in `config/i18n.ts`.
  - Locale JSON files (e.g., `en.json`, `es.json`, `fr.json`, `pt.json`).
  - Hook `useTranslation` to access translation keys.
  - Support for:
    - dynamic language switching
    - storing preferred locale in persistent store
    - fallback locale.

---

### 3.6 Navigation & Engagement

#### 3.6.1 Deep Linking & Routing

**Module:** `Deep Linking`

- **Type:** `Navigation`

- **Features**
  - **Expo Router + URL**
    - File-based routing structure under `app/`.
  - **Universal Links**
    - iOS support for universal links (`https://yourdomain/...`).
  - **Custom Schemes**
    - App scheme like `yourapp://`.
- **Config**
  - Deep linking config in `config/linking.ts`.

#### 3.6.2 Push Notifications

**Module:** `Push Notifications`

- **Type:** `Engagement`

- **Features**
  - **Expo + Supabase**
    - Use Expo Push for sending push notifications.
  - **Expo Push**
    - Client registration, permission management & token storage.
  - **Native iOS**
    - Ensure proper iOS configuration for APNs.
  - **Supabase Edge**
    - `send-notifications` function for server-side triggers.
  - **Targeting**
    - Send notifications based on user segments & events
      (e.g., subscription expiry, new feature, reminders).
- **Hooks & Components**
  - `useNotifications`, `NotificationCenter`, `NotificationSettings`,
    debug UI for testing push.

---

### 3.7 Development & Monitoring

**Module:** `Sentry Monitoring`

- **Type:** `DevOps`

- **Features**
  - **Integrated SDK**
    - Sentry initialization in app entry.
  - **Logs**
    - Capture JS & Native logs.
  - **Tracing**
    - App performance overview, slow transactions.
  - **Crashes**
    - Real-time crash tracking and error reporting.

---

### 3.8 Legal & Compliance

**Module:** `CGU & Privacy Pages`

- **Type:** `Legal`

- **Features**
  - **Templates**
    - Ready-to-edit templates for:
      - CGU (Terms & Conditions)
      - Privacy Policy
  - **Compliance**
    - GDPR & App Store ready baseline sections.
  - **Customizable**
    - Easy text modification via markdown or static content.
  - **Navigation**
    - Integrated routing:
      - `privacy-policy.tsx`
      - `terms-of-service.tsx`

---

### 3.9 Core Modules & UI Kit

#### 3.9.1 UI Kit – “Every Component”

- **Module:** `UI Kit`
- Installable & extendable via an internal package (e.g., `dasani` style), or
  just a local `components/ui` folder.

- **Base components**
  - Buttons, Inputs, Cards, Modals
  - Avatar, Badge, Checkbox, Dialog, Header, Sidebar, Tabs, Table, Toggle,
    ProgressBar, Text, Select, etc.
- **Style**
  - Tailwind utilities + custom theme tokens.
- **Animations**
  - Framer Motion + Reanimated variants integrated where appropriate.

#### 3.9.2 iOS Templates & Weekly Drops (Optional but supported)

- **iOS Templates**
  - Production-ready templates inspired by Apple’s design system.
  - Use Expo Router for navigation.
- **Weekly Drops**
  - Folder or package structure to allow:
    - 1 new template/module per week.
    - Use cases: AI, Health, SaaS, etc.

---

## 4. Project Structure

High-level folder structure to be generated:

```text
React Native Boilerplate
📦 dasani-app/
├── app/                    # Expo Router routes
│   ├── (auth)/             # Public/auth flows
│   │   ├── resetPassword.tsx
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── welcome.tsx
│   ├── (protected)/        # Authenticated area
│   │   ├── (tabs)/         # Tab navigation
│   │   │   ├── _layout.tsx
│   │   │   ├── ai.tsx
│   │   │   ├── index.tsx
│   │   │   ├── notifications.tsx
│   │   │   ├── offline.tsx
│   │   │   ├── payment.tsx
│   │   │   ├── premium.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── settings.tsx
│   │   │   └── tasks.tsx
│   │   ├── _layout.tsx
│   │   ├── privacy-policy.tsx
│   │   └── terms-of-service.tsx
│   ├── onboarding/
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   ├── _layout.tsx
│   ├── +not-found.tsx
│   └── index.tsx
│
├── assets/                 # fonts, icons, logos, splash
│   ├── fonts/
│   │   │   ├── InstrumentSerif-Italic.ttf
│   │   │   ├── InstrumentSerif-Regular.ttf
│   ├── icons/
│   ├── logo/
│   │   │   ├── revenuecat.png
│   │   │   ├── stripe.jpeg
│   └── splashscreen/
│   │   │   ├── splashscreen_dark.png
│   │   │   └── splashscreen_light.png
│
├── components/
│   ├── ai/
│   │   ├── AIThinkingLoader.tsx
│   │   ├── AutoResizingInput.tsx
│   │   ├── ChatHeader.tsx
│   │   ├── index.ts
│   │   ├── MessageActions.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── PromptLabels.tsx
│   │   ├── ThinkingAnimation.tsx
│   │   └── TypewriterText.tsx
│   ├── auth/
│   │   ├── appleProviderButton.tsx
│   │   ├── EmailLoginForm.tsx
│   │   ├── EmailLoginToggle.tsx
│   │   ├── googleProviderButton.tsx
│   │   ├── index.ts
│   │   ├── Separator.tsx
│   │   └── SocialLoginButtons.tsx
│   ├── email/
│   │   └── buttonSendEmail.tsx
│   ├── layout/
│   │   └── LayoutWrapper.tsx
│   ├── notifications/
│   │   ├── DebugInfo.tsx
│   │   ├── DeviceInfoCard.tsx
│   │   ├── index.ts
│   │   ├── NotificationCenter.tsx
│   │   ├── NotificationHeader.tsx
│   │   ├── NotificationSettings.tsx
│   │   ├── PermissionStatusCard.tsx
│   │   ├── push.tsx
│   │   └── TestButtonsSection.tsx
│   ├── onboarding/
│   │   ├── index.ts
│   │   ├── NotificationSettings.tsx
│   │   ├── OnboardingFeatureCard.tsx
│   │   ├── OnboardingNavigationButtons.tsx
│   │   ├── OnboardingProgressBar.tsx
│   │   ├── OnboardingStep1.tsx
│   │   ├── OnboardingStep2.tsx
│   │   └── OnboardingStep3.tsx
│   ├── payment/
│   │   ├── index.ts
│   │   ├── PaymentButton.tsx
│   │   ├── PaymentSheet.tsx
│   │   ├── paywall.tsx
│   │   └── stripeButtonPay.tsx
│   ├── premium/
│   │   ├── index.ts
│   │   ├── PaywallScreen.tsx
│   │   ├── PremiumGate.tsx
│   │   ├── PremiumStatus.tsx
│   │   └── RestorePurchaseButton.tsx
│   ├── profile/
│   │   ├── EditFieldModal.tsx
│   │   ├── index.ts
│   │   ├── ProfileActionsSection.tsx
│   │   ├── ProfileEditSection.tsx
│   │   ├── ProfileHeaderSection.tsx
│   │   ├── ProfileInfoSection.tsx
│   │   └── ProfileStatusSection.tsx
│   ├── settings/
│   │   ├── AssistanceSection.tsx
│   │   ├── index.ts
│   │   ├── NotificationsSection.tsx
│   │   ├── PreferencesSection.tsx
│   │   ├── ProfileSection.tsx
│   │   ├── SettingsRow.tsx
│   │   ├── SettingsSection.tsx
│   │   └── SubscriptionSection.tsx
│   ├── tasks/
│   │   ├── CreateTaskForm.tsx
│   │   ├── EditTaskModal.tsx
│   │   ├── index.ts
│   │   ├── StatusBadges.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskList.tsx
│   └── ui/
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── dynamic-header.tsx
│       ├── header-menu.tsx
│       ├── header-title.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── ProgressBar.tsx
│       ├── select.tsx
│       ├── sidebar.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       ├── text.tsx
│       └── toggle.tsx               # design system primitives
│
├── config/
│   ├── i18n.ts
│   ├── linking.ts
│   └── supabase.ts
│
├── constants/
│   ├── colors.ts
│   ├── emailTemplates.ts
│   ├── navigation.ts
│   ├── notifications.ts
│   ├── onboarding.ts
│   ├── promptData.ts
│   └── quickActions.ts
│
├── context/
│   ├── AuthContext.tsx
│   ├── RevenuCatContext.tsx
│   ├── SidebarContext.tsx
│   ├── StripeContext.tsx
│   └── ThemeContext.tsx
│
├── fetch/
│   ├── profile.ts
│   └── tasks.ts
│
├── hooks/
│   ├── useAIChat.ts
│   ├── useCache.ts
│   ├── useColorScheme.ts
│   ├── useIconColors.ts
│   ├── useImageUpload.ts
│   ├── useNetworkStatus.ts
│   ├── useNotifications.ts
│   ├── useOnboarding.ts
│   ├── usePremiumStatus.ts
│   ├── useProfile.ts
│   ├── useSounds.ts
│   ├── useTasks.ts
│   ├── useTheme.tsx
│   └── useTranslation.ts
│
├── icons/
│   └── index.tsx
│
├── lib/
│   ├── storage/
│   │   ├── index.ts
│   │   ├── supabase.ts
│   │   └── zustand.ts
│   ├── queryClient.ts
│   └── utils.ts
│
├── locales/
│   ├── en.json
│   ├── es.json
│   ├── fr.json
│   └── pt.json
│
├── stores/
│   ├── offlineStore.ts
│   ├── onboardingStore.ts
│   ├── profileStore.ts
│   └── README.md
│
├── supabase/
│   ├── functions/
│   │   ├── ai-completion/
│   │   │   └── index.ts
│   │   ├── create-payment-intent/
│   │   │   └── index.ts
│   │   ├── create-stripe-checkout/
│   │   │   └── index.ts
│   │   ├── resend-email/
│   │   │   └── index.ts
│   │   ├── send-notifications/
│   │   │   └── index.ts
│   │   └── stripe-webhooks/
│   │       └── index.ts
│   ├── migrations/
│   │   └── 20250202000000_init_supabase.sql
│   ├── templates/
│   │   └── invite.html
│   └── config.toml
│
├── types/
│   ├── ai.d.ts
│   ├── auth.d.ts
│   ├── hooks.d.ts
│   ├── index.ts
│   ├── navigation.d.ts
│   ├── onboarding.d.ts
│   ├── payment.d.ts
│   ├── profile.d.ts
│   ├── revenuecat.d.ts
│   ├── settings.d.ts
│   ├── stores.d.ts
│   ├── tasks.d.ts
│   ├── theme.d.ts
│   └── ui.d.ts
│
└── utils/
    ├── clearSession.ts
    └── functionNavigations.ts
```

## 5. Data Flow & State Management (Summary)

Supabase is the single source of truth for server data (auth, profile,
tasks, payments snapshot).

React Query (or equivalent) used for:

fetching data (fetch/profile.ts, fetch/tasks.ts)

caching results

automatic refetch on focus or network reconnection.

Zustand + MMKV used for:

client-side state that must survive app restarts (theme, onboarding,
offline queues, lightweight profile info).

Contexts used for:

cross-cutting concerns:

AuthContext

ThemeContext

RevenueCatContext

StripeContext

SidebarContext.

## 6. Key Flows to Support

Auth Flow

User opens app → check persisted session (MMKV) → validate with Supabase.

If no session → show (auth) stack.

If session → show (protected) tabs.

Premium Flow

Paywall screen (Stripe/RevenueCat integration).

After purchase:

update RevenueCat customer info

sync to Supabase profile

update usePremiumStatus + PremiumGate components.

Image Upload Flow

User picks image (camera / gallery).

Client compresses & resizes.

Upload to Supabase Storage with RLS.

Store resulting URL in profile or other tables.

AI Chat Flow

User sends message → useAIChat calls Supabase Edge ai-completion.

Stream tokens back to UI with ThinkingAnimation & typing indicator.

Onboarding & Theme

First launch → show onboarding steps.

On completion → mark in onboardingStore.

Theme preference saved via ThemeContext + MMKV.

## 7. Extensibility & Best Practices

All features should be encapsulated into modules (components + hooks +
context + types) to allow reuse across projects.

Prefer feature folders inside components/ and hooks/ rather than a
pure “everything in one place” approach.

Keep Supabase schemas & migrations versioned under supabase/migrations.

Use typed APIs with shared TypeScript types in types/.

Provide README.md for modules explaining:

how to plug into a new app,

configuration steps (environment variables, API keys, etc.).

Use this document as the main specification for the AI coding assistant.
The generated boilerplate should implement all modules above, follow the
described folder structure, and expose clear extension points for future
projects.
