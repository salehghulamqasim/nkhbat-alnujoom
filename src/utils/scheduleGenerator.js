const GROUPS = ['A', 'B', 'C']
const MATCHES_PER_GROUP = 6 // round-robin for 4 teams

export function roundRobinPairings(teamIds) {
  const pairings = []
  for (let i = 0; i < teamIds.length; i++) {
    for (let j = i + 1; j < teamIds.length; j++) {
      pairings.push([teamIds[i], teamIds[j]])
    }
  }
  return pairings
}

function formatDateOffset(baseDate, dayOffset) {
  const date = new Date(baseDate + 'T12:00:00')
  date.setDate(date.getDate() + dayOffset)
  return date.toISOString().split('T')[0]
}

function getDefaultStartDate() {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  return date.toISOString().split('T')[0]
}

export function buildGroupSchedule({
  group,
  teamIds,
  startDate,
  dayOffset = 0,
  defaultTime = '18:00',
  defaultVenue = 'ملاعب فيا',
}) {
  const baseDate = startDate || getDefaultStartDate()
  return roundRobinPairings(teamIds).map(([teamA, teamB], index) => ({
    group,
    teamA,
    teamB,
    date: formatDateOffset(baseDate, dayOffset + Math.floor(index / 2)),
    time: defaultTime,
    venue: defaultVenue,
  }))
}

export function buildFullSchedule(teams, options = {}) {
  const startDate = options.startDate || getDefaultStartDate()
  const schedules = []

  GROUPS.forEach((group, groupIndex) => {
    const groupTeamIds = teams.filter((t) => t.group === group).map((t) => t.id)
    if (groupTeamIds.length < 2) return

    schedules.push(
      ...buildGroupSchedule({
        group,
        teamIds: groupTeamIds,
        startDate,
        dayOffset: groupIndex * 3,
        defaultTime: options.defaultTime,
        defaultVenue: options.defaultVenue,
      })
    )
  })

  return schedules
}

export function getExpectedMatchCount(teamCountPerGroup = 4) {
  return GROUPS.length * ((teamCountPerGroup * (teamCountPerGroup - 1)) / 2)
}

export { MATCHES_PER_GROUP, GROUPS }
