import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { haptic } from '../../../hooks/useHaptics'
import { useTeamsStore } from '../../../stores/useTeamsStore'
import { useI18n } from '../../../i18n/useI18n'

const GROUPS = ['A', 'B', 'C']
const ROUNDS = [
  { value: 'QF', labelAr: 'دور الـ 8 (ربع النهائي)', labelEn: 'Round 8 (Quarter Final)' },
  { value: 'SF', labelAr: 'دور الـ 4 (نصف النهائي)', labelEn: 'Round 4 (Semi Final)' },
  { value: 'F',  labelAr: 'النهائي',      labelEn: 'Final' },
]

export default function MatchFormModal({ isOpen, onClose, onSubmitGroup, onSubmitKnockout }) {
  const teams = useTeamsStore((state) => state.teams)
  const { t, isAr } = useI18n()

  const [matchType, setMatchType] = useState('group') // 'group' or 'knockout'

  const [form, setForm] = useState({
    group: 'A',
    round: 'QF',
    teamA: '',
    teamB: '',
    date: '',
    time: '',
    venue: '',
  })
  const [errors, setErrors] = useState({})

  const availableTeams = matchType === 'group' 
    ? teams.filter((t) => t.group === form.group)
    : teams

  useEffect(() => {
    if (isOpen) {
      setMatchType('group')
      setForm({ group: 'A', round: 'QF', teamA: '', teamB: '', date: '', time: '', venue: isAr ? 'ملاعب فيا' : 'Via Stadium' })
      setErrors({})
    }
  }, [isOpen])

  useEffect(() => {
    setForm((prev) => ({ ...prev, teamA: '', teamB: '' }))
  }, [form.group, form.round])

  const validate = () => {
    const nextErrors = {}
    if (!form.teamA) nextErrors.teamA = t('matches.team1Required')
    if (!form.teamB) nextErrors.teamB = t('matches.team2Required')
    if (form.teamA && form.teamA === form.teamB) nextErrors.teamB = t('matches.sameTeamError')
    if (!form.date) nextErrors.date = t('matches.dateRequired')
    if (!form.time) nextErrors.time = t('matches.timeRequired')
    if (!form.venue.trim()) nextErrors.venue = t('matches.venueRequired')
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return

    haptic.intense()
    if (matchType === 'group') {
      if (onSubmitGroup) onSubmitGroup({ group: form.group, teamA: form.teamA, teamB: form.teamB, date: form.date, time: form.time, venue: form.venue })
    } else {
      if (onSubmitKnockout) onSubmitKnockout({ round: form.round, teamA: form.teamA, teamB: form.teamB, date: form.date, time: form.time, venue: form.venue })
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto glass-card rounded-t-2xl md:rounded-2xl shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-bg-card/95 backdrop-blur-md">
              <h2 className="text-lg font-bold">{t('matches.addMatchTitle')}</h2>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-bg-surface flex items-center justify-center hover:bg-bg-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-8">
              <div>
                <label className="block text-sm text-text-secondary mb-2">{isAr ? 'نوع المباراة' : 'Match Type'}</label>
                <select
                  value={matchType}
                  onChange={(e) => {
                    setMatchType(e.target.value)
                    setForm((prev) => ({ ...prev, teamA: '', teamB: '' }))
                  }}
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="group">{isAr ? 'مرحلة المجموعات' : 'Group Stage'}</option>
                  <option value="knockout">{isAr ? 'مرحلة خروج المغلوب' : 'Knockout Stage'}</option>
                </select>
              </div>

              {matchType === 'group' ? (
                <div>
                  <label className="block text-sm text-text-secondary mb-2">{t('matches.group')}</label>
                  <select
                    value={form.group}
                    onChange={(e) => setForm((prev) => ({ ...prev, group: e.target.value }))}
                    className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    {GROUPS.map((g) => (
                      <option key={g} value={g}>
                        {t('matches.group')} {g}
                      </option>
                    ))}
                  </select>
                  {availableTeams.length < 2 && (
                    <p className="text-xs text-warning mt-1">{t('matches.needDrawFirst')}</p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-text-secondary mb-2">{isAr ? 'الدور' : 'Round'}</label>
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

              <div>
                <label className="block text-sm text-text-secondary mb-2">{t('matches.team1')}</label>
                <select
                  value={form.teamA}
                  onChange={(e) => setForm((prev) => ({ ...prev, teamA: e.target.value }))}
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">{t('matches.selectTeam')}</option>
                  {availableTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.group ? `(${t.group})` : ''}
                    </option>
                  ))}
                </select>
                {errors.teamA && <p className="text-xs text-danger mt-1">{errors.teamA}</p>}
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">{t('matches.team2')}</label>
                <select
                  value={form.teamB}
                  onChange={(e) => setForm((prev) => ({ ...prev, teamB: e.target.value }))}
                  className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">{t('matches.selectTeam')}</option>
                  {availableTeams
                    .filter((t) => t.id !== form.teamA)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.group ? `(${t.group})` : ''}
                      </option>
                    ))}
                </select>
                {errors.teamB && <p className="text-xs text-danger mt-1">{errors.teamB}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">{t('matches.date')}</label>
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
                  <label className="block text-sm text-text-secondary mb-2">{t('matches.time')}</label>
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

              <div>
                <label className="block text-sm text-text-secondary mb-2">{t('matches.venue')}</label>
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
                disabled={matchType === 'group' && availableTeams.length < 2}
                className="w-full bg-accent hover:bg-accent-hover text-black font-bold py-3.5 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('matches.addMatchTitle')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
