import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import BottomNav from './BottomNav'
import QuickAccessFAB from './QuickAccessFAB'

export default function AppLayout() {
  const location = useLocation()
  const { pathname } = location
  
  const isHome = pathname === '/'
  const mainTabs = ['/', '/matches', '/standings', '/teams']
  const showHeader = !isHome && !mainTabs.includes(pathname)
  const paddingTop = showHeader ? 'pt-16' : ''

  // Using 100dvh for mobile-friendly full height lock
  // Using overflow-hidden on the parent, overflow-y-auto on the main content
  return (
    <div className="h-[100dvh] w-full overflow-hidden flex flex-col bg-bg-primary text-text-primary transition-colors duration-300">
      {showHeader && <Header />}
      
      <main 
        className={`flex-1 overflow-y-auto overflow-x-hidden relative w-full ${paddingTop} ${isHome ? '' : 'max-w-md mx-auto'}`}
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <Outlet />
      </main>
      
      <QuickAccessFAB />
      <BottomNav />
    </div>
  )
}
