import { NavLink, useLocation } from 'react-router-dom'
import { Home, Table2, Swords, Users } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

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

  // Hide bottom nav on admin pages
  if (pathname.startsWith('/admin')) return null

  return (
    <nav className="fixed bottom-0 inset-x-0 h-16 bg-bg-nav border-t border-border z-40 pb-safe">
      <ul className="flex items-center justify-around h-full max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.path
          const Icon = item.icon
          return (
            <li key={item.path} className="flex-1">
              <NavLink
                to={item.path}
                className={`flex flex-col items-center justify-center h-full gap-0.5 rounded-xl transition-colors ${
                  isActive
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.75} />
                <span className="text-[10px] font-semibold leading-tight">
                  {isAr ? item.labelAr : item.labelEn}
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
