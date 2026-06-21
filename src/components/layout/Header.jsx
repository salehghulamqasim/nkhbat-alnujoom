import { useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react'
import { useAppStore } from '../../stores/useAppStore'
import { haptic } from '../../hooks/useHaptics'

const getPageTitle = (path, lang) => {
  if (path.startsWith('/matches/')) return lang === 'ar' ? 'تفاصيل المباراة' : 'Match Details'
  if (path.startsWith('/teams/')) return lang === 'ar' ? 'تفاصيل الفريق' : 'Team Details'
  if (path === '/matches') return lang === 'ar' ? 'جدول المباريات' : 'Match Schedule'
  if (path === '/standings') return lang === 'ar' ? 'ترتيب المجموعات' : 'Standings'
  if (path === '/teams') return lang === 'ar' ? 'الفرق المشاركة' : 'Teams'
  if (path === '/top-scorers') return lang === 'ar' ? 'الهدافون' : 'Top Scorers'
  if (path === '/more') return lang === 'ar' ? 'المزيد' : 'More Settings'
  return lang === 'ar' ? 'نخبة النجوم' : 'Nkhbat Alnujoom'
}

/** Smart fallback route for when there's no browser history */
const getBackFallback = (pathname) => {
  if (pathname.startsWith('/matches/')) return '/matches'
  if (pathname.startsWith('/teams/')) return '/teams'
  if (pathname === '/schedule') return '/'
  if (pathname === '/top-scorers') return '/'
  if (pathname === '/more') return '/'
  return '/'
}

export default function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const navType = useNavigationType()
  const { language, toggleLanguage } = useAppStore()

  const isHome = pathname === '/'
  const mainTabs = ['/', '/matches', '/standings', '/teams']
  const isMainTab = mainTabs.includes(pathname)

  // In Arabic (RTL), back button points Right (ChevronRight)
  // In English (LTR), back button points Left (ChevronLeft)
  const BackIcon = language === 'ar' ? ChevronRight : ChevronLeft

  const goBack = () => {
    haptic.light()
    // If user navigated from within the app (PUSH), browser history works
    // If they entered directly or refreshed (POP), use route-based fallback
    if (navType === 'PUSH') {
      navigate(-1)
    } else {
      navigate(getBackFallback(pathname))
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 glass z-50 px-4 flex items-center justify-between">
      {/* Left Side: Back button (sub/detail pages) or Settings icon (home screen) */}
      {!isMainTab ? (
        <button
          onClick={goBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-surface border border-border text-text-primary hover:bg-accent/10 hover:text-accent transition-colors active:scale-90"
          aria-label={language === 'ar' ? 'رجوع' : 'Go back'}
        >
          <BackIcon size={18} />
        </button>
      ) : (
        <button
          onClick={() => {
            haptic.light()
            navigate('/more')
          }}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-bg-surface border border-border text-text-secondary hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-all duration-200"
          aria-label={language === 'ar' ? 'الإعدادات' : 'Settings'}
        >
          <Settings size={18} strokeWidth={1.75} />
        </Link>
      )}

      {/* Center: Title (empty for home screen) */}
      <h1 className="text-base font-bold text-text-primary tracking-wide">
        {isHome ? '' : getPageTitle(pathname, language)}
      </h1>

      {/* Right Side: Language Toggle */}
      <button
        onClick={() => {
          haptic.medium()
          toggleLanguage()
        }}
        className="w-9 h-9 flex items-center justify-center rounded-xl border border-accent/20 bg-bg-surface text-xs font-bold text-accent hover:bg-accent hover:text-black transition-colors"
      >
        {language === 'ar' ? 'EN' : 'AR'}
      </button>
    </header>
  )
}