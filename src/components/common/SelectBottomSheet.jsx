import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'

/**
 * SelectBottomSheet – Replaces <select> with a gesture-driven bottom sheet.
 * Fully RTL-aware. Designed for dark glass aesthetic.
 *
 * Props:
 *   label       – string displayed above the trigger field
 *   value       – current selected value
 *   onChange    – callback(value)
 *   options     – [{ value, label }]
 *   placeholder – string when nothing is selected
 *   isOpen      – bool
 *   onOpen      – fn to open
 *   onClose     – fn to close
 *   isAr        – bool (RTL)
 */
export default function SelectBottomSheet({
  label,
  value,
  onChange,
  options = [],
  placeholder,
  isOpen,
  onOpen,
  onClose,
  isAr = true,
}) {
  const selectedOption = options.find((o) => o.value === value)

  // Scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSelect = (optValue) => {
    onChange(optValue)
    onClose()
  }

  const handleDragEnd = (_, info) => {
    if (info.offset.y > 80 || info.velocity.y > 400) onClose()
  }

  return (
    <>
      {/* Trigger field */}
      <div>
        {label && (
          <label className="block text-sm text-text-secondary mb-2 text-right">
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={onOpen}
          className="w-full bg-bg-surface border border-border rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-accent transition-colors flex items-center justify-between gap-2"
          dir={isAr ? 'rtl' : 'ltr'}
        >
          <span className={selectedOption ? 'text-text-primary' : 'text-text-secondary'}>
            {selectedOption ? selectedOption.label : (placeholder || (isAr ? 'اختر...' : 'Select...'))}
          </span>
          <ChevronDown size={16} className="text-text-secondary shrink-0" />
        </button>
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="sbs-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-[2px]"
              onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
              key="sbs-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              drag="y"
              dragConstraints={{ top: 0 }}
              dragElastic={0.12}
              onDragEnd={handleDragEnd}
              className="fixed inset-x-0 bottom-0 z-[70] rounded-t-[22px] overflow-hidden shadow-2xl bg-bg-surface border-t border-border"
              style={{
                paddingBottom: 'env(safe-area-inset-bottom, 16px)',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing select-none">
                <div className="w-9 h-1.5 rounded-full bg-text-secondary/20" />
              </div>

              {/* Sheet label */}
              {label && (
                <p
                  className="text-[11px] font-bold uppercase tracking-widest text-text-secondary px-5 pt-2 pb-3"
                  dir={isAr ? 'rtl' : 'ltr'}
                >
                  {label}
                </p>
              )}

              {/* Option list */}
              <div className="overflow-y-auto max-h-[52vh] px-3 pb-4 space-y-1">
                {options.map((option) => {
                  const isSelected = option.value === value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors text-right ${
                        isSelected
                          ? 'bg-accent/15 text-accent'
                          : 'text-text-primary hover:bg-bg-surface/60 active:bg-bg-surface'
                      }`}
                      dir={isAr ? 'rtl' : 'ltr'}
                    >
                      <span className="flex-1">{option.label}</span>
                      {isSelected && <Check size={16} className="shrink-0 text-accent" />}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
