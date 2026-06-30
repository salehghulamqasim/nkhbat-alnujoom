import { useMemo } from 'react'

/** Deterministic meteor positions — stable across re-renders */
const METEOR_SEEDS = [
  { left: 12, delay: 0.2, duration: 4.2, length: 52 },
  { left: 28, delay: 1.8, duration: 3.6, length: 44 },
  { left: 45, delay: 3.1, duration: 5.0, length: 60 },
  { left: 62, delay: 0.9, duration: 4.8, length: 48 },
  { left: 78, delay: 2.4, duration: 3.9, length: 56 },
  { left: 88, delay: 4.2, duration: 4.5, length: 40 },
  { left: 35, delay: 5.5, duration: 5.2, length: 50 },
  { left: 55, delay: 6.8, duration: 4.0, length: 46 },
]

/**
 * Subtle meteor shower — limited count, GPU-friendly transforms only.
 */
export default function Meteors({ number = 8, className = '' }) {
  const meteors = useMemo(
    () => METEOR_SEEDS.slice(0, Math.min(number, METEOR_SEEDS.length)),
    [number]
  )

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {meteors.map((m) => (
        <span
          key={m.left}
          className="meteor"
          style={{
            left: `${m.left}%`,
            animationDelay: `${m.delay}s`,
            animationDuration: `${m.duration}s`,
            width: `${m.length}px`,
          }}
        />
      ))}
    </div>
  )
}
