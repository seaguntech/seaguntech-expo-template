<img width="2048" height="256" alt="background-readme-mobile" src="https://github.com/user-attachments/assets/3dedc2c3-6c47-4dd0-955d-9353b6849169" />

# Seaguntech Expo Template

Opinionated Expo 54 + Expo Router template with feature-first architecture, NativeWind v5 + Tailwind v4 styling, and Supabase integration.

## Tech Stack

- Expo 54 + React Native 0.81
- Expo Router (file-based routing)
- NativeWind v5 + Tailwind v4 + react-native-css
- Zustand + MMKV (client state)
- React Query (server state)
- Supabase (Auth, DB, Storage, Edge Functions)
- i18n (i18next + react-i18next)
- RevenueCat + Stripe (payments)

## Project Structure

```
app/                    # Expo Router screens and layouts
src/
  features/             # Feature modules (components, hooks, api, stores, types)
  shared/               # Shared UI, hooks, context, stores, libs
tw/                     # NativeWind v5 CSS-wrapped components
supabase/               # Edge Functions, migrations
docs/                   # Architecture, API, conventions
```

## Prerequisites

- Node.js 18 or higher
- npm or yarn (pnpm recommended)
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Setup

Clone the repository:

```bash
git clone https://github.com/seaguntech/seaguntech-expo-template
```

Install dependencies:

```bash
pnpm install
```

Create environment file:

```bash
cp .env.example .env
```

Fill in required env values (see `app.config.ts` and `.env.example`).

Install iOS dependencies (iOS only):

```bash
cd ios && pod install && cd ..
```

## Development

Start dev server:

```bash
pnpm start
```

Run platforms:

```bash
pnpm ios
pnpm android
pnpm web
```

Native build:

```bash
npx expo prebuild --clean
npx expo run:ios
npx expo run:android
```

## Quality

```bash
pnpm lint
pnpm lint:fix
pnpm check-types
pnpm format
pnpm format:check
```

## Tests

```bash
pnpm test
pnpm test:watch
pnpm test -- path/to/file.test.tsx
```

## Patching Dependencies

This repo uses `patch-package` for hotfixing npm dependencies.

```bash
# edit files in node_modules, then create a patch
npx patch-package <package-name>
```

Patches are stored in `patches/` and automatically applied on install via `postinstall`.

## Supabase (local)

```bash
supabase start
supabase db push
supabase functions serve
```

## Conventions

- Import order: external -> `@/shared` -> `@/features` -> local
- Do not mix React Native layout primitives with `@/tw` in the same component/section
  See `docs/CONVENTIONS.md` for full rules.

## Notes

- `global.css` defines theme tokens for Tailwind v4.
- `tw/` exposes CSS-wrapped components required for `className` support.

## Resources

- Expo Router docs: https://docs.expo.dev/router/introduction
- NativeWind docs: https://www.nativewind.dev/
- iOS capture:

https://github.com/user-attachments/assets/f7272120-71a8-44ab-8c42-320c9568a786
