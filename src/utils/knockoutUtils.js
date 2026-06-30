import { calculateStandings } from './standings'

const GROUPS = ['A', 'B', 'C']

/**
 * Compute standings for all three groups (read-only, no side effects).
 */
export function computeAllStandings(teams, matches) {
  const result = {}
  GROUPS.forEach((group) => {
    result[group] = calculateStandings(teams, matches, group)
  })
  return result
}

/**
 * Determine the 8 qualified teams from group standings.
 * Seeds 1-2: Top 2 Group A
 * Seeds 3-4: Top 2 Group B
 * Seeds 5-6: Top 2 Group C
 * Seeds 7-8: Best 2 third-placed teams (pts → GD → GF)
 *
 * Returns an array of 8 enriched team objects with seed info.
 */
export function getQualifiedTeams(teams, matches) {
  const allStandings = computeAllStandings(teams, matches)
  const qualifiedTeams = []
  let seed = 1

  // Top 2 from each group — seeds 1-6
  GROUPS.forEach((group) => {
    const standings = allStandings[group]
    const top2 = standings.slice(0, 2)
    top2.forEach((standing) => {
      const team = teams.find((t) => t.id === standing.id)
      if (team) {
        qualifiedTeams.push({
          seed,
          teamId: team.id,
          name: team.name,
          logo: team.logo || null,
          color: team.color || null,
          group: team.group,
          pts: standing.pts,
          gd: standing.gf - standing.ga,
          gf: standing.gf,
          qualifyType: 'direct',
        })
        seed++
      }
    })
  })

  // Best 2 third-placed teams — seeds 7-8
  const thirds = GROUPS.map((group) => {
    const standings = allStandings[group]
    const third = standings[2]
    if (!third) return null
    const team = teams.find((t) => t.id === third.id)
    if (!team) return null
    return {
      seed: 0,
      teamId: team.id,
      name: team.name,
      logo: team.logo || null,
      color: team.color || null,
      group: team.group,
      pts: third.pts,
      gd: third.gf - third.ga,
      gf: third.gf,
      qualifyType: 'bestThird',
    }
  }).filter(Boolean)

  // Sort thirds: pts DESC → GD DESC → GF DESC
  thirds.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    if (b.gd !== a.gd) return b.gd - a.gd
    return b.gf - a.gf
  })

  thirds.slice(0, 2).forEach((t) => {
    t.seed = seed++
    qualifiedTeams.push(t)
  })

  return qualifiedTeams
}

/**
 * Team IDs of the two best third-placed teams that actually qualify (seeds 7–8).
 */
export function getBestThirdPlacedTeamIds(teams, matches) {
  return new Set(
    getQualifiedTeams(teams, matches)
      .filter((q) => q.seed >= 7)
      .map((q) => q.teamId)
      .filter(Boolean)
  )
}

/**
 * Generate Quarter Final pairings from 8 seeded qualified teams.
 * Bracket: 1v8, 2v7, 3v6, 4v5
 */
export function generateQFPairings(qualifiedTeams) {
  const matchups = [
    [0, 7], // QF1: seed1 vs seed8
    [1, 6], // QF2: seed2 vs seed7
    [2, 5], // QF3: seed3 vs seed6
    [3, 4], // QF4: seed4 vs seed5
  ]

  return matchups.map(([iA, iB], index) => ({
    id: `ko-qf-${index + 1}`,
    round: 'QF',
    matchLabel: null, // rendered from round + matchNumber
    matchNumber: index + 1,
    teamA: qualifiedTeams[iA]?.teamId || '',
    teamB: qualifiedTeams[iB]?.teamId || '',
    date: '',
    time: '',
    venue: 'ملاعب فيا',
    status: 'scheduled',
    result: null,
  }))
}

/**
 * Determine the winning team ID from a completed knockout match.
 * Handles penalty shootout results.
 */
export function getKnockoutWinner(match) {
  if (!match || match.status !== 'completed' || !match.result) return null
  const { scoreA, scoreB, penaltyWinner } = match.result
  const sA = Number(scoreA) || 0
  const sB = Number(scoreB) || 0
  if (sA > sB) return match.teamA
  if (sB > sA) return match.teamB
  // Tied — use penalty winner
  return penaltyWinner || null
}

/**
 * Check if the entire group stage is complete:
 * - All 12 teams assigned to groups
 * - All group-stage matches completed
 */
export function isGroupStageComplete(teams, matches) {
  const teamsInGroups = teams.filter((t) => t.group && GROUPS.includes(t.group))
  if (teamsInGroups.length < 12) return false

  const groupMatches = matches.filter((m) => GROUPS.includes(m.group))
  if (groupMatches.length === 0) return false
  return groupMatches.every((m) => m.status === 'completed')
}

/**
 * Generate a short random local ID for knockout matches.
 */
export function generateKoId() {
  return 'ko-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now()
}
