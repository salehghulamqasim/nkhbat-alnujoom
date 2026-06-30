import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, ChevronDown, Target, AlertCircle } from 'lucide-react'
import { emptyResult } from '../../../stores/useMatchesStore'
import { haptic } from '../../../hooks/useHaptics'
import { useI18n } from '../../../i18n/useI18n'
import TeamLogo from '../../../components/common/TeamLogo'

const emptyScorer = { player: '', minute: '', teamId: '', goalsCount: '1' }
const emptyCard = { player: '', teamId: '' }

function CardEventsSection({
  title,
  items,
  onChange,
  teamA,
  teamB,
  accentClass,
  icon: Icon,
  addLabel,
  noEventsLabel,
  playerLabel,
  teamLabel,
  minuteLabel,
  variant = 'card',
  eventKey,
  fieldErrors = {},
}) {
  const errorPrefix = eventKey || variant
  const [collapsed, setCollapsed] = useState(false)

  const addItem = () => {
    haptic.light()
    onChange([...items, variant === 'scorer' ? { ...emptyScorer } : { ...emptyCard }])
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

  const fieldError = (index, field) => fieldErrors[`${errorPrefix}-${index}-${field}`]

  return (
    <div className="rounded-2xl border border-border/80 bg-gradient-to-b from-bg-surface/80 to-bg-surface/40 overflow-hidden">
      <button
        type="button"
        onClick={() => {
          haptic.light()
          setCollapsed(!collapsed)
        }}
        className="w-full flex items-center justify-between p-3.5 hover:bg-bg-surface/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-bg-primary border border-border ${accentClass}`}>
            {Icon && <Icon size={16} />}
          </div>
          <span className="text-sm font-semibold text-text-primary">{title}</span>
          <span className="text-[10px] bg-bg-primary px-2 py-0.5 rounded-full text-text-secondary border border-border">
            {items.reduce((acc, it) => acc + (variant === 'scorer' ? (Number(it.goalsCount) || 1) : 1), 0)}
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
            className="flex items-center gap-1 text-xs text-accent hover:text-accent-light transition-colors px-2.5 py-1.5 rounded-lg bg-accent/10 border border-accent/20"
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
                <div className="rounded-xl border border-dashed border-border p-4 flex flex-col items-center gap-2 text-text-secondary">
                  <span className="text-xs">{noEventsLabel}</span>
                </div>
              </div>
            ) : (
              <div className="px-3 pb-3 space-y-2">
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 items-start bg-bg-primary/80 rounded-xl p-2.5 border border-border/60"
                  >
                    <div className={`flex-1 grid grid-cols-1 ${variant === 'scorer' ? 'sm:grid-cols-4' : 'sm:grid-cols-2'} gap-2 min-w-0`}>
                      <div>
                        <label className="text-[10px] text-text-secondary mb-1 block">{teamLabel}</label>
                        <select
                          value={item.teamId}
                          onChange={(e) => updateItem(index, 'teamId', e.target.value)}
                          className={`w-full bg-bg-surface border rounded-lg py-2 px-2 text-xs focus:outline-none focus:border-accent appearance-none ${
                            fieldError(index, 'teamId') ? 'border-danger ring-1 ring-danger/30' : 'border-border'
                          }`}
                        >
                          <option value="">{teamLabel}</option>
                          {teamA && <option value={teamA.id}>{teamA.name}</option>}
                          {teamB && <option value={teamB.id}>{teamB.name}</option>}
                        </select>
                        {fieldError(index, 'teamId') && (
                          <p className="text-[10px] text-danger mt-0.5">{fieldError(index, 'teamId')}</p>
                        )}
                      </div>

                      <div>
                        <label className="text-[10px] text-text-secondary mb-1 block">{playerLabel}</label>
                        <select
                          value={item.player}
                          onChange={(e) => updateItem(index, 'player', e.target.value)}
                          disabled={!item.teamId}
                          className={`w-full bg-bg-surface border rounded-lg py-2 px-2 text-xs focus:outline-none focus:border-accent disabled:opacity-40 appearance-none ${
                            fieldError(index, 'player') ? 'border-danger ring-1 ring-danger/30' : 'border-border'
                          }`}
                        >
                          <option value="">{playerLabel}</option>
                          {getTeamPlayers(item.teamId).map((p) => (
                            <option key={p.id} value={p.name}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                        {fieldError(index, 'player') && (
                          <p className="text-[10px] text-danger mt-0.5">{fieldError(index, 'player')}</p>
                        )}
                      </div>

                      {variant === 'scorer' && (
                        <>
                          <div>
                            <label className="text-[10px] text-text-secondary mb-1 block">عدد الأهداف (اختياري)</label>
                            <input
                              type="number"
                              min="1"
                              value={item.goalsCount || '1'}
                              onChange={(e) => {
                                haptic.light()
                                updateItem(index, 'goalsCount', e.target.value)
                              }}
                              className={`w-full bg-bg-surface border rounded-lg py-2 px-2 text-xs text-center focus:outline-none focus:border-accent ${
                                fieldError(index, 'goalsCount') ? 'border-danger ring-1 ring-danger/30' : 'border-border'
                              }`}
                              dir="ltr"
                            />
                            {fieldError(index, 'goalsCount') && (
                              <p className="text-[10px] text-danger mt-0.5">{fieldError(index, 'goalsCount')}</p>
                            )}
                          </div>
                          <div>
                            <label className="text-[10px] text-text-secondary mb-1 block">الدقيقة (اختياري)</label>
                            <input
                              type="number"
                              min="1"
                              max="120"
                              value={item.minute || ''}
                              onChange={(e) => updateItem(index, 'minute', e.target.value)}
                              placeholder="مثال: 15"
                              className="w-full bg-bg-surface border border-border rounded-lg py-2 px-2 text-xs text-center focus:outline-none focus:border-accent"
                              dir="ltr"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="w-9 h-9 rounded-lg bg-bg-surface border border-border/60 flex items-center justify-center text-danger/70 hover:text-danger hover:bg-danger/5 shrink-0 transition-colors mt-5"
                    >
                      <Trash2 size={14} />
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

function YellowIcon({ size = 16 }) {
  return (
    <span
      className="inline-block rounded-sm border border-yellow-500/50 bg-yellow-400/90"
      style={{ width: size * 0.65, height: size }}
    />
  )
}

function RedIcon({ size = 16 }) {
  return (
    <span
      className="inline-block rounded-sm border border-red-500/50 bg-red-500/90"
      style={{ width: size * 0.65, height: size }}
    />
  )
}

function validateEventRows(items, variant, t) {
  const errors = {}
  let hasIncomplete = false

  items.forEach((item, index) => {
    const hasAny =
      variant === 'scorer'
        ? item.player || item.minute || item.goalsCount
        : item.teamId || item.player
    // Scorer row with only team selected — counts toward score, skip field validation
    if (variant === 'scorer' && !hasAny && item.teamId) return
    if (!hasAny) return

    const prefix = `${variant}-${index}`
    if (!item.teamId) {
      errors[`${prefix}-teamId`] = t('matches.teamRequired')
      hasIncomplete = true
    }
    if (!item.player) {
      errors[`${prefix}-player`] = t('matches.playerRequired')
      hasIncomplete = true
    }
    if (variant === 'scorer') {
      const gCount = Number(item.goalsCount || 1)
      if (isNaN(gCount) || gCount < 1) {
        errors[`${prefix}-goalsCount`] = 'يجب أن يكون 1 على الأقل'
        hasIncomplete = true
      }
    }
  })

  return { errors, hasIncomplete }
}

function countGoalsByTeam(scorers, teamId) {
  if (!teamId) return 0
  return scorers
    .filter((s) => s.teamId === teamId)
    .reduce((sum, s) => sum + (Number(s.goalsCount) || 1), 0)
}

function syncScoresFromScorers(scorers, teamA, teamB, currentScoreA, currentScoreB) {
  const fromScorersA = countGoalsByTeam(scorers, teamA?.id)
  const fromScorersB = countGoalsByTeam(scorers, teamB?.id)
  const manualA = Number(currentScoreA) || 0
  const manualB = Number(currentScoreB) || 0
  return {
    scoreA: Math.max(manualA, fromScorersA),
    scoreB: Math.max(manualB, fromScorersB),
  }
}



/**
 * KnockoutResultFormModal — result editor for knockout matches.
 * Extends the group-stage result UX with a penalty winner selector.
 *
 * Penalty winner uses tap-to-select team cards (Option B as chosen).
 * The penalty section appears only when scoreA === scoreB.
 */
export default function KnockoutResultFormModal({
  isOpen,
  onClose,
  onSubmit,
  match,
  teamA,
  teamB,
}) {
  const { t, isAr } = useI18n()

  const [scoreA, setScoreA] = useState(0)
  const [scoreB, setScoreB] = useState(0)
  const [scorers, setScorers] = useState([])
  const [yellowCards, setYellowCards] = useState([])
  const [redCards, setRedCards] = useState([])
  const [fieldErrors, setFieldErrors] = useState({})
  const [penaltyWinner, setPenaltyWinner] = useState(null) // teamId | null
  const [errors, setErrors] = useState({})

  const isTied = useMemo(() => {
    const sA = Number(scoreA) || 0
    const sB = Number(scoreB) || 0
    return sA === sB
  }, [scoreA, scoreB])

  useEffect(() => {
    if (isOpen && match) {
      const res = match.result
      setScoreA(res?.scoreA ?? 0)
      setScoreB(res?.scoreB ?? 0)
      setPenaltyWinner(res?.penaltyWinner || null)
      
      const mapScorers = (items = []) => items.map(item => ({ player: item.player || '', teamId: item.teamId || '', minute: item.minute || '', goalsCount: '1' }))
      const mapCards = (items = []) => items.map((item) => ({ player: item.player || '', teamId: item.teamId || '' }))
      
      setScorers(res?.scorers ? mapScorers(res.scorers) : [])
      setYellowCards(res?.yellowCards ? mapCards(res.yellowCards) : [])
      setRedCards(res?.redCards ? mapCards(res.redCards) : [])
      setErrors({})
      setFieldErrors({})
    }
  }, [isOpen, match])

  // Clear penalty winner when scores diverge
  useEffect(() => {
    if (!isTied) {
      setPenaltyWinner(null)
    }
  }, [isTied])

  const validationState = useMemo(() => {
    const errs = {}
    const sA = Number(scoreA)
    const sB = Number(scoreB)
    if (scoreA === '' || scoreA < 0 || isNaN(sA)) errs.scoreA = isAr ? 'مطلوب' : 'Required'
    if (scoreB === '' || scoreB < 0 || isNaN(sB)) errs.scoreB = isAr ? 'مطلوب' : 'Required'
    if (sA === sB && !penaltyWinner) {
      errs.penalty = isAr ? 'يجب تحديد الفائز بركلات الترجيح عند التعادل' : 'Penalty winner required when scores are tied'
    }

    const scorerVal = validateEventRows(scorers, 'scorer', t)
    const yellowVal = validateEventRows(yellowCards, 'yellow', t)
    const redVal = validateEventRows(redCards, 'red', t)

    const allFieldErrors = { ...scorerVal.errors, ...yellowVal.errors, ...redVal.errors }

    const isValid = Object.keys(errs).length === 0 && !scorerVal.hasIncomplete && !yellowVal.hasIncomplete && !redVal.hasIncomplete
    return { errs, allFieldErrors, isValid }
  }, [scoreA, scoreB, penaltyWinner, scorers, yellowCards, redCards, t, isAr])

  const cleanScorers = (items) => {
    const flatScorers = []
    items.forEach((item) => {
      if (!item.player || !item.teamId) return
      const count = Math.max(1, Number(item.goalsCount) || 1)
      for (let i = 0; i < count; i++) {
        flatScorers.push({ player: item.player, teamId: item.teamId, minute: item.minute || null })
      }
    })
    return flatScorers
  }

  const cleanCards = (items) => items.filter((item) => item.player && item.teamId).map((item) => ({ player: item.player, teamId: item.teamId }))

  const handleScorersChange = (newScorers) => {
    setScorers(newScorers)
    const synced = syncScoresFromScorers(newScorers, teamA, teamB, scoreA, scoreB)
    setScoreA(synced.scoreA)
    setScoreB(synced.scoreB)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validationState.isValid) {
      haptic.heavy()
      setErrors(validationState.errs)
      setFieldErrors(validationState.allFieldErrors)
      return
    }

    const synced = syncScoresFromScorers(scorers, teamA, teamB, scoreA, scoreB)
    
    haptic.intense()
    onSubmit({
      scoreA: synced.scoreA,
      scoreB: synced.scoreB,
      penaltyWinner: (synced.scoreA === synced.scoreB) ? penaltyWinner : null,
      scorers: cleanScorers(scorers),
      yellowCards: cleanCards(yellowCards),
      redCards: cleanCards(redCards),
    })
    onClose()
  }

  if (!match) return null

  const goalMinuteLabel = isAr ? 'دقيقة الهدف' : 'Goal minute'

  const isEditingCompleted = match.status === 'completed'
  const isLive = match.status === 'live'

  const headerTitle = isLive
    ? (isAr ? 'إنهاء المباراة' : 'End Match')
    : isEditingCompleted
      ? (isAr ? 'تعديل النتيجة' : 'Edit Result')
      : (isAr ? 'تسجيل النتيجة' : 'Record Result')

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => { haptic.light(); onClose() }}
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto glass-card rounded-t-3xl md:rounded-3xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-bg-card/95 backdrop-blur-md">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  {headerTitle}
                  {isLive && (
                    <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-medium animate-pulse">
                      LIVE
                    </span>
                  )}
                </h2>
                <p className="text-xs text-text-secondary mt-0.5">
                  {match.matchLabel} — {teamA?.name} <span className="text-zinc-600">vs</span> {teamB?.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { haptic.light(); onClose() }}
                className="w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center hover:bg-bg-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="p-4 space-y-4 pb-8">

              {/* Score inputs */}
              <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-5">
                <div className="flex items-center justify-center gap-6">
                  {/* Team A */}
                  <div className="text-center flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <TeamLogo logo={teamA?.logo} name={teamA?.name} color={teamA?.color} size="sm" />
                      <p className="text-xs font-medium text-text-secondary truncate w-full text-center">{teamA?.name}</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={scoreA}
                      onChange={(e) => setScoreA(e.target.value)}
                      className={`w-full max-w-[88px] h-16 text-3xl font-bold text-center bg-bg-primary border rounded-2xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all mx-auto block ${
                        errors.scoreA ? 'border-danger' : 'border-border'
                      }`}
                      dir="ltr"
                    />
                    {errors.scoreA && <p className="text-xs text-danger mt-1">{errors.scoreA}</p>}
                  </div>

                  <span className="text-xl font-bold text-text-secondary shrink-0">—</span>

                  {/* Team B */}
                  <div className="text-center flex-1 min-w-0">
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <TeamLogo logo={teamB?.logo} name={teamB?.name} color={teamB?.color} size="sm" />
                      <p className="text-xs font-medium text-text-secondary truncate w-full text-center">{teamB?.name}</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={scoreB}
                      onChange={(e) => setScoreB(e.target.value)}
                      className={`w-full max-w-[88px] h-16 text-3xl font-bold text-center bg-bg-primary border rounded-2xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all mx-auto block ${
                        errors.scoreB ? 'border-danger' : 'border-border'
                      }`}
                      dir="ltr"
                    />
                    {errors.scoreB && <p className="text-xs text-danger mt-1">{errors.scoreB}</p>}
                  </div>
                </div>
              </div>

              {/* Penalty Winner — appears only when tied */}
              <AnimatePresence>
                {isTied && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    className={`rounded-2xl border p-4 space-y-3 ${
                      errors.penalty
                        ? 'border-danger/50 bg-danger/5'
                        : 'border-accent/30 bg-accent/5'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold flex items-center gap-2">
                        <span className="text-lg">🏆</span>
                        {t('knockout.penaltyWinner')}
                      </p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        {t('knockout.scoreTied')}
                      </p>
                    </div>

                    {errors.penalty && (
                      <div className="flex items-center gap-2 text-xs text-danger">
                        <AlertCircle size={14} />
                        <span>{errors.penalty}</span>
                      </div>
                    )}

                    {/* Tap-to-select team cards */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { team: teamA, id: teamA?.id },
                        { team: teamB, id: teamB?.id },
                      ].map(({ team, id }) => {
                        const isSelected = penaltyWinner === id
                        return (
                          <motion.button
                            key={id}
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => {
                              haptic.medium()
                              setPenaltyWinner(id)
                            }}
                            className={`flex flex-col items-center gap-2.5 p-3.5 rounded-2xl border-2 transition-all ${
                              isSelected
                                ? 'border-accent bg-accent/15 shadow-lg shadow-accent/10'
                                : 'border-border bg-bg-surface hover:border-accent/40'
                            }`}
                          >
                            <TeamLogo logo={team?.logo} name={team?.name} color={team?.color} size="md" />
                            <p className={`text-sm font-bold text-center leading-tight ${isSelected ? 'text-accent' : ''}`}>
                              {team?.name}
                            </p>
                            {isSelected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-[10px] bg-accent text-black px-2 py-0.5 rounded-full font-bold"
                              >
                                {isAr ? 'الفائز ✓' : 'Winner ✓'}
                              </motion.span>
                            )}
                          </motion.button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Winner preview (non-tied) */}
              {!isTied && (Number(scoreA) > 0 || Number(scoreB) > 0) && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-success/10 border border-success/30 text-sm">
                  <span className="text-success">✓</span>
                  <span className="text-text-secondary">
                    {isAr ? 'الفائز:' : 'Winner:'}
                  </span>
                  <span className="font-bold text-success">
                    {Number(scoreA) > Number(scoreB) ? teamA?.name : teamB?.name}
                  </span>
                  <span className="text-xs text-text-secondary ms-auto">
                    {t('knockout.winnerAdvances')}
                  </span>
                </div>
              )}

              <CardEventsSection
                title={t('matches.goals')}
                icon={Target}
                variant="scorer"
                items={scorers}
                onChange={handleScorersChange}
                teamA={teamA}
                teamB={teamB}
                accentClass="text-accent"
                addLabel={t('matches.addGoal')}
                noEventsLabel={t('matches.noGoals')}
                playerLabel={t('matches.player')}
                teamLabel={t('matches.team')}
                minuteLabel={goalMinuteLabel}
                fieldErrors={fieldErrors}
              />

              <CardEventsSection
                title={t('matches.yellowCards')}
                icon={YellowIcon}
                variant="card"
                eventKey="yellow"
                items={yellowCards}
                onChange={setYellowCards}
                teamA={teamA}
                teamB={teamB}
                accentClass="text-warning"
                addLabel={t('matches.addCard')}
                noEventsLabel={t('matches.noEvents')}
                playerLabel={t('matches.player')}
                teamLabel={t('matches.team')}
                fieldErrors={fieldErrors}
              />

              <CardEventsSection
                title={t('matches.redCards')}
                icon={RedIcon}
                variant="card"
                eventKey="red"
                items={redCards}
                onChange={setRedCards}
                teamA={teamA}
                teamB={teamB}
                accentClass="text-danger"
                addLabel={t('matches.addCard')}
                noEventsLabel={t('matches.noEvents')}
                playerLabel={t('matches.player')}
                teamLabel={t('matches.team')}
                fieldErrors={fieldErrors}
              />

              {!validationState.isValid && Object.keys(fieldErrors).length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-danger/10 border border-danger/30 text-xs text-danger">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{t('matches.fixHighlightedFields')}</span>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={!validationState.isValid}
                whileTap={validationState.isValid ? { scale: 0.97 } : {}}
                className={`w-full font-bold py-3.5 rounded-xl transition-all ${
                  validationState.isValid
                    ? 'bg-accent hover:bg-accent-hover text-black shadow-lg shadow-accent/15'
                    : 'bg-bg-surface text-text-secondary border border-border cursor-not-allowed opacity-60'
                }`}
              >
                {isLive
                  ? (isAr ? 'إنهاء المباراة وحفظ النتيجة' : 'End Match & Save Result')
                  : (isAr ? 'حفظ النتيجة' : 'Save Result')}
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
