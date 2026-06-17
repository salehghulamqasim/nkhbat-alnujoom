import { NavLink, useLocation } from 'react-router-dom'
import { Home, CalendarDays, BarChart2, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BottomNav() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'الرئيسية', icon: Home },
    { path: '/matches', label: 'المباريات', icon: CalendarDays },
    { path: '/standings', label: 'الترتيب', icon: BarChart2 },
    { path: '/teams', label: 'الفرق', icon: Shield },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 glass z-40 pb-safe">
      <ul className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <li key={item.path} className="flex-1 px-1 flex justify-center items-center h-full">
              <NavLink
                to={item.path}
                className="relative flex flex-col items-center justify-center w-full max-w-[64px] h-12 rounded-2xl group"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-accent/15 dark:bg-accent/20 rounded-2xl -z-10"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`mb-1 transition-colors duration-300 ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'}`}
                />
                <span
                  className={`text-[9px] font-bold transition-colors duration-300 ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary'}`}
                >
                  {item.label}
                </span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
