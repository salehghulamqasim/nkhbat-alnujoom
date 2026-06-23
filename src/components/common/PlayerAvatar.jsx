import { User } from 'lucide-react'
import { getTeamInitial } from '../../utils/teamColors'

function photoSrc(photo) {
  if (!photo) return null
  return photo.startsWith('data:') ? photo : `data:image/png;base64,${photo}`
}

export default function PlayerAvatar({
  name,
  photo,
  teamColor,
  size = 'md',
  rank,
  className = '',
}) {
  const sizes = {
    sm: { box: 'w-10 h-10', text: 'text-xs', icon: 14, badge: 'w-5 h-5 text-[9px] -bottom-1 -right-1' },
    md: { box: 'w-14 h-14', text: 'text-sm', icon: 18, badge: 'w-6 h-6 text-xs -bottom-1.5 -right-1.5' },
    lg: { box: 'w-16 h-16', text: 'text-base', icon: 22, badge: 'w-7 h-7 text-xs -bottom-2 -right-2' },
  }
  const s = sizes[size] || sizes.md
  const src = photoSrc(photo)
  const borderColor = teamColor || '#C8102E'

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${s.box} rounded-full flex items-center justify-center overflow-hidden bg-bg-surface`}
        style={{ border: `2.5px solid ${borderColor}`, boxShadow: `0 0 12px ${borderColor}33` }}
      >
        {src ? (
          <img src={src} alt={name || ''} className="w-full h-full object-cover" />
        ) : name ? (
          <span className={`${s.text} font-bold text-text-primary`}>{getTeamInitial(name)}</span>
        ) : (
          <User size={s.icon} className="text-text-secondary" />
        )}
      </div>
      {rank != null && (
        <div
          className={`absolute ${s.badge} rounded-full font-bold flex items-center justify-center border-2 border-bg-card`}
          style={{ backgroundColor: borderColor, color: '#fff' }}
        >
          {rank}
        </div>
      )}
    </div>
  )
}
