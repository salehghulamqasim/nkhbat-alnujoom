import { useState } from 'react'
import { motion } from 'framer-motion'
import MatchRow from '../../components/common/MatchRow'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import { useMatchesQuery } from '../../hooks/useQueries'
import { useAppStore } from '../../stores/useAppStore'
import { useNavigate } from 'react-router-dom'

const t = {
  ar: {
    title: 'المباريات',
    all: 'الكل',
    live: 'مباشر',
    completed: 'منتهية',
    upcoming: 'قادمة',
    noMatches: 'لا توجد مباريات',
    noMatchesDesc: 'لا توجد مباريات تطابق الفلتر المحدد',
  },
  en: {
    title: 'Matches',
    all: 'All',
    live: 'Live',
    completed: 'Finished',
    upcoming: 'Upcoming',
    noMatches: 'No matches found',
    noMatchesDesc: 'No matches match the selected filter',
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
  const { data: matches = [], isLoading, isError, refetch } = useMatchesQuery()
  const [filter, setFilter] = useState('all')

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true
    return m.status === filter
  })

  if (isLoading) return <LoadingState message={lang === 'ar' ? 'جاري تحميل المباريات...' : 'Loading matches...'} />
  if (isError) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          message={lang === 'ar' ? 'تعذر تحميل المباريات' : 'Failed to load matches'}
          onRetry={refetch}
        />
      </div>
    )
  }

  const isAr = lang === 'ar'
  const indicatorStyle = isAr
    ? { right: `calc(${filters.findIndex((f) => f.id === filter) * 25}% + 0.25rem)`, left: 'auto' }
    : { left: `calc(${filters.findIndex((f) => f.id === filter) * 25}% + 0.25rem)`, right: 'auto' }

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">{t[lang].title}</h1>

      <div className="flex bg-bg-surface rounded-xl p-1 mb-6 relative" dir={isAr ? 'rtl' : 'ltr'}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors relative z-10 ${
              filter === f.id ? 'text-black' : 'text-text-secondary'
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

      {filteredMatches.length === 0 ? (
        <EmptyState title={t[lang].noMatches} message={t[lang].noMatchesDesc} />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          className="space-y-1"
        >
          {filteredMatches.map((match) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MatchRow
                match={match}
                onClick={() => navigate(`/matches/${match.id}`)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}