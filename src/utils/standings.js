export function calculateStandings(teams, matches, group) {
  const groupTeams = teams.filter((t) => t.group === group)
  const groupMatches = matches.filter(
    (m) => m.group === group && m.status === 'completed' && m.result
  )

  const table = {}
  groupTeams.forEach((team) => {
    table[team.id] = {
      id: team.id,
      name: team.name,
      logo: team.logo,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gf: 0,
      ga: 0,
      pts: 0,
    }
  })

  groupMatches.forEach((match) => {
    const { scoreA, scoreB } = match.result
    const teamA = table[match.teamA]
    const teamB = table[match.teamB]
    if (!teamA || !teamB) return

    teamA.played++
    teamB.played++
    teamA.gf += scoreA
    teamA.ga += scoreB
    teamB.gf += scoreB
    teamB.ga += scoreA

    if (scoreA > scoreB) {
      teamA.won++
      teamA.pts += 3
      teamB.lost++
    } else if (scoreB > scoreA) {
      teamB.won++
      teamB.pts += 3
      teamA.lost++
    } else {
      teamA.drawn++
      teamB.drawn++
      teamA.pts++
      teamB.pts++
    }
  })

  return Object.values(table).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    const diffA = a.gf - a.ga
    const diffB = b.gf - b.ga
    if (diffB !== diffA) return diffB - diffA
    return b.gf - a.gf
  })
}

export function getTeamStandingRank(teams, matches, teamId) {
  const team = teams.find((t) => t.id === teamId)
  if (!team?.group) return null
  const standings = calculateStandings(teams, matches, team.group)
  const rank = standings.findIndex((t) => t.id === teamId) + 1
  return rank > 0 ? rank : null
}
