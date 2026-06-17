import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LayoutList, Star, Calendar, CalendarDays } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function QuickAccessFAB() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleOpen = () => setIsOpen(!isOpen)

  const actions = [
    { icon: Star, label: 'الهدافون', path: '/top-scorers' },
    { icon: Calendar, label: 'الجدول', path: '/matches' },
    { icon: CalendarDays, label: 'المجموعات', path: '/standings' },
  ]

  return (
    <div className="fixed bottom-20 end-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="flex flex-col gap-3"
          >
            {actions.map((action, i) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-end gap-2 group"
                >
                  <span className="bg-bg-surface text-text-primary text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap border border-border group-hover:border-accent/50 transition-colors">
                    {action.label}
                  </span>
                  <div className="w-12 h-12 rounded-full bg-bg-surface border border-border flex items-center justify-center shadow-lg text-text-primary group-hover:text-accent group-hover:border-accent/50 transition-colors">
                    <Icon size={20} />
                  </div>
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={toggleOpen}
        className="w-14 h-14 rounded-full bg-accent text-black flex items-center justify-center shadow-[0_4px_15px_rgba(212,175,55,0.4)] hover:scale-105 hover:bg-accent-light active:scale-95 transition-all"
        aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
      >
        <motion.div
          key={isOpen ? 'open' : 'closed'}
          initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="flex items-center justify-center"
        >
          {isOpen ? <X size={26} strokeWidth={2.5} /> : <LayoutList size={26} strokeWidth={2.5} />}
        </motion.div>
      </button>
    </div>
  )
}
