import { useAppStore } from '../stores/useAppStore'
import { ar } from '../locales/ar'
import { en } from '../locales/en'

export function useTranslation() {
  const language = useAppStore((s) => s.language)
  const t = language === 'ar' ? ar : en
  return { t, lang: language }
}
