import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { haptic } from '../../hooks/useHaptics'

export default function BottomSheet({ isOpen, onClose, children, title }) {
  // Lock scroll on body when bottom sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleClose = () => {
    haptic.light()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-xs"
          />

          {/* Bottom Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={(event, info) => {
              // Trigger close state if swiped down far enough or with high speed
              if (info.offset.y > 100 || info.velocity.y > 500) {
                handleClose()
              }
            }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] bg-glass-panel backdrop-blur-xl border-t border-glass-border rounded-t-[24px] shadow-2xl flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom,16px)]"
          >
            {/* Drag Handle & Header */}
            <div className="flex flex-col items-center pt-3 pb-2 shrink-0 cursor-grab active:cursor-grabbing select-none">
              {/* Center drag handle */}
              <div className="w-10 h-1.5 rounded-full bg-text-secondary/20 mb-3" />
              
              {/* Header text and close cross */}
              {(title || onClose) && (
                <div className="w-full px-5 flex items-center justify-between">
                  <h3 className="text-base font-bold text-text-primary leading-none select-text">
                    {title}
                  </h3>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-text-secondary/10 hover:bg-text-secondary/20 text-text-secondary transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
            </div>

            {/* Content box */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
