import { useAppStore } from '../../stores/useAppStore'

/**
 * Full-screen light beam — fixed to the top of the viewport so the beam
 * appears to originate from the top of the screen naturally.
 */
export default function LightRays({ className = '' }) {
  const theme = useAppStore((s) => s.theme)
  const variant = theme === 'dark' ? 'light-rays-dark' : 'light-rays-light'

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 h-[60vh] z-0 overflow-hidden ${variant} ${className}`}
      aria-hidden="true"
    >
      <div className="light-beam" />
    </div>
  )
}
