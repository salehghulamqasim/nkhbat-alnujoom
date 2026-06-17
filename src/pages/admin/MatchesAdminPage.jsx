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
} from 'lucide-react'
import { useTeamsStore, isDrawComplete } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'
import EmptyState from '../../components/common/EmptyState'
import MatchFormModal from './components/MatchFormModal'
import MatchDateModal from './components/MatchDateModal'
import ResultFormModal from './components/ResultFormModal'
import LiveScoreModal from './components/LiveScoreModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import { getExpectedMatchCount } from '../../utils/scheduleGenerator'

const GROUPS = ['A', 'B', 'C']

const statusLabels = {
  scheduled: { text: 'مجدولة', className: 'text-text-secondary bg-bg-surface' },
  live: { text: 'مباشر', className: 'text-live bg-live/10' },
  completed: { text: 'منتهية', className: 'text-success bg-success/10' },
}

function AdminMatchCard({
  match,
  teamA,
  teamB,
  onRecordResult,
  onEditResult,
  onEditDate,
  onStartLive,
  onUpdateLive,
  onDelete,
}) {
  const status = statusLabels[match.status] || statusLabels.scheduled

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className={`px-2 py-0.5 rounded-lg font-medium ${status.className}`}>
          {match.status === 'live' && (
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-live animate-pulse ml-1" />
          )}
          {status.text}
        </span>
        <span className="text-text-secondary">مجموعة {match.group}</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 text-center">
          <p className="font-bold text-sm truncate">{teamA?.name || '—'}</p>
        </div>

        <div className="flex flex-col items-center shrink-0 px-2">
          {match.status === 'live' || (match.status === 'completed' && match.result) ? (
            <span className="text-2xl font-bold text-accent" dir="ltr">
              {match.result?.scoreA ?? 0} - {match.result?.scoreB ?? 0}
            </span>
          ) : (
            <span className="text-lg font-bold text-text-secondary">VS</span>
          )}
        </div>

        <div className="flex-1 text-center">
          <p className="font-bold text-sm truncate">{teamB?.name || '—'}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-xs text-text-secondary pt-2 border-t border-border">
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

      <div className="flex gap-2 pt-1">
        {match.status === 'scheduled' && (
          <>
            <button
              type="button"
              onClick={() => onEditDate(match)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-bg-surface border border-border text-sm font-bold hover:border-accent/30 hover:text-accent transition-colors"
            >
              <CalendarClock size={15} />
              <span>تعديل الموعد</span>
            </button>
            <button
              type="button"
              onClick={() => onStartLive(match)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-live/10 border border-live/30 text-live text-sm font-bold hover:bg-live/20 transition-colors"
            >
              <Radio size={15} />
              <span>بدء مباشر</span>
            </button>
            <button
              type="button"
              onClick={() => onRecordResult(match)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-black text-sm font-bold transition-colors"
            >
              <Trophy size={15} />
              <span>تسجيل النتيجة</span>
            </button>
          </>
        )}

        {match.status === 'live' && (
          <>
            <button
              type="button"
              onClick={() => onUpdateLive(match)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-live/10 border border-live/30 text-live text-sm font-bold hover:bg-live/20 transition-colors"
            >
              <Radio size={15} />
              <span>تحديث مباشر</span>
            </button>
            <button
              type="button"
              onClick={() => onEditResult(match)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-black text-sm font-bold transition-colors"
            >
              <Trophy size={15} />
              <span>إنهاء المباراة</span>
            </button>
          </>
        )}

        {match.status === 'completed' && (
          <button
            type="button"
            onClick={() => onEditResult(match)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-bg-surface border border-border text-sm hover:border-accent/30 hover:text-accent transition-colors"
          >
            <Pencil size={15} />
            <span>تعديل النتيجة</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => onDelete(match)}
          className="w-10 h-10 rounded-xl bg-bg-surface border border-border flex items-center justify-center text-danger hover:bg-danger/10 hover:border-danger/30 transition-colors shrink-0"
        >
          <Trash2 size={15} />
        </button>
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
          <h1 className="text-2xl font-bold">إدارة المباريات</h1>
          <p className="text-sm text-text-secondary mt-1">جدولة المباريات وتسجيل النتائج</p>
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
              className="flex items-center justify-center gap-2 bg-bg-surface border border-accent/40 hover:border-accent text-accent font-bold py-3 px-5 rounded-xl transition-colors disabled:opacity-50"
            >
              <Wand2 size={20} />
              <span>{generating ? 'جاري الإنشاء...' : 'إنشاء الجدول تلقائياً'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-3 px-5 rounded-xl transition-colors"
          >
            <Plus size={20} />
            <span>إضافة مباراة</span>
          </button>
        </div>
      </div>

      {canGenerateSchedule && (
        <div className="glass-card p-4 flex items-start gap-3 border border-accent/20">
          <Wand2 size={20} className="text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-text-primary">القرعة مكتملة — جاهز لإنشاء الجدول</p>
            <p className="text-xs text-text-secondary mt-1">
              سيتم إنشاء {getExpectedMatchCount()} مباراة (6 لكل مجموعة). يمكنك تعديل تاريخ ووقت كل مباراة بعد الإنشاء.
            </p>
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <EmptyState
          title="لا توجد مباريات"
          message="ابدأ بإضافة مباريات للبطولة"
          icon={Calendar}
          action={
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-black font-bold py-2.5 px-5 rounded-xl transition-colors"
            >
              <Plus size={18} />
              <span>إضافة أول مباراة</span>
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
                المجموعة {group}
                <span className="text-xs text-text-secondary font-normal">
                  ({groupMatches.length} مباراة)
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
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
                      onDelete={setDeletingMatch}
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
        title="حذف المباراة"
        message={`هل أنت متأكد من حذف مباراة ${getTeam(deletingMatch?.teamA)?.name} vs ${getTeam(deletingMatch?.teamB)?.name}؟ لا يمكن التراجع عن هذا الإجراء.`}
      />
    </div>
  )
}
