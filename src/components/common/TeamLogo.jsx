import { resolveTeamColor, getTeamInitial } from '../../utils/teamColors'

export default function TeamLogo({ logo, name, color, size = 'md', className = '' }) {
  const sizes = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl',
  }

  const teamColor = resolveTeamColor({ color })

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center overflow-hidden shrink-0 ${className}`}
      style={
        !logo
          ? { backgroundColor: teamColor, border: `2px solid ${teamColor}` }
          : { backgroundColor: 'var(--bg-surface, #1a1a1a)', border: '1px solid var(--border, #333)' }
      }
    >
      {logo ? (
        <img src={logo} alt={name || 'Team logo'} className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-white drop-shadow-sm">{getTeamInitial(name)}</span>
      )}
    </div>
  )
}
