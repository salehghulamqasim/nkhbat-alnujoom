import { Users, Calendar, Shuffle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import DarkCard from '../../components/common/DarkCard'
import { useTeamsStore, MAX_TEAMS, isDrawComplete } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'

export default function DashboardPage() {
  const teams = useTeamsStore((state) => state.teams)
  const drawLocked = useTeamsStore((state) => state.drawLocked)
  const matches = useMatchesStore((state) => state.matches)
  const drawComplete = isDrawComplete(teams, drawLocked)

  const stats = [
    { label: 'الفرق المسجلة', value: `${teams.length}/${MAX_TEAMS}`, icon: Users, color: 'text-accent' },
    { label: 'المباريات', value: String(matches.length), icon: Calendar, color: 'text-success' },
    {
      label: 'حالة القرعة',
      value: drawComplete ? 'مكتملة' : 'غير مكتملة',
      icon: Shuffle,
      color: drawComplete ? 'text-success' : 'text-warning',
    },
  ]

  const actions = [
    { label: 'إدارة الفرق', path: '/admin/teams', icon: Users, desc: 'إضافة، تعديل، أو حذف الفرق واللاعبين' },
    { label: 'المباريات والنتائج', path: '/admin/matches', icon: Calendar, desc: 'جدولة المباريات وتحديث النتائج المباشرة' },
    { label: 'سحب القرعة', path: '/admin/draw', icon: Shuffle, desc: 'توزيع الفرق على المجموعات الثلاث' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Users size={24} className="text-accent" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">مرحباً، المشرف</h1>
          <p className="text-sm text-text-secondary">لوحة تحكم بطولة نخبة النجوم</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <DarkCard className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="text-sm text-text-secondary">{stat.label}</span>
                  <Icon size={18} className={stat.color} />
                </div>
                <span className="text-2xl font-bold text-text-primary">{stat.value}</span>
              </DarkCard>
            </motion.div>
          )
        })}
      </div>

      <div>
        <h2 className="text-lg font-bold mb-4 mt-8">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link to={action.path}>
                  <DarkCard hover className="p-4 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-bg-surface flex items-center justify-center border border-border group-hover:bg-accent/20 group-hover:border-accent/50 transition-colors">
                      <Icon size={24} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="font-bold">{action.label}</h3>
                      <p className="text-xs text-text-secondary">{action.desc}</p>
                    </div>
                  </DarkCard>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
