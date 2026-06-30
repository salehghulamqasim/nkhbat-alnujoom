import DarkCard from './DarkCard'
import TeamLogo from './TeamLogo'
import BorderBeam from '../effects/BorderBeam'
import { formatMatchDate, getMatchDisplayStatus } from '../../utils/matchHelpers'
import { useLiveMatch } from '../../hooks/useLiveMatch'
import { useAppStore } from '../../stores/useAppStore'
import { Trophy } from 'lucide-react'

const t = {
  ar: {
    live: 'مباشر',
    completed: 'منتهية',
    upcoming: 'قادمة',
    postponed: 'مؤجلة',
    group: (g) => {
      const arGroups = { A: 'أ', B: 'ب', C: 'ج' }
      return `المجموعة ${arGroups[g] || g}`
    },
    round: { QF: 'دور الـ 8', SF: 'دور الـ 4', F: 'النهائي' }
  },
  en: {
    live: 'Live',
    completed: 'Finished',
    upcoming: 'Upcoming',
    postponed: 'Postponed',
    group: (g) => `Group ${g}`,
    round: { QF: 'Round 8', SF: 'Round 4', F: 'Final' }
  }
}

export default function MatchRow({ match, teamA, teamB, onClick }) {
  const lang = useAppStore((s) => s.language)
  const theme = useAppStore((s) => s.theme)
  const isAr = lang === 'ar'
  const status = getMatchDisplayStatus(match)
  const isLive = status === 'live'
  const dateLabel = formatMatchDate(match.date, lang)
  const { liveData, loading: liveLoading } = useLiveMatch(isLive ? match.id : null)
  const isFinal = match.round === 'F'

  const beamGold = theme === 'dark' ? 'rgba(212, 185, 106, 0.85)' : 'rgba(142, 110, 48, 0.75)'
  const beamLive = theme === 'dark' ? 'rgba(234, 100, 90, 0.7)' : 'rgba(234, 67, 53, 0.55)'

  // In RTL (Arabic) the flex row is visually reversed: teamB is on the left, teamA on the right.
  // So the score string must also be reversed to match what the user sees visually.
  const getScore = (sA, sB) => isAr ? `${sB} - ${sA}` : `${sA} - ${sB}`

  const centerContent =
    status === 'live'
      ? liveLoading
        ? '...'
        : liveData
          ? getScore(liveData.scoreA, liveData.scoreB)
          : match.result
            ? getScore(match.result.scoreA, match.result.scoreB)
            : getScore(0, 0)
      : status === 'completed' && match.result
        ? getScore(match.result.scoreA, match.result.scoreB)
        : match.time

  return (
    <DarkCard
      hover={Boolean(onClick)}
      onClick={onClick}
      className={`p-4 border-t border-border relative overflow-hidden ${
        isLive ? 'border-live/30 shadow-[0_0_20px_rgba(234,67,53,0.08)]' : ''
      } ${isFinal ? 'ring-2 ring-accent/50 ring-offset-2 ring-offset-bg-primary' : ''}`}
    >
      {isLive && (
        <>
          <BorderBeam
            duration={5}
            size={280}
            borderWidth={2}
            colorVia={beamGold}
          />
          <BorderBeam
            duration={5}
            delay={2.5}
            size={280}
            borderWidth={1.5}
            colorVia={beamLive}
          />
        </>
      )}
      <div className="relative z-[1]">
        {/* Header row: status on one side, round/group on other, FINAL badge inline */}
        <div className="flex items-center justify-between text-xs text-text-secondary mb-3 gap-2">
          {status === 'live' ? (
            <span className="flex items-center gap-1.5 text-live font-bold shrink-0">
              <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
              {t[lang].live}
            </span>
          ) : (
            <span className={`font-medium shrink-0 ${status === 'postponed' ? 'text-warning' : ''}`}>
              {status === 'completed'
                ? t[lang].completed
                : status === 'postponed'
                  ? t[lang].postponed
                  : t[lang].upcoming}
            </span>
          )}

          <div className="flex items-center gap-2 justify-end min-w-0">
            {isFinal && (
              <span className="bg-gradient-to-br from-accent to-accent-hover text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md shadow-accent/30 shrink-0">
                <Trophy size={10} className="fill-current" />
                <span className="text-[10px] font-bold">{isAr ? 'النهائي' : 'FINAL'}</span>
              </span>
            )}
            <span className="truncate">{match.round ? (t[lang].round ? t[lang].round[match.round] : match.round) : t[lang].group(match.group)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2 w-1/3">
          <TeamLogo logo={teamA?.logo || match.homeLogo} name={teamA?.name || match.home} color={teamA?.color || match.homeColor} />
          <span className="font-bold text-sm text-center line-clamp-2">{teamA?.name || match.home || '—'}</span>
        </div>

        <div className="flex flex-col items-center justify-center w-1/3">
          <div className="text-2xl font-bold tracking-widest text-accent mb-1" dir="ltr">
            {centerContent}
          </div>
          <span className="text-[10px] text-text-secondary px-2 py-0.5 bg-bg-surface rounded-full">
            {dateLabel}
          </span>
          {match.venue && (
            <span className="text-[10px] text-text-secondary mt-1 line-clamp-1">{match.venue}</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 w-1/3">
          <TeamLogo logo={teamB?.logo || match.awayLogo} name={teamB?.name || match.away} color={teamB?.color || match.awayColor} />
          <span className="font-bold text-sm text-center line-clamp-2">{teamB?.name || match.away || '—'}</span>
        </div>
        </div>
      </div>
    </DarkCard>
  )
}
