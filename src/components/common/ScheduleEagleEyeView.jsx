import { useRef, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Download,
  Share2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Zap,
  Compass,
  ChevronDown,
  FileText,
  X,
  ExternalLink,
} from 'lucide-react'
import DarkCard from './DarkCard'
import { useTeamsStore } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'
import { useAppStore } from '../../stores/useAppStore'
import { haptic } from '../../hooks/useHaptics'

const GROUPS = ['A', 'B', 'C']
const GROUP_LABELS = { A: 'المجموعة أ', B: 'المجموعة ب', C: 'المجموعة ج' }
const GROUP_LABELS_EN = { A: 'Group A', B: 'Group B', C: 'Group C' }

const STATUS_BADGE = {
  scheduled: { bg: 'bg-zinc-800/60', text: 'text-zinc-400', label: 'لم تُلعب', labelEn: 'Not played' },
  live: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'مباشر', labelEn: 'Live' },
  completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'منتهية', labelEn: 'Finished' },
  postponed: { bg: 'bg-orange-500/15', text: 'text-orange-400', label: 'مؤجلة', labelEn: 'Postponed' },
}

export default function ScheduleEagleEyeView({
  className = '',
  teamsOverride,
  matchesOverride,
}) {
  const lang = useAppStore((s) => s.language)
  const storeTeams = useTeamsStore((s) => s.teams)
  const storeMatches = useMatchesStore((s) => s.matches)
  const containerRef = useRef(null)
  const [capturing, setCapturing] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [shareModal, setShareModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [filterGroup, setFilterGroup] = useState('all')

  const isAr = lang === 'ar'

  // Use override props if provided, otherwise fall back to Zustand stores
  const teams = teamsOverride || storeTeams
  const matches = matchesOverride || storeMatches

  const teamsById = useMemo(() => {
    const map = {}
    teams.forEach((t) => (map[t.id] = t))
    return map
  }, [teams])

  const filteredMatches = useMemo(() => {
    if (filterGroup === 'all') return matches
    return matches.filter((m) => m.group === filterGroup)
  }, [matches, filterGroup])

  // Sort matches by date then time
  const sortedMatches = useMemo(() => {
    return [...filteredMatches].sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '')
      if (dateCmp !== 0) return dateCmp
      return (a.time || '').localeCompare(b.time || '')
    })
  }, [filteredMatches])

  // Sort ALL matches globally by date then time to get stable numbering
  const globalSortedMatches = useMemo(() => {
    return [...matches].sort((a, b) => {
      const dateCmp = (a.date || '').localeCompare(b.date || '')
      if (dateCmp !== 0) return dateCmp
      return (a.time || '').localeCompare(b.time || '')
    })
  }, [matches])

  const getMatchStatus = useCallback((match) => {
    if (!match) return 'scheduled'
    if (match.status === 'postponed') return 'postponed'
    if (match.status === 'live') return 'live'
    if (match.status === 'completed' || (match.result && typeof match.result === 'object')) return 'completed'
    return 'scheduled'
  }, [])

  const getScore = useCallback((match) => {
    if (!match?.result) return null
    const { scoreA, scoreB } = match.result
    // In RTL (Arabic) the table columns are visually reversed, so flip the score to match.
    return isAr
      ? `${scoreB || 0} - ${scoreA || 0}`
      : `${scoreA || 0} - ${scoreB || 0}`
  }, [isAr])

  const filterOptions = [
    { key: 'all', labelAr: 'الكل', labelEn: 'All' },
    { key: 'A', labelAr: 'المجموعة أ', labelEn: 'Group A' },
    { key: 'B', labelAr: 'المجموعة ب', labelEn: 'Group B' },
    { key: 'C', labelAr: 'المجموعة ج', labelEn: 'Group C' },
  ]

  const captureAndDownload = async (format = 'png') => {
    if (!containerRef.current) return
    setCapturing(true)
    try {
      const { toPng } = await import('html-to-image')
      const target = containerRef.current

      // Save original inline styles and apply flat colors
      // This overrides Tailwind v4's oklab color-mix which libraries can't parse
      const allElements = target.querySelectorAll('*')
      const savedStyles = []
      allElements.forEach((el) => {
        const cs = getComputedStyle(el)
        savedStyles.push({
          el,
          bg: el.style.backgroundColor,
          color: el.style.color,
          borderColor: el.style.borderColor,
        })
        if (cs.backgroundColor && cs.backgroundColor.includes('oklab')) {
          el.style.backgroundColor = 'transparent'
        }
        if (cs.color && cs.color.includes('oklab')) {
          el.style.color = '#a0a0a0'
        }
        if (cs.borderColor && cs.borderColor.includes('oklab')) {
          el.style.borderColor = '#2a2a2a'
        }
      })

      const dataUrl = await toPng(target, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#0e0e0e',
        cacheBust: true,
      })

      // Restore styles
      savedStyles.forEach(({ el, bg, color, borderColor }) => {
        el.style.backgroundColor = bg
        el.style.color = color
        el.style.borderColor = borderColor
      })

      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = dataUrl
      })

      // Calculate canvas size dynamically with margin to remove empty side spaces
      const margin = 24
      const canvasWidth = img.width + (margin * 2)
      const canvasHeight = img.height + (margin * 2)

      const outCanvas = document.createElement('canvas')
      outCanvas.width = canvasWidth
      outCanvas.height = canvasHeight
      const ctx = outCanvas.getContext('2d')

      // Draw background and highlight card shape
      ctx.fillStyle = '#0e0e0e'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(margin - 4, margin - 4, img.width + 8, img.height + 8)
      ctx.drawImage(img, margin, margin, img.width, img.height)

      if (format === 'png') {
        const link = document.createElement('a')
        link.download = `nkhbat-alnujoom-${new Date().toISOString().split('T')[0]}.png`
        link.href = outCanvas.toDataURL('image/png')
        link.click()
      } else {
        const { jsPDF } = await import('jspdf')
        const imgData = outCanvas.toDataURL('image/jpeg', 1.0)
        const pdf = new jsPDF({
          orientation: canvasWidth > canvasHeight ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvasWidth, canvasHeight],
        })
        pdf.addImage(imgData, 'JPEG', 0, 0, canvasWidth, canvasHeight)
        pdf.save(`nkhbat-alnujoom-${new Date().toISOString().split('T')[0]}.pdf`)
      }
    } catch (err) {
      console.error('All capture methods failed:', err)
      alert(isAr ? 'فشل التحميل - استخدم لقطة الشاشة' : 'Download failed - use screenshot')
    } finally {
      setCapturing(false)
    }
  }

  const handleShare = async () => {
    if (!containerRef.current) return
    setCapturing(true)
    try {
      const { toPng } = await import('html-to-image')
      const target = containerRef.current

      const allElements = target.querySelectorAll('*')
      const savedStyles = []
      allElements.forEach((el) => {
        const cs = getComputedStyle(el)
        savedStyles.push({
          el,
          bg: el.style.backgroundColor,
          color: el.style.color,
          borderColor: el.style.borderColor,
        })
        if (cs.backgroundColor && cs.backgroundColor.includes('oklab')) {
          el.style.backgroundColor = 'transparent'
        }
        if (cs.color && cs.color.includes('oklab')) {
          el.style.color = '#a0a0a0'
        }
        if (cs.borderColor && cs.borderColor.includes('oklab')) {
          el.style.borderColor = '#2a2a2a'
        }
      })

      const dataUrl = await toPng(containerRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#0e0e0e',
        cacheBust: true,
      })

      savedStyles.forEach(({ el, bg, color, borderColor }) => {
        el.style.backgroundColor = bg
        el.style.color = color
        el.style.borderColor = borderColor
      })

      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], `schedule-${Date.now()}.png`, { type: 'image/png' })
      const shareData = {
        title: isAr ? 'جدول نخبة النجوم' : 'Nkhbat Alnujoom Schedule',
        text: isAr ? 'جدول مباريات بطولة نخبة النجوم' : 'Check out the tournament schedule!',
        files: [file],
      }
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        const link = document.createElement('a')
        link.download = `schedule-${Date.now()}.png`
        link.href = dataUrl
        link.click()
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(window.location.href)
          alert(isAr ? 'تم نسخ الرابط!' : 'Link copied!')
        } catch {
          setShareModal(true)
        }
      }
    } finally {
      setCapturing(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <Calendar size={20} className="text-accent" />
          {isAr ? 'جدول' : 'Schedule'}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptic.light()
              handleShare()
            }}
            disabled={capturing}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-all flex items-center gap-1.5"
          >
            <Share2 size={14} />
            {isAr ? 'مشاركة' : 'Share'}
          </button>
          <div className="relative">
            <button
              onClick={() => {
                haptic.medium()
                setShowDownloadMenu(!showDownloadMenu)
              }}
              disabled={capturing}
              className="px-3 py-2 bg-accent text-black font-semibold rounded-xl hover:bg-accent-hover transition-all flex items-center gap-1.5 text-xs"
            >
              <Download size={14} />
              {isAr ? 'تحميل' : 'Download'}
              <ChevronDown size={12} />
            </button>
            {showDownloadMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDownloadMenu(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full end-0 mt-2 w-40 bg-zinc-900 border border-zinc-700 rounded-xl py-1.5 shadow-xl z-20"
                >
                  <button
                    onClick={() => { captureAndDownload('png'); setShowDownloadMenu(false) }}
                    className="w-full px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 cursor-pointer text-start"
                  >
                    <Download size={12} /> PNG
                  </button>
                  <button
                    onClick={() => { captureAndDownload('pdf'); setShowDownloadMenu(false) }}
                    className="w-full px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2 cursor-pointer text-start"
                  >
                    <FileText size={12} /> PDF
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" dir={isAr ? 'rtl' : 'ltr'}>
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => {
              haptic.light()
              setFilterGroup(opt.key)
            }}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              filterGroup === opt.key
                ? 'bg-accent/15 border-accent/30 text-accent'
                : 'bg-zinc-800/30 border-zinc-700/30 text-zinc-400 hover:bg-zinc-700/50'
            }`}
          >
            {isAr ? opt.labelAr : opt.labelEn}
          </button>
        ))}
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800/60">
        <div ref={containerRef} className="min-w-[800px] w-full bg-[#0e0e0e] p-4">
          <table className="w-full text-sm" dir={isAr ? 'rtl' : 'ltr'}>
          <thead>
            <tr className="bg-zinc-900/80 border-b border-zinc-800">
              <th className="px-3 py-3 text-xs font-medium text-zinc-500 text-center w-10">#</th>
              <th className="px-3 py-3 text-xs font-medium text-zinc-500 text-center whitespace-nowrap">
                {isAr ? 'التاريخ' : 'Date'}
              </th>
              <th className="px-3 py-3 text-xs font-medium text-zinc-500 text-center whitespace-nowrap">
                {isAr ? 'الوقت' : 'Time'}
              </th>
              <th className="px-3 py-3 text-xs font-medium text-zinc-500 text-center whitespace-nowrap">
                {isAr ? 'المجموعة' : 'Group'}
              </th>
              <th className="px-3 py-3 text-xs font-medium text-zinc-500 text-center">
                {isAr ? 'الفريق' : 'Home'}
              </th>
              <th className="px-3 py-3 text-xs font-medium text-zinc-500 text-center w-20">
                {isAr ? 'النتيجة' : 'Score'}
              </th>
              <th className="px-3 py-3 text-xs font-medium text-zinc-500 text-center">
                {isAr ? 'الضيف' : 'Away'}
              </th>
              <th className="px-3 py-3 text-xs font-medium text-zinc-500 text-center whitespace-nowrap">
                {isAr ? 'الملعب' : 'Venue'}
              </th>
              <th className="px-3 py-3 text-xs font-medium text-zinc-500 text-center w-14">
                {isAr ? 'الحالة' : 'Status'}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedMatches.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-zinc-500 text-sm">
                  {isAr ? 'لا توجد مباريات' : 'No matches found'}
                </td>
              </tr>
            ) : (
              sortedMatches.map((match, idx) => {
                const tA = teamsById[match.teamA]
                const tB = teamsById[match.teamB]
                const status = getMatchStatus(match)
                const score = getScore(match)
                const badge = STATUS_BADGE[status] || STATUS_BADGE.scheduled
                const isLive = status === 'live'

                return (
                  <motion.tr
                    key={match.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => {
                      haptic.light()
                      setSelectedMatch(match)
                    }}
                    className="border-b border-zinc-800/40 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-2.5 text-center text-xs text-zinc-500">
                      {globalSortedMatches.findIndex((m) => m.id === match.id) + 1}
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-zinc-300 whitespace-nowrap">
                      {match.date || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-zinc-300 whitespace-nowrap">
                      {match.time || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-accent/10 text-accent text-[10px] font-bold border border-accent/20">
                        {match.group}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="grid grid-cols-[1fr_auto] items-center gap-2 w-[130px] sm:w-[140px] ml-auto" dir={isAr ? 'rtl' : 'ltr'}>
                        <span className="text-xs font-medium truncate text-zinc-200 text-end">
                          {tA?.name || match.teamA || '—'}
                        </span>
                        {tA?.logo ? (
                          <img src={tA.logo} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-700/50 shrink-0" />
                        ) : <div className="w-5 h-5 shrink-0" />}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      {score ? (
                        <span dir="ltr" className={`inline-block text-sm font-bold tabular-nums ${isLive ? 'text-amber-400' : 'text-zinc-100'}`}>
                          {score}
                        </span>
                      ) : (
                        <span className="text-[10px] text-zinc-500 font-semibold tracking-wider">VS</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="grid grid-cols-[auto_1fr] items-center gap-2 w-[130px] sm:w-[140px] mr-auto" dir={isAr ? 'rtl' : 'ltr'}>
                        {tB?.logo ? (
                          <img src={tB.logo} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-700/50 shrink-0" />
                        ) : <div className="w-5 h-5 shrink-0" />}
                        <span className="text-xs font-medium truncate text-zinc-200 text-start">
                          {tB?.name || match.teamB || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-center text-xs text-zinc-400 truncate max-w-[100px]">
                      {match.venue || '—'}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${badge.bg} ${badge.text}`}>
                        {isLive && <Zap size={8} className="animate-pulse" />}
                        {isAr ? badge.label : badge.labelEn}
                      </span>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Match count */}
      <div className="text-[11px] text-zinc-500 text-center">
        {sortedMatches.length} {isAr ? 'مباراة' : 'matches'}
        {filterGroup !== 'all' ? ` — ${isAr ? GROUP_LABELS[filterGroup] : GROUP_LABELS_EN[filterGroup]}` : ''}
      </div>

      {/* Match Detail Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedMatch(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedMatch(null)} className="float-right p-1 hover:bg-zinc-800 rounded-full transition-colors">
                <X size={16} className="text-zinc-400" />
              </button>
              {(() => {
                const m = selectedMatch
                const tA = teamsById[m.teamA]
                const tB = teamsById[m.teamB]
                const s = getMatchStatus(m)
                const sc = getScore(m)
                const st = STATUS_BADGE[s]
                const isL = s === 'live'
                return (
                  <>
                    <div className="flex items-center gap-3 py-4">
                      <div className="flex-1 text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                          {tA?.logo ? <img src={tA.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-zinc-500">{tA?.name?.charAt(0) || '?'}</span>}
                        </div>
                        <p className="text-sm font-bold mt-2">{tA?.name || m.teamA}</p>
                      </div>
                      <div className="flex-shrink-0 text-center">
                        {sc ? (
                          <span dir="ltr" className="inline-block text-2xl font-extrabold text-accent">{sc}</span>
                        ) : (
                          <span className="text-xs text-zinc-500 uppercase font-medium">VS</span>
                        )}
                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg} ${st.text}`}>
                          {isL && <Zap size={10} className="animate-pulse" />}
                          {isAr ? st.label : st.labelEn}
                        </div>
                      </div>
                      <div className="flex-1 text-center">
                        <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center overflow-hidden">
                          {tB?.logo ? <img src={tB.logo} alt="" className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-zinc-500">{tB?.name?.charAt(0) || '?'}</span>}
                        </div>
                        <p className="text-sm font-bold mt-2">{tB?.name || m.teamB}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs text-zinc-400 border-t border-zinc-800 pt-4 mt-2">
                      {m.date && <div className="flex items-center gap-2"><Calendar size={12} className="text-zinc-500" /><span>{m.date}{m.time ? ` | ${m.time}` : ''}</span></div>}
                      {m.venue && <div className="flex items-center gap-2"><MapPin size={12} className="text-zinc-500" /><span>{m.venue}</span></div>}
                      {m.group && <div className="flex items-center gap-2"><span className="w-5 h-5 rounded bg-accent/10 text-accent text-[10px] font-bold flex items-center justify-center">{m.group}</span><span>{isAr ? GROUP_LABELS[m.group] : GROUP_LABELS_EN[m.group]}</span></div>}
                    </div>
                  </>
                )
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share link fallback modal */}
      <AnimatePresence>
        {shareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShareModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5 shadow-2xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={24} className="mx-auto text-accent mb-3" />
              <p className="text-sm font-medium mb-1">{isAr ? 'رابط المشاركة' : 'Share Link'}</p>
              <p className="text-xs text-zinc-500 mb-4 break-all">{window.location.href}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href).then(() => setShareModal(false)) }}
                className="px-4 py-2 bg-accent text-black rounded-xl text-sm font-semibold"
              >
                {isAr ? 'نسخ الرابط' : 'Copy Link'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
