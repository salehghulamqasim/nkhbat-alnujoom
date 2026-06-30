import { useCallback } from 'react'
import { useAppStore } from '../stores/useAppStore'
import ar from './ar'
import en from './en'

const translations = { ar, en }

export function useI18n() {
  const language = useAppStore((s) => s.language)
  const isAr = language === 'ar'

  const t = useCallback(
    (key) => {
      const keys = key.split('.')
      let value = translations[language]
      for (const k of keys) {
        value = value?.[k]
      }
      return value || key
    },
    [language]
  )

  return { t, language, isAr, dir: isAr ? 'rtl' : 'ltr' }
}
