import { Link, useLocation } from 'react-router-dom'
import { Home, Swords, Table2, Users } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { haptic } from '../../hooks/useHaptics'

const navItems = [
  { path: '/', labelAr: 'الرئيسية', labelEn: 'Home', icon: Home },
  { path: '/matches', labelAr: 'المباريات', labelEn: 'Matches', icon: Swords },
  { path: '/standings', labelAr: 'الترتيب', labelEn: 'Standings', icon: Table2 },
  { path: '/teams', labelAr: 'الفرق', labelEn: 'Teams', icon: Users },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const { language } = useAppStore()
  const isAr = language === 'ar'

  if (pathname.startsWith('/admin')) return null

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 select-none pb-[env(safe-area-inset-bottom,0px)]"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="grid grid-cols-4 h-14 bg-bg-nav/95 backdrop-blur-xl border-t border-border px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => haptic.light()}
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all duration-150 focus:outline-none ${
                isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary active:text-text-primary'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={21} strokeWidth={isActive ? 2.5 : 1.75} aria-hidden="true" />
              <span className="text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[4.5rem] text-center leading-tight">
                {isAr ? item.labelAr : item.labelEn}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}