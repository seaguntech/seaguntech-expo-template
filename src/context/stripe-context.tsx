import { supabase } from '@/config/supabase'
import type {
  CreatePaymentIntentRequest,
  CreatePaymentIntentResponse,
  PaymentResult,
  StripeContextValue,
} from '@/types'
import {
  StripeProvider as StripeSDKProvider,
  useConfirmPayment,
  usePaymentSheet,
} from '@stripe/stripe-react-native'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const StripeContext = createContext<StripeContextValue | null>(null)

// Stripe publishable key - to be set in environment
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
const MERCHANT_IDENTIFIER = process.env.EXPO_PUBLIC_MERCHANT_IDENTIFIER ?? 'merchant.com.seaguntech'
const URL_SCHEME = process.env.EXPO_PUBLIC_URL_SCHEME ?? 'seaguntechexpotemplate'

interface StripeProviderProps {
  children: ReactNode
}

function StripeContextProvider({ children }: StripeProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { initPaymentSheet, presentPaymentSheet: presentSheet } = usePaymentSheet()
  const { confirmPayment: confirmStripePayment } = useConfirmPayment()

  // Mark as initialized once mounted
  useEffect(() => {
    if (STRIPE_PUBLISHABLE_KEY) {
      setIsInitialized(true)
    } else if (__DEV__) {
      console.warn('Stripe publishable key not configured')
    }
  }, [])

  const createPaymentIntent = useCallback(
    async (request: CreatePaymentIntentRequest): Promise<CreatePaymentIntentResponse> => {
      setIsLoading(true)
      setError(null)

      try {
        const { data, error: fnError } = await supabase.functions.invoke('create-payment-intent', {
          body: request,
        })

        if (fnError) throw fnError
        if (!data?.clientSecret) throw new Error('No client secret returned')

        // Initialize payment sheet
        const { error: initError } = await initPaymentSheet({
          paymentIntentClientSecret: data.clientSecret,
          merchantDisplayName: 'Seaguntech',
          applePay: {
            merchantCountryCode: 'US',
          },
          googlePay: {
            merchantCountryCode: 'US',
            testEnv: __DEV__,
          },
          style: 'automatic',
          returnURL: `${URL_SCHEME}://stripe-redirect`,
        })

        if (initError) throw new Error(initError.message)

        return {
          clientSecret: data.clientSecret,
          paymentIntentId: data.paymentIntentId,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create payment intent'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [initPaymentSheet],
  )

  const presentPaymentSheet = useCallback(
    async (_clientSecret: string): Promise<PaymentResult> => {
      setIsLoading(true)
      setError(null)

      try {
        const { error: presentError } = await presentSheet()

        if (presentError) {
          if (presentError.code === 'Canceled') {
            return { success: false, error: 'Payment canceled' }
          }
          throw new Error(presentError.message)
        }

        return { success: true }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment failed'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [presentSheet],
  )

  const confirmPayment = useCallback(
    async (clientSecret: string): Promise<PaymentResult> => {
      setIsLoading(true)
      setError(null)

      try {
        const { paymentIntent, error: confirmError } = await confirmStripePayment(clientSecret, {
          paymentMethodType: 'Card',
        })

        if (confirmError) throw new Error(confirmError.message)

        return {
          success: true,
          paymentIntentId: paymentIntent?.id,
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment confirmation failed'
        setError(errorMessage)
        return { success: false, error: errorMessage }
      } finally {
        setIsLoading(false)
      }
    },
    [confirmStripePayment],
  )

  const value = useMemo<StripeContextValue>(
    () => ({
      isInitialized,
      isLoading,
      error,
      createPaymentIntent,
      presentPaymentSheet,
      confirmPayment,
    }),
    [isInitialized, isLoading, error, createPaymentIntent, presentPaymentSheet, confirmPayment],
  )

  return <StripeContext.Provider value={value}>{children}</StripeContext.Provider>
}

export function StripeProvider({ children }: StripeProviderProps) {
  if (!STRIPE_PUBLISHABLE_KEY) {
    return (
      <StripeContext.Provider
        value={{
          isInitialized: false,
          isLoading: false,
          error: 'Stripe not configured',
          createPaymentIntent: async () => {
            throw new Error('Stripe not configured')
          },
          presentPaymentSheet: async () => ({ success: false, error: 'Stripe not configured' }),
          confirmPayment: async () => ({ success: false, error: 'Stripe not configured' }),
        }}
      >
        {children}
      </StripeContext.Provider>
    )
  }

  return (
    <StripeSDKProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier={MERCHANT_IDENTIFIER}
      urlScheme={URL_SCHEME}
    >
      <StripeContextProvider>{children}</StripeContextProvider>
    </StripeSDKProvider>
  )
}

export function useStripe(): StripeContextValue {
  const context = useContext(StripeContext)
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider')
  }
  return context
}

export { StripeContext }
