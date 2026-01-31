import { useRevenueCat } from '@/shared/context/revenue-cat-context'
import { useMemo } from 'react'

export interface UsePremiumStatusResult {
  isPremium: boolean
  isOnTrial: boolean
  isLoading: boolean
  expirationDate: string | null
  daysRemaining: number | null
  subscriptionStatus: 'active' | 'trial' | 'expired' | 'none'
  canAccessPremiumFeatures: boolean
}

export function usePremiumStatus(): UsePremiumStatusResult {
  const { isPremium, isOnTrial, isLoading, expirationDate, customerInfo } = useRevenueCat()

  const daysRemaining = useMemo(() => {
    if (!expirationDate) return null

    const expDate = new Date(expirationDate)
    const now = new Date()
    const diffTime = expDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  }, [expirationDate])

  const subscriptionStatus = useMemo(() => {
    if (!customerInfo) return 'none'
    if (isOnTrial) return 'trial'
    if (isPremium) return 'active'
    if (expirationDate && new Date(expirationDate) < new Date()) return 'expired'
    return 'none'
  }, [customerInfo, isPremium, isOnTrial, expirationDate])

  const canAccessPremiumFeatures = useMemo(() => {
    return isPremium || isOnTrial
  }, [isPremium, isOnTrial])

  return {
    isPremium,
    isOnTrial,
    isLoading,
    expirationDate,
    daysRemaining,
    subscriptionStatus,
    canAccessPremiumFeatures,
  }
}
