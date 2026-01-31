export interface CustomerInfo {
  originalAppUserId: string
  activeSubscriptions: string[]
  allPurchasedProductIdentifiers: string[]
  latestExpirationDate: string | null
  firstSeen: string
  originalApplicationVersion: string | null
  requestDate: string
  entitlements: {
    all: Record<string, Entitlement>
    active: Record<string, Entitlement>
  }
  managementURL: string | null
}

export interface Entitlement {
  identifier: string
  isActive: boolean
  willRenew: boolean
  periodType: 'normal' | 'trial' | 'intro'
  latestPurchaseDate: string
  originalPurchaseDate: string
  expirationDate: string | null
  store: 'app_store' | 'play_store' | 'stripe' | 'promotional'
  productIdentifier: string
  isSandbox: boolean
  unsubscribeDetectedAt: string | null
  billingIssueDetectedAt: string | null
}

export interface Package {
  identifier: string
  packageType: PackageType
  product: Product
  offeringIdentifier: string
}

export type PackageType =
  | 'UNKNOWN'
  | 'CUSTOM'
  | 'LIFETIME'
  | 'ANNUAL'
  | 'SIX_MONTH'
  | 'THREE_MONTH'
  | 'TWO_MONTH'
  | 'MONTHLY'
  | 'WEEKLY'

export interface Product {
  identifier: string
  description: string
  title: string
  price: number
  priceString: string
  currencyCode: string
  introPrice: IntroPrice | null
  discounts: Discount[]
  productCategory: 'SUBSCRIPTION' | 'NON_SUBSCRIPTION'
  productType:
    | 'CONSUMABLE'
    | 'NON_CONSUMABLE'
    | 'AUTO_RENEWABLE_SUBSCRIPTION'
    | 'NON_RENEWABLE_SUBSCRIPTION'
  subscriptionPeriod: string | null
}

export interface IntroPrice {
  price: number
  priceString: string
  period: string
  cycles: number
  periodUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
  periodNumberOfUnits: number
}

export interface Discount {
  identifier: string
  price: number
  priceString: string
  cycles: number
  period: string
  periodUnit: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR'
  periodNumberOfUnits: number
}

export interface Offering {
  identifier: string
  serverDescription: string
  metadata: Record<string, unknown>
  availablePackages: Package[]
  lifetime: Package | null
  annual: Package | null
  sixMonth: Package | null
  threeMonth: Package | null
  twoMonth: Package | null
  monthly: Package | null
  weekly: Package | null
}

export interface Offerings {
  all: Record<string, Offering>
  current: Offering | null
}

export interface PurchaseResult {
  productIdentifier: string
  customerInfo: CustomerInfo
}

export interface RevenueCatContextValue {
  isConfigured: boolean
  isLoading: boolean
  customerInfo: CustomerInfo | null
  offerings: Offerings | null
  isPremium: boolean
  isOnTrial: boolean
  expirationDate: string | null
  error: string | null
  purchasePackage: (pkg: Package) => Promise<PurchaseResult>
  restorePurchases: () => Promise<CustomerInfo>
  refreshCustomerInfo: () => Promise<void>
  getOfferings: () => Promise<Offerings>
  presentPaywall?: () => Promise<void>
  presentCustomerCenter?: () => Promise<void>
}
