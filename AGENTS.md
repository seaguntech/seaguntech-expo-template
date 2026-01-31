# AGENTS.md

This file guides agentic coding assistants working in this repo.

## Build, Lint, Test Commands

Development:

- `pnpm start` - Expo dev server
- `pnpm ios` - run iOS (requires prebuild if native modules)
- `pnpm android` - run Android (requires prebuild if native modules)
- `pnpm web` - run web

Native build:

- `npx expo prebuild --clean`
- `npx expo run:ios`
- `npx expo run:android`

Quality:

- `pnpm lint`
- `pnpm lint:fix`
- `pnpm check-types`
- `pnpm format`
- `pnpm format:check`

Tests:

- `pnpm test`
- `pnpm test:watch`
- `pnpm test -- path/to/file.test.tsx` (single test file)

Supabase:

- `supabase start`
- `supabase db push`
- `supabase functions serve`

## Project Structure

- `app/` - Expo Router screens and layouts
- `src/features/` - feature modules (components, hooks, api, stores, types)
- `src/shared/` - shared UI, hooks, context, stores, libs
- `tw/` - NativeWind v5 CSS-wrapped components
- `supabase/` - Edge Functions, migrations
- `docs/` - architecture, API, conventions

## Import and Dependency Rules

Import order (CRITICAL):

1. external packages
2. shared modules (`@/shared/...`)
3. features (public API only, `@/features/...`)
4. local relative imports

Dependency direction:

- `app/` -> `features/` -> `shared/` -> `config/`, `constants/`, `tw/`
- never import `app/` from feature/shared

Feature-first API usage:

- use `@/features/{feature}` public exports
- do not import feature internals

## UI and Layout Rules (CRITICAL)

Consistency:

- Use `@/tw` primitives for layout and UI (`View`, `Text`, `ScrollView`, `Pressable`, etc.).
- Do not mix React Native layout primitives with `@/tw` in the same component/section.
- RN utilities like `Platform`, `StyleSheet`, `Dimensions`, `Linking` are OK.
- RN components without `@/tw` wrappers (e.g. `Switch`) are OK but must not use `className`.

LayoutWrapper:

- Use `LayoutWrapper` for screen-level layout.
- Never nest a `ScrollView` inside `LayoutWrapper` when `scrollable={true}`.
- Set screen padding via `contentContainerClassName` on `LayoutWrapper`.

Examples:

```tsx
// Correct
<LayoutWrapper scrollable contentContainerClassName="justify-center px-6 py-12">
  <View>...</View>
</LayoutWrapper>

// Wrong
<LayoutWrapper scrollable>
  <ScrollView>...</ScrollView>
</LayoutWrapper>
```

## Styling

- NativeWind v5 + Tailwind v4 with `react-native-css`.
- Import CSS-wrapped components from `@/tw` for `className` support.
- Global styles live in `global.css`.
- Prefer `className` for layout, spacing, colors; use inline `style` only for dynamic values.

## Types and Naming

- Strict TypeScript.
- Components: `PascalCase`, hooks: `useX`, stores: `{feature}-store`.
- Props interfaces: `{Component}Props`.
- Types: `types.ts` per feature and `src/shared/types` for common types.

## Error Handling

- Handle async errors with `try/catch` and surface user-safe messages.
- Avoid throwing raw errors to UI; map to readable strings.
- For API hooks, centralize error handling where possible.

## State and Data

- Server data: React Query in `features/*/api`.
- Client state: Zustand + MMKV in `features/*/stores`.
- Auth state: `@/shared/context` and Supabase Auth.

## Testing Guidelines

- Jest + `jest-expo` + `@testing-library/react-native`.
- Tests in `__tests__/` or colocated `*.test.tsx`.
- Use `pnpm test -- path/to/file.test.tsx` for a single test.

## Formatting

- 2-space indentation, single quotes, no semicolons.
- Keep files under ~200 lines for components.

## Cursor/Copilot Rules

- No `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md` found.

## References

- `docs/ARCHITECTURE.md`
- `docs/CONVENTIONS.md`
