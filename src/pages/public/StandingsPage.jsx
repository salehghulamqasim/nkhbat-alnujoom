import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import StandingsTable from '../../components/common/StandingsTable'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { useTeamsQuery, useMatchesQuery } from '../../hooks/useQueries'
import { calculateStandings } from '../../utils/standings'
import { useAppStore } from '../../stores/useAppStore'

const GROUPS = ['A', 'B', 'C']

const t = {
  ar: {
    title: 'ترتيب المجموعات',
    group: 'المجموعة',
    loading: 'جاري تحميل الترتيب...',
    error: 'تعذر تحميل جدول الترتيب',
    emptyTitle: 'لا توجد فرق في هذه المجموعة',
    emptyMessage: 'أكمل القرعة لعرض ترتيب المجموعات',
    directQualify: 'تأهل مباشر',
    bestThird: 'أفضل ثوالث',
  },
  en: {
    title: 'Group Standings',
    group: 'Group',
    loading: 'Loading standings...',
    error: 'Failed to load standings',
    emptyTitle: 'No teams in this group',
    emptyMessage: 'Complete the draw to see group standings',
    directQualify: 'Direct Qualify',
    bestThird: 'Best Third-placed',
  },
}

export default function StandingsPage() {
  const lang = useAppStore((s) => s.language)
  const [activeGroup, setActiveGroup] = useState('A')
  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, refetch: refetchTeams } = useTeamsQuery()
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useMatchesQuery()

  const standings = useMemo(
    () => calculateStandings(teams, matches, activeGroup),
    [teams, matches, activeGroup]
  )

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

  const isAr = lang === 'ar'
  const indicatorStyle = isAr
    ? { right: `calc(${GROUPS.indexOf(activeGroup) * 33.333}% + 0.25rem)`, left: 'auto' }
    : { left: `calc(${GROUPS.indexOf(activeGroup) * 33.333}% + 0.25rem)`, right: 'auto' }

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">{t[lang].title}</h1>

      <div className="flex bg-bg-surface rounded-xl p-1 mb-6 relative z-0">
        {GROUPS.map((group) => (
          <button
            key={group}
            type="button"
            onClick={() => setActiveGroup(group)}
            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${activeGroup === group ? 'text-black' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {lang === 'ar' ? `المجموعة ${group === 'A' ? 'أ' : group === 'B' ? 'ب' : group === 'C' ? 'ج' : group}` : `Group ${group}`}
          </button>
        ))}
        <div
          className="absolute top-1 bottom-1 bg-accent rounded-lg transition-all duration-300 -z-10"
          style={{
            width: `calc(33.333% - 0.5rem)`,
            ...indicatorStyle,
          }}
        />
      </div>

      {standings.length === 0 ? (
        <EmptyState
          title={t[lang].emptyTitle}
          message={t[lang].emptyMessage}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={activeGroup}
          transition={{ duration: 0.3 }}
        >
          <StandingsTable standings={standings} />
        </motion.div>
      )}

      <div className="flex gap-4 text-[10px] text-text-secondary justify-center px-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          {t[lang].directQualify}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-warning" />
          {t[lang].bestThird}
        </div>
      </div>
    </div>
  )
}
