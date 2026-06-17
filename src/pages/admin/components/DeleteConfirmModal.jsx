import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'حذف الفريق',
  itemName,
  message,
}) {
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
                  {message ? (
                    message
                  ) : (
                    <>
                      هل أنت متأكد من حذف{' '}
                      <span className="text-text-primary font-bold">{itemName}</span>؟ لا يمكن التراجع
                      عن هذا الإجراء.
                    </>
                  )}
                </p>
              </div>

              <div className="flex gap-3 w-full mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-bg-surface border border-border hover:bg-bg-primary transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onConfirm()
                    onClose()
                  }}
                  className="flex-1 py-3 rounded-xl bg-danger text-white font-bold hover:bg-danger/90 transition-colors"
                >
                  حذف
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
