export function formatMatchDate(dateStr, lang = 'ar') {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const matchDay = new Date(date)
  matchDay.setHours(0, 0, 0, 0)

  const isAr = lang === 'ar'
  if (matchDay.getTime() === today.getTime()) return isAr ? 'اليوم' : 'Today'
  if (matchDay.getTime() === tomorrow.getTime()) return isAr ? 'غداً' : 'Tomorrow'
  const locale = isAr ? 'ar-SA' : 'en-US'
  return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
}

export function getMatchDisplayStatus(match) {
  if (match.status === 'live') return 'live'
  if (match.status === 'completed') return 'completed'
  if (match.status === 'postponed') return 'postponed'
  return 'upcoming'
}

export function groupMatchesByDate(matches) {
  const groups = {}
  matches.forEach((match) => {
    const key = match.date || 'unknown'
    if (!groups[key]) groups[key] = []
    groups[key].push(match)
  })
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
}

export function enrichMatch(match, teams) {
  const teamA = teams.find((t) => t.id === match.teamA)
  const teamB = teams.find((t) => t.id === match.teamB)
  return {
    ...match,
    home: teamA?.name || '—',
    away: teamB?.name || '—',
    homeLogo: teamA?.logo,
    awayLogo: teamB?.logo,
    homeColor: teamA?.color,
    awayColor: teamB?.color,
    teamAData: teamA,
    teamBData: teamB,
  }
}
