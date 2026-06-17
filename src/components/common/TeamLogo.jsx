import { Users } from 'lucide-react'

export default function TeamLogo({ logo, name, size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl',
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-bg-surface flex items-center justify-center border border-border overflow-hidden shrink-0 ${className}`}
    >
      {logo ? (
        <img src={logo} alt={name || 'شعار الفريق'} className="w-full h-full object-cover" />
      ) : (
        <Users className="text-text-secondary" size={size === 'sm' ? 14 : size === 'md' ? 18 : 24} />
      )}
    </div>
  )
}
