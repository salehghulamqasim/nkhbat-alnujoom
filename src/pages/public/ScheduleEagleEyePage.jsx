import { useEffect } from 'react'
import { motion } from 'framer-motion'
import ScheduleEagleEyeView from '../../components/common/ScheduleEagleEyeView'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import { useTeamsQuery, useMatchesQuery } from '../../hooks/useQueries'
import { useTranslation } from '../../hooks/useTranslation'

export default function ScheduleEagleEyePage() {
  const { t } = useTranslation()
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

  if (isLoading) return <LoadingState message={t.schedule.loading} />
  if (isError) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          message={t.schedule.error}
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
          <h1 className="text-2xl font-bold">{t.schedule.title}</h1>
          <p className="text-sm text-text-secondary">{t.schedule.subtitle}</p>
        </div>
      </div>

      <ScheduleEagleEyeView teamsOverride={teams} matchesOverride={matches} />
    </motion.div>
  )
}
