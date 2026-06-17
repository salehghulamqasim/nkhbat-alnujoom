import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import DarkCard from '../../components/common/DarkCard'
import TeamLogo from '../../components/common/TeamLogo'
import MatchRow from '../../components/common/MatchRow'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { useTeamsQuery, useMatchesQuery } from '../../hooks/useQueries'
import { calculateStandings, getTeamStandingRank } from '../../utils/standings'
import { getPlayerGoals } from '../../utils/scorers'
import { enrichMatch } from '../../utils/matchHelpers'

export default function TeamDetailPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('players')
  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, refetch: refetchTeams } = useTeamsQuery()
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useMatchesQuery()

  const team = teams.find((t) => t.id === id)

  const standingsStats = useMemo(() => {
    if (!team?.group) return null
    const standings = calculateStandings(teams, matches, team.group)
    return standings.find((t) => t.id === team.id)
  }, [team, teams, matches])

  const rank = useMemo(
    () => (team ? getTeamStandingRank(teams, matches, team.id) : null),
    [team, teams, matches]
  )

  const teamMatches = useMemo(() => {
    if (!team) return []
    return matches
      .filter((m) => m.teamA === team.id || m.teamB === team.id)
      .map((m) => enrichMatch(m, teams))
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
  }, [team, matches, teams])

  const playersWithGoals = useMemo(() => {
    if (!team) return []
    return (team.players || []).map((player) => ({
      ...player,
      goals: getPlayerGoals(teams, matches, player.name, team.id),
    }))
  }, [team, teams, matches])

  const isLoading = teamsLoading || matchesLoading
  const isError = teamsError || matchesError

  if (isLoading) return <LoadingState message="جاري تحميل بيانات الفريق..." />
  if (isError) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          message="تعذر تحميل بيانات الفريق"
          onRetry={() => {
            refetchTeams()
            refetchMatches()
          }}
        />
      </div>
    )
  }

  if (!team) {
    return (
      <div className="px-4 py-6">
        <EmptyState title="الفريق غير موجود" message="لم يتم العثور على هذا الفريق" />
      </div>
    )
  }

  return (
    <div className="pb-6">
      <div className="bg-bg-card border-b border-border pt-4 pb-6 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 to-transparent opacity-50" />

        <Link
          to="/teams"
          className="relative z-10 flex items-center text-sm text-text-secondary hover:text-text-primary mb-4 w-fit"
        >
          <ChevronRight size={16} className="rtl:-scale-x-100" /> عودة للفرق
        </Link>

        <div className="relative z-10 flex flex-col items-center">
          <TeamLogo logo={team.logo} name={team.name} size="xl" className="border-2 border-accent mb-3 shadow-[0_0_15px_rgba(212,175,55,0.35)]" />
          <h1 className="text-2xl font-bold mb-1">{team.name}</h1>
          <div className="flex items-center gap-2 text-sm text-text-secondary flex-wrap justify-center">
            {team.group && (
              <span className="bg-bg-surface px-2 py-0.5 rounded">
                المجموعة {team.group}
                {rank && ` — المركز ${rank}`}
              </span>
            )}
            <span>مدرب: {team.manager}</span>
          </div>

          {standingsStats && (
            <div className="grid grid-cols-4 gap-2 mt-4 w-full max-w-sm">
              {[
                { label: 'نقاط', value: standingsStats.pts },
                { label: 'لعب', value: standingsStats.played },
                { label: 'فوز', value: standingsStats.won },
                { label: 'خسارة', value: standingsStats.lost },
              ].map((stat) => (
                <DarkCard key={stat.label} className="p-2 text-center">
                  <p className="text-lg font-bold text-accent">{stat.value}</p>
                  <p className="text-[10px] text-text-secondary">{stat.label}</p>
                </DarkCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        {[
          { id: 'players', label: 'اللاعبون' },
          { id: 'matches', label: 'المباريات' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-4 text-sm font-bold relative transition-colors ${activeTab === tab.id ? 'text-accent' : 'text-text-secondary'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
          </button>
        ))}
      </div>

      <div className="px-4">
        {activeTab === 'players' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            {playersWithGoals.length === 0 ? (
              <EmptyState title="لا يوجد لاعبون" message="لم يتم تسجيل لاعبين لهذا الفريق" />
            ) : (
              playersWithGoals.map((player, index) => (
                <DarkCard key={player.id || index} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-bg-surface flex items-center justify-center font-bold border border-border">
                      {index + 1}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{player.name}</span>
                    </div>
                  </div>
                  {player.goals > 0 && (
                    <div className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded">
                      {player.goals} {player.goals === 1 ? 'هدف' : 'أهداف'}
                    </div>
                  )}
                </DarkCard>
              ))
            )}
          </motion.div>
        )}

        {activeTab === 'matches' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
            {teamMatches.length === 0 ? (
              <EmptyState title="لا توجد مباريات" message="لم يتم جدولة مباريات لهذا الفريق بعد" />
            ) : (
              teamMatches.map((match) => <MatchRow key={match.id} match={match} />)
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
