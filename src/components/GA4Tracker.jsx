import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Lightweight GA4 page view tracker for SPA
// Reads Measurement ID from VITE_GA4_ID env variable
export default function GA4Tracker() {
  const location = useLocation()

  useEffect(() => {
    const measurementId = import.meta.env.VITE_GA4_ID
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') return

    // Send page_view on route change
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_path: location.pathname + location.search,
        page_title: document.title,
      })
    }
  }, [location])

  return null
}
