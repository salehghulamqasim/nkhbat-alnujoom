import { Link } from 'react-router-dom'
import { ShieldCheck, Trophy, ChevronLeft, Moon, Sun, Languages, ChevronRight } from 'lucide-react'
import DarkCard from '../../components/common/DarkCard'
import { useAppStore } from '../../stores/useAppStore'

export default function MorePage() {
  const { theme, toggleTheme, language, toggleLanguage } = useAppStore()
  const lang = language === 'ar' ? 'ar' : 'en'
  const isRtl = lang === 'ar'

  const ArrowIcon = isRtl ? ChevronLeft : ChevronRight

  const t = {
    ar: {
      title: 'الإعدادات',
      subtitle: 'تخصيص المظهر وتفضيلات التطبيق',
      preferences: 'تفضيلات التطبيق',
      theme: 'المظهر',
      themeDark: 'داكن',
      themeLight: 'فاتح',
      themeDesc: 'تبديل بين الوضع الداكن والفاتح',
      language: 'اللغة',
      languageDesc: 'تغيير لغة واجهة التطبيق',
      admin: 'لوحة التحكم',
      adminDesc: 'إدارة البطولة والنتائج والفرق',
      appName: 'بطولة نخبة النجوم',
      version: 'الإصدار 2026',
    },
    en: {
      title: 'Settings',
      subtitle: 'Customize the appearance and preferences',
      preferences: 'App Preferences',
      theme: 'Theme',
      themeDark: 'Dark',
      themeLight: 'Light',
      themeDesc: 'Toggle between dark and light mode',
      language: 'Language',
      languageDesc: 'Change the app interface language',
      admin: 'Admin Panel',
      adminDesc: 'Manage tournament, scores, and teams',
      appName: 'Star Elite Cup',
      version: 'Version 2026',
    },
  }

  const tx = t[lang]

  return (
    <div className="pb-10">
      {/* Page Header */}
      <div className="px-5 pt-6 pb-5">
        <h1 className="text-2xl font-extrabold text-text-primary tracking-tight">{tx.title}</h1>
        <p className="text-sm text-text-secondary mt-1">{tx.subtitle}</p>
      </div>

      {/* Preferences Section */}
      <section className="px-4">
        <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest px-1 mb-3">
          {tx.preferences}
        </p>

        <div className="space-y-2">
          {/* Theme Toggle */}
          <DarkCard
            hover
            className="p-4 flex items-center gap-4 group cursor-pointer"
            onClick={toggleTheme}
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

          {/* Language Toggle */}
          <DarkCard
            hover
            className="p-4 flex items-center gap-4 group cursor-pointer"
            onClick={toggleLanguage}
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

          {/* Admin Panel Link */}
          <Link to="/admin" className="block">
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
        </div>
      </section>

      {/* App Footer Branding */}
      <div className="pt-10 flex justify-center">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-1">
            <Trophy size={24} className="text-accent" />
          </div>
          <p className="font-bold text-text-primary text-sm">{tx.appName}</p>
          <p className="text-xs text-text-secondary">{tx.version}</p>
        </div>
      </div>
    </div>
  )
}
