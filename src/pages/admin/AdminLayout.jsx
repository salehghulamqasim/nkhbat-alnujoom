import { useState } from 'react'
import { Navigate, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/useAuthStore'
import { Trophy, LogOut, LayoutDashboard, Users, Calendar, Shuffle, RotateCcw } from 'lucide-react'
import AdminDataSync from '../../components/providers/AdminDataSync'
import LoadingState from '../../components/common/LoadingState'
import ErrorState from '../../components/common/ErrorState'
import AdminErrorBanner from '../../components/common/AdminErrorBanner'
import AdminBottomNav from '../../components/layout/AdminBottomNav'
import { useTeamsStore } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'

export default function AdminLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const teamsLoading = useTeamsStore((s) => s.loading && !s.initialized)
  const matchesLoading = useMatchesStore((s) => s.loading && !s.initialized)
  const teamsFetchError = useTeamsStore((s) => s.fetchError)
  const matchesFetchError = useMatchesStore((s) => s.fetchError)
  const fetchTeams = useTeamsStore((s) => s.fetchAll)
  const fetchMatches = useMatchesStore((s) => s.fetchAll)
  const initFailed = !teamsLoading && !matchesLoading && (teamsFetchError || matchesFetchError)

  if (!isAuthenticated && !isLoggingOut) {
    return <Navigate to="/admin/login" replace />
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    navigate('/', { replace: true })
    logout()
  }

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
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-danger transition-colors"
          >
            <span>خروج</span>
            <LogOut size={16} />
          </button>
        </header>

        <div className="flex-1 flex flex-col md:flex-row w-full max-w-7xl mx-auto">
          <AdminBottomNav />

          <aside className="hidden md:block md:w-56 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:border-e md:border-border md:pb-4 shrink-0">
            <nav className="md:pt-6 md:px-3" dir="rtl">
              <ul className="flex flex-col gap-0.5">
                {[
                  { path: '/admin/dashboard', label: 'نظرة عامة', icon: LayoutDashboard },
                  { path: '/admin/teams', label: 'إدارة الفرق', icon: Users },
                  { path: '/admin/matches', label: 'المباريات', icon: Calendar },
                  { path: '/admin/draw', label: 'القرعة', icon: Shuffle },
                  { path: '/admin/schedule', label: 'نظرة النسر', icon: RotateCcw },
                ].map((item) => {
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
