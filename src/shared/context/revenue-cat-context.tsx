import { useProfileStore } from '@/shared/stores/profile-store'
import type {
  CustomerInfo,
  Offerings,
  Package,
  ProfileStoreState,
  PurchaseResult,
  RevenueCatContextValue,
} from '@/types'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Platform } from 'react-native'
import Purchases, {
  LOG_LEVEL,
  type PurchasesOfferings,
  type PurchasesPackage,
  type CustomerInfo as RCCustomerInfo,
} from 'react-native-purchases'

const RevenueCatContext = createContext<RevenueCatContextValue | null>(null)

// RevenueCat API Keys - to be set in environment
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? ''
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? ''

// Premium entitlement identifier
const PREMIUM_ENTITLEMENT = 'premium'

// Transform RevenueCat types to our types
function transformCustomerInfo(info: RCCustomerInfo): CustomerInfo {
  return {
    originalAppUserId: info.originalAppUserId,
    activeSubscriptions: info.activeSubscriptions,
    allPurchasedProductIdentifiers: info.allPurchasedProductIdentifiers,
    latestExpirationDate: info.latestExpirationDate,
    firstSeen: info.firstSeen,
    originalApplicationVersion: info.originalApplicationVersion,
    requestDate: info.requestDate,
    entitlements: {
      all: Object.fromEntries(
        Object.entries(info.entitlements.all).map(([key, ent]) => [
          key,
          {
            identifier: ent.identifier,
            isActive: ent.isActive,
            willRenew: ent.willRenew,
            periodType: ent.periodType as 'normal' | 'trial' | 'intro',
            latestPurchaseDate: ent.latestPurchaseDate,
            originalPurchaseDate: ent.originalPurchaseDate,
            expirationDate: ent.expirationDate,
            store: ent.store as 'app_store' | 'play_store' | 'stripe' | 'promotional',
            productIdentifier: ent.productIdentifier,
            isSandbox: ent.isSandbox,
            unsubscribeDetectedAt: ent.unsubscribeDetectedAt,
            billingIssueDetectedAt: ent.billingIssueDetectedAt,
          },
        ]),
      ),
      active: Object.fromEntries(
        Object.entries(info.entitlements.active).map(([key, ent]) => [
          key,
          {
            identifier: ent.identifier,
            isActive: ent.isActive,
            willRenew: ent.willRenew,
            periodType: ent.periodType as 'normal' | 'trial' | 'intro',
            latestPurchaseDate: ent.latestPurchaseDate,
            originalPurchaseDate: ent.originalPurchaseDate,
            expirationDate: ent.expirationDate,
            store: ent.store as 'app_store' | 'play_store' | 'stripe' | 'promotional',
            productIdentifier: ent.productIdentifier,
            isSandbox: ent.isSandbox,
            unsubscribeDetectedAt: ent.unsubscribeDetectedAt,
            billingIssueDetectedAt: ent.billingIssueDetectedAt,
          },
        ]),
      ),
    },
    managementURL: info.managementURL,
  }
}

function transformOfferings(offerings: PurchasesOfferings): Offerings {
  const transformPackage = (pkg: PurchasesPackage): Package => ({
    identifier: pkg.identifier,
    packageType: pkg.packageType as Package['packageType'],
    product: {
      identifier: pkg.product.identifier,
      description: pkg.product.description,
      title: pkg.product.title,
      price: pkg.product.price,
      priceString: pkg.product.priceString,
      currencyCode: pkg.product.currencyCode,
      introPrice: pkg.product.introPrice
        ? {
            price: pkg.product.introPrice.price,
            priceString: pkg.product.introPrice.priceString,
            period: pkg.product.introPrice.period,
            cycles: pkg.product.introPrice.cycles,
            periodUnit: pkg.product.introPrice.periodUnit as 'DAY' | 'WEEK' | 'MONTH' | 'YEAR',
            periodNumberOfUnits: pkg.product.introPrice.periodNumberOfUnits,
          }
        : null,
      discounts:
        pkg.product.discounts?.map((d) => ({
          identifier: d.identifier,
          price: d.price,
          priceString: d.priceString,
          cycles: d.cycles,
          period: d.period,
          periodUnit: d.periodUnit as 'DAY' | 'WEEK' | 'MONTH' | 'YEAR',
          periodNumberOfUnits: d.periodNumberOfUnits,
        })) ?? [],
      productCategory: pkg.product.productCategory as 'SUBSCRIPTION' | 'NON_SUBSCRIPTION',
      productType: pkg.product.productType as Package['product']['productType'],
      subscriptionPeriod: pkg.product.subscriptionPeriod,
    },
    offeringIdentifier: pkg.offeringIdentifier,
  })

  return {
    all: Object.fromEntries(
      Object.entries(offerings.all).map(([key, offering]) => [
        key,
        {
          identifier: offering.identifier,
          serverDescription: offering.serverDescription,
          metadata: offering.metadata,
          availablePackages: offering.availablePackages.map(transformPackage),
          lifetime: offering.lifetime ? transformPackage(offering.lifetime) : null,
          annual: offering.annual ? transformPackage(offering.annual) : null,
          sixMonth: offering.sixMonth ? transformPackage(offering.sixMonth) : null,
          threeMonth: offering.threeMonth ? transformPackage(offering.threeMonth) : null,
          twoMonth: offering.twoMonth ? transformPackage(offering.twoMonth) : null,
          monthly: offering.monthly ? transformPackage(offering.monthly) : null,
          weekly: offering.weekly ? transformPackage(offering.weekly) : null,
        },
      ]),
    ),
    current: offerings.current
      ? {
          identifier: offerings.current.identifier,
          serverDescription: offerings.current.serverDescription,
          metadata: offerings.current.metadata,
          availablePackages: offerings.current.availablePackages.map(transformPackage),
          lifetime: offerings.current.lifetime
            ? transformPackage(offerings.current.lifetime)
            : null,
          annual: offerings.current.annual ? transformPackage(offerings.current.annual) : null,
          sixMonth: offerings.current.sixMonth
            ? transformPackage(offerings.current.sixMonth)
            : null,
          threeMonth: offerings.current.threeMonth
            ? transformPackage(offerings.current.threeMonth)
            : null,
          twoMonth: offerings.current.twoMonth
            ? transformPackage(offerings.current.twoMonth)
            : null,
          monthly: offerings.current.monthly ? transformPackage(offerings.current.monthly) : null,
          weekly: offerings.current.weekly ? transformPackage(offerings.current.weekly) : null,
        }
      : null,
  }
}

