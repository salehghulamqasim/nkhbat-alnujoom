import { useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Calendar, Radio } from 'lucide-react'
import TeamLogo from '../../components/common/TeamLogo'
import DarkCard from '../../components/common/DarkCard'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import { useTeamsQuery, useMatchesQuery } from '../../hooks/useQueries'
import { useLiveMatch } from '../../hooks/useLiveMatch'
import { enrichMatch, formatMatchDate, getMatchDisplayStatus } from '../../utils/matchHelpers'
import { useAppStore } from '../../stores/useAppStore'
import { haptic } from '../../hooks/useHaptics'

const t = {
  ar: {
    back: 'رجوع',
    live: 'مباشر',
    completed: 'منتهية',
    upcoming: 'قادمة',
    group: (g) => {
      const arGroups = { A: 'أ', B: 'ب', C: 'ج' }
      return `المجموعة ${arGroups[g] || g}`
    },
    loading: 'جاري تحميل المباراة...',
    errorLive: 'تعذر الاتصال بالبث المباشر',
    errorMatch: 'تعذر تحميل بيانات المباراة',
    notFoundTitle: 'المباراة غير موجودة',
    notFoundMessage: 'لم يتم العثور على هذه مباراة',
    events: 'أحداث المباراة',
    notStarted: 'المباراة لم تبدأ بعد',
    viewAllMatches: 'عرض جميع المباريات'
  },
  en: {
    back: 'Back',
    live: 'Live',
    completed: 'Finished',
    upcoming: 'Upcoming',
    group: (g) => `Group ${g}`,
    loading: 'Loading match...',
    errorLive: 'Failed to connect to live stream',
    errorMatch: 'Failed to load match data',
    notFoundTitle: 'Match Not Found',
    notFoundMessage: 'This match could not be found',
    events: 'Match Events',
    notStarted: 'The match has not started yet',
    viewAllMatches: 'View all matches'
  }
}

export default function LiveMatchPage() {
  const lang = useAppStore((s) => s.language)
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, refetch: refetchTeams } = useTeamsQuery()
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useMatchesQuery()

  const match = useMemo(() => matches.find((m) => m.id === id), [matches, id])
  const enriched = useMemo(
    () => (match ? enrichMatch(match, teams) : null),
    [match, teams]
  )

  const isLive = enriched && getMatchDisplayStatus(enriched) === 'live'
  const { liveData, loading: liveLoading, error: liveError } = useLiveMatch(isLive ? id : null)

  const scoreA = isLive && liveData ? liveData.scoreA : enriched?.result?.scoreA
  const scoreB = isLive && liveData ? liveData.scoreB : enriched?.result?.scoreB
  const events = isLive && liveData?.events ? liveData.events : enriched?.result?.scorers || []

  const isLoading = teamsLoading || matchesLoading || (isLive && liveLoading)
  const isError = teamsError || matchesError || (isLive && liveError)

  if (isLoading) return <LoadingState message={t[lang].loading} />

  if (isError) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          message={
            liveError
              ? t[lang].errorLive
              : t[lang].errorMatch
          }
          onRetry={() => {
            refetchTeams()
            refetchMatches()
          }}
        />
      </div>
    )
  }

  if (!enriched) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          title={t[lang].notFoundTitle}
          message={t[lang].notFoundMessage}
          onRetry={() => navigate('/matches')}
        />
      </div>
    )
  }

  const status = getMatchDisplayStatus(enriched)

  return (
    <div className="px-4 py-6 space-y-6">
      <button
        type="button"
        onClick={() => {
          haptic.light()
          navigate(-1)
        }}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors"
      >
        <ArrowRight size={16} />
        <span>{t[lang].back}</span>
      </button>

      <div className="text-center space-y-2">
        {status === 'live' ? (
          <span className="inline-flex items-center gap-2 text-live font-bold text-sm">
            <Radio size={14} className="animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
            {t[lang].live}
          </span>
        ) : (
          <span className="text-sm text-text-secondary">
            {status === 'completed' ? t[lang].completed : t[lang].upcoming} • {t[lang].group(enriched.group)}
          </span>
        )}
      </div>

      <DarkCard className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
            <TeamLogo logo={enriched.homeLogo} name={enriched.home} size="lg" />
            <span className="font-bold text-center line-clamp-2">{enriched.home}</span>
          </div>

          <div className="flex flex-col items-center shrink-0 px-2">
            {status === 'upcoming' ? (
              <span className="text-3xl font-bold text-text-secondary">VS</span>
            ) : (
              <motion.span
                key={`${scoreA}-${scoreB}`}
                initial={{ scale: 1.2, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold text-accent tracking-widest"
                dir="ltr"
              >
                {scoreA ?? 0} - {scoreB ?? 0}
              </motion.span>
            )}
          </div>

          <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
            <TeamLogo logo={enriched.awayLogo} name={enriched.away} size="lg" />
            <span className="font-bold text-center line-clamp-2">{enriched.away}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-6 pt-4 border-t border-border text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {formatMatchDate(enriched.date, lang)}
          </span>
          <span className="flex items-center gap-1" dir="ltr">
            <Clock size={12} />
            {enriched.time}
          </span>
          {enriched.venue && (
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {enriched.venue}
            </span>
          )}
        </div>
      </DarkCard>

      {(status === 'live' || status === 'completed') && events.length > 0 && (
        <section>
          <h2 className="text-lg font-bold mb-3">{t[lang].events}</h2>
          <div className="space-y-2">
            {events.map((event, index) => {
              const isGoal = event.type === 'goal' || event.player
              const playerName = event.player || event.name
              const minute = event.minute
              const teamName =
                event.teamId === enriched.teamA
                  ? enriched.home
                  : event.teamId === enriched.teamB
                    ? enriched.away
                    : null

              return (
                <DarkCard key={index} className="p-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{isGoal ? '⚽' : '📋'}</span>
                    <span className="font-medium">{playerName}</span>
                    {teamName && (
                      <span className="text-text-secondary text-xs">({teamName})</span>
                    )}
                  </div>
                  {minute != null && (
                    <span className="text-accent font-bold" dir="ltr">
                      {minute}&apos;
                    </span>
                  )}
                </DarkCard>
              )
            })}
          </div>
        </section>
      )}

      {status === 'upcoming' && (
        <DarkCard className="p-6 text-center">
          <p className="text-text-secondary text-sm">{t[lang].notStarted}</p>
          <Link to="/matches" className="text-accent text-sm mt-2 inline-block hover:underline">
            {t[lang].viewAllMatches}
          </Link>
        </DarkCard>
      )}
    </div>
  )
}
