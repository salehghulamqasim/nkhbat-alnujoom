export const TEAM_COLORS = [
  { id: 'red', hex: '#C8102E', nameEn: 'Red', nameAr: 'أحمر' },
  { id: 'navy', hex: '#003087', nameEn: 'Navy Blue', nameAr: 'كحلي' },
  { id: 'yellow', hex: '#FFCD00', nameEn: 'Yellow', nameAr: 'أصفر' },
  { id: 'green', hex: '#00A651', nameEn: 'Green', nameAr: 'أخضر' },
  { id: 'sky', hex: '#6CADDF', nameEn: 'Sky Blue', nameAr: 'أزرق فاتح' },
  { id: 'orange', hex: '#FF6600', nameEn: 'Orange', nameAr: 'برتقالي' },
  { id: 'black', hex: '#1A1A1A', nameEn: 'Black', nameAr: 'أسود' },
  { id: 'purple', hex: '#7B2D8B', nameEn: 'Purple', nameAr: 'بنفسجي' },
  { id: 'dark-red', hex: '#8B0000', nameEn: 'Dark Red', nameAr: 'أحمر داكن' },
  { id: 'grey', hex: '#9E9E9E', nameEn: 'Light Grey', nameAr: 'رمادي' },
  { id: 'gold', hex: '#B8860B', nameEn: 'Gold', nameAr: 'ذهبي' },
  { id: 'dark-green', hex: '#004D40', nameEn: 'Dark Green', nameAr: 'أخضر داكن' },
  { id: 'saudi-green', hex: '#006C35', nameEn: 'Saudi Green', nameAr: 'أخضر سعودي' },
]

export function getColorById(id) {
  return TEAM_COLORS.find((c) => c.id === id) || null
}

/**
 * Returns the hex value for a color ID, or null if not found.
 * Does NOT fall back to red — callers must handle null explicitly.
 */
export function getColorHex(colorId) {
  return getColorById(colorId)?.hex || null
}

/**
 * Returns a random color that is not in the excluded color ID list.
 * @param {string[]} excludeIds - Array of color IDs already in use by other teams
 */
export function getRandomTeamColor(excludeIds = []) {
  const available = TEAM_COLORS.filter((c) => !excludeIds.includes(c.id))
  const pool = available.length > 0 ? available : TEAM_COLORS
  return pool[Math.floor(Math.random() * pool.length)]
}

export function getTeamInitial(name) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}

export function resolveTeamColor(team) {
  if (team?.color) {
    const hex = getColorHex(team.color)
    if (hex) return hex
  }
  if (team?.colorHex) return team.colorHex
  // Neutral dark fallback — avoids false red color
  return '#4A5568'
}
