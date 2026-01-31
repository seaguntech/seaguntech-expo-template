// Shared Module
// Common utilities, components, and hooks used across features
//
// IMPORTANT: This module should NEVER import from features/
// See docs/CONVENTIONS.md for import rules

// UI Components (Design System)
export * from './ui'

// Hooks
export * from './hooks'

// Context Providers
export * from './context'

// Stores
export * from './stores'

// Types
export * from './types'

// Note: lib/ exports are accessed directly via @/shared/lib
// Example: import { queryClient } from '@/shared/lib/exports'
