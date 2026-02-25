import type { StripeContextValue } from '@/types'
import { createContext, useContext, useMemo, type ReactNode } from 'react'

const STRIPE_WEB_UNAVAILABLE = 'Stripe native SDK is not available on web build'

const StripeContext = createContext<StripeContextValue | null>(null)

interface StripeProviderProps {
  children: ReactNode
}

export function StripeProvider({ children }: StripeProviderProps) {
  const value = useMemo<StripeContextValue>(
    () => ({
      isInitialized: false,
      isLoading: false,
      error: STRIPE_WEB_UNAVAILABLE,
      createPaymentIntent: async () => {
        throw new Error(STRIPE_WEB_UNAVAILABLE)
      },
      presentPaymentSheet: async () => ({ success: false, error: STRIPE_WEB_UNAVAILABLE }),
      confirmPayment: async () => ({ success: false, error: STRIPE_WEB_UNAVAILABLE }),
    }),
    [],
  )

  return <StripeContext.Provider value={value}>{children}</StripeContext.Provider>
}

export function useStripe(): StripeContextValue {
  const context = useContext(StripeContext)
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider')
  }
  return context
}

export { StripeContext }
