// Features Module
// All business features organized by domain
//
// IMPORTANT: Features should import from each other via public API only
// See docs/CONVENTIONS.md for import rules

// Authentication
export * from './auth'

// AI Chat
export * from './ai-chat'

// Email
export * from './email'

// Notifications
export * from './notifications'

// Onboarding
export * from './onboarding'

// Payments (Stripe)
export * from './payments'

// Premium (RevenueCat subscriptions)
export * from './premium'

// Profile
export * from './profile'

// Settings
export * from './settings'

// Tasks
export * from './tasks'
