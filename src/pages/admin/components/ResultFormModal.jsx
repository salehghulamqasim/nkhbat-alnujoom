import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2 } from 'lucide-react'
import { emptyResult } from '../../../stores/useMatchesStore'
import { useI18n } from '../../../i18n/useI18n'

const emptyCard = { player: '', minute: '', teamId: '' }

function CardEventsSection({ title, items, onChange, teamA, teamB, accentClass, addLabel, noEventsLabel, playerLabel, teamLabel, minutePlaceholder }) {
  const addItem = () => onChange([...items, { ...emptyCard }])
  const removeItem = (index) => onChange(items.filter((_, i) => i !== index))
  const updateItem = (index, field, value) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)))

  const getTeamPlayers = (teamId) => {
    const team = [teamA, teamB].find((t) => t?.id === teamId)
    return team?.players || []
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className={`text-sm font-medium ${accentClass}`}>{title}</label>
        <button
          type="button"
          onClick={addItem}
          className="flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors"
        >
          <Plus size={14} />
          <span>{addLabel}</span>
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-text-secondary bg-bg-surface rounded-xl p-3 border border-border">
          {noEventsLabel}
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 items-start">
              <select
                value={item.teamId}
                onChange={(e) => updateItem(index, 'teamId', e.target.value)}
                className="w-28 bg-bg-surface border border-border rounded-xl py-2 px-2 text-xs focus:outline-none focus:border-accent"
              >
                <option value="">{teamLabel}</option>
                {teamA && <option value={teamA.id}>{teamA.name}</option>}
                {teamB && <option value={teamB.id}>{teamB.name}</option>}
              </select>
              <select
                value={item.player}
                onChange={(e) => updateItem(index, 'player', e.target.value)}
                disabled={!item.teamId}
                className="flex-1 bg-bg-surface border border-border rounded-xl py-2 px-2 text-xs focus:outline-none focus:border-accent disabled:opacity-40"
              >
                <option value="">{playerLabel}</option>
                {getTeamPlayers(item.teamId).map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                max="120"
                value={item.minute}
                onChange={(e) => updateItem(index, 'minute', e.target.value)}
                placeholder={minutePlaceholder}
                className="w-12 bg-bg-surface border border-border rounded-xl py-2 px-1 text-xs text-center focus:outline-none focus:border-accent"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="w-9 h-9 rounded-xl bg-bg-surface border border-border flex items-center justify-center text-danger hover:bg-danger/10 shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
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
      .filter((item) => item.player && item.minute && item.teamId)
      .map((item) => ({
        player: item.player,
        minute: Number(item.minute),
        teamId: item.teamId,
      }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

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
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto glass-card rounded-t-2xl md:rounded-2xl shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-bg-card/95 backdrop-blur-md">
              <div>
                <h2 className="text-lg font-bold">
                  {match.status === 'live'
                    ? t('matches.endMatch')
                    : match.status === 'completed'
                      ? t('matches.editResult')
                      : t('matches.recordResult')}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {teamA?.name} vs {teamB?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center hover:bg-bg-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-8">
              <div className="flex items-center justify-center gap-4 md:gap-6 py-4">
                <div className="text-center flex-1">
                  <p className="text-sm font-bold mb-2 truncate">{teamA?.name}</p>
                  <input
                    type="number"
                    min="0"
                    value={form.scoreA}
                    onChange={(e) => setForm((prev) => ({ ...prev, scoreA: e.target.value }))}
                    className="w-16 md:w-20 h-14 md:h-16 text-2xl md:text-3xl font-bold text-center bg-bg-surface border border-border rounded-xl focus:outline-none focus:border-accent"
                    dir="ltr"
                  />
                  {errors.scoreA && <p className="text-xs text-danger mt-1">{errors.scoreA}</p>}
                </div>
                <span className="text-2xl font-bold text-text-secondary">-</span>
                <div className="text-center flex-1">
                  <p className="text-sm font-bold mb-2 truncate">{teamB?.name}</p>
                  <input
                    type="number"
                    min="0"
                    value={form.scoreB}
                    onChange={(e) => setForm((prev) => ({ ...prev, scoreB: e.target.value }))}
                    className="w-16 md:w-20 h-14 md:h-16 text-2xl md:text-3xl font-bold text-center bg-bg-surface border border-border rounded-xl focus:outline-none focus:border-accent"
                    dir="ltr"
                  />
                  {errors.scoreB && <p className="text-xs text-danger mt-1">{errors.scoreB}</p>}
                </div>
              </div>

              <CardEventsSection
                title="⚽"
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

              <CardEventsSection
                title="🟨"
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

              <CardEventsSection
                title="🟥"
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

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-black font-bold py-3.5 rounded-xl transition-colors"
              >
                {match.status === 'live'
                  ? t('matches.endMatchSave')
                  : match.status === 'completed'
                    ? t('common.save')
                    : t('matches.saveResult')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
