import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, ChevronDown, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import { haptic } from '../../hooks/useHaptics'

export default function DownloadButton({ onDownload, isAr }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleDownloadClick = async (format) => {
    // 1. Immediately disable and show loading BEFORE anything else
    setIsLoading(true)
    setShowMenu(false)
    haptic.medium()

    // Defer the heavy import and canvas execution so React can commit the state change
    // and render the spinner before the main thread is blocked.
    setTimeout(async () => {
      try {
        // 2. Perform the download action
        await onDownload(format)
        // 3. Success feedback
        toast.success(
          isAr ? 'تم تحميل الجدول بنجاح!' : 'Schedule downloaded successfully!',
          {
            style: {
              background: 'var(--theme-bg-card)',
              color: 'var(--theme-text-primary)',
              border: '1px solid var(--theme-border)',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'Cairo, sans-serif'
            },
            iconTheme: {
              primary: 'var(--theme-accent)',
              secondary: 'var(--theme-bg-card)'
            }
          }
        )
        haptic.intense()
      } catch (err) {
        console.error('Download error caught in wrapper:', err)
        // 4. Error feedback
        toast.error(
          isAr ? 'فشل التحميل. يرجى المحاولة مرة أخرى.' : 'Failed to download. Please try again.',
          {
            style: {
              background: 'var(--theme-bg-card)',
              color: 'var(--theme-text-primary)',
              border: '1px solid var(--theme-border)',
              borderRadius: '12px',
              fontSize: '13px',
              fontFamily: 'Cairo, sans-serif'
            }
          }
        )
      } finally {
        // 5. Always unlock the button
        setIsLoading(false)
      }
    }, 50)
  }

  return (
    <div className="relative inline-block text-start" ref={menuRef}>
      <button
        type="button"
        disabled={isLoading}
        onClick={() => {
          if (!isLoading) {
            haptic.light()
            setShowMenu(!showMenu)
          }
        }}
        className="download-btn-glass"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-center h-full w-full"
            >
              <div className="download-spinner" />
            </motion.div>
          ) : (
            <motion.div
              key="label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5 justify-center h-full w-full text-xs font-semibold"
            >
              <Download size={13} />
              <span>{isAr ? 'تحميل' : 'Download'}</span>
              <ChevronDown size={11} className="opacity-70" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {showMenu && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute top-full end-0 mt-2 w-36 bg-bg-card/95 backdrop-blur-xl border border-border/80 rounded-xl py-1 shadow-lg z-50 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => handleDownloadClick('png')}
              className="w-full px-4 py-2.5 text-xs text-text-primary hover:bg-bg-surface flex items-center gap-2 cursor-pointer text-start transition-colors font-medium"
            >
              <Download size={12} className="text-text-secondary" /> PNG Image
            </button>
            <button
              type="button"
              onClick={() => handleDownloadClick('pdf')}
              className="w-full px-4 py-2.5 text-xs text-text-primary hover:bg-bg-surface flex items-center gap-2 cursor-pointer text-start transition-colors font-medium border-t border-border/30"
            >
              <FileText size={12} className="text-text-secondary" /> PDF Document
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
