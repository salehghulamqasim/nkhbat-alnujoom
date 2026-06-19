import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { useAppStore } from '../../stores/useAppStore'
import { Trophy, LogOut, LayoutDashboard, Users, Calendar, Shuffle, RotateCcw } from 'lucide-react'
import AdminDataSync from '../../components/providers/AdminDataSync'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import AdminErrorBanner from '../../components/common/AdminErrorBanner'
import AdminBottomNav from '../../components/layout/AdminBottomNav'
import { useTeamsStore } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'
import { useI18n } from '../../i18n/useI18n'

const navItemsEn = [
  { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/admin/teams', label: 'Teams', icon: Users },
  { path: '/admin/matches', label: 'Matches', icon: Calendar },
  { path: '/admin/draw', label: 'Draw', icon: Shuffle },
  { path: '/admin/schedule', label: 'Eagle Eye', icon: RotateCcw },
]

const navItemsAr = [
  { path: '/admin/dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
  { path: '/admin/teams', label: 'إدارة الفرق', icon: Users },
  { path: '/admin/matches', label: 'المباريات', icon: Calendar },
  { path: '/admin/draw', label: 'القرعة', icon: Shuffle },
  { path: '/admin/schedule', label: 'نظرة النسر', icon: RotateCcw },
]

export default function AdminLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()
  const navigate = useNavigate()
  const teamsLoading = useTeamsStore((s) => s.loading && !s.initialized)
  const matchesLoading = useMatchesStore((s) => s.loading && !s.initialized)
  const teamsFetchError = useTeamsStore((s) => s.fetchError)
  const matchesFetchError = useMatchesStore((s) => s.fetchError)
  const fetchTeams = useTeamsStore((s) => s.fetchAll)
  const fetchMatches = useMatchesStore((s) => s.fetchAll)
  const initFailed = !teamsLoading && !matchesLoading && (teamsFetchError || matchesFetchError)
  const { t, isAr } = useI18n()

  const navItems = isAr ? navItemsAr : navItemsEn

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const loadingMsg = isAr ? 'جاري تحميل بيانات الإدارة...' : 'Loading admin data...'

  return (
    <AdminDataSync>
      <div className="min-h-screen bg-bg-primary flex flex-col transition-colors duration-300">
        <header className="h-14 md:h-16 bg-bg-primary border-b border-border px-3 md:px-4 flex items-center justify-between sticky top-0 z-50 gap-2">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-black transition-all text-[10px] md:text-xs font-semibold shrink-0"
            >
              <Trophy size={14} />
              <span className="hidden sm:inline">{t('nav.backToApp')}</span>
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold text-sm md:text-base leading-tight truncate">Admin</h1>
              <span className="text-[9px] md:text-[10px] text-accent">نخبة النجوم</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => useAppStore.getState().toggleLanguage()}
              className="text-[10px] md:text-xs px-2 py-1 rounded-lg bg-bg-surface border border-border hover:border-accent/30 transition-colors font-medium"
              aria-label="Toggle language"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs md:text-sm text-text-secondary hover:text-danger transition-colors"
            >
              <span className="hidden sm:inline">{t('nav.logout')}</span>
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
          <AdminBottomNav />

          <aside className="hidden md:block md:w-56 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:border-e md:border-border md:pb-4 shrink-0">
            <nav className="md:pt-6 md:px-3">
              <ul className="flex flex-col gap-0.5">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path
                  const Icon = item.icon
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-accent/10 text-accent border border-accent/20'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                        }`}
                      >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          <main className="flex-1 p-3 md:p-4 pb-24 md:pb-8 overflow-y-auto">
            {teamsLoading || matchesLoading ? (
              <LoadingState message={loadingMsg} />
            ) : initFailed ? (
              <ErrorState
                message={teamsFetchError || matchesFetchError || t('admin.loadError')}
                onRetry={() => {
                  fetchTeams()
                  fetchMatches()
                }}
              />
            ) : (
              <div className="max-w-4xl mx-auto">
                <AdminErrorBanner />
                <Outlet />
              </div>
            )}
          </main>
        </div>
      </div>
    </AdminDataSync>
  )
}
