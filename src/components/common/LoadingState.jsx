import { Loader2 } from 'lucide-react'

export default function LoadingState({ message = 'جاري التحميل...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <Loader2 size={36} className="text-accent animate-spin" />
      <p className="text-sm text-text-secondary">{message}</p>
    </div>
  )
}
