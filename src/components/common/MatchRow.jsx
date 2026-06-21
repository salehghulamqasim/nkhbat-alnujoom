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
    group: (g) => {
      const arGroups = { A: 'أ', B: 'ب', C: 'ج' }
      return `المجموعة ${arGroups[g] || g}`
    }
  },
  en: {
    live: 'Live',
    completed: 'Finished',
    upcoming: 'Upcoming',
    group: (g) => `Group ${g}`
  }
}

export default function MatchRow({ match, onClick }) {
  const lang = useAppStore((s) => s.language)
  const status = getMatchDisplayStatus(match)
  const dateLabel = formatMatchDate(match.date, lang)
  const { liveData, loading: liveLoading } = useLiveMatch(status === 'live' ? match.id : null)

  const centerContent =
    status === 'live'
      ? liveLoading
        ? '...'
        : liveData
          ? `${liveData.scoreA} - ${liveData.scoreB}`
          : match.result
            ? `${match.result.scoreA} - ${match.result.scoreB}`
            : '0 - 0'
      : status === 'completed' && match.result
        ? `${match.result.scoreA} - ${match.result.scoreB}`
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
          <span className="font-medium">
            {status === 'completed' ? t[lang].completed : t[lang].upcoming}
          </span>
        )}
        <span>{t[lang].group(match.group)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-2 w-1/3">
          <TeamLogo logo={match.homeLogo} name={match.home} />
          <span className="font-bold text-sm text-center line-clamp-2">{match.home}</span>
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
          <TeamLogo logo={match.awayLogo} name={match.away} />
          <span className="font-bold text-sm text-center line-clamp-2">{match.away}</span>
        </div>
      </div>
    </DarkCard>
  )
}
