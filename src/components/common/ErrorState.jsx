import { AlertCircle, RefreshCw } from 'lucide-react'
import GoldButton from './GoldButton'
import DarkCard from './DarkCard'
import { useI18n } from '../../i18n/useI18n'

export default function ErrorState({
  title,
  message = 'Failed to load data. Please try again.',
  onRetry,
}) {
  const { t, isAr } = useI18n()
  const defaultTitle = isAr ? 'حدث خطأ' : 'An Error Occurred'
  const defaultMsg = isAr ? 'تعذر تحميل البيانات. يرجى المحاولة مرة أخرى.' : message

  return (
    <DarkCard className="p-8 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center">
        <AlertCircle size={28} className="text-danger" />
      </div>
      <div>
        <h3 className="font-bold mb-1">{title || defaultTitle}</h3>
        <p className="text-sm text-text-secondary">{message || defaultMsg}</p>
      </div>
      {onRetry && (
        <GoldButton variant="outline" onClick={onRetry}>
          <RefreshCw size={16} />
          {t('common.retry')}
        </GoldButton>
      )}
    </DarkCard>
  )
}
