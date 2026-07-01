import { useState } from 'react'
import { motion } from 'framer-motion'
import MatchRow from '../../components/common/MatchRow'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import { MatchRowSkeleton } from '../../components/common/SkeletonLoader'
import { useRealtimeMatchesQuery, useRealtimeTeamsQuery } from '../../hooks/useRealtimeQueries'
import { useAppStore } from '../../stores/useAppStore'
import { useNavigate } from 'react-router-dom'
import { haptic } from '../../hooks/useHaptics'
import { compareMatchesByDateTime } from '../../utils/matchHelpers'

const t = {
  ar: {
    title: 'المباريات',
    all: 'الكل',
    live: 'مباشر',
    completed: 'منتهية',
    upcoming: 'قادمة',
    noMatches: 'لا توجد مباريات',
    noMatchesDesc: 'لا توجد مباريات تطابق الفلتر المحدد',
    loading: 'جاري تحميل المباريات...',
    error: 'تعذر تحميل المباريات',
  },
  en: {
    title: 'Matches',
    all: 'All',
    live: 'Live',
    completed: 'Finished',
    upcoming: 'Upcoming',
    noMatches: 'No matches found',
    noMatchesDesc: 'No matches match the selected filter',
    loading: 'Loading matches...',
    error: 'Failed to load matches',
  },
}

const filters = [
  { id: 'all', arLabel: 'الكل', enLabel: 'All' },
  { id: 'live', arLabel: 'مباشر', enLabel: 'Live' },
  { id: 'completed', arLabel: 'منتهية', enLabel: 'Finished' },
  { id: 'upcoming', arLabel: 'قادمة', enLabel: 'Upcoming' },
]

export default function MatchesPage() {
  const lang = useAppStore((s) => s.language)
  const navigate = useNavigate()
  const { data: matches = [], isLoading, isError, refetch } = useRealtimeMatchesQuery()
  const { data: teams = [] } = useRealtimeTeamsQuery()
  const [filter, setFilter] = useState('all')

  const isAr = lang === 'ar'
  const strings = t[lang]
  const indicatorStyle = isAr
    ? { right: `calc(${filters.findIndex((f) => f.id === filter) * 25}% + 0.25rem)`, left: 'auto' }
    : { left: `calc(${filters.findIndex((f) => f.id === filter) * 25}% + 0.25rem)`, right: 'auto' }

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true
    if (filter === 'upcoming') return m.status === 'scheduled' || m.status === 'postponed'
    if (filter === 'live') return m.status === 'live'
    if (filter === 'completed') return m.status === 'completed'
    return true
  }).sort((a, b) => {
    // Knockout matches (with round property) should appear first
    const aIsKO = !!a.round
    const bIsKO = !!b.round
    
    if (aIsKO && !bIsKO) return -1
    if (!aIsKO && bIsKO) return 1
    
    // Within knockout matches, sort by round priority: F > SF > QF
    if (aIsKO && bIsKO) {
      const roundPriority = { F: 3, SF: 2, QF: 1 }
      const aPriority = roundPriority[a.round] || 0
      const bPriority = roundPriority[b.round] || 0
      if (aPriority !== bPriority) return bPriority - aPriority
    }
    
    return compareMatchesByDateTime(a, b, 'desc')
  })

  // Silent loading state handled inside the fixed page layout baseline
  return (
    <div className="px-4 py-6 space-y-6 min-h-[calc(100vh-12rem)] relative">
      <h1 className="text-2xl font-bold text-center mb-6">{strings.title}</h1>

      <div className="flex bg-bg-surface rounded-xl p-1 mb-6 relative z-0" dir={isAr ? 'rtl' : 'ltr'}>
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              haptic.light()
              setFilter(f.id)
            }}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors relative z-10 ${
              filter === f.id ? 'text-white dark:text-black' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {isAr ? f.arLabel : f.enLabel}
          </button>
        ))}
        <div
          className="absolute top-1 bottom-1 bg-accent rounded-lg transition-all duration-300 -z-10"
          style={{
            width: `calc(25% - 0.5rem)`,
            ...indicatorStyle,
          }}
        />
      </div>

      {isLoading ? (
        // Stable skeleton baseline to prevent layout jumps or screen-blocking spinners
        <div className="space-y-1">
          <MatchRowSkeleton />
          <MatchRowSkeleton />
          <MatchRowSkeleton />
          <MatchRowSkeleton />
          <MatchRowSkeleton />
        </div>
      ) : isError ? (
        <ErrorState message={strings.error} onRetry={refetch} />
      ) : filteredMatches.length === 0 ? (
        <EmptyState title={strings.noMatches} message={strings.noMatchesDesc} />
      ) : (
        // Localized content fade-in to prevent page shifts and router blinking
        <motion.div
          key="matches-list"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="space-y-1"
        >
          {filteredMatches.map((match) => (
            <MatchRow
              key={match.id}
              match={match}
              teamA={teams.find(t => t.id === match.teamA)}
              teamB={teams.find(t => t.id === match.teamB)}
              onClick={() => {
                haptic.light()
                navigate(`/matches/${match.id}`)
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}
