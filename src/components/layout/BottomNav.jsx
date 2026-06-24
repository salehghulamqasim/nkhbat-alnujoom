import { NavLink, useLocation } from 'react-router-dom'
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
    <nav className="fixed bottom-0 inset-x-0 z-40 select-none" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Theme-aware blurred background bar */}
      <div className="h-16 bg-bg-nav/95 backdrop-blur-xl border-t border-border" />

      {/* Nav items */}
      <div className="absolute inset-x-0 bottom-0 grid grid-cols-4 h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => haptic.light()}
              className={`flex flex-col items-center justify-center h-full gap-0.5 transition-all duration-150
                ${isActive ? 'text-accent' : 'text-text-secondary hover:text-text-primary active:text-text-primary'}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} aria-hidden="true" />
              <span className="text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis max-w-[4.5rem] text-center leading-tight">
                {isAr ? item.labelAr : item.labelEn}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}