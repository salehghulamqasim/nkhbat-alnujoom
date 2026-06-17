export function calculateTopScorers(teams, matches) {
  const scorerMap = {}

  matches
    .filter((m) => m.status === 'completed' && m.result?.scorers)
    .forEach((match) => {
      match.result.scorers.forEach((scorer) => {
        const team = teams.find((t) => t.id === scorer.teamId)
        const key = `${scorer.player}-${scorer.teamId}`
        if (!scorerMap[key]) {
          scorerMap[key] = {
            id: key,
            name: scorer.player,
            team: team?.name || '—',
            teamId: scorer.teamId,
            logo: team?.logo || null,
            goals: 0,
          }
        }
        scorerMap[key].goals++
      })
    })

  return Object.values(scorerMap).sort((a, b) => b.goals - a.goals)
}

export function getPlayerGoals(teams, matches, playerName, teamId) {
  let goals = 0
  matches
    .filter((m) => m.status === 'completed' && m.result?.scorers)
    .forEach((match) => {
      match.result.scorers.forEach((scorer) => {
        if (scorer.player === playerName && scorer.teamId === teamId) goals++
      })
    })
  return goals
}

export function getTotalGoals(matches) {
  return matches
    .filter((m) => m.status === 'completed' && m.result)
    .reduce((sum, m) => sum + m.result.scoreA + m.result.scoreB, 0)
}
