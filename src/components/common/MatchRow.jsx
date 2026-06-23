import DarkCard from './DarkCard'
import TeamLogo from './TeamLogo'
import { formatMatchDate, getMatchDisplayStatus } from '../../utils/matchHelpers'
import { useLiveMatch } from '../../hooks/useLiveMatch'
import { useAppStore } from '../../stores/useAppStore'

const t = {
  ar: {
    live: 'مباشر',
    completed: 'منتهية',
    upcoming: 'قادمة',
    postponed: 'مؤجلة',
    group: (g) => {
      const arGroups = { A: 'أ', B: 'ب', C: 'ج' }
      return `المجموعة ${arGroups[g] || g}`
    }
  },
  en: {
    live: 'Live',
    completed: 'Finished',
    upcoming: 'Upcoming',
    postponed: 'Postponed',
    group: (g) => `Group ${g}`
  }
}

export default function MatchRow({ match, teamA, teamB, onClick }) {
  const lang = useAppStore((s) => s.language)
  const isAr = lang === 'ar'
  const status = getMatchDisplayStatus(match)
  const dateLabel = formatMatchDate(match.date, lang)
  const { liveData, loading: liveLoading } = useLiveMatch(status === 'live' ? match.id : null)

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
      className="p-4 border-t border-border"
    >
      <div className="flex items-center justify-between text-xs text-text-secondary mb-3">
        {status === 'live' ? (
          <span className="flex items-center gap-1.5 text-live font-bold">
            <span className="w-2 h-2 rounded-full bg-live animate-pulse" />
            {t[lang].live}
          </span>
        ) : (
          <span className={`font-medium ${status === 'postponed' ? 'text-warning' : ''}`}>
            {status === 'completed'
              ? t[lang].completed
              : status === 'postponed'
                ? t[lang].postponed
                : t[lang].upcoming}
          </span>
        )}
        <span>{t[lang].group(match.group)}</span>
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
    </DarkCard>
  )
}
