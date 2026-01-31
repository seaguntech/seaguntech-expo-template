import { mmkvStorage, STORAGE_KEYS } from '@/shared/lib/storage'
import * as Localization from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import translations
import en from '@/locales/en.json'
import es from '@/locales/es.json'
import fr from '@/locales/fr.json'
import pt from '@/locales/pt.json'

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
} as const

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en'

// Get stored language or detect from device
const getInitialLanguage = (): SupportedLanguage => {
  // Check stored preference first
  const storedLocale = mmkvStorage.getString(STORAGE_KEYS.LOCALE)
  if (storedLocale && storedLocale in SUPPORTED_LANGUAGES) {
    return storedLocale as SupportedLanguage
  }

  // Detect from device
  const deviceLocales = Localization.getLocales()
  if (deviceLocales.length > 0) {
    const deviceLang = deviceLocales[0].languageCode
    if (deviceLang && deviceLang in SUPPORTED_LANGUAGES) {
      return deviceLang as SupportedLanguage
    }
  }

  return DEFAULT_LANGUAGE
}

// Custom language detector
const languageDetector = {
  type: 'languageDetector' as const,
  async: false,
  detect: getInitialLanguage,
  cacheUserLanguage: (lng: string) => {
    mmkvStorage.setString(STORAGE_KEYS.LOCALE, lng)
  },
}

// Track initialization state
let isInitialized = false
let initPromise: Promise<void> | null = null

// Initialize i18n asynchronously
export const initI18n = async (): Promise<void> => {
  if (isInitialized) return
  if (initPromise) return initPromise

  initPromise = i18n
    .use(languageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: { translation: en },
        es: { translation: es },
        fr: { translation: fr },
        pt: { translation: pt },
      },
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: Object.keys(SUPPORTED_LANGUAGES),
      interpolation: {
        escapeValue: false, // React already escapes values
      },
      react: {
        useSuspense: false, // Disable suspense for React Native
      },
    })
    .then(() => {
      isInitialized = true
    })

  return initPromise
}

// Check if i18n is ready
export const isI18nReady = (): boolean => isInitialized

// Initialize immediately for backwards compatibility (non-blocking)
initI18n()

// Helper to change language
export const changeLanguage = async (language: SupportedLanguage) => {
  await i18n.changeLanguage(language)
  mmkvStorage.setString(STORAGE_KEYS.LOCALE, language)
}

// Helper to get current language
export const getCurrentLanguage = (): SupportedLanguage => {
  return i18n.language as SupportedLanguage
}

// Helper to get language display name
export const getLanguageDisplayName = (code: SupportedLanguage): string => {
  return SUPPORTED_LANGUAGES[code].nativeName
}

export default i18n