interface RevenueCatProviderProps {
  children: ReactNode
}

export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const [isConfigured, setIsConfigured] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null)
  const [offerings, setOfferings] = useState<Offerings | null>(null)
  const [error, setError] = useState<string | null>(null)

  const setIsPremium = useProfileStore((state: ProfileStoreState) => state.setIsPremium)

  // Derived premium status
  const isPremium = useMemo(() => {
    if (!customerInfo) return false
    return PREMIUM_ENTITLEMENT in (customerInfo.entitlements.active ?? {})
  }, [customerInfo])

  // Check if user is on trial
  const isOnTrial = useMemo(() => {
    if (!customerInfo) return false
    const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]
    return premiumEntitlement?.periodType === 'trial'
  }, [customerInfo])

  // Get expiration date
  const expirationDate = useMemo(() => {
    if (!customerInfo) return null
    const premiumEntitlement = customerInfo.entitlements.active[PREMIUM_ENTITLEMENT]
    return premiumEntitlement?.expirationDate ?? null
  }, [customerInfo])

  // Initialize RevenueCat
  useEffect(() => {
    const initialize = async () => {
      const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY

      if (!apiKey) {
        if (__DEV__) {
          console.warn('RevenueCat API key not configured for this platform')
        }
        setIsLoading(false)
        return
      }

      try {
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG)
        }

        await Purchases.configure({ apiKey })

        const info = await Purchases.getCustomerInfo()
        setCustomerInfo(transformCustomerInfo(info))
        setIsConfigured(true)
        setIsLoading(false)

        // Listen for customer info updates
        Purchases.addCustomerInfoUpdateListener((info) => {
          setCustomerInfo(transformCustomerInfo(info))
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize RevenueCat')
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  // Sync premium status with profile store
  useEffect(() => {
    setIsPremium(isPremium)
  }, [isPremium, setIsPremium])

  const purchasePackage = useCallback(async (pkg: Package): Promise<PurchaseResult> => {
    setIsLoading(true)
    setError(null)

    try {
      // Get the original RevenueCat package from offerings
      const rcOfferings = await Purchases.getOfferings()
      const rcPackage = rcOfferings.current?.availablePackages.find(
        (p) => p.identifier === pkg.identifier,
      )

      if (!rcPackage) {
        throw new Error('Package not found')
      }

      const { customerInfo: info } = await Purchases.purchasePackage(rcPackage)
      const transformed = transformCustomerInfo(info)
      setCustomerInfo(transformed)

      return {
        productIdentifier: pkg.product.identifier,
        customerInfo: transformed,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Purchase failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const restorePurchases = useCallback(async (): Promise<CustomerInfo> => {
    setIsLoading(true)
    setError(null)

    try {
      const info = await Purchases.restorePurchases()
      const transformed = transformCustomerInfo(info)
      setCustomerInfo(transformed)
      return transformed
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Restore failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshCustomerInfo = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo()
      setCustomerInfo(transformCustomerInfo(info))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh customer info')
    }
  }, [])

  const getOfferings = useCallback(async (): Promise<Offerings> => {
    setIsLoading(true)
    setError(null)

    try {
      const rcOfferings = await Purchases.getOfferings()
      const transformed = transformOfferings(rcOfferings)
      setOfferings(transformed)
      return transformed
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get offerings'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = useMemo<RevenueCatContextValue>(
    () => ({
      isConfigured,
      isLoading,
      customerInfo,
      offerings,
      isPremium,
      isOnTrial,
      expirationDate,
      error,
      purchasePackage,
      restorePurchases,
      refreshCustomerInfo,
      getOfferings,
    }),
    [
      isConfigured,
      isLoading,
      customerInfo,
      offerings,
      isPremium,
      isOnTrial,
      expirationDate,
      error,
      purchasePackage,
      restorePurchases,
      refreshCustomerInfo,
      getOfferings,
    ],
  )

  return <RevenueCatContext.Provider value={value}>{children}</RevenueCatContext.Provider>
}

export function useRevenueCat(): RevenueCatContextValue {
  const context = useContext(RevenueCatContext)
  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider')
  }
  return context
}

// Convenience hooks
export function useIsPremium(): boolean {
  const { isPremium } = useRevenueCat()
  return isPremium
}

export function useIsOnTrial(): boolean {
  const { isOnTrial } = useRevenueCat()
  return isOnTrial
}

export { RevenueCatContext }
