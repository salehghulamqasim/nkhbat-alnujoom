import { useState, useMemo, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import EmptyState from '../../components/common/EmptyState'
import TeamLogo from '../../components/common/TeamLogo'
import { useTeamsQuery, useMatchesQuery } from '../../hooks/useQueries'
import { enrichMatch, getMatchDisplayStatus, groupMatchesByDate } from '../../utils/matchHelpers'
import { useAppStore } from '../../stores/useAppStore'

const t = {
  ar: {
    title: 'جدول المباريات',
    all: 'الكل',
    upcoming: 'القادمة',
    live: 'مباشر',
    completed: 'منتهية',
    loading: 'جاري تحميل المباريات...',
    error: 'تعذر تحميل المباريات',
    noMatches: 'لا توجد مباريات',
    noMatchesDesc: 'لا توجد مباريات في هذا التصنيف',
    unknownDate: 'غير محدد',
    download: 'تحميل',
    share: 'مشاركة',
    date: 'التاريخ',
    time: 'الوقت',
    home: 'الفريق',
    score: 'النتيجة',
    away: 'الضيف',
    venue: 'الملعب',
    group: 'المجموعة',
    downloadReady: 'تم التحميل',
    shareReady: 'تمت المشاركة',
    downloading: 'جاري التحميل...',
    notAvailable: 'غير متاح',
    finished: 'منتهية',
    scheduled: 'مجدولة',
    groupLabel: 'مجموعة',
    noVenue: 'يُحدد لاحقاً',
  },
  en: {
    title: 'Match Schedule',
    all: 'All',
    upcoming: 'Upcoming',
    live: 'Live',
    completed: 'Finished',
    loading: 'Loading matches...',
    error: 'Failed to load matches',
    noMatches: 'No matches found',
    noMatchesDesc: 'No matches in this category',
    unknownDate: 'Unknown',
    download: 'Download',
    share: 'Share',
    date: 'Date',
    time: 'Time',
    home: 'Home',
    score: 'Score',
    away: 'Away',
    venue: 'Venue',
    group: 'Group',
    downloadReady: 'Downloaded',
    shareReady: 'Shared',
    downloading: 'Downloading...',
    notAvailable: 'N/A',
    finished: 'Finished',
    scheduled: 'Scheduled',
    groupLabel: 'Group',
    noVenue: 'TBD',
  },
}

export default function MatchesPage() {
  const navigate = useNavigate()
  const lang = useAppStore((s) => s.language)
  const [filter, setFilter] = useState('all')
  const [actionMsg, setActionMsg] = useState('')
  const tableRef = useRef(null)
  const { data: teams = [], isLoading: teamsLoading, isError: teamsError, refetch: refetchTeams } = useTeamsQuery()
  const { data: matches = [], isLoading: matchesLoading, isError: matchesError, refetch: refetchMatches } = useMatchesQuery()

  const filters = [
    { id: 'all', label: t[lang].all },
    { id: 'upcoming', label: t[lang].upcoming },
    { id: 'live', label: t[lang].live },
    { id: 'completed', label: t[lang].completed },
  ]

  const enrichedMatches = useMemo(
    () => matches.map((m) => enrichMatch(m, teams)),
    [matches, teams]
  )

  const filteredMatches = useMemo(() => {
    return enrichedMatches.filter((match) => {
      const status = getMatchDisplayStatus(match)
      if (filter === 'all') return true
      if (filter === 'upcoming') return status === 'upcoming'
      return status === filter
    })
  }, [enrichedMatches, filter])

  const grouped = useMemo(() => groupMatchesByDate(filteredMatches), [filteredMatches])

  const flatRows = useMemo(() => {
    const rows = []
    grouped.forEach(([date, dateMatches]) => {
      dateMatches.forEach((m, i) => {
        rows.push({ date, match: m, rowNum: rows.length + 1 })
      })
    })
    return rows
  }, [grouped])

  const statusClass = (status) => {
    if (status === 'live') return 'text-live bg-live/10'
    if (status === 'completed') return 'text-success bg-success/10'
    return 'text-text-secondary bg-bg-surface'
  }

  const getStatusLabel = (status) => {
    if (status === 'live') return t[lang].live
    if (status === 'completed') return t[lang].finished
    return t[lang].scheduled
  }

  const handleDownload = useCallback(async () => {
    if (!tableRef.current) return
    setActionMsg(t[lang].downloading)
    try {
      const table = tableRef.current
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const scale = 2

      // Compute required dimensions
      const rect = table.getBoundingClientRect()
      canvas.width = rect.width * scale
      canvas.height = rect.height * scale

      // Dark background
      ctx.scale(scale, scale)
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Draw each visible child manually using the DOM's computed styles
      const drawNode = (node, offsetX, offsetY) => {
        const style = window.getComputedStyle(node)
        const display = style.display
        if (display === 'none' || node.offsetParent === null) return

        const nodeRect = node.getBoundingClientRect()
        const x = nodeRect.left - rect.left + offsetX
        const y = nodeRect.top - rect.top + offsetY
        const w = nodeRect.width
        const h = nodeRect.height

        // Background color
        const bg = style.backgroundColor
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          ctx.fillStyle = bg
          ctx.fillRect(x, y, w, h)
        }

        // Text content
        if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE && node.textContent.trim()) {
          ctx.fillStyle = style.color
          ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`
          ctx.textAlign = style.textAlign === 'right' ? 'right' : style.textAlign === 'left' ? 'left' : 'center'
          ctx.textBaseline = 'middle'
          const text = node.textContent.trim()
          ctx.fillText(text, x + w / 2, y + h / 2)
        }

        // Border
        const borderColor = style.borderColor
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)' && style.borderWidth !== '0px') {
          ctx.strokeStyle = borderColor
          ctx.lineWidth = 1
          ctx.strokeRect(x, y, w, h)
        }

        // Recurse children
        for (const child of node.children) {
          drawNode(child, offsetX, offsetY)
        }
      }

      drawNode(table, 0, 0)

      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `match-schedule-${new Date().toISOString().split('T')[0]}.png`
      link.href = dataUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setActionMsg(t[lang].downloadReady)
    } catch (err) {
      console.error('Download failed:', err)
      // Last-resort fallback: window print
      try {
        window.print()
        setActionMsg(t[lang].downloadReady)
      } catch {
        setActionMsg(t[lang].error)
      }
    }
    setTimeout(() => setActionMsg(''), 3000)
  }, [t, lang])

  const handleShare = useCallback(async () => {
    const text = flatRows
      .map((r) => `${r.match.home} vs ${r.match.away} — ${r.match.result ? `${r.match.result.scoreA}-${r.match.result.scoreB}` : r.match.time} — ${r.date}`)
      .join('\n')
    try {
      if (navigator.share) {
        await navigator.share({ title: t[lang].title, text })
      } else {
        await navigator.clipboard.writeText(text)
      }
      setActionMsg(t[lang].shareReady)
    } catch {
      // user cancelled share
    }
    setTimeout(() => setActionMsg(''), 3000)
  }, [flatRows, t, lang])

  const isLoading = teamsLoading || matchesLoading
  const isError = teamsError || matchesError

  if (isLoading) return <LoadingState message={t[lang].loading} />
  if (isError) {
    return (
      <div className="px-4 py-6">
        <ErrorState
          message={t[lang].error}
          onRetry={() => { refetchTeams(); refetchMatches() }}
        />
      </div>
    )
  }

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-center">{t[lang].title}</h1>
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-bg-surface border border-border text-text-secondary hover:text-accent hover:border-accent/30 text-sm font-bold transition-all flex-1 max-w-[140px] justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            {t[lang].share}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-black text-sm font-bold transition-all flex-1 max-w-[140px] justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {t[lang].download}
          </button>
        </div>
      </div>

      {/* Action feedback */}
      {actionMsg && (
        <div className="text-center text-sm text-accent font-bold animate-pulse">{actionMsg}</div>
      )}

      {/* Filter tabs */}
      <div className="flex bg-bg-surface rounded-xl p-1 relative z-0">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`flex-1 py-2 text-sm font-medium z-10 transition-colors ${filter === f.id ? 'text-black' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {f.label}
          </button>
        ))}
        <div
          className="absolute top-1 bottom-1 bg-accent rounded-lg transition-all duration-300 -z-10"
          style={{ width: `calc(25% - 0.5rem)`, right: `calc(${filters.findIndex((f) => f.id === filter) * 25}% + 0.25rem)` }}
        />
      </div>

      {/* Table */}
      {flatRows.length === 0 ? (
        <EmptyState title={t[lang].noMatches} message={t[lang].noMatchesDesc} />
      ) : (
        <div ref={tableRef} className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm border-collapse" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <thead>
              <tr className="bg-bg-surface">
                <th className="p-3 text-[11px] font-bold text-text-secondary text-center uppercase tracking-wider">#</th>
                <th className="p-3 text-[11px] font-bold text-text-secondary text-center uppercase tracking-wider">{t[lang].date}</th>
                <th className="p-3 text-[11px] font-bold text-text-secondary text-center uppercase tracking-wider">{t[lang].time}</th>
                <th className="p-3 text-[11px] font-bold text-text-secondary text-center uppercase tracking-wider">{t[lang].group}</th>
                <th className="p-3 text-[11px] font-bold text-text-secondary text-center uppercase tracking-wider">{t[lang].home}</th>
                <th className="p-3 text-[11px] font-bold text-accent text-center uppercase tracking-wider">{t[lang].score}</th>
                <th className="p-3 text-[11px] font-bold text-text-secondary text-center uppercase tracking-wider">{t[lang].away}</th>
                <th className="p-3 text-[11px] font-bold text-text-secondary text-center uppercase tracking-wider">{t[lang].venue}</th>
              </tr>
            </thead>
            <tbody>
              {flatRows.map((r, idx) => {
                const match = r.match
                const status = getMatchDisplayStatus(match)
                const isLive = status === 'live'
                const isEvenRow = idx % 2 === 0
                return (
                  <motion.tr
                    key={match.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => navigate(`/matches/${match.id}`)}
                    className={`border-b border-border/30 transition-colors cursor-pointer ${
                      isLive ? 'bg-live/5' : isEvenRow ? 'bg-bg-primary' : 'bg-bg-surface/30'
                    } hover:bg-bg-surface/80`}
                  >
                    <td className="p-2.5 text-center text-text-secondary text-xs font-mono">{r.rowNum}</td>
                    <td className="p-2.5 text-center whitespace-nowrap text-xs">{r.date === 'unknown' ? t[lang].unknownDate : r.date}</td>
                    <td className="p-2.5 text-center whitespace-nowrap text-xs">{match.time || '--:--'}</td>
                    <td className="p-2.5 text-center">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-surface border border-border font-medium">
                        {t[lang].groupLabel} {match.group}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-semibold text-sm">
                      <span className={isLive ? 'text-live' : ''}>{match.home}</span>
                    </td>
                    <td className="p-2.5 text-center">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className={`text-base font-bold tracking-wider ${isLive ? 'text-live' : 'text-accent'}`} dir="ltr">
                          {match.result ? `${match.result.scoreA} – ${match.result.scoreB}` : match.time || '--:--'}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${statusClass(status)}`}>
                          {status === 'live' ? <span className="inline-block w-1 h-1 rounded-full bg-live animate-pulse ml-0.5" /> : null}
                          {getStatusLabel(status)}
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 text-center font-semibold text-sm">
                      <span className={isLive ? 'text-live' : ''}>{match.away}</span>
                    </td>
                    <td className="p-2.5 text-center text-text-secondary text-[11px] max-w-[80px] truncate" title={match.venue || t[lang].noVenue}>
                      {match.venue || t[lang].noVenue}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
