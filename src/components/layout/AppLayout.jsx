import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from './Header'
import BottomNav from './BottomNav'
import QuickAccessFAB from './QuickAccessFAB'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
}

export default function AppLayout() {
  const { pathname } = useLocation()
  
  const isHome = pathname === '/'
  const mainTabs = ['/', '/matches', '/standings', '/teams']
  const showHeader = !isHome && !mainTabs.includes(pathname)
  const paddingTop = showHeader ? 'pt-16' : ''

  return (
    <div className={`min-h-screen bg-bg-primary text-text-primary pb-20 transition-colors duration-300 ${paddingTop}`}>
      {showHeader && <Header />}
      
      <main className={`w-full min-h-[calc(100vh-8rem)] relative ${isHome ? '' : 'max-w-md mx-auto'}`}>
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Outlet />
        </motion.div>
      </main>
      
      <QuickAccessFAB />
      <BottomNav />
    </div>
  )
}

