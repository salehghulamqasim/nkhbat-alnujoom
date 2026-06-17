import { AlertCircle, RefreshCw } from 'lucide-react'
import GoldButton from './GoldButton'
import DarkCard from './DarkCard'

export default function ErrorState({
  title = 'حدث خطأ',
  message = 'تعذر تحميل البيانات. يرجى المحاولة مرة أخرى.',
  onRetry,
}) {
  return (
    <DarkCard className="p-8 flex flex-col items-center text-center gap-4">
      <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center">
        <AlertCircle size={28} className="text-danger" />
      </div>
      <div>
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-sm text-text-secondary">{message}</p>
      </div>
      {onRetry && (
        <GoldButton variant="outline" onClick={onRetry}>
          <RefreshCw size={16} />
          إعادة المحاولة
        </GoldButton>
      )}
    </DarkCard>
  )
}
