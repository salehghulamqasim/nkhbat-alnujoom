import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const tx = t.notFound

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <div className="text-8xl sm:text-9xl font-black text-accent/20 select-none mb-4">
        404
      </div>

      <div className="w-20 h-20 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-6">
        <ArrowLeft size={36} className="text-accent ltr:rotate-180" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
        {tx.title}
      </h1>

      <p className="text-text-secondary text-sm sm:text-base max-w-sm mb-1">
        {tx.subtitle}
      </p>

      <p className="text-text-secondary/60 text-xs sm:text-sm max-w-xs mb-8">
        {tx.desc}
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-black font-bold text-sm hover:bg-accent-light transition-all shadow-lg shadow-accent/20"
      >
        <Home size={18} strokeWidth={2} />
        {tx.home}
      </Link>
    </div>
  )
}
