import { AlertCircle, X } from 'lucide-react'
import { useTeamsStore } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'

export default function AdminErrorBanner() {
  const teamsError = useTeamsStore((s) => s.error)
  const matchesError = useMatchesStore((s) => s.error)
  const clearTeamsError = useTeamsStore((s) => s.clearError)
  const clearMatchesError = useMatchesStore((s) => s.clearError)

  const error = teamsError || matchesError
  if (!error) return null

  const dismiss = () => {
    if (teamsError) clearTeamsError()
    if (matchesError) clearMatchesError()
  }

  return (
    <div className="mb-4 flex items-start gap-3 p-3 rounded-xl bg-danger/10 border border-danger/30 text-sm">
      <AlertCircle size={18} className="text-danger shrink-0 mt-0.5" />
      <p className="flex-1 text-danger">{error}</p>
      <button
        type="button"
        onClick={dismiss}
        className="text-danger/70 hover:text-danger shrink-0"
        aria-label="إغلاق"
      >
        <X size={16} />
      </button>
    </div>
  )
}
