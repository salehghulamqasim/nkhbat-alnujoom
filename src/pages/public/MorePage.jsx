import { Link } from 'react-router-dom'
import { ShieldCheck, Trophy, ChevronLeft, Moon, Sun, Languages, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import DarkCard from '../../components/common/DarkCard'
import ContactFooter from '../../components/common/ContactFooter'
import { useAppStore } from '../../stores/useAppStore'
import { haptic } from '../../hooks/useHaptics'
import { useTranslation } from '../../hooks/useTranslation'
import { APP_VERSION } from '../../version'

export default function MorePage() {
  const { theme, toggleTheme, toggleLanguage } = useAppStore()
  const { t, lang } = useTranslation()
  const isRtl = lang === 'ar'

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight
  const tx = t.more

  return (
    <div className="pb-10">
      {/* Page Header */}
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="px-5 pt-6 pb-5"
      >
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{tx.title}</h1>
        <p className="text-sm text-text-secondary mt-1">{tx.subtitle}</p>
      </motion.div>

      {/* Preferences Section */}
      <section className="px-4">
        <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest px-1 mb-3">
          {tx.preferences}
        </p>

        <div className="space-y-2">
          {/* Theme Toggle */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}>
          <DarkCard
            hover
            className="p-4 flex items-center gap-4 group cursor-pointer"
            onClick={() => { haptic.medium(); toggleTheme() }}
          >
            <div className="w-11 h-11 rounded-xl bg-bg-surface border border-border flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors">
              {theme === 'dark'
                ? <Sun size={20} className="text-accent" />
                : <Moon size={20} className="text-accent" />
              }
            </div>
            <div className="flex-1 min-w-0 text-start">
              <h3 className="font-bold text-text-primary text-sm">{tx.theme}</h3>
              <p className="text-xs text-text-secondary">{tx.themeDesc}</p>
            </div>
            {/* Toggle pill */}
            <div className={`relative w-11 h-6 rounded-full transition-colors duration-300 shrink-0 ${theme === 'dark' ? 'bg-accent' : 'bg-border'}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${theme === 'dark' ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </DarkCard>
          </motion.div>

          {/* Language Toggle */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <DarkCard
            hover
            className="p-4 flex items-center gap-4 group cursor-pointer"
            onClick={() => { haptic.medium(); toggleLanguage() }}
          >
            <div className="w-11 h-11 rounded-xl bg-bg-surface border border-border flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors">
              <Languages size={20} className="text-accent" />
            </div>
            <div className="flex-1 min-w-0 text-start">
              <h3 className="font-bold text-text-primary text-sm">{tx.language}</h3>
              <p className="text-xs text-text-secondary">{tx.languageDesc}</p>
            </div>
            {/* Language pill indicator */}
            <div className="shrink-0 flex items-center bg-bg-surface border border-border rounded-full px-2.5 py-1 gap-1.5 text-[10px] font-bold">
              <span className={lang === 'ar' ? 'text-accent' : 'text-text-secondary'}>ع</span>
              <span className="text-border">|</span>
              <span className={lang === 'en' ? 'text-accent' : 'text-text-secondary'}>EN</span>
            </div>
          </DarkCard>
          </motion.div>

          {/* Admin Panel Link */}
          <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
          <Link to="/admin" className="block" onClick={() => haptic.light()}>
            <DarkCard hover className="p-4 flex items-center gap-4 group">
              <div className="w-11 h-11 rounded-xl bg-bg-surface border border-border flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/30 transition-colors">
                <ShieldCheck size={20} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0 text-start">
                <h3 className="font-bold text-text-primary text-sm">{tx.admin}</h3>
                <p className="text-xs text-text-secondary">{tx.adminDesc}</p>
              </div>
              <ArrowIcon size={16} className="text-text-secondary group-hover:text-accent transition-colors shrink-0" />
            </DarkCard>
          </Link>
          </motion.div>
        </div>
      </section>

      <div className="px-4">
        <ContactFooter />
      </div>

      {/* App Footer Branding */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="pt-10 flex justify-center"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-1">
            <Trophy size={24} className="text-accent" />
          </div>
          <p className="font-bold text-text-primary text-sm">{tx.appName}</p>
          {/* Developer version stamp — quiet, minimal, not decorative */}
          <p
            className="text-[11px] tabular-nums"
            style={{ color: 'var(--theme-text-secondary, #6b7280)', letterSpacing: '0.04em' }}
          >
            {APP_VERSION}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
