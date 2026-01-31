// Payments Types

export interface PaymentIntent {
  id: string
  clientSecret: string
  amount: number
  currency: string
  status: PaymentStatus
}

export type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'canceled'

export interface CreatePaymentIntentRequest {
  amount: number
  currency: string
  metadata?: Record<string, string>
}

export interface CreatePaymentIntentResponse {
  clientSecret: string
  paymentIntentId: string
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

export interface CheckoutSession {
  id: string
  url: string
  status: 'open' | 'complete' | 'expired'
}
