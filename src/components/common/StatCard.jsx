import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import DarkCard from './DarkCard'

export default function StatCard({ value, label, delay = 0, className = '' }) {
  const numberRef = useRef(null)

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        numberRef.current,
        { innerHTML: 0 },
        {
          innerHTML: value,
          duration: 1.5,
          delay,
          ease: 'power2.out',
          snap: { innerHTML: 1 },
        }
      )
    })

    return () => ctx.revert()
  }, [value, delay])

  return (
    <DarkCard className={`flex flex-col items-center justify-center p-2 ${className}`}>
      <span ref={numberRef} className="text-xl font-bold text-text-primary mb-1 leading-none">
        {value}
      </span>
      <span className="text-xs md:text-sm text-text-secondary whitespace-nowrap">{label}</span>
    </DarkCard>
  )
}

