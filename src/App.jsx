import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import AppLayout from './components/layout/AppLayout'
import AdminLayout from './pages/admin/AdminLayout'
import ErrorBoundary from './components/common/ErrorBoundary'
import LoadingState from './components/common/LoadingState'
import { useAppStore } from './stores/useAppStore'

// ── Lazy-loaded route components ──
// Each page loads its JS only when the user navigates to it,
// meaning the initial bundle stays small and fast.
const HomePage = lazy(() => import('./pages/public/HomePage'))
const TeamsPage = lazy(() => import('./pages/public/TeamsPage'))
const TeamDetailPage = lazy(() => import('./pages/public/TeamDetailPage'))
const MatchesPage = lazy(() => import('./pages/public/MatchesPage'))
const ScheduleEagleEyePage = lazy(() => import('./pages/public/ScheduleEagleEyePage'))
const StandingsPage = lazy(() => import('./pages/public/StandingsPage'))
const TopScorersPage = lazy(() => import('./pages/public/TopScorersPage'))
const LiveMatchPage = lazy(() => import('./pages/public/LiveMatchPage'))
const MorePage = lazy(() => import('./pages/public/MorePage'))
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'))
const LoginPage = lazy(() => import('./pages/admin/LoginPage'))
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'))
const TeamsAdminPage = lazy(() => import('./pages/admin/TeamsAdminPage'))
const DrawAdminPage = lazy(() => import('./pages/admin/DrawAdminPage'))
const MatchesAdminPage = lazy(() => import('./pages/admin/MatchesAdminPage'))
const ScheduleEagleEyeAdminPage = lazy(() => import('./pages/admin/ScheduleEagleEyePage'))

function App() {
  const { theme, language } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    root.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [theme, language])

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingState message={language === 'ar' ? 'جاري التحميل...' : 'Loading...'} />}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/schedule" element={<ScheduleEagleEyePage />} />
              <Route path="/matches/:id" element={<LiveMatchPage />} />
              <Route path="/standings" element={<StandingsPage />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/teams/:id" element={<TeamDetailPage />} />
              <Route path="/top-scorers" element={<TopScorersPage />} />
              <Route path="/more" element={<MorePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            <Route path="/admin/login" element={<LoginPage />} />

            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<DashboardPage />} />
              <Route path="/admin/teams" element={<TeamsAdminPage />} />
              <Route path="/admin/matches" element={<MatchesAdminPage />} />
              <Route path="/admin/draw" element={<DrawAdminPage />} />
              <Route path="/admin/schedule" element={<ScheduleEagleEyeAdminPage />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  )
}

export default App