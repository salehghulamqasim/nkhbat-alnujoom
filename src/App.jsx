import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import GA4Tracker from './components/GA4Tracker'
import AppLayout from './components/layout/AppLayout'
import AdminLayout from './pages/admin/AdminLayout'
import HomePage from './pages/public/HomePage'
import TeamsPage from './pages/public/TeamsPage'
import TeamDetailPage from './pages/public/TeamDetailPage'
import MatchesPage from './pages/public/MatchesPage'
import ScheduleEagleEyePage from './pages/public/ScheduleEagleEyePage'
import StandingsPage from './pages/public/StandingsPage'
import TopScorersPage from './pages/public/TopScorersPage'
import LiveMatchPage from './pages/public/LiveMatchPage'
import MorePage from './pages/public/MorePage'
import NotFoundPage from './pages/public/NotFoundPage'
import LoginPage from './pages/admin/LoginPage'
import ErrorBoundary from './components/common/ErrorBoundary'
import DashboardPage from './pages/admin/DashboardPage'
import TeamsAdminPage from './pages/admin/TeamsAdminPage'
import DrawAdminPage from './pages/admin/DrawAdminPage'
import MatchesAdminPage from './pages/admin/MatchesAdminPage'
import ScheduleEagleEyeAdminPage from './pages/admin/ScheduleEagleEyePage'
import { useAppStore } from './stores/useAppStore'

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

  useEffect(() => {
    // Add theme-transition class after initial paint to prevent transitions on load
    const timer = setTimeout(() => {
      document.documentElement.classList.add('theme-transition')
    }, 150)
    return () => clearTimeout(timer)
  }, [])

  return (
    <ErrorBoundary>
      <GA4Tracker />
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
    </ErrorBoundary>
  )
}

export default App