// Premium Types

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'none'

export interface PremiumFeature {
  id: string
  name: string
  description: string
  requiredTier: PremiumTier
}

export type PremiumTier = 'free' | 'pro' | 'enterprise'

export interface Subscription {
  id: string
  userId: string
  tier: PremiumTier
  status: SubscriptionStatus
  startDate: Date
  endDate: Date | null
  cancelAtPeriodEnd: boolean
}

export interface PurchasePackage {
  id: string
  identifier: string
  title: string
  description: string
  price: string
  pricePerMonth?: string
  duration: 'monthly' | 'yearly' | 'lifetime'
}

export interface UsePremiumStatusResult {
  isPremium: boolean
  isTrialing: boolean
  subscriptionStatus: SubscriptionStatus
  daysRemaining: number | null
  canAccessFeature: (featureId: string) => boolean
  currentTier: PremiumTier
}
