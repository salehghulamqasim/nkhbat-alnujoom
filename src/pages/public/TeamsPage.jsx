import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import DarkCard from '../../components/common/DarkCard'
import TeamLogo from '../../components/common/TeamLogo'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import { useTeamsQuery } from '../../hooks/useQueries'
import { useAppStore } from '../../stores/useAppStore'

const t = {
  ar: {
    title: 'الفرق المشاركة',
    search: 'بحث عن فريق...',
    all: 'الكل',
    group: 'المجموعة',
    awaitingDraw: 'بانتظار القرعة',
    emptyTitle: 'لا توجد فرق مسجلة',
    emptyMsg: 'سيتم عرض الفرق المشاركة هنا بعد تسجيلها',
    noResultsTitle: 'لم يتم العثور على نتائج',
    noResultsMsg: 'جرب تغيير معايير البحث أو التصفية',
    loading: 'جاري تحميل الفرق...',
    error: 'تعذر تحميل الفرق',
  },
  en: {
    title: 'Participating Teams',
    search: 'Search for a team...',
    all: 'All',
    group: 'Group',
    awaitingDraw: 'Awaiting Draw',
    emptyTitle: 'No teams registered',
    emptyMsg: 'Participating teams will appear here after registration',
    noResultsTitle: 'No results found',
    noResultsMsg: 'Try changing your search or filter criteria',
    loading: 'Loading teams...',
    error: 'Failed to load teams',
  },
}

export default function TeamsPage() {
  const lang = useAppStore((s) => s.language)
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const { data: teams = [], isLoading, isError, refetch } = useTeamsQuery()

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      const matchesGroup = filter === 'all' || team.group === filter
      const matchesSearch = team.name.includes(searchQuery)
      return matchesGroup && matchesSearch
    })
  }, [teams, filter, searchQuery])

  if (isLoading) return <LoadingState message={t[lang].loading} />
  if (isError) {
    return (
      <div className="px-4 py-6">
        <ErrorState message={t[lang].error} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-center mb-6">{t[lang].title}</h1>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t[lang].search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-surface border border-border rounded-xl py-3 pr-10 pl-4 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary placeholder:text-text-secondary"
          />
          <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary" />
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary appearance-none"
        >
          <option value="all">{t[lang].all}</option>
          <option value="A">{t[lang].group} A</option>
          <option value="B">{t[lang].group} B</option>
          <option value="C">{t[lang].group} C</option>
        </select>
      </div>

      {teams.length === 0 ? (
        <EmptyState title={t[lang].emptyTitle} message={t[lang].emptyMsg} />
      ) : filteredTeams.length === 0 ? (
        <EmptyState title={t[lang].noResultsTitle} message={t[lang].noResultsMsg} />
      ) : (
        <motion.div
          className="grid grid-cols-2 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredTeams.map((team) => (
            <motion.div
              key={team.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <Link to={`/teams/${team.id}`}>
                <DarkCard hover className="p-4 flex flex-col items-center justify-center gap-3 aspect-square border-t border-border">
                  <TeamLogo logo={team.logo} name={team.name} size="lg" />
                  <div className="text-center">
                    <h3 className="font-bold text-text-primary">{team.name}</h3>
                    <span className="text-[10px] text-text-secondary">
                      {team.group ? `${t[lang].group} ${team.group}` : t[lang].awaitingDraw}
                    </span>
                  </div>
                </DarkCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
