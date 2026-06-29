import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAppStore } from '../../stores/useAppStore'
import { haptic } from '../../hooks/useHaptics'

export default function QuickAccessFAB() {
  const [isOpen, setIsOpen] = useState(false)
  const { language } = useAppStore()
  const isAr = language === 'ar'

  const actions = [
    { icon: Compass, labelAr: 'جدول', labelEn: 'Schedule', path: '/schedule' },
    { icon: Star, labelAr: 'الهدافون', labelEn: 'Top Scorers', path: '/top-scorers' },
  ]

  const toggleOpen = () => {
    haptic.light()
    setIsOpen(!isOpen)
  }

  const handleAction = () => {
    haptic.medium()
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-20 end-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="flex flex-col gap-2"
          >
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.path}
                  to={action.path}
                  onClick={handleAction}
                  className="flex items-center justify-end gap-2 group"
                >
                  <motion.span
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 }}
                    className="bg-white dark:bg-zinc-900 text-text-primary dark:text-zinc-300 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border dark:border-zinc-700/60 group-hover:border-accent transition-colors shadow-lg whitespace-nowrap"
                  >
                    {isAr ? action.labelAr : action.labelEn}
                  </motion.span>
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-border dark:border-zinc-700/60 flex items-center justify-center shadow-lg text-text-primary dark:text-zinc-300 group-hover:text-accent group-hover:border-accent transition-colors">
                    <Icon size={18} />
                  </div>
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggleOpen}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className="w-14 h-14 rounded-full bg-white dark:bg-zinc-950 text-accent flex items-center justify-center border-2 border-accent/65 hover:border-accent hover:bg-accent/10 transition-colors shadow-lg dark:shadow-[0_0_15px_rgba(212,175,55,0.25)]"
        aria-label={isOpen ? (isAr ? 'إغلاق القائمة' : 'Close menu') : (isAr ? 'فتح القائمة' : 'Open menu')}
      >
        <motion.div
          key={isOpen ? 'open' : 'closed'}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <Compass size={24} strokeWidth={1.75} />
        </motion.div>
      </motion.button>
    </div>
  )
}
