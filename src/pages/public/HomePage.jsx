import { useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import { ChevronLeft, Settings, Sun, Moon } from 'lucide-react'
import StatCard from '../../components/common/StatCard'
import MatchRow from '../../components/common/MatchRow'
import DarkCard from '../../components/common/DarkCard'
import GoldButton from '../../components/common/GoldButton'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import TeamLogo from '../../components/common/TeamLogo'
import { useTeamsQuery, useMatchesQuery } from '../../hooks/useQueries'
import { enrichMatch } from '../../utils/matchHelpers'
import { calculateTopScorers, getTotalGoals } from '../../utils/scorers'
import { MAX_TEAMS } from '../../stores/useTeamsStore'
import { useAppStore } from '../../stores/useAppStore'
import { useTranslation } from '../../hooks/useTranslation'

export default function HomePage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useAppStore()
  const { t, lang } = useTranslation()

  const { language, toggleLanguage } = useAppStore()

  const isRtl = lang === 'ar'
  const containerRef = useRef(null)

  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, refetch: refetchTeams } = useTeamsQuery()
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useMatchesQuery()

  const isLoading = teamsLoading || matchesLoading
  const isError = teamsError || matchesError

  // GSAP Entrance Animations
  useEffect(() => {
    if (isLoading || isError) return

    const ctx = gsap.context(() => {
      // Smooth fade-in for hero contents
      gsap.fromTo(
        '.hero-content',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger: 0.15 }
      )
    }, containerRef)

    return () => ctx.revert()
  }, [isLoading, isError])

  const enrichedMatches = useMemo(() => matches.map((m) => enrichMatch(m, teams)), [matches, teams])

  const upcomingMatches = useMemo(
    () =>
      enrichedMatches
        .filter((m) => m.status === 'scheduled')
        .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
        .slice(0, 3),
    [enrichedMatches]
  )

  const latestResults = useMemo(
    () =>
      enrichedMatches
        .filter((m) => m.status === 'completed')
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
        .slice(0, 3),
    [enrichedMatches]
  )

  const topScorersList = useMemo(() => calculateTopScorers(teams, matches).slice(0, 5), [teams, matches])
  const totalGoals = useMemo(() => getTotalGoals(matches), [matches])

  if (isLoading) return <LoadingState message={t.home.loading} />
  
  if (isError) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          message={t.home.error}
          onRetry={() => {
            refetchTeams()
            refetchMatches()
          }}
        />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-6 pb-8 overflow-x-hidden">
      {/* Home header controls — fixed so they stay tappable above the hero */}
      <div className="fixed top-0 inset-x-0 z-50 px-4 pt-4 sm:pt-6 flex items-center justify-between pointer-events-none">
        <Link
          to="/more"
          className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-black/60 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/60 transition-all duration-200 backdrop-blur-sm"
          aria-label={language === 'ar' ? 'الإعدادات' : 'Settings'}
        >
          <Settings size={18} strokeWidth={1.75} />
        </Link>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={toggleTheme}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-black/60 border border-accent/30 text-accent hover:bg-accent/20 hover:border-accent/60 transition-all duration-200 backdrop-blur-sm"
            aria-label={language === 'ar' ? 'تبديل المظهر' : 'Toggle theme'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            type="button"
            onClick={toggleLanguage}
            className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl bg-black/60 border border-accent/30 text-xs font-bold text-accent hover:bg-accent hover:text-black transition-all duration-200 backdrop-blur-sm"
          >
            {language === 'ar' ? 'EN' : 'AR'}
          </button>
        </div>
      </div>

      {/* Premium Hero Section - Fullscreen */}
      <div className="relative w-screen left-1/2 right-1/2 -mx-[50vw] h-[320px] sm:h-[380px] md:h-[480px] overflow-hidden select-none bg-black -mt-4 sm:-mt-6">
        {/* Background Image */}
        <img
          src="/premium-trophy-bg.png"
          alt="Premium Trophy"
          className={`absolute inset-0 w-full h-full object-cover z-0 ${isRtl ? 'object-left scale-x-[-1]' : 'object-right'}`}
        />

        {/* Gradients overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/40 to-transparent z-10" />
        <div className={`absolute inset-0 z-10 ${isRtl ? 'bg-gradient-to-l from-bg-primary/95 via-bg-primary/70 to-transparent' : 'bg-gradient-to-r from-bg-primary/95 via-bg-primary/70 to-transparent'}`} />

        {/* Hero Text Content */}
        <div className={`absolute inset-0 z-20 flex flex-col justify-center px-6 sm:px-8 md:px-12 ${isRtl ? 'items-start pr-8 sm:pr-12' : 'items-start pl-8 sm:pl-12'}`}>
          <div className={`flex flex-col gap-3 sm:gap-4 max-w-lg ${isRtl ? 'items-start text-right' : 'items-start text-left'}`}>
            {/* Subtitle badge */}
            <span className="hero-content opacity-100 text-accent-light text-xs sm:text-sm font-bold uppercase tracking-widest bg-accent/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-accent/20 whitespace-nowrap">
              {t.home.subtitle}
            </span>

            {/* Main Title */}
            <h2 className="hero-content opacity-100 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-accent drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] leading-tight">
              {t.home.title}
            </h2>

            {/* Gold Stars */}
            <div className="hero-content flex text-accent text-lg sm:text-xl gap-3">
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>
          </div>
        </div>
      </div>

       {/* Stats Cards floating over the Hero bottom */}
      <div className="relative z-30 -mt-14 sm:-mt-16 md:-mt-20 px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <StatCard
            key={`teams-${lang}-${teams.length}`}
            value={teams.length}
            label={t.home.team}
            delay={0}
            className="backdrop-blur-md shadow-md py-3 sm:py-4"
          />
          <StatCard
            key={`matches-${lang}-${matches.length}`}
            value={matches.length}
            label={t.home.match}
            delay={0.1}
            className="backdrop-blur-md shadow-md py-3 sm:py-4"
          />
          <StatCard
            key={`goals-${lang}-${totalGoals}`}
            value={totalGoals}
            label={t.home.goal}
            delay={0.2}
            className="backdrop-blur-md shadow-md py-3 sm:py-4"
          />
          <StatCard
            key={`limit-${lang}-${MAX_TEAMS}`}
            value={MAX_TEAMS}
            label={t.home.limit}
            delay={0.3}
            className="backdrop-blur-md shadow-md py-3 sm:py-4"
          />
        </div>
      </div>

      {/* Main Content - Centered with max width */}
      <div className="px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
        {/* Main Actions */}
        <div className="flex gap-3 pt-2 sm:pt-4">
          <Link to="/standings" className="flex-1">
            <GoldButton className="w-full text-xs sm:text-sm font-bold h-11 rounded-xl shadow-lg shadow-accent/15">
              {t.home.groupsTable}
            </GoldButton>
          </Link>
          <Link to="/matches" className="flex-1">
            <GoldButton variant="ghost" className="w-full text-xs sm:text-sm font-bold h-11 rounded-xl">
              {t.home.matchesSchedule}
            </GoldButton>
          </Link>
        </div>

        {/* Upcoming Matches */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-base font-bold">{t.home.upcomingMatches}</h2>
            {upcomingMatches.length > 0 && (
              <Link to="/matches" className="text-xs text-text-secondary hover:text-accent flex items-center gap-0.5">
                {t.home.viewAll}
                <ChevronLeft size={14} className="mt-[1px] ltr:rotate-180" />
              </Link>
            )}
          </div>

          {upcomingMatches.length === 0 ? (
            <EmptyState title={t.home.noUpcoming} message={t.home.noUpcomingDesc} />
          ) : (
            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
              }}
            >
              {upcomingMatches.map((match) => (
                <motion.div
                  key={match.id}
                  variants={{
                    hidden: { y: 10, opacity: 0 },
                    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
                  }}
                >
                  <MatchRow
                    match={match}
                    onClick={() => navigate(`/matches/${match.id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Latest Results */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-base font-bold">{t.home.latestResults}</h2>
            {latestResults.length > 0 && (
              <Link to="/matches" className="text-xs text-text-secondary hover:text-accent flex items-center gap-0.5">
                {t.home.viewAll}
                <ChevronLeft size={14} className="mt-[1px] ltr:rotate-180" />
              </Link>
            )}
          </div>

          {latestResults.length === 0 ? (
            <EmptyState title={t.home.noResults} message={t.home.noResultsDesc} />
          ) : (
            <div className="space-y-3">
              {latestResults.map((match) => (
                <MatchRow
                  key={match.id}
                  match={match}
                  onClick={() => navigate(`/matches/${match.id}`)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Top Scorers */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-base font-bold">{t.home.topScorers}</h2>
            {topScorersList.length > 0 && (
              <Link to="/top-scorers" className="text-xs text-text-secondary hover:text-accent flex items-center gap-0.5">
                {t.home.viewAll}
                <ChevronLeft size={14} className="mt-[1px] ltr:rotate-180" />
              </Link>
            )}
          </div>

          {topScorersList.length === 0 ? (
            <EmptyState title={t.home.noScorers} message={t.home.noScorersDesc} />
          ) : (
            <div className="space-y-2">
              {topScorersList.map((scorer, index) => (
                <DarkCard key={scorer.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-bg-surface flex items-center justify-center text-[10px] font-bold text-accent">
                      {index + 1}
                    </span>
                    <TeamLogo logo={scorer.logo} name={scorer.team} size="sm" />
                    <div>
                      <p className="font-bold text-xs sm:text-sm">{scorer.name}</p>
                      <p className="text-[9px] text-text-secondary">{scorer.team}</p>
                    </div>
                  </div>
                  <span className="font-bold text-accent text-sm">{scorer.goals}</span>
                </DarkCard>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
