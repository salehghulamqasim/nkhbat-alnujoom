import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, MapPin } from 'lucide-react'
import { haptic } from '../../../hooks/useHaptics'
import { useI18n } from '../../../i18n/useI18n'
import TeamLogo from '../../../components/common/TeamLogo'

const ROUNDS = [
  { value: 'QF', labelAr: 'ربع النهائي', labelEn: 'Quarter Final' },
  { value: 'SF', labelAr: 'نصف النهائي', labelEn: 'Semi Final' },
  { value: 'F',  labelAr: 'النهائي',      labelEn: 'Final' },
]

/**
 * KnockoutMatchFormModal — edit/create a knockout match.
 * Reuses the same form layout as MatchFormModal / MatchDateModal.
 * Can be used in two modes:
 *  - "schedule" mode: edit date/time/venue only (teams pre-filled)
 *  - "full" mode: edit teams + schedule + round
 */
export default function KnockoutMatchFormModal({
  isOpen,
  onClose,
  onSubmit,
  match = null,      // existing match for edit mode (null = new match)
  teams = [],        // all tournament teams
  defaultRound = 'QF',
  mode = 'full',     // 'full' | 'schedule'
  title,
}) {
  const { t, isAr } = useI18n()

  const [form, setForm] = useState({
    round: defaultRound,
    teamA: '',
    teamB: '',
    date: '',
    time: '',
    venue: '',
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setForm({
        round: match?.round || defaultRound,
        teamA: match?.teamA || '',
        teamB: match?.teamB || '',
        date: match?.date || '',
        time: match?.time || '',
        venue: match?.venue || (isAr ? 'ملاعب فيا' : 'Via Stadium'),
      })
      setErrors({})
    }
  }, [isOpen, match, defaultRound])

  const validate = () => {
    const errs = {}
    if (mode === 'full') {
      if (!form.teamA) errs.teamA = isAr ? 'اختر الفريق الأول' : 'Select Team A'
      if (!form.teamB) errs.teamB = isAr ? 'اختر الفريق الثاني' : 'Select Team B'
      if (form.teamA && form.teamA === form.teamB)
        errs.teamB = isAr ? 'يجب أن يكون الفريقان مختلفين' : 'Teams must be different'
    }
    if (!form.date) errs.date = isAr ? 'التاريخ مطلوب' : 'Date required'
    if (!form.time) errs.time = isAr ? 'الوقت مطلوب' : 'Time required'
    if (!form.venue.trim()) errs.venue = isAr ? 'الملعب مطلوب' : 'Venue required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    haptic.intense()
    onSubmit({ ...form, venue: form.venue.trim() })
    onClose()
  }

  const getTeam = (id) => teams.find((t) => t.id === id)
  const teamA = getTeam(form.teamA)
  const teamB = getTeam(form.teamB)

  const modalTitle = title ||
    (mode === 'schedule' ? t('knockout.editMatch') : t('knockout.editMatchTitle'))

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
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-bg-card/95 backdrop-blur-md">
              <div>
                <h2 className="text-lg font-bold">{modalTitle}</h2>
                {match?.matchLabel && (
                  <p className="text-xs text-accent font-medium mt-0.5">{match.matchLabel}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center hover:bg-bg-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-8">
              {/* Round selector — full mode only */}
              {mode === 'full' && (
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    {t('knockout.round')}
                  </label>
                  <select
                    value={form.round}
                    onChange={(e) => setForm((prev) => ({ ...prev, round: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    {ROUNDS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {isAr ? r.labelAr : r.labelEn}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Team A — full mode only */}
              {mode === 'full' && (
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    {isAr ? 'الفريق الأول' : 'Team A'}
                  </label>
                  <select
                    value={form.teamA}
                    onChange={(e) => setForm((prev) => ({ ...prev, teamA: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="">{isAr ? 'اختر فريقاً' : 'Select team'}</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>
                        {team.name} {team.group ? `(${t('knockout.group')} ${team.group})` : ''}
                      </option>
                    ))}
                  </select>
                  {errors.teamA && <p className="text-xs text-danger mt-1">{errors.teamA}</p>}
                  {teamA && (
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-bg-surface">
                      <TeamLogo logo={teamA.logo} name={teamA.name} color={teamA.color} size="sm" />
                      <span className="text-sm font-medium">{teamA.name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Team B — full mode only */}
              {mode === 'full' && (
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    {isAr ? 'الفريق الثاني' : 'Team B'}
                  </label>
                  <select
                    value={form.teamB}
                    onChange={(e) => setForm((prev) => ({ ...prev, teamB: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="">{isAr ? 'اختر فريقاً' : 'Select team'}</option>
                    {teams
                      .filter((team) => team.id !== form.teamA)
                      .map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name} {team.group ? `(${t('knockout.group')} ${team.group})` : ''}
                        </option>
                      ))}
                  </select>
                  {errors.teamB && <p className="text-xs text-danger mt-1">{errors.teamB}</p>}
                  {teamB && (
                    <div className="flex items-center gap-2 mt-2 p-2 rounded-lg bg-bg-surface">
                      <TeamLogo logo={teamB.logo} name={teamB.name} color={teamB.color} size="sm" />
                      <span className="text-sm font-medium">{teamB.name}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Preview for schedule-only mode */}
              {mode === 'schedule' && teamA && teamB && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/5 border border-accent/20">
                  <TeamLogo logo={teamA.logo} name={teamA.name} color={teamA.color} size="sm" />
                  <span className="font-bold text-sm flex-1 text-center">{teamA.name}</span>
                  <span className="text-text-secondary font-bold text-sm">VS</span>
                  <span className="font-bold text-sm flex-1 text-center">{teamB.name}</span>
                  <TeamLogo logo={teamB.logo} name={teamB.name} color={teamB.color} size="sm" />
                </div>
              )}

              {/* Date / Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-2 flex items-center gap-1">
                    <Calendar size={13} />
                    {isAr ? 'التاريخ' : 'Date'}
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                    dir="ltr"
                  />
                  {errors.date && <p className="text-xs text-danger mt-1">{errors.date}</p>}
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2 flex items-center gap-1">
                    <Clock size={13} />
                    {isAr ? 'الوقت' : 'Time'}
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm((prev) => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                    dir="ltr"
                  />
                  {errors.time && <p className="text-xs text-danger mt-1">{errors.time}</p>}
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className="block text-sm text-text-secondary mb-2 flex items-center gap-1">
                  <MapPin size={13} />
                  {isAr ? 'الملعب' : 'Venue'}
                </label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => setForm((prev) => ({ ...prev, venue: e.target.value }))}
                  placeholder={isAr ? 'مثال: ملعب النجوم' : 'e.g. Stars Stadium'}
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                />
                {errors.venue && <p className="text-xs text-danger mt-1">{errors.venue}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-accent hover:bg-accent-hover text-black font-bold py-3.5 rounded-xl transition-colors"
              >
                {isAr ? 'حفظ' : 'Save'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
