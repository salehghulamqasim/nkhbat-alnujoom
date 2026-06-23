import { motion } from 'framer-motion'
import ScheduleEagleEyeView from '../../components/common/ScheduleEagleEyeView'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import { useTeamsStore } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'
import { useAppStore } from '../../stores/useAppStore'

const t = {
  ar: {
    title: 'جدول',
    subtitle: 'جدول المباريات الشامل',
    loading: 'جاري تحميل الجدول...',
    error: 'تعذر تحميل الجدول',
  },
  en: {
    title: 'Schedule',
    subtitle: 'Complete match schedule overview',
    loading: 'Loading schedule...',
    error: 'Failed to load schedule',
  },
}

export default function AdminScheduleEagleEyePage() {
  const lang = useAppStore((s) => s.language)
  const teams = useTeamsStore((s) => s.teams)
  const matches = useMatchesStore((s) => s.matches)
  const teamsLoading = useTeamsStore((s) => !s.initialized)
  const matchesLoading = useMatchesStore((s) => !s.initialized)
  const teamsFetchError = useTeamsStore((s) => s.fetchError)
  const matchesFetchError = useMatchesStore((s) => s.fetchError)
  const fetchTeams = useTeamsStore((s) => s.fetchAll)
  const fetchMatches = useMatchesStore((s) => s.fetchAll)

  const isLoading = teamsLoading || matchesLoading
  const isError = teamsFetchError || matchesFetchError

  if (isLoading) return <LoadingState message={t[lang].loading} />
  if (isError) {
    return (
      <div className="p-4">
        <ErrorState
          message={teamsFetchError || matchesFetchError || t[lang].error}
          onRetry={() => {
            fetchTeams()
            fetchMatches()
          }}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <ScheduleEagleEyeView />
    </motion.div>
  )
}