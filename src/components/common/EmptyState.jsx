import { Inbox } from 'lucide-react'
import DarkCard from './DarkCard'
import { useI18n } from '../../i18n/useI18n'

export default function EmptyState({ title, message, icon: Icon = Inbox, action }) {
  const { isAr } = useI18n()
  const defaultTitle = isAr ? 'لا توجد بيانات' : 'No Data'

  return (
    <DarkCard className="p-10 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-bg-surface border border-border flex items-center justify-center">
        <Icon size={28} className="text-text-secondary" />
      </div>
      <div>
        <h3 className="font-bold mb-1">{title || defaultTitle}</h3>
        {message && <p className="text-sm text-text-secondary">{message}</p>}
      </div>
      {action}
    </DarkCard>
  )
}
