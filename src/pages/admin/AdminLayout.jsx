import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { Trophy, LogOut, Home, Users, Calendar, Shuffle } from 'lucide-react'
import AdminDataSync from '../../components/providers/AdminDataSync'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import AdminErrorBanner from '../../components/common/AdminErrorBanner'
import { useTeamsStore } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'

export default function AdminLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const location = useLocation()
  const teamsLoading = useTeamsStore((s) => s.loading && !s.initialized)
  const matchesLoading = useMatchesStore((s) => s.loading && !s.initialized)
  const teamsFetchError = useTeamsStore((s) => s.fetchError)
  const matchesFetchError = useMatchesStore((s) => s.fetchError)
  const fetchTeams = useTeamsStore((s) => s.fetchAll)
  const fetchMatches = useMatchesStore((s) => s.fetchAll)
  const initFailed = !teamsLoading && !matchesLoading && (teamsFetchError || matchesFetchError)

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  const navItems = [
    { path: '/admin/dashboard', label: 'نظرة عامة', icon: Home },
    { path: '/admin/teams', label: 'إدارة الفرق', icon: Users },
    { path: '/admin/matches', label: 'المباريات', icon: Calendar },
    { path: '/admin/draw', label: 'القرعة', icon: Shuffle },
  ]

  return (
    <AdminDataSync>
      <div className="min-h-screen bg-bg-primary flex flex-col transition-colors duration-300">
        <header className="h-16 bg-bg-primary border-b border-border px-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-accent hover:bg-accent hover:text-black transition-all text-xs font-semibold"
            >
              <Trophy size={16} />
              <span>العودة للتطبيق</span>
            </Link>
            <div>
              <h1 className="font-bold leading-tight">الإدارة</h1>
              <span className="text-[10px] text-accent">نخبة النجوم</span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-danger transition-colors"
          >
            <span>خروج</span>
            <LogOut size={16} />
          </button>
        </header>

        <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
          <nav className="fixed bottom-0 left-0 right-0 h-16 bg-bg-nav border-t border-border z-40 md:sticky md:top-16 md:w-64 md:h-[calc(100vh-4rem)] md:border-t-0 md:border-e md:border-border flex md:flex-col pb-safe md:pb-0 shrink-0">
            <ul className="flex items-center justify-around h-full md:flex-col md:justify-start md:p-4 md:gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                const Icon = item.icon
                return (
                  <li key={item.path} className="flex-1 md:w-full md:flex-none">
                    <Link
                      to={item.path}
                      className={`flex flex-col md:flex-row items-center justify-center md:justify-start h-full md:h-12 md:px-4 gap-1 md:gap-3 rounded-xl transition-colors ${
                        isActive
                          ? 'text-accent md:bg-bg-surface'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-surface'
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
                      <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <main className="flex-1 p-4 pb-24 md:pb-8 overflow-y-auto">
            {teamsLoading || matchesLoading ? (
              <LoadingState message="جاري تحميل بيانات الإدارة..." />
            ) : initFailed ? (
              <ErrorState
                message={teamsFetchError || matchesFetchError || 'تعذر تحميل بيانات الإدارة'}
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
