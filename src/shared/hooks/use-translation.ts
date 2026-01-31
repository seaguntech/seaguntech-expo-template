import { useTranslation as useI18nTranslation } from 'react-i18next'
import { useCallback } from 'react'
import {
  changeLanguage,
  getCurrentLanguage,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/config/i18n'

export function useTranslation(namespace?: string) {
  const { t, i18n } = useI18nTranslation(namespace)

  const currentLanguage = getCurrentLanguage()

  const setLanguage = useCallback(async (language: SupportedLanguage) => {
    await changeLanguage(language)
  }, [])

  const languages = Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
    code: code as SupportedLanguage,
    name: info.name,
    nativeName: info.nativeName,
    isSelected: code === currentLanguage,
  }))

  return {
    t,
    i18n,
    currentLanguage,
    setLanguage,
    languages,
    isRTL: i18n.dir() === 'rtl',
  }
}
