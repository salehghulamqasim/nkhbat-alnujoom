import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, ChevronDown } from 'lucide-react'
import { emptyResult } from '../../../stores/useMatchesStore'
import { useI18n } from '../../../i18n/useI18n'
import { haptic } from '../../../hooks/useHaptics'

const emptyCard = { player: '', minute: '', teamId: '', number: '' }

function CardEventsSection({ title, items, onChange, teamA, teamB, accentClass, icon, addLabel, noEventsLabel, playerLabel, teamLabel, minutePlaceholder }) {
  const [collapsed, setCollapsed] = useState(false)
  const addItem = () => {
    haptic.light()
    onChange([...items, { ...emptyCard }])
  }
  const removeItem = (index) => {
    haptic.medium()
    onChange(items.filter((_, i) => i !== index))
  }
  const updateItem = (index, field, value) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))

  const getTeamPlayers = (teamId) => {
    const team = [teamA, teamB].find((t) => t?.id === teamId)
    return team?.players || []
  }

  const Icon = icon

  return (
    <div className="bg-bg-surface/50 rounded-xl border border-border overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-3 hover:bg-bg-surface transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={18} className={accentClass} />}
          <span className={`text-sm font-semibold ${accentClass}`}>{title}</span>
          <span className="text-[10px] bg-bg-surface px-1.5 py-0.5 rounded-full text-text-secondary border border-border">
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              addItem()
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation()
                addItem()
              }
            }}
            className="flex items-center gap-1 text-xs text-text-secondary hover:text-accent transition-colors px-2 py-1 rounded-lg hover:bg-accent/5"
          >
            <Plus size={13} />
            <span>{addLabel}</span>
          </span>
          <ChevronDown
            size={16}
            className={`text-text-secondary transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`}
          />
        </div>
      </button>

      {/* Event rows */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {items.length === 0 ? (
              <div className="px-3 pb-3">
                <div className="bg-bg-surface rounded-lg border border-dashed border-border p-4 flex flex-col items-center gap-2 text-text-secondary">
                  <span className="text-xs">{noEventsLabel}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={addItem}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') addItem()
                    }}
                    className="text-xs text-accent hover:text-accent-light cursor-pointer font-medium"
                  >
                    + {addLabel}
                  </span>
                </div>
              </div>
            ) : (
              <div className="px-3 pb-3 space-y-2">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex gap-1.5 items-start bg-bg-surface rounded-lg p-2 border border-border/60"
                  >
                    {/* Team select */}
                    <select
                      value={item.teamId}
                      onChange={(e) => updateItem(index, 'teamId', e.target.value)}
                      className="w-[88px] bg-bg-primary border border-border rounded-lg py-2 px-1.5 text-[11px] focus:outline-none focus:border-accent appearance-none"
                    >
                      <option value="">{teamLabel}</option>
                      {teamA && <option value={teamA.id}>{teamA.name}</option>}
                      {teamB && <option value={teamB.id}>{teamB.name}</option>}
                    </select>

                    {/* Player select */}
                    <select
                      value={item.player}
                      onChange={(e) => updateItem(index, 'player', e.target.value)}
                      disabled={!item.teamId}
                      className="flex-1 min-w-0 bg-bg-primary border border-border rounded-lg py-2 px-1.5 text-[11px] focus:outline-none focus:border-accent disabled:opacity-40 appearance-none"
                    >
                      <option value="">{playerLabel}</option>
                      {getTeamPlayers(item.teamId).map((p) => (
                        <option key={p.id} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    {/* Number (optional) — jersey numeral */}
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={item.number}
                      onChange={(e) => updateItem(index, 'number', e.target.value)}
                      placeholder="رقم"
                      className="w-12 bg-bg-primary border border-border rounded-lg py-2 px-1 text-[11px] text-center focus:outline-none focus:border-accent"
                      dir="ltr"
                      title="رقم القميص (اختياري)"
                    />

                    {/* Minute */}
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={item.minute}
                      onChange={(e) => updateItem(index, 'minute', e.target.value)}
                      placeholder={minutePlaceholder}
                      className="w-12 bg-bg-primary border border-border rounded-lg py-2 px-1 text-[11px] text-center focus:outline-none focus:border-accent"
                      dir="ltr"
                    />

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-8 h-8 rounded-lg bg-bg-primary border border-border/60 flex items-center justify-center text-danger/70 hover:text-danger hover:bg-danger/5 shrink-0 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ResultFormModal({ isOpen, onClose, onSubmit, match, teamA, teamB }) {
  const [form, setForm] = useState(emptyResult)
  const [errors, setErrors] = useState({})
  const { t, isAr } = useI18n()

  const mapEvents = (items = []) =>
    items.map((item) => ({
      ...item,
      minute: String(item.minute ?? ''),
      number: String(item.number ?? ''),
    }))

  useEffect(() => {
    if (isOpen && match) {
      setForm(
        match.result
          ? {
              scoreA: match.result.scoreA,
              scoreB: match.result.scoreB,
              scorers: mapEvents(match.result.scorers),
              yellowCards: mapEvents(match.result.yellowCards),
              redCards: mapEvents(match.result.redCards),
            }
          : { ...emptyResult, scorers: [], yellowCards: [], redCards: [] }
      )
      setErrors({})
    }
  }, [isOpen, match])

  const validate = () => {
    const nextErrors = {}
    if (form.scoreA === '' || form.scoreA < 0) nextErrors.scoreA = t('common.required')
    if (form.scoreB === '' || form.scoreB < 0) nextErrors.scoreB = t('common.required')
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const cleanEvents = (items) =>
    items
      .filter((item) => item.player && item.teamId)
      .map((item) => ({
        player: item.player,
        teamId: item.teamId,
        minute: item.minute ? Number(item.minute) : undefined,
        ...(item.number !== '' && item.number !== undefined ? { number: Number(item.number) } : {}),
      }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    haptic.intense()
    onSubmit({
      scoreA: Number(form.scoreA),
      scoreB: Number(form.scoreB),
      scorers: cleanEvents(form.scorers),
      yellowCards: cleanEvents(form.yellowCards),
      redCards: cleanEvents(form.redCards),
    })
    onClose()
  }

  if (!match) return null

  const minutePh = isAr ? "د'" : "'"

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              haptic.light()
              onClose()
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30, mass: 0.9 }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto glass-card rounded-t-2xl md:rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-bg-card/95 backdrop-blur-md">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {match.status === 'live'
                    ? t('matches.endMatch')
                    : match.status === 'completed'
                      ? t('matches.editResult')
                      : t('matches.recordResult')}
                  {match.status === 'live' && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded-full font-medium">
                      LIVE
                    </span>
                  )}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {teamA?.name} <span className="text-zinc-600">—</span> {teamB?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  haptic.light()
                  onClose()
                }}
                className="w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center hover:bg-bg-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-4 space-y-4 pb-8">
              {/* Score section */}
              <div className="bg-bg-surface/50 rounded-xl border border-border p-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center flex-1">
                    <p className="text-sm font-bold mb-2 truncate">{teamA?.name}</p>
                    <input
                      type="number"
                      min="0"
                      value={form.scoreA}
                      onChange={(e) => setForm((prev) => ({ ...prev, scoreA: e.target.value }))}
                      className="w-20 h-16 text-3xl font-bold text-center bg-bg-primary border border-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                      dir="ltr"
                    />
                    {errors.scoreA && <p className="text-xs text-danger mt-1">{errors.scoreA}</p>}
                  </div>
                  <span className="text-2xl font-bold text-text-secondary">—</span>
                  <div className="text-center flex-1">
                    <p className="text-sm font-bold mb-2 truncate">{teamB?.name}</p>
                    <input
                      type="number"
                      min="0"
                      value={form.scoreB}
                      onChange={(e) => setForm((prev) => ({ ...prev, scoreB: e.target.value }))}
                      className="w-20 h-16 text-3xl font-bold text-center bg-bg-primary border border-border rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                      dir="ltr"
                    />
                    {errors.scoreB && <p className="text-xs text-danger mt-1">{errors.scoreB}</p>}
                  </div>
                </div>
              </div>

              {/* Scorers */}
              <CardEventsSection
                title="⚽"
                icon={() => <span className="text-base">⚽</span>}
                items={form.scorers}
                onChange={(scorers) => setForm((prev) => ({ ...prev, scorers }))}
                teamA={teamA}
                teamB={teamB}
                accentClass="text-accent"
                addLabel={t('matches.add')}
                noEventsLabel={t('matches.noEvents')}
                playerLabel={t('matches.player')}
                teamLabel={t('matches.team')}
                minutePlaceholder={minutePh}
              />

              {/* Yellow cards */}
              <CardEventsSection
                title="🟨"
                icon={() => <span className="text-base">🟨</span>}
                items={form.yellowCards}
                onChange={(yellowCards) => setForm((prev) => ({ ...prev, yellowCards }))}
                teamA={teamA}
                teamB={teamB}
                accentClass="text-warning"
                addLabel={t('matches.add')}
                noEventsLabel={t('matches.noEvents')}
                playerLabel={t('matches.player')}
                teamLabel={t('matches.team')}
                minutePlaceholder={minutePh}
              />

              {/* Red cards */}
              <CardEventsSection
                title="🟥"
                icon={() => <span className="text-base">🟥</span>}
                items={form.redCards}
                onChange={(redCards) => setForm((prev) => ({ ...prev, redCards }))}
                teamA={teamA}
                teamB={teamB}
                accentClass="text-danger"
                addLabel={t('matches.add')}
                noEventsLabel={t('matches.noEvents')}
                playerLabel={t('matches.player')}
                teamLabel={t('matches.team')}
                minutePlaceholder={minutePh}
              />

              {/* Submit button */}
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="w-full bg-accent hover:bg-accent-hover text-black font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-accent/10 active:shadow-sm"
              >
                {match.status === 'live'
                  ? t('matches.endMatchSave')
                  : match.status === 'completed'
                    ? t('common.save')
                    : t('matches.saveResult')}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
