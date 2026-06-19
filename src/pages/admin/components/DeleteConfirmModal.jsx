import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { haptic } from '../../../hooks/useHaptics'
import { useI18n } from '../../../i18n/useI18n'

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  message,
}) {
  const { t, isAr } = useI18n()

  const defaultMessage = isAr
    ? `هل أنت متأكد من حذف "${itemName}"؟ لا يمكن التراجع عن هذا الإجراء.`
    : `Are you sure you want to delete "${itemName}"? This action cannot be undone.`

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-sm glass-card p-6"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-danger/10 border border-danger/30 flex items-center justify-center">
                <AlertTriangle size={28} className="text-danger" />
              </div>

              <div>
                <h3 className="text-lg font-bold mb-1">{title}</h3>
                <p className="text-sm text-text-secondary">
                  {message || defaultMessage}
                </p>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={() => {
                    haptic.light()
                    onClose()
                  }}
                  className="flex-1 py-3 rounded-xl bg-bg-surface border border-border hover:bg-bg-primary transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    haptic.heavy()
                    onConfirm()
                    onClose()
                  }}
                  className="flex-1 py-3 rounded-xl bg-danger text-white font-bold hover:bg-danger/90 transition-colors"
                >
                  {t('common.delete')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
