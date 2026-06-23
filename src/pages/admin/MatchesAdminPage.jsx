import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Calendar,
  MapPin,
  Clock,
  Trophy,
  Pencil,
  Trash2,
  Radio,
  CalendarClock,
  Wand2,
  PauseCircle,
  PlayCircle,
} from 'lucide-react'
import { haptic } from '../../hooks/useHaptics'
import { useTeamsStore, isDrawComplete } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'
import EmptyState from '../../components/common/EmptyState'
import MatchFormModal from './components/MatchFormModal'
import MatchDateModal from './components/MatchDateModal'
import ResultFormModal from './components/ResultFormModal'
import LiveScoreModal from './components/LiveScoreModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import { getExpectedMatchCount } from '../../utils/scheduleGenerator'
import { useI18n } from '../../i18n/useI18n'

const GROUPS = ['A', 'B', 'C']

function AdminMatchCard({
  match,
  teamA,
  teamB,
  onRecordResult,
  onEditResult,
  onEditDate,
  onStartLive,
  onUpdateLive,
  onPostpone,
  onRestore,
  onDelete,
  t,
}) {
  const statusLabels = {
    scheduled: { text: t('matches.status.scheduled'), className: 'text-text-secondary bg-bg-surface' },
    live: { text: t('matches.status.live'), className: 'text-live bg-live/10' },
    completed: { text: t('matches.status.completed'), className: 'text-success bg-success/10' },
    postponed: { text: t('matches.status.postponed'), className: 'text-warning bg-warning/10' },
  }
  const status = statusLabels[match.status] || statusLabels.scheduled

  return (
    <div className="glass-card p-3 md:p-4 space-y-3 relative">
      <div className="flex items-center justify-between gap-2 text-xs pe-10">
        <span className={`px-2 py-0.5 rounded-lg font-medium shrink-0 ${status.className}`}>
          {match.status === 'live' && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-live animate-pulse ml-1" />
          )}
          {status.text}
        </span>
        <span className="text-text-secondary truncate">{t('matches.group')} {match.group}</span>
        <button
          type="button"
          onClick={() => {
            haptic.heavy()
            onDelete(match)
          }}
          className="absolute top-3 end-3 w-8 h-8 rounded-lg bg-bg-surface/90 border border-border flex items-center justify-center text-danger hover:bg-danger/10 hover:border-danger/30 transition-colors z-10"
          aria-label={t('common.delete')}
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-center min-w-0">
          <p className="font-bold text-sm truncate">{teamA?.name || '—'}</p>
        </div>

        <div className="flex flex-col items-center shrink-0 px-2">
          {match.status === 'live' || (match.status === 'completed' && match.result) ? (
            <span className="text-xl md:text-2xl font-bold text-accent" dir="ltr">
              {match.result?.scoreA ?? 0} - {match.result?.scoreB ?? 0}
            </span>
          ) : (
            <span className="text-lg font-bold text-text-secondary">{t('matches.vs')}</span>
          )}
        </div>

        <div className="flex-1 text-center min-w-0">
          <p className="font-bold text-sm truncate">{teamB?.name || '—'}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 text-xs text-text-secondary pt-2 border-t border-border">
        <span className="flex items-center gap-1">
          <Calendar size={12} />
          {match.date}
        </span>
        <span className="flex items-center gap-1" dir="ltr">
          <Clock size={12} />
          {match.time}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {match.venue}
        </span>
      </div>

      {match.status === 'completed' && match.result?.scorers?.length > 0 && (
        <div className="text-xs text-text-secondary bg-bg-surface rounded-xl p-2 border border-border">
          <span className="text-accent font-medium">⚽ </span>
          {match.result.scorers.map((s, i) => (
            <span key={i}>
              {s.player} ({s.minute}&apos;)
              {i < match.result.scorers.length - 1 ? '، ' : ''}
            </span>
          ))}
        </div>
      )}

      {match.status === 'completed' && (match.result?.yellowCards?.length > 0 || match.result?.redCards?.length > 0) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {match.result.yellowCards?.map((c, i) => (
            <span
              key={`y-${i}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-400/10 border border-yellow-400/30 text-yellow-300"
            >
              <span className="w-2.5 h-3.5 rounded-sm bg-yellow-400 inline-block" />
              {c.player}
            </span>
          ))}
          {match.result.redCards?.map((c, i) => (
            <span
              key={`r-${i}`}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300"
            >
              <span className="w-2.5 h-3.5 rounded-sm bg-red-500 inline-block" />
              {c.player}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons — responsive grid */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {match.status === 'scheduled' && (
          <>
            <button
              type="button"
              onClick={() => onEditDate(match)}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-bg-surface border border-border text-xs md:text-sm font-bold hover:border-accent/30 hover:text-accent transition-colors"
            >
              <CalendarClock size={14} />
              <span className="truncate">{t('matches.editDate')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                haptic.medium()
                onPostpone(match)
              }}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-warning/10 border border-warning/30 text-warning text-xs md:text-sm font-bold hover:bg-warning/20 transition-colors"
            >
              <PauseCircle size={14} />
              <span className="truncate">{t('matches.postpone')}</span>
            </button>
            <button
              type="button"
              onClick={() => onStartLive(match)}
              className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-black text-sm font-bold transition-colors"
            >
              <Radio size={15} />
              <span>{t('matches.startLive')}</span>
            </button>
          </>
        )}

        {match.status === 'postponed' && (
          <>
            <button
              type="button"
              onClick={() => {
                haptic.medium()
                onRestore(match)
              }}
              className="col-span-2 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent text-sm font-bold hover:bg-accent/20 transition-colors"
            >
              <PlayCircle size={15} />
              <span>{t('matches.restoreMatch')}</span>
            </button>
            <button
              type="button"
              onClick={() => onEditDate(match)}
              className="col-span-2 flex items-center justify-center gap-1 py-2 rounded-xl bg-bg-surface border border-border text-sm hover:border-accent/30 hover:text-accent transition-colors"
            >
              <CalendarClock size={14} />
              <span>{t('matches.editDate')}</span>
            </button>
          </>
        )}

        {match.status === 'live' && (
          <>
            <button
              type="button"
              onClick={() => onUpdateLive(match)}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-live/10 border border-live/30 text-live text-xs md:text-sm font-bold hover:bg-live/20 transition-colors"
            >
              <Radio size={14} />
              <span className="truncate">{t('matches.updateLive')}</span>
            </button>
            <button
              type="button"
              onClick={() => onEditResult(match)}
              className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-accent hover:bg-accent-hover text-black text-xs md:text-sm font-bold transition-colors"
            >
              <Trophy size={14} />
              <span className="truncate">{t('matches.endMatch')}</span>
            </button>
          </>
        )}

        {match.status === 'completed' && (
          <button
            type="button"
            onClick={() => onEditResult(match)}
            className="col-span-2 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-bg-surface border border-border text-sm hover:border-accent/30 hover:text-accent transition-colors"
          >
            <Pencil size={15} />
            <span>{t('matches.editResult')}</span>
          </button>
        )}

      </div>
    </div>
  )
}

export default function MatchesAdminPage() {
  const teams = useTeamsStore((state) => state.teams)
  const drawLocked = useTeamsStore((state) => state.drawLocked)
  const matches = useMatchesStore((state) => state.matches)
  const addMatch = useMatchesStore((state) => state.addMatch)
  const generateSchedule = useMatchesStore((state) => state.generateSchedule)
  const updateMatchSchedule = useMatchesStore((state) => state.updateMatchSchedule)
  const saveResult = useMatchesStore((state) => state.saveResult)
  const setMatchLive = useMatchesStore((state) => state.setMatchLive)
  const updateLiveScore = useMatchesStore((state) => state.updateLiveScore)
  const deleteMatch = useMatchesStore((state) => state.deleteMatch)
  const postponeMatch = useMatchesStore((state) => state.postponeMatch)
  const restoreMatch = useMatchesStore((state) => state.restoreMatch)
  const { t, isAr } = useI18n()

  const [formOpen, setFormOpen] = useState(false)
  const [resultMatch, setResultMatch] = useState(null)
  const [dateMatch, setDateMatch] = useState(null)
  const [liveMatch, setLiveMatch] = useState(null)
  const [deletingMatch, setDeletingMatch] = useState(null)
  const [generating, setGenerating] = useState(false)

  const getTeam = (id) => teams.find((t) => t.id === id)
  const drawComplete = isDrawComplete(teams, drawLocked)
  const canGenerateSchedule = drawComplete && matches.length === 0

  const groupedMatches = GROUPS.map((group) => ({
    group,
    matches: matches
      .filter((m) => m.group === group)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('matches.title')}</h1>
          <p className="text-sm text-text-secondary mt-1">{t('matches.subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0">
          {canGenerateSchedule && (
            <button
              type="button"
              disabled={generating}
              onClick={async () => {
                setGenerating(true)
                await generateSchedule(teams)
                setGenerating(false)
              }}
              className="flex items-center justify-center gap-2 bg-bg-surface border border-accent/40 hover:border-accent text-accent font-bold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              <Wand2 size={18} />
              <span>{generating ? t('matches.generating') : t('matches.autoGenerate')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
          >
            <Plus size={18} />
            <span>{t('matches.addMatch')}</span>
          </button>
        </div>
      </div>

      {canGenerateSchedule && (
        <div className="glass-card p-4 flex items-start gap-3 border border-accent/20">
          <Wand2 size={20} className="text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-text-primary">{t('matches.drawCompleteReady')}</p>
            <p className="text-xs text-text-secondary mt-1">
              {t('matches.drawCompleteDesc').replace('{count}', String(getExpectedMatchCount()))}
            </p>
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <EmptyState
          title={t('matches.noMatches')}
          message={t('matches.noMatchesMsg')}
          icon={Calendar}
          action={
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-2.5 px-5 rounded-xl transition-colors"
            >
              <Plus size={18} />
              <span>{t('matches.addFirstMatch')}</span>
            </button>
          }
        />
      ) : (
        groupedMatches.map(({ group, matches: groupMatches }) =>
          groupMatches.length > 0 ? (
            <section key={group}>
              <h2 className="text-lg font-bold text-accent mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/30 flex items-center justify-center text-sm">
                  {group}
                </span>
                {t('matches.group')} {group}
                <span className="text-xs text-text-secondary font-normal">
                  ({groupMatches.length} {t('matches.matchCount')})
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className=""
                  >
                    <AdminMatchCard
                      match={match}
                      teamA={getTeam(match.teamA)}
                      teamB={getTeam(match.teamB)}
                      onRecordResult={setResultMatch}
                      onEditResult={setResultMatch}
                      onEditDate={setDateMatch}
                      onStartLive={async (m) => {
                        await setMatchLive(m.id)
                      }}
                      onUpdateLive={setLiveMatch}
                      onPostpone={async (m) => {
                        await postponeMatch(m.id)
                      }}
                      onRestore={async (m) => {
                        await restoreMatch(m.id)
                      }}
                      onDelete={setDeletingMatch}
                      t={t}
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          ) : null
        )
      )}

      <MatchFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={async (data) => {
          await addMatch(data)
        }}
      />

      <MatchDateModal
        isOpen={Boolean(dateMatch)}
        onClose={() => setDateMatch(null)}
        onSubmit={async (data) => {
          await updateMatchSchedule(dateMatch.id, data)
        }}
        match={dateMatch}
        teamA={dateMatch ? getTeam(dateMatch.teamA) : null}
        teamB={dateMatch ? getTeam(dateMatch.teamB) : null}
      />

      <ResultFormModal
        isOpen={Boolean(resultMatch)}
        onClose={() => setResultMatch(null)}
        onSubmit={async (result) => {
          await saveResult(resultMatch.id, result, false)
        }}
        match={resultMatch}
        teamA={resultMatch ? getTeam(resultMatch.teamA) : null}
        teamB={resultMatch ? getTeam(resultMatch.teamB) : null}
      />

      <LiveScoreModal
        isOpen={Boolean(liveMatch)}
        onClose={() => setLiveMatch(null)}
        onSubmit={async ({ scoreA, scoreB, events }) => {
          await updateLiveScore(liveMatch.id, { scoreA, scoreB, events })
        }}
        match={liveMatch}
        teamA={liveMatch ? getTeam(liveMatch.teamA) : null}
        teamB={liveMatch ? getTeam(liveMatch.teamB) : null}
        liveData={null}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingMatch)}
        onClose={() => setDeletingMatch(null)}
        onConfirm={async () => {
          await deleteMatch(deletingMatch.id)
        }}
        title={t('matches.deleteMatchTitle')}
        message={t('matches.deleteMatchMsg')
          .replace('{teamA}', getTeam(deletingMatch?.teamA)?.name || '')
          .replace('{teamB}', getTeam(deletingMatch?.teamB)?.name || '')}
      />
    </div>
  )
}
