import { useMemo } from 'react'
import { motion } from 'framer-motion'
import DarkCard from '../../components/common/DarkCard'
import PlayerAvatar from '../../components/common/PlayerAvatar'
import LightRays from '../../components/effects/LightRays'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { useRealtimeTeamsQuery, useRealtimeMatchesQuery } from '../../hooks/useRealtimeQueries'
import { calculateTopScorers } from '../../utils/scorers'
import { useAppStore } from '../../stores/useAppStore'

const t = {
  ar: {
    loading: 'جاري تحميل الهدافين...',
    error: 'تعذر تحميل قائمة الهدافين',
    emptyTitle: 'لا يوجد هدافون بعد',
    emptyMessage: 'ستظهر قائمة الهدافين بعد تسجيل نتائج المباريات',
    goal: 'هدف',
    goals: 'أهداف',
  },
  en: {
    loading: 'Loading scorers...',
    error: 'Failed to load scorers',
    emptyTitle: 'No top scorers yet',
    emptyMessage: 'Top scorers will appear after match results are recorded',
    goal: 'goal',
    goals: 'goals',
  },
}

const PODIUM_RANKS = { 1: 'text-accent', 2: 'text-slate-300', 3: 'text-amber-600' }
const PODIUM_HEIGHTS = { 1: 'h-36', 2: 'h-28', 3: 'h-24' }

export default function TopScorersPage() {
  const lang = useAppStore((s) => s.language)
  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, refetch: refetchTeams } = useRealtimeTeamsQuery()
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useRealtimeMatchesQuery()

  const scorers = useMemo(() => calculateTopScorers(teams, matches), [teams, matches])
  const top3 = scorers.slice(0, 3)
  const rest = scorers.slice(3)

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

  if (scorers.length === 0) {
    return (
      <div className="px-4 py-6">
        <EmptyState title={t[lang].emptyTitle} message={t[lang].emptyMessage} />
      </div>
    )
  }

  const podiumSlots = [
    { rank: 2, scorer: top3[1] || null },
    { rank: 1, scorer: top3[0] || null },
    { rank: 3, scorer: top3[2] || null },
  ]

  return (
    <div className="px-4 py-6 space-y-8">
      <div className="relative flex items-end justify-center gap-3 sm:gap-4 h-56 mb-4 mt-10">
      {top3[0] && <LightRays />}
        {podiumSlots.map(({ rank, scorer }, idx) => {
          const isFirst = rank === 1

          if (!scorer) {
            return (
              <div
                key={`empty-${rank}`}
                className={`relative flex flex-col items-center ${isFirst ? 'w-28' : 'w-24'} opacity-30`}
              >
                <div className={`absolute ${isFirst ? '-top-16' : '-top-14'} z-10`}>
                  <PlayerAvatar size={isFirst ? 'lg' : 'md'} rank={rank} teamColor="#555" />
                </div>
                <div className={`w-full ${PODIUM_HEIGHTS[rank]} bg-bg-surface/30 border border-dashed border-border rounded-t-2xl mt-14 flex items-end justify-center pb-3`}>
                  <span className="text-[10px] text-text-secondary">—</span>
                </div>
              </div>
            )
          }

          return (
            <motion.div
              key={scorer.id}
              className={`flex flex-col items-center ${isFirst ? 'w-28 sm:w-32 z-10' : 'w-24 sm:w-28'} relative`}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.15 }}
            >
              <div className={`absolute ${isFirst ? '-top-16' : '-top-14'} z-10`}>
                <PlayerAvatar
                  name={scorer.name}
                  photo={scorer.photo}
                  teamColor={scorer.teamColor}
                  size={isFirst ? 'lg' : 'md'}
                  rank={rank}
                />
              </div>
              <div
                className={`w-full ${PODIUM_HEIGHTS[rank]} rounded-t-2xl flex flex-col items-center justify-end pb-3 px-1 mt-14 bg-gradient-to-t from-bg-surface to-bg-surface/60 border-t-2 relative overflow-hidden ${
                  isFirst
                    ? 'border-accent/60 shadow-[0_0_32px_rgba(184,155,94,0.12)] dark:shadow-[0_0_36px_rgba(255,255,255,0.06)]'
                    : 'border-border'
                }`}
              >
                <span className={`${isFirst ? 'text-sm' : 'text-xs'} font-bold text-center line-clamp-1 w-full`}>
                  {scorer.name}
                </span>
                <span className="text-[10px] text-text-secondary text-center line-clamp-1 w-full mt-0.5">
                  {scorer.team}
                </span>
                <span className={`${isFirst ? 'text-2xl' : 'text-xl'} font-bold ${PODIUM_RANKS[rank]} mt-1`}>
                  {scorer.goals}
                </span>
                <span className="text-[9px] text-text-secondary">
                  {scorer.goals === 1 ? t[lang].goal : t[lang].goals}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="space-y-3">
        {rest.map((scorer, index) => (
          <motion.div
            key={scorer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.08 }}
          >
            <DarkCard className="p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-7 h-7 rounded-full bg-bg-surface flex items-center justify-center text-xs font-bold text-text-secondary shrink-0">
                  {index + 4}
                </div>
                <PlayerAvatar
                  name={scorer.name}
                  photo={scorer.photo}
                  teamColor={scorer.teamColor}
                  size="sm"
                />
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-sm truncate">{scorer.name}</span>
                  <span className="text-[10px] text-text-secondary truncate">{scorer.team}</span>
                </div>
              </div>
              <div
                className="w-11 h-11 flex flex-col items-center justify-center bg-bg-surface rounded-xl border-2 shrink-0"
                style={{ borderColor: `${scorer.teamColor}66` }}
              >
                <span className="font-bold text-accent leading-none">{scorer.goals}</span>
                <span className="text-[8px] text-text-secondary mt-0.5">{t[lang].goal}</span>
              </div>
            </DarkCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
