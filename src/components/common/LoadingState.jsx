import { Loader2 } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

export default function LoadingState({ message }) {
  const { isAr } = useI18n()
  const defaultMsg = isAr ? 'جاري التحميل...' : 'Loading...'

  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Loader2 size={36} className="text-accent animate-spin" />
      <p className="text-sm text-text-secondary">{message || defaultMsg}</p>
    </div>
  )
}
