import { describe, it, expect } from 'vitest'
import { calculateTopScorers, getPlayerGoals, getTotalGoals } from '../../src/utils/scorers'

describe('Top Scorers Engine — PRD: Knockout Goals Integration', () => {
  const teams = [
    { id: 't1', name: 'Al-Hilal', logo: 'hilal-logo' },
    { id: 't2', name: 'Al-Nassr', logo: 'nassr-logo' },
    { id: 't3', name: 'Al-Ahli', logo: 'ahli-logo' },
    { id: 't4', name: 'Al-Ittihad', logo: 'ittihad-logo' },
  ]

  it('should include goals scored in Quarter-Final matches', () => {
    const qfMatches = [
      {
        id: 'ko-qf-1',
        round: 'QF',
        matchLabel: 'QF 1',
        teamA: 't1',
        teamB: 't2',
        status: 'completed',
        result: {
          scoreA: 2,
          scoreB: 1,
          scorers: [
            { player: 'Messi', teamId: 't1' },
            { player: 'Messi', teamId: 't1' },
            { player: 'Ronaldo', teamId: 't2' },
          ],
        },
      },
    ]

    const scorers = calculateTopScorers(teams, qfMatches)
    expect(scorers).toHaveLength(2)

    const messi = scorers.find((s) => s.name === 'Messi')
    expect(messi.goals).toBe(2)
    expect(messi.team).toBe('Al-Hilal')

    const ronaldo = scorers.find((s) => s.name === 'Ronaldo')
    expect(ronaldo.goals).toBe(1)
    expect(ronaldo.team).toBe('Al-Nassr')
  })

  it('should include goals scored in Semi-Final matches', () => {
    const sfMatches = [
      {
        id: 'ko-sf-1',
        round: 'SF',
        matchLabel: 'SF 1',
        teamA: 't1',
        teamB: 't3',
        status: 'completed',
        result: {
          scoreA: 1,
          scoreB: 0,
          scorers: [{ player: 'Salah', teamId: 't1' }],
        },
      },
    ]

    const scorers = calculateTopScorers(teams, sfMatches)
    expect(scorers).toHaveLength(1)
    expect(scorers[0].name).toBe('Salah')
    expect(scorers[0].goals).toBe(1)
    expect(scorers[0].team).toBe('Al-Hilal')
  })

  it('should include goals scored in the Final match', () => {
    const finalMatch = [
      {
        id: 'ko-f-1',
        round: 'F',
        matchLabel: 'النهائي',
        teamA: 't1',
        teamB: 't4',
        status: 'completed',
        result: {
          scoreA: 3,
          scoreB: 2,
          scorers: [
            { player: 'Messi', teamId: 't1' },
            { player: 'Messi', teamId: 't1' },
            { player: 'Mbappe', teamId: 't4' },
            { player: 'Mbappe', teamId: 't4' },
            { player: 'Salah', teamId: 't1' },
          ],
          penaltyWinner: null,
        },
      },
    ]

    const scorers = calculateTopScorers(teams, finalMatch)
    expect(scorers).toHaveLength(3)

    const messi = scorers.find((s) => s.name === 'Messi')
    expect(messi.goals).toBe(2)

    const mbappe = scorers.find((s) => s.name === 'Mbappe')
    expect(mbappe.goals).toBe(2)
    expect(mbappe.team).toBe('Al-Ittihad')
  })

  it('should aggregate goals across Quarter-Finals, Semi-Finals, and Final for the same player', () => {
    const knockoutMatches = [
      {
        id: 'ko-qf-1',
        round: 'QF',
        teamA: 't1',
        teamB: 't2',
        status: 'completed',
        result: {
          scoreA: 2,
          scoreB: 0,
          scorers: [
            { player: 'Messi', teamId: 't1' },
            { player: 'Messi', teamId: 't1' },
          ],
        },
      },
      {
        id: 'ko-sf-1',
        round: 'SF',
        teamA: 't1',
        teamB: 't3',
        status: 'completed',
        result: {
          scoreA: 1,
          scoreB: 0,
          scorers: [{ player: 'Messi', teamId: 't1' }],
        },
      },
      {
        id: 'ko-f-1',
        round: 'F',
        teamA: 't1',
        teamB: 't4',
        status: 'completed',
        result: {
          scoreA: 1,
          scoreB: 0,
          scorers: [{ player: 'Messi', teamId: 't1' }],
        },
      },
    ]

    const scorers = calculateTopScorers(teams, knockoutMatches)
    expect(scorers).toHaveLength(1)
    expect(scorers[0].name).toBe('Messi')
    expect(scorers[0].goals).toBe(4)

    expect(getPlayerGoals(teams, knockoutMatches, 'Messi', 't1')).toBe(4)
    expect(getTotalGoals(knockoutMatches)).toBe(4)
  })

  it('should ignore goals from knockout matches that are not completed (scheduled or live)', () => {
    const matches = [
      {
        id: 'ko-qf-1',
        round: 'QF',
        teamA: 't1',
        teamB: 't2',
        status: 'scheduled',
        result: null,
      },
      {
        id: 'ko-qf-2',
        round: 'QF',
        teamA: 't3',
        teamB: 't4',
        status: 'live',
        result: { scoreA: 1, scoreB: 0, scorers: [{ player: 'Salah', teamId: 't3' }] },
      },
    ]

    const scorers = calculateTopScorers(teams, matches)
    expect(scorers).toHaveLength(0)
  })
})
