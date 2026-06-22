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

const GROUPS = ['A', 'B', 'C']
const GROUP_LABELS = { A: 'المجموعة أ', B: 'المجموعة ب', C: 'المجموعة ج' }
const GROUP_LABELS_EN = { A: 'Group A', B: 'Group B', C: 'Group C' }

const STATUS_BADGE = {
  scheduled: { bg: 'bg-zinc-800/60', text: 'text-zinc-400', label: 'مجدولة', labelEn: 'Scheduled' },
  live: { bg: 'bg-amber-500/15', text: 'text-amber-400', label: 'مباشر', labelEn: 'Live' },
  completed: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', label: 'منتهية', labelEn: 'Finished' },
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
    if (match.status === 'live') return 'live'
    if (match.status === 'completed' || (match.result && typeof match.result === 'object')) return 'completed'
    return 'scheduled'
  }, [])

  const getScore = useCallback((match) => {
    if (!match?.result) return null
    return `${match.result.scoreA || 0} - ${match.result.scoreB || 0}`
  }, [])

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

      const OUTPUT_W = 1920
      const OUTPUT_H = 1080
      const outCanvas = document.createElement('canvas')
      outCanvas.width = OUTPUT_W
      outCanvas.height = OUTPUT_H
      const ctx = outCanvas.getContext('2d')

      ctx.fillStyle = '#0e0e0e'
      ctx.fillRect(0, 0, OUTPUT_W, OUTPUT_H)

      const img = new Image()
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
        img.src = dataUrl
      })

      const scaleX = OUTPUT_W / img.width
      const scaleY = OUTPUT_H / img.height
      const scale = Math.min(scaleX, scaleY) * 0.9
      const dw = img.width * scale
      const dh = img.height * scale
      const dx = (OUTPUT_W - dw) / 2
      const dy = (OUTPUT_H - dh) / 2

      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(dx - 4, dy - 4, dw + 8, dh + 8)
      ctx.drawImage(img, dx, dy, dw, dh)

      if (format === 'png') {
        const link = document.createElement('a')
        link.download = `nkhbat-alnujoom-${new Date().toISOString().split('T')[0]}.png`
        link.href = outCanvas.toDataURL('image/png')
        link.click()
      } else {
        const { jsPDF } = await import('jspdf')
        const imgData = outCanvas.toDataURL('image/jpeg', 1.0)
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [OUTPUT_W, OUTPUT_H],
        })
        pdf.addImage(imgData, 'JPEG', 0, 0, OUTPUT_W, OUTPUT_H)
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
          <Compass size={20} className="text-accent" />
          {isAr ? 'نظرة النسر' : 'Eagle-Eye View'}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            disabled={capturing}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-all flex items-center gap-1.5"
          >
            <Share2 size={14} />
            {isAr ? 'مشاركة' : 'Share'}
          </button>
          <div className="relative">
            <button
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              disabled={capturing}
              className="px-3 py-2 bg-accent text-black font-semibold rounded-xl hover:bg-accent-hover transition-all flex items-center gap-1.5 text-xs"
            >
              <Download size={14} />
              {isAr ? 'تحميل' : 'Download'}
              <ChevronDown size={12} />
            </button>
            {showDownloadMenu && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-full ltr:right-0 rtl:left-0 ltr:left-auto rtl:right-auto mb-2 w-40 bg-zinc-900 border border-zinc-700 rounded-xl py-1.5 shadow-xl z-20"
              >
                <button
                  onClick={() => { captureAndDownload('png'); setShowDownloadMenu(false) }}
                  className="w-full px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Download size={12} /> PNG
                </button>
                <button
                  onClick={() => { captureAndDownload('pdf'); setShowDownloadMenu(false) }}
                  className="w-full px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 flex items-center gap-2"
                >
                  <FileText size={12} /> PDF
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" dir={isAr ? 'rtl' : 'ltr'}>
        {filterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setFilterGroup(opt.key)}
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
                const badge = STATUS_BADGE[status]
                const isLive = status === 'live'

                return (
                  <motion.tr
                    key={match.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    onClick={() => setSelectedMatch(match)}
                    className="border-b border-zinc-800/40 hover:bg-zinc-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-3 py-3 text-center text-xs text-zinc-500">
                        {globalSortedMatches.findIndex((m) => m.id === match.id) + 1}
                      </td>
                    <td className="px-3 py-3 text-center text-xs text-zinc-300 whitespace-nowrap">
                      {match.date || '—'}
                    </td>
                    <td className="px-3 py-3 text-center text-xs text-zinc-300 whitespace-nowrap">
                      {match.time || '—'}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-accent/10 text-accent text-[10px] font-bold border border-accent/20">
                        {match.group}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2" dir={isAr ? 'rtl' : 'ltr'}>
                        {!isAr && tA?.logo ? (
                          <img src={tA.logo} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-700/50 flex-shrink-0" />
                        ) : null}
                        <span className="text-xs font-medium truncate max-w-[100px]">
                          {tA?.name || match.teamA || '—'}
                        </span>
                        {isAr && tA?.logo ? (
                          <img src={tA.logo} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-700/50 flex-shrink-0" />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {score ? (
                        <span className={`text-sm font-bold ${isLive ? 'text-amber-400' : 'text-accent'}`}>
                          {score}
                        </span>
                      ) : null}
                    </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 justify-end" dir={isAr ? 'rtl' : 'ltr'}>
                          {!isAr && tA?.logo ? (
                            <img src={tA.logo} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-700/50 flex-shrink-0" />
                          ) : null}
                          <span className="text-xs font-medium truncate max-w-[130px]">
                            {tA?.name || match.teamA || '—'}
                          </span>
                          {isAr && tA?.logo ? (
                            <img src={tA.logo} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-700/50 flex-shrink-0" />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {score ? (
                          <span className={`text-sm font-bold ${isLive ? 'text-amber-400' : 'text-accent'}`}>
                            {score}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-600 uppercase font-semibold tracking-wider">VS</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2" dir={isAr ? 'rtl' : 'ltr'}>
                          {isAr && tB?.logo ? (
                            <img src={tB.logo} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-700/50 flex-shrink-0" />
                          ) : null}
                          <span className="text-xs font-medium truncate max-w-[130px]">
                            {tB?.name || match.teamB || '—'}
                          </span>
                          {!isAr && tB?.logo ? (
                            <img src={tB.logo} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-700/50 flex-shrink-0" />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center text-xs text-zinc-400 truncate max-w-[130px]">
                        {match.venue || '—'}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                          {isLive && <Zap size={8} className="animate-pulse" />}
                          {isAr ? badge.label : badge.labelEn}
                        </span>
                        {!isAr && tB?.logo ? (
                          <img src={tB.logo} alt="" className="w-5 h-5 rounded-full object-cover border border-zinc-700/50 flex-shrink-0" />
                        ) : null}
                        </td>
                        <td className="px-3 py-3 text-center text-xs text-zinc-400 truncate max-w-[100px]">
                        {match.venue || '—'}
                        </td>
                    <td className="px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
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
                          <span className="text-2xl font-extrabold text-accent">{sc}</span>
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
