import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Users, UserCircle } from 'lucide-react'
import GoldButton from '../../components/common/GoldButton'
import DarkCard from '../../components/common/DarkCard'
import EmptyState from '../../components/common/EmptyState'
import { useTeamsStore, MAX_TEAMS } from '../../stores/useTeamsStore'
import TeamFormModal from './components/TeamFormModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'

export default function TeamsAdminPage() {
  const teams = useTeamsStore((state) => state.teams)
  const addTeam = useTeamsStore((state) => state.addTeam)
  const updateTeam = useTeamsStore((state) => state.updateTeam)
  const deleteTeam = useTeamsStore((state) => state.deleteTeam)

  const [formOpen, setFormOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [deletingTeam, setDeletingTeam] = useState(null)

  const teamCount = teams.length
  const maxReached = teamCount >= MAX_TEAMS
  const progressPercent = (teamCount / MAX_TEAMS) * 100

  const openAddForm = () => {
    setEditingTeam(null)
    setFormOpen(true)
  }

  const openEditForm = (team) => {
    setEditingTeam(team)
    setFormOpen(true)
  }

  const handleFormSubmit = async (data) => {
    if (editingTeam) {
      await updateTeam(editingTeam.id, data)
    } else {
      await addTeam(data)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة الفرق</h1>
          <p className="text-sm text-text-secondary mt-1">إضافة وتعديل وحذف الفرق المشاركة</p>
        </div>

        <GoldButton onClick={openAddForm} disabled={maxReached} className="shrink-0">
          <Plus size={20} />
          <span>إضافة فريق</span>
        </GoldButton>
      </div>

      {/* Team count */}
      <DarkCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-text-secondary">الفرق المسجلة</span>
          <span className="text-xl font-bold text-accent">
            {teamCount}/{MAX_TEAMS}
          </span>
        </div>
        <div className="h-2 bg-bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {maxReached && (
          <p className="text-xs text-success mt-2">تم اكتمال عدد الفرق — جاهز للقرعة</p>
        )}
      </DarkCard>

      {teams.length === 0 ? (
        <EmptyState
          title="لا توجد فرق مسجلة"
          message="ابدأ بإضافة الفرق المشاركة في البطولة"
          icon={Users}
          action={
            <GoldButton onClick={openAddForm}>
              <Plus size={18} />
              <span>إضافة أول فريق</span>
            </GoldButton>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, index) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <DarkCard className="p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-full bg-bg-surface border border-border flex items-center justify-center overflow-hidden shrink-0">
                  {team.logo ? (
                    <img src={team.logo} alt={team.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={22} className="text-text-secondary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{team.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
                    <UserCircle size={14} />
                    <span className="truncate">{team.manager}</span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">
                    {team.players.length} لاعب
                    {team.group && (
                      <span className="mr-2 text-accent">• مجموعة {team.group}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => openEditForm(team)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-bg-surface border border-border text-sm hover:bg-accent/10 hover:border-accent/30 hover:text-accent transition-colors"
                >
                  <Pencil size={15} />
                  <span>تعديل</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingTeam(team)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-bg-surface border border-border text-sm text-danger hover:bg-danger/10 hover:border-danger/30 transition-colors"
                >
                  <Trash2 size={15} />
                  <span>حذف</span>
                </button>
              </div>
              </DarkCard>
            </motion.div>
          ))}
        </div>
      )}

      <TeamFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTeam(null)
        }}
        onSubmit={handleFormSubmit}
        team={editingTeam}
        maxTeamsReached={maxReached}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingTeam)}
        onClose={() => setDeletingTeam(null)}
        onConfirm={async () => {
          await deleteTeam(deletingTeam.id)
        }}
        itemName={deletingTeam?.name}
      />
    </div>
  )
}
