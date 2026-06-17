import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ScheduleEagleEyeView from '../../components/common/ScheduleEagleEyeView'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import { useTeamsQuery, useMatchesQuery } from '../../hooks/useQueries'
import { useAppStore } from '../../stores/useAppStore'

const t = {
  ar: {
    title: 'نظرة النسر',
    subtitle: 'جدول المباريات الشامل',
    loading: 'جاري تحميل الجدول...',
    error: 'تعذر تحميل الجدول',
  },
  en: {
    title: 'Eagle-Eye View',
    subtitle: 'Complete Schedule Overview',
    loading: 'Loading schedule...',
    error: 'Failed to load schedule',
  },
}

export default function ScheduleEagleEyePage() {
  const navigate = useNavigate()
  const lang = useAppStore((s) => s.language)
  const {
    data: teams = [],
    isLoading: teamsLoading,
    isError: teamsError,
    refetch: refetchTeams,
  } = useTeamsQuery()
  const {
    data: matches = [],
    isLoading: matchesLoading,
    isError: matchesError,
    refetch: refetchMatches,
  } = useMatchesQuery()

  // Prefetch data
  useEffect(() => {
    if (!teamsLoading && !matchesLoading) return
  }, [teamsLoading, matchesLoading])

  const isLoading = teamsLoading || matchesLoading
  const isError = teamsError || matchesError

  if (isLoading) return <LoadingState message={t[lang].loading} />
  if (isError) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          message={t[lang].error}
          onRetry={() => {
            refetchTeams()
            refetchMatches()
          }}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 py-6 space-y-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t[lang].title}</h1>
          <p className="text-sm text-text-secondary">{t[lang].subtitle}</p>
        </div>
      </div>

      <ScheduleEagleEyeView teamsOverride={teams} matchesOverride={matches} />
    </motion.div>
  )
}