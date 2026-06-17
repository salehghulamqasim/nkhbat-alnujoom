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
} from 'lucide-react'
import DarkCard from './DarkCard'
import { useTeamsStore } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'
import { useAppStore } from '../../stores/useAppStore'

const GROUPS = ['A', 'B', 'C']
const GROUP_LABELS = { A: 'المجموعة أ', B: 'المجموعة ب', C: 'المجموعة ج' }
const GROUP_LABELS_EN = { A: 'Group A', B: 'Group B', C: 'Group C' }

const STATUS_STYLES = {
  scheduled: {
    bg: 'bg-zinc-800/30',
    text: 'text-zinc-400',
    border: 'border-zinc-700/40',
    dot: 'bg-zinc-500',
    label: 'مجدولة',
    labelEn: 'Scheduled',
  },
  live: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
    label: 'مباشر',
    labelEn: 'Live',
    pulse: true,
  },
  completed: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500',
    label: 'منتهية',
    labelEn: 'Finished',
  },
}

export default function ScheduleEagleEyeView({ className = '' }) {
  const lang = useAppStore((s) => s.language)
  const teams = useTeamsStore((s) => s.teams)
  const matches = useMatchesStore((s) => s.matches)
  const containerRef = useRef(null)
  const [capturing, setCapturing] = useState(false)
  const [showDownloadMenu, setShowDownloadMenu] = useState(false)
  const [shareModal, setShareModal] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [filterGroup, setFilterGroup] = useState('all')

  const isAr = lang === 'ar'

  const teamsById = useMemo(() => {
    const map = {}
    teams.forEach((t) => (map[t.id] = t))
    return map
  }, [teams])

  const filteredMatches = useMemo(() => {
    if (filterGroup === 'all') return matches
    return matches.filter((m) => m.group === filterGroup)
  }, [matches, filterGroup])

  const matchesByGroup = useMemo(() => {
    const grouped = {}
    GROUPS.forEach((g) => {
      grouped[g] = filteredMatches.filter((m) => m.group === g)
    })
    return grouped
  }, [filteredMatches])

  const teamsByGroup = useMemo(() => {
    const grouped = {}
    GROUPS.forEach((g) => {
      grouped[g] = teams.filter((t) => t.group === g)
    })
    return grouped
  }, [teams])

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

  const buildPairings = useCallback((groupMatches) => {
    // Show all matches in the group
    return [...groupMatches]
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
      const html2canvas = (await import('html2canvas')).default
      const target = containerRef.current
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0e0e0e',
        width: target.scrollWidth,
        height: target.scrollHeight,
        onclone: (doc) => {
          doc.querySelectorAll('[class*="max-h-"], [class*="overflow"]').forEach((el) => {
            el.style.maxHeight = 'none'
            el.style.overflow = 'visible'
          })
        },
      })

      if (format === 'png') {
        const link = document.createElement('a')
        link.download = `nkhbat-alnujoom-${new Date().toISOString().split('T')[0]}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } else {
        const { jsPDF } = await import('jspdf')
        const imgData = canvas.toDataURL('image/jpeg', 1.0)
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        })
        pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height)
        pdf.save(`nkhbat-alnujoom-${new Date().toISOString().split('T')[0]}.pdf`)
      }
    } catch (err) {
      console.error('Download failed:', err)
      alert(isAr ? 'فشل التحميل' : 'Download failed')
    } finally {
      setCapturing(false)
    }
  }

  const handleShare = async () => {
    if (!containerRef.current) return
    setCapturing(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(containerRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0e0e0e',
      })
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('No blob')
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
        link.href = canvas.toDataURL('image/png')
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
    <div className={`space-y-5 ${className}`}>
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
                className="absolute bottom-full right-0 mb-2 w-40 bg-zinc-900 border border-zinc-700 rounded-xl py-1.5 shadow-xl z-20"
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
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none" dir="ltr">
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

      {/* Groups Grid */}
      <div ref={containerRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {GROUPS.map((group) => {
          const groupTeams = teamsByGroup[group] || []
          const groupMatches = matchesByGroup[group] || []

          return (
            <div key={group} className="flex flex-col">
              {/* Group header */}
              <div className="sticky top-0 z-10 pb-2 bg-bg-primary">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                    {group}
                  </div>
                  <div>
                    <h2 className="text-sm font-bold">
                      {isAr ? GROUP_LABELS[group] : GROUP_LABELS_EN[group]}
                    </h2>
                    <p className="text-[10px] text-zinc-500">
                      {groupTeams.length} {isAr ? 'فرق' : 'teams'} · {groupMatches.length} {isAr ? 'مباراة' : 'matches'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Match cards */}
              <div className="flex flex-col gap-2">
                {groupMatches.length === 0 ? (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    {isAr ? 'لا توجد مباريات في هذه المجموعة' : 'No matches in this group'}
                  </div>
                ) : (
                  groupMatches.map((match) => {
                    const tA = teamsById[match.teamA]
                    const tB = teamsById[match.teamB]
                    const status = getMatchStatus(match)
                    const style = STATUS_STYLES[status]
                    const score = getScore(match)
                    const isLive = status === 'live'

                    return (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <DarkCard
                          className={`p-3 ${style.bg} border ${style.border} transition-all duration-200 cursor-pointer hover:brightness-110`}
                          hover={false}
                          onClick={() => setSelectedMatch(match)}
                        >
                          <div className="flex items-center gap-2">
                            {/* Status dot */}
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot} ${isLive ? 'animate-pulse' : ''}`} />

                            {/* Team A */}
                            <div className="flex-1 min-w-0 flex items-center gap-1.5">
                              {tA?.logo ? (
                                <img src={tA.logo} alt="" className="w-6 h-6 rounded-full object-cover border border-zinc-700/50 flex-shrink-0" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[9px] font-bold text-zinc-500">{tA?.name?.charAt(0) || '?'}</span>
                                </div>
                              )}
                              <span className="truncate text-xs font-medium">{tA?.name || match.teamA}</span>
                            </div>

                            {/* Score / VS */}
                            <div className="flex-shrink-0 text-center min-w-[2.5rem]">
                              {score ? (
                                <span className="text-sm font-bold text-accent">{score}</span>
                              ) : (
                                <span className="text-[10px] text-zinc-500 uppercase font-medium">VS</span>
                              )}
                            </div>

                            {/* Team B */}
                            <div className="flex-1 min-w-0 flex items-center justify-end gap-1.5">
                              <span className="truncate text-xs font-medium">{tB?.name || match.teamB}</span>
                              {tB?.logo ? (
                                <img src={tB.logo} alt="" className="w-6 h-6 rounded-full object-cover border border-zinc-700/50 flex-shrink-0" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center flex-shrink-0">
                                  <span className="text-[9px] font-bold text-zinc-500">{tB?.name?.charAt(0) || '?'}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Match meta */}
                          {(match.date || match.time || match.venue) && (
                            <div className="mt-2 pt-2 border-t border-zinc-800/50 flex flex-wrap gap-3 text-[10px] text-zinc-500">
                              {match.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={9} />
                                  {match.date}
                                </span>
                              )}
                              {match.time && (
                                <span className="flex items-center gap-1">
                                  <Clock size={9} />
                                  {match.time}
                                </span>
                              )}
                              {match.venue && (
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin size={9} />
                                  {match.venue}
                                </span>
                              )}
                            </div>
                          )}
                        </DarkCard>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
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
                const st = STATUS_STYLES[s]
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
                        <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.bg} ${st.text} ${st.border}`}>
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
              className="w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-sm font-bold mb-3">{isAr ? 'مشاركة' : 'Share'}</h3>
              <div className="flex gap-2">
                <input type="text" readOnly value={window.location.href} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-zinc-300" />
                <button onClick={async () => { await navigator.clipboard.writeText(window.location.href); setShareModal(false) }} className="px-4 py-2.5 bg-accent text-black font-semibold rounded-xl hover:bg-accent-hover transition-colors text-xs">
                  {isAr ? 'نسخ' : 'Copy'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}