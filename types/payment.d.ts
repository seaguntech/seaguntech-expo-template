export type PaymentStatus = 'idle' | 'processing' | 'succeeded' | 'failed' | 'canceled'

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: PaymentStatus
  metadata?: Record<string, string>
}

export interface StripeConfig {
  publishableKey: string
  merchantIdentifier?: string
  urlScheme?: string
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'apple_pay' | 'google_pay'
  card?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
}

export interface PaymentResult {
  success: boolean
  paymentIntentId?: string
  error?: string
}

export interface CreatePaymentIntentRequest {
  amount: number
  currency: string
  metadata?: Record<string, string>
}

export interface CreatePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
}

export interface StripeContextValue {
  isInitialized: boolean
  isLoading: boolean
  error: string | null
  createPaymentIntent: (request: CreatePaymentIntentRequest) => Promise<CreatePaymentIntentResponse>
  presentPaymentSheet: (clientSecret: string) => Promise<PaymentResult>
  confirmPayment: (clientSecret: string) => Promise<PaymentResult>
}

export interface PaymentSheetParams {
  paymentIntentClientSecret: string
  merchantDisplayName: string
  customerId?: string
  customerEphemeralKeySecret?: string
  applePay?: {
    merchantCountryCode: string
  }
  googlePay?: {
    merchantCountryCode: string
    testEnv?: boolean
  }
  style?: 'alwaysLight' | 'alwaysDark' | 'automatic'
  returnURL?: string
}

export interface PaymentProduct {
  id: string
  name: string
  description: string
  amount: number
  currency: string
  image?: string
}
