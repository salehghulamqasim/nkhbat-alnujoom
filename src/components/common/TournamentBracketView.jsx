import { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Calendar, MapPin } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { useKnockoutStore } from '../../stores/useKnockoutStore'
import TeamLogo from './TeamLogo'

export default function TournamentBracketView({ teams = [] }) {
  const lang = useAppStore((s) => s.language)
  const isAr = lang === 'ar'
  
  const listenToFirestore = useKnockoutStore((s) => s.listenToFirestore)
  const cleanup = useKnockoutStore((s) => s.cleanup)
  const koMatches = useKnockoutStore((s) => s.knockoutMatches)
  const champion = useKnockoutStore((s) => s.champion)

  useEffect(() => {
    listenToFirestore()
    return () => cleanup()
  }, [listenToFirestore, cleanup])

  const teamsById = useMemo(() => {
    const map = {}
    teams.forEach((t) => (map[t.id] = t))
    
    // Merge qualified teams from store if we have simulated/mock teams
    const koQualified = useKnockoutStore.getState().qualifiedTeams || []
    koQualified.forEach((t) => {
      if (t.teamId && !map[t.teamId]) {
        map[t.teamId] = {
          id: t.teamId,
          name: t.name,
          logo: t.logo,
          color: t.color,
        }
      }
    })
    // Reference koMatches to trigger updates when store changes
    if (koMatches && koMatches.length > 0) {
      map.__koCount = koMatches.length
    }
    return map
  }, [teams, koMatches])

  // Map matches by round and label index
  const bracketData = useMemo(() => {
    const qf = { qf1: null, qf2: null, qf3: null, qf4: null }
    const sf = { sf1: null, sf2: null }
    let final = null

    const matchesList = koMatches || []
    matchesList.forEach((m) => {
      const round = (m.round || '').toUpperCase()
      const label = (m.matchLabel || '').toLowerCase()

      if (round === 'QF' || round.includes('8') || round.includes('ربع')) {
        if (label.includes('1')) qf.qf1 = m
        else if (label.includes('2')) qf.qf2 = m
        else if (label.includes('3')) qf.qf3 = m
        else if (label.includes('4')) qf.qf4 = m
        else {
          const emptySlot = Object.keys(qf).find(key => !qf[key])
          if (emptySlot) qf[emptySlot] = m
        }
      } else if (round === 'SF' || round.includes('4') || round.includes('نصف')) {
        if (label.includes('1')) sf.sf1 = m
        else if (label.includes('2')) sf.sf2 = m
        else {
          const emptySlot = Object.keys(sf).find(key => !sf[key])
          if (emptySlot) sf[emptySlot] = m
        }
      } else if (round === 'F' || round.includes('FINAL') || round.includes('نهائي')) {
        final = m
      }
    })

    return { qf, sf, final }
  }, [koMatches])

  const renderTeamRow = (teamId, score, isWinner, isPenaltyWinner) => {
    const team = teamsById[teamId]
    const hasTeam = !!teamId && !!team

    return (
      <div className={`flex items-center justify-between p-2.5 transition-colors ${
        isWinner ? 'bg-accent/5 dark:bg-accent/10' : ''
      }`}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasTeam ? (
            <>
              <TeamLogo logo={team.logo} name={team.name} color={team.color} size="xs" />
              <span className={`text-xs font-bold truncate ${
                isWinner ? 'text-accent' : 'text-text-primary'
              }`}>
                {team.name}
              </span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded-full border border-dashed border-zinc-700 bg-zinc-800/10 flex items-center justify-center text-[10px] text-text-secondary font-bold">
                ?
              </div>
              <span className="text-xs text-text-secondary font-medium italic">
                {isAr ? 'انتظار المتأهل' : 'TBD'}
              </span>
            </>
          )}
        </div>

        {hasTeam && score !== null && (
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className={`text-sm font-extrabold tabular-nums ${
              isWinner ? 'text-accent' : 'text-text-secondary'
            }`}>
              {score}
            </span>
            {isPenaltyWinner && (
              <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 whitespace-nowrap">
                {isAr ? 'ترجيح' : 'PEN'}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderMatchCard = (match, label) => {
    const hasTeams = match && (match.teamA || match.teamB)

    if (!match || !hasTeams) {
      return (
        <div className="w-full glass-card rounded-2xl border border-dashed border-border/80 p-5 text-center select-none bg-bg-surface/5 flex flex-col items-center justify-center min-h-[142px] shadow-xs">
          <p className="text-xs font-extrabold text-accent mb-2.5 uppercase tracking-wider">
            {isAr && label.includes('QF') ? label.replace('QF', 'دور الـ 8 - ') : isAr && label.includes('SF') ? label.replace('SF', 'دور الـ 4 - ') : label}
          </p>
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-zinc-400/40 bg-zinc-500/5 flex items-center justify-center text-text-secondary mx-auto my-2 text-base font-bold">
            ?
          </div>
          <p className="text-[10px] text-text-secondary/70 font-bold italic mt-1.5">{isAr ? 'انتظار المتأهل' : 'TBD'}</p>
        </div>
      )
    }

    const { teamA, teamB, result, status } = match
    const isCompleted = status === 'completed'
    const isLive = status === 'live'

    const scoreA = result ? result.scoreA : null
    const scoreB = result ? result.scoreB : null

    const hasWinnerA = isCompleted && (scoreA > scoreB || (scoreA === scoreB && result?.penaltyWinner === teamA))
    const hasWinnerB = isCompleted && (scoreB > scoreA || (scoreA === scoreB && result?.penaltyWinner === teamB))

    const isPenaltyWinnerA = isCompleted && scoreA === scoreB && result?.penaltyWinner === teamA
    const isPenaltyWinnerB = isCompleted && scoreA === scoreB && result?.penaltyWinner === teamB

    return (
      <div className={`w-full glass-card rounded-2xl border transition-all duration-300 relative select-none bg-bg-card overflow-hidden ${
        isLive ? 'border-live ring-1 ring-live/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]' : 'border-border/80 hover:border-zinc-700'
      }`}>
        {/* Card Header */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-bg-surface border-b border-border/60">
          <span className="text-[9px] font-extrabold text-accent uppercase tracking-wider">
            {isAr && label.includes('QF') ? label.replace('QF', 'دور الـ 8 - ') : isAr && label.includes('SF') ? label.replace('SF', 'دور الـ 4 - ') : label}
          </span>
          {isLive && (
            <span className="inline-flex items-center gap-1 text-[8px] font-bold text-live">
              <span className="w-1.5 h-1.5 rounded-full bg-live animate-pulse" />
              {isAr ? 'مباشر' : 'LIVE'}
            </span>
          )}
        </div>

        {/* Teams List */}
        <div className="divide-y divide-border/40">
          {renderTeamRow(teamA, scoreA, hasWinnerA, isPenaltyWinnerA)}
          {renderTeamRow(teamB, scoreB, hasWinnerB, isPenaltyWinnerB)}
        </div>

        {/* Date/Time/Venue footer */}
        {(match.date || match.venue) && (
          <div className="px-3 py-1.5 bg-bg-surface/30 border-t border-border/20 text-[9px] text-text-secondary flex justify-between gap-2">
            {match.date && (
              <span className="flex items-center gap-0.5 truncate">
                <Calendar size={8} />
                {match.date}
              </span>
            )}
            {match.venue && (
              <span className="flex items-center gap-0.5 truncate text-end">
                <MapPin size={8} />
                {match.venue}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }

  const { qf, sf, final } = bracketData

  return (
    <div className="w-full flex flex-col items-center">
      
      {koMatches.length === 0 && (
        <div className="w-full max-w-md p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center mb-8 flex flex-col items-center gap-3">
          <Trophy size={36} className="text-zinc-600 animate-pulse" />
          <p className="text-sm font-bold text-text-primary">
            {isAr ? 'مخطط البطولة فارغ حالياً' : 'The tournament bracket is currently empty'}
          </p>
          <p className="text-xs text-text-secondary">
            {isAr 
              ? 'بصفتك مسؤولاً، يمكنك محاكاة ملء المخطط ببيانات تجريبية كاملة لرؤية المظهر الحقيقي والتفاعلي للمخطط.' 
              : 'As an admin, you can simulate filling the bracket with complete demo data to see its live interactive layout.'}
          </p>
          <button
            type="button"
            onClick={() => {
              useKnockoutStore.getState().simulateKnockoutData(teams)
            }}
            className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-black font-extrabold text-xs rounded-xl shadow-lg shadow-accent/20 transition-all duration-200"
          >
            {isAr ? 'محاكاة بيانات البطولة ⚡️' : 'Simulate Tournament Data ⚡️'}
          </button>
        </div>
      )}

      {koMatches.length > 0 && (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              useKnockoutStore.getState().resetKnockout()
            }}
            className="px-4 py-2 bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/50 text-[11px] font-bold text-text-secondary hover:text-white rounded-lg transition-all duration-200"
          >
            {isAr ? 'إعادة تعيين المحاكاة (تفريغ المخطط)' : 'Reset Simulation (Empty Bracket)'}
          </button>
        </div>
      )}
      
      {/* Visual Trophy Section for the Champion */}
      {champion && teamsById[champion] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-4 bg-linear-to-br from-accent/20 to-bg-surface border border-accent/30 rounded-2xl text-center mb-8 flex flex-col items-center gap-2"
        >
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent shadow-lg shadow-accent/10 animate-bounce">
            <Trophy size={36} />
          </div>
          <div>
            <h3 className="text-lg font-black text-accent">{isAr ? 'بطل البطولة' : 'Tournament Champion'}</h3>
            <p className="text-xl font-extrabold text-white mt-1">{teamsById[champion].name}</p>
          </div>
        </motion.div>
      )}

      {/* Mobile scroll hint */}
      <div className="block md:hidden text-center text-[11px] font-bold text-text-secondary/70 mb-4 animate-pulse">
        {isAr ? '← اسحب أفقياً لمشاهدة مخطط البطولة كاملاً →' : '← Swipe horizontally to view full bracket tree →'}
      </div>

      {/* Bracket Tree Container */}
      <div className="w-full px-2 sm:px-4 max-w-5xl mx-auto overflow-x-auto pb-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
        
        {/* Symmetrical premium bracket tree with pixel-perfect local SVG lines */}
        <div className="flex flex-col gap-1 min-w-[960px]" dir="ltr">
          
          {/* Desktop Headers Row */}
          <div className="grid grid-cols-[1fr_40px_1fr_40px_1fr_40px_1fr_40px_1fr] gap-0 text-center border-b border-accent/20 pb-3 mb-4 select-none">
            <div className="text-[11px] font-black text-accent uppercase tracking-widest">{isAr ? 'دور الـ 8' : 'Quarter-Finals'}</div>
            <div /> {/* Connector spacer */}
            <div className="text-[11px] font-black text-accent uppercase tracking-widest">{isAr ? 'دور الـ 4' : 'Semi-Finals'}</div>
            <div /> {/* Connector spacer */}
            <div className="text-[11px] font-black text-accent uppercase tracking-widest animate-pulse">{isAr ? 'النهائي' : 'The Final'}</div>
            <div /> {/* Connector spacer */}
            <div className="text-[11px] font-black text-accent uppercase tracking-widest">{isAr ? 'دور الـ 4' : 'Semi-Finals'}</div>
            <div /> {/* Connector spacer */}
            <div className="text-[11px] font-black text-accent uppercase tracking-widest">{isAr ? 'دور الـ 8' : 'Quarter-Finals'}</div>
          </div>

          {/* Desktop Symmetrical Tree Grid */}
          <div className="grid grid-cols-[1fr_40px_1fr_40px_1fr_40px_1fr_40px_1fr] gap-0 items-stretch h-[440px]">
            
            {/* Column 1: Left Quarter-Finals (QF 1, QF 4) */}
            <div className="flex flex-col justify-between py-6 h-full">
              {renderMatchCard(qf.qf1, 'QF 1')}
              {renderMatchCard(qf.qf4, 'QF 4')}
            </div>

            {/* Left Connector (QFs -> SF1) */}
            <div className="h-full relative">
              <svg className="absolute inset-0 w-full h-full stroke-accent/40" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" strokeWidth="2">
                <path d="M 0,22.62 L 50,22.62 L 50,77.38 L 0,77.38 M 50,50 L 100,50" />
              </svg>
            </div>

            {/* Column 2: Left Semi-Final (SF 1) */}
            <div className="flex flex-col justify-center py-6 h-full">
              {renderMatchCard(sf.sf1, 'SF 1')}
            </div>

            {/* Center-Left Connector (SF1 -> Final) */}
            <div className="h-full relative">
              <svg className="absolute inset-0 w-full h-full stroke-accent/40" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" strokeWidth="2">
                <path d="M 0,50 L 100,50" />
              </svg>
            </div>

            {/* Column 3: Central Final (Final) */}
            <div className="flex flex-col justify-center py-6 h-full">
              {renderMatchCard(final, isAr ? 'النهائي' : 'Final')}
            </div>

            {/* Center-Right Connector (Final <- SF2) */}
            <div className="h-full relative">
              <svg className="absolute inset-0 w-full h-full stroke-accent/40" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" strokeWidth="2">
                <path d="M 0,50 L 100,50" />
              </svg>
            </div>

            {/* Column 4: Right Semi-Final (SF 2) */}
            <div className="flex flex-col justify-center py-6 h-full">
              {renderMatchCard(sf.sf2, 'SF 2')}
            </div>

            {/* Right Connector (SF2 <- QFs) */}
            <div className="h-full relative">
              <svg className="absolute inset-0 w-full h-full stroke-accent/40" viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" strokeWidth="2">
                <path d="M 100,22.62 L 50,22.62 L 50,77.38 L 100,77.38 M 50,50 L 0,50" />
              </svg>
            </div>

            {/* Column 5: Right Quarter-Finals (QF 2, QF 3) */}
            <div className="flex flex-col justify-between py-6 h-full">
              {renderMatchCard(qf.qf2, 'QF 2')}
              {renderMatchCard(qf.qf3, 'QF 3')}
            </div>

          </div>

        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[10px] text-text-secondary justify-center px-4 mt-6">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent" />
          {isAr ? 'مباراة الإقصاء' : 'Knockout Match'}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-live" />
          {isAr ? 'مباشر حالياً' : 'Live Now'}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] px-1" />
          {isAr ? 'حُسمت بركلات الترجيح' : 'Decided via Penalties'}
        </div>
      </div>
    </div>
  )
}
