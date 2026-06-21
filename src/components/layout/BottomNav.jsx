import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Home, Swords, Table2, Users, Compass } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'

const navItems = [
  { path: '/', labelAr: 'الرئيسية', labelEn: 'Home', icon: Home },
  { path: '/matches', labelAr: 'المباريات', labelEn: 'Matches', icon: Swords },
  { path: '/standings', labelAr: 'الترتيب', labelEn: 'Standings', icon: Table2 },
  { path: '/teams', labelAr: 'الفرق', labelEn: 'Teams', icon: Users },
]

export default function BottomNav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { language } = useAppStore()
  const isAr = language === 'ar'
  const isScheduleActive = pathname === '/schedule'

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

      {/* FAB — floats above the bar, no notch needed */}
      <button
        onClick={() => navigate('/schedule')}
        className={`absolute left-1/2 -translate-x-1/2 z-30 w-13 h-13 rounded-full flex items-center justify-center
          shadow-2xl transition-all duration-200 active:scale-90 hover:scale-110
          ${isScheduleActive
            ? 'bg-accent text-black shadow-[0_4px_15px_rgba(184,155,94,0.4)]'
            : 'bg-bg-surface text-text-primary border border-border hover:bg-accent/10 hover:text-accent hover:border-accent/30 shadow-md shadow-black/5'
          }`}
        aria-label={isAr ? 'نظرة النسر' : 'Eagle-Eye'}
        style={{ bottom: 'calc(4rem - 20px)' }}
      >
        <Compass size={26} strokeWidth={2.5} />
      </button>
    </nav>
  )
}