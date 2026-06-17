import { Inbox } from 'lucide-react'
import DarkCard from './DarkCard'

export default function EmptyState({ title = 'لا توجد بيانات', message, icon: Icon = Inbox, action }) {
  return (
    <DarkCard className="p-10 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-bg-surface border border-border flex items-center justify-center">
        <Icon size={28} className="text-text-secondary" />
      </div>
      <div>
        <h3 className="font-bold mb-1">{title}</h3>
        {message && <p className="text-sm text-text-secondary">{message}</p>}
      </div>
      {action}
    </DarkCard>
  )
}
