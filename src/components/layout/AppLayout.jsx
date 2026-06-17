import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import QuickAccessFAB from './QuickAccessFAB'

export default function AppLayout() {
  const { pathname } = useLocation()
  
  const isHome = pathname === '/'
  const mainTabs = ['/', '/matches', '/standings', '/teams']
  const showHeader = !isHome && !mainTabs.includes(pathname) // Hide header on all main pages including home
  const paddingTop = showHeader ? 'pt-16' : ''

  return (
    <div className={`min-h-screen bg-bg-primary text-text-primary pb-20 transition-colors duration-300 ${paddingTop}`}>
      {showHeader && <Header />}
      
      <main className={`w-full min-h-[calc(100vh-8rem)] relative ${isHome ? '' : 'max-w-md mx-auto'}`}>
        <Outlet />
      </main>
      
      <QuickAccessFAB />
      <BottomNav />
    </div>
  )
}

