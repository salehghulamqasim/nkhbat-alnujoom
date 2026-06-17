import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import MatchRow from '../../components/common/MatchRow'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { useTeamsQuery, useMatchesQuery } from '../../hooks/useQueries'
import { enrichMatch, getMatchDisplayStatus, groupMatchesByDate } from '../../utils/matchHelpers'

export default function MatchesPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, refetch: refetchTeams } = useTeamsQuery()
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useMatchesQuery()

  const filters = [
    { id: 'all', label: 'الكل' },
    { id: 'upcoming', label: 'القادمة' },
    { id: 'live', label: 'مباشر' },
    { id: 'completed', label: 'منتهية' },
  ]

  const enrichedMatches = useMemo(
    () => matches.map((m) => enrichMatch(m, teams)),
    [matches, teams]
  )

  const filteredMatches = useMemo(() => {
    return enrichedMatches.filter((match) => {
      const status = getMatchDisplayStatus(match)
      if (filter === 'all') return true
      if (filter === 'upcoming') return status === 'upcoming'
      return status === filter
    })
  }, [enrichedMatches, filter])

  const grouped = useMemo(() => groupMatchesByDate(filteredMatches), [filteredMatches])

  const isLoading = teamsLoading || matchesLoading
  const isError = teamsError || matchesError

  if (isLoading) return <LoadingState message="جاري تحميل المباريات..." />
  if (isError) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          message="تعذر تحميل المباريات"
          onRetry={() => {
            refetchTeams()
            refetchMatches()
          }}
        />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">المباريات</h1>

      <div className="flex bg-bg-surface rounded-xl p-1 mb-6 relative z-0">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${filter === f.id ? 'text-black' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {f.label}
          </button>
        ))}
        <div
          className="absolute top-1 bottom-1 bg-accent rounded-lg transition-all duration-300 -z-10"
          style={{
            width: `calc(25% - 0.5rem)`,
            right: `calc(${filters.findIndex((f) => f.id === filter) * 25}% + 0.25rem)`,
          }}
        />
      </div>

      {filteredMatches.length === 0 ? (
        <EmptyState title="لا توجد مباريات" message="لا توجد مباريات في هذا التصنيف" />
      ) : (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={filter}
        >
          {grouped.map(([date, dateMatches]) => (
            <div key={date}>
              <h3 className="text-sm font-bold text-accent mb-3 px-1">
                {date === 'unknown' ? 'غير محدد' : date}
              </h3>
              <div className="space-y-3">
                {dateMatches.map((match) => (
                  <motion.div
                    key={match.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                  >
                    <MatchRow
                      match={match}
                      onClick={() => navigate(`/matches/${match.id}`)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
