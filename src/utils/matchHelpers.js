export function formatMatchDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const matchDay = new Date(date)
  matchDay.setHours(0, 0, 0, 0)

  if (matchDay.getTime() === today.getTime()) return 'اليوم'
  if (matchDay.getTime() === tomorrow.getTime()) return 'غداً'
  return date.toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function getMatchDisplayStatus(match) {
  if (match.status === 'live') return 'live'
  if (match.status === 'completed') return 'completed'
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
    teamAData: teamA,
    teamBData: teamB,
  }
}
