import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, Shuffle } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { haptic } from '../../hooks/useHaptics'

const navItems = [
  { path: '/admin/dashboard', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: LayoutDashboard },
  { path: '/admin/teams', labelAr: 'إدارة الفرق', labelEn: 'Teams', icon: Users },
  { path: '/admin/matches', labelAr: 'المباريات', labelEn: 'Matches', icon: Calendar },
  { path: '/admin/draw', labelAr: 'القرعة', labelEn: 'Draw', icon: Shuffle },
  { path: '/admin/schedule', labelAr: 'جدول', labelEn: 'Schedule', icon: Calendar },
]

export default function AdminBottomNav() {
  const location = useLocation()
  const language = useAppStore((s) => s.language)
  const isAr = language === 'ar'

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden select-none pb-safe"
      role="navigation"
      aria-label={isAr ? 'القائمة السفلية' : 'Bottom navigation'}
    >
      <div
        className="h-14 bg-bg-nav/95 backdrop-blur-xl border-t border-border grid grid-cols-5"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => haptic.light()}
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all duration-150
                ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary active:text-text-primary'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                size={21}
                strokeWidth={isActive ? 2.5 : 1.75}
                aria-hidden="true"
              />
              <span className="text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[4.5rem] leading-tight text-center">
                {isAr ? item.labelAr : item.labelEn}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}