import { useMemo } from 'react'
import { motion } from 'framer-motion'
import DarkCard from '../../components/common/DarkCard'
import TeamLogo from '../../components/common/TeamLogo'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { useTeamsQuery, useMatchesQuery } from '../../hooks/useQueries'
import { calculateTopScorers } from '../../utils/scorers'
import { useTranslation } from '../../hooks/useTranslation'

export default function TopScorersPage() {
  const { t } = useTranslation()
  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, refetch: refetchTeams } = useTeamsQuery()
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useMatchesQuery()

  const scorers = useMemo(() => calculateTopScorers(teams, matches), [teams, matches])
  const top3 = scorers.slice(0, 3)
  const rest = scorers.slice(3)

  const isLoading = teamsLoading || matchesLoading
  const isError = teamsError || matchesError

  if (isLoading) return <LoadingState message={t.topScorers.loading} />
  if (isError) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          message={t.topScorers.error}
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
        <EmptyState title={t.topScorers.emptyTitle} message={t.topScorers.emptyMessage} />
      </div>
    )
  }

  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3

  return (
    <div className="px-4 py-6 space-y-8">
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-2 h-48 mb-8 mt-12">
          {podiumOrder.map((scorer, idx) => {
            const rank = scorer === top3[0] ? 1 : scorer === top3[1] ? 2 : 3
            const isFirst = rank === 1
            const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' }
            const borders = { 1: 'border-accent', 2: 'border-slate-300', 3: 'border-amber-700' }
            const badgeColors = { 1: 'bg-accent text-black', 2: 'bg-slate-300 text-black', 3: 'bg-amber-700 text-white' }

            return (
              <motion.div
                key={scorer.id}
                className={`flex flex-col items-center ${isFirst ? 'w-28 z-10' : 'w-24'} relative`}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: idx * 0.15 }}
              >
                <div
                  className={`absolute ${isFirst ? '-top-14 w-16 h-16' : '-top-12 w-14 h-14'} z-10 rounded-full border-2 ${borders[rank]} bg-bg-surface flex items-center justify-center overflow-hidden ${isFirst ? 'shadow-[0_0_15px_rgba(212,175,55,0.5)]' : ''}`}
                >
                  <TeamLogo logo={scorer.logo} name={scorer.team} size={isFirst ? 'md' : 'sm'} />
                  <div className={`absolute -bottom-2 -right-2 w-6 h-6 ${badgeColors[rank]} text-xs font-bold rounded-full flex items-center justify-center`}>
                    {rank}
                  </div>
                </div>
                <div
                  className={`w-full ${heights[rank]} bg-gradient-to-t from-bg-surface ${isFirst ? 'to-accent/20 border-t-2 border-accent shadow-[0_0_20px_rgba(212,175,55,0.2)]' : rank === 2 ? 'to-slate-400/20 border-t border-slate-400/40' : 'to-amber-600/20 border-t border-amber-600/40'} rounded-t-xl flex flex-col items-center justify-end pb-3`}
                >
                  <span className={`${isFirst ? 'text-sm' : 'text-xs'} font-bold text-center px-1 line-clamp-1`}>{scorer.name}</span>
                  <span className={`${isFirst ? 'text-xl' : 'text-lg'} font-bold text-accent`}>{scorer.goals}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <div className="space-y-3">
        {rest.map((scorer, index) => (
          <motion.div
            key={scorer.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.08 }}
          >
            <DarkCard className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-bg-surface flex items-center justify-center text-xs font-bold text-text-secondary">
                  {index + 4}
                </div>
                <TeamLogo logo={scorer.logo} name={scorer.team} size="sm" />
                <div className="flex flex-col">
                  <span className="font-bold text-sm">{scorer.name}</span>
                  <span className="text-[10px] text-text-secondary">{scorer.team}</span>
                </div>
              </div>
              <div className="w-10 h-10 flex flex-col items-center justify-center bg-bg-surface rounded-xl border border-border">
                <span className="font-bold text-accent leading-none">{scorer.goals}</span>
                <span className="text-[8px] text-text-secondary mt-0.5">{t.topScorers.goal}</span>
              </div>
            </DarkCard>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
