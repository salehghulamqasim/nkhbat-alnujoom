import { describe, it, expect } from 'vitest'
import { calculateTopScorers, getPlayerGoals, getTotalGoals } from '../../src/utils/scorers'

describe('Top Scorers Engine', () => {
  const sampleTeams = [
    { id: 't1', name: 'Al-Hilal', logo: 'hilal-logo' },
    { id: 't2', name: 'Al-Nassr', logo: 'nassr-logo' },
  ]

  describe('calculateTopScorers', () => {
    it('should return empty array if no matches are completed or no scorers exist', () => {
      const topScorers = calculateTopScorers(sampleTeams, [])
      expect(topScorers).toEqual([])
    })

    it('should aggregate goals correctly for different players', () => {
      const matches = [
        {
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

      const scorers = calculateTopScorers(sampleTeams, matches)
      expect(scorers).toHaveLength(2)

      // Messi should have 2 goals
      const messi = scorers.find(s => s.name === 'Messi')
      expect(messi.goals).toBe(2)
      expect(messi.team).toBe('Al-Hilal')
      expect(messi.logo).toBe('hilal-logo')

      // Ronaldo should have 1 goal
      const ronaldo = scorers.find(s => s.name === 'Ronaldo')
      expect(ronaldo.goals).toBe(1)
      expect(ronaldo.team).toBe('Al-Nassr')
    })

    it('should sort scorers by goals in descending order', () => {
      const matches = [
        {
          status: 'completed',
          result: {
            scoreA: 1,
            scoreB: 3,
            scorers: [
              { player: 'Ronaldo', teamId: 't2' },
              { player: 'Ronaldo', teamId: 't2' },
              { player: 'Ronaldo', teamId: 't2' },
              { player: 'Messi', teamId: 't1' },
            ],
          },
        },
      ]

      const scorers = calculateTopScorers(sampleTeams, matches)
      expect(scorers[0].name).toBe('Ronaldo')
      expect(scorers[0].goals).toBe(3)
      expect(scorers[1].name).toBe('Messi')
      expect(scorers[1].goals).toBe(1)
    })

    it('should treat same-name players in different teams as unique entities', () => {
      const matches = [
        {
          status: 'completed',
          result: {
            scoreA: 1,
            scoreB: 1,
            scorers: [
              { player: 'Ali', teamId: 't1' },
              { player: 'Ali', teamId: 't2' },
            ],
          },
        },
      ]

      const scorers = calculateTopScorers(sampleTeams, matches)
      // Ali in t1 and Ali in t2 are different keys
      expect(scorers).toHaveLength(2)
      expect(scorers[0].goals).toBe(1)
      expect(scorers[1].goals).toBe(1)
    })
  })

  describe('getPlayerGoals', () => {
    const matches = [
      {
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

    it('should count individual goals scored by a specific player in a team', () => {
      const messiGoals = getPlayerGoals(sampleTeams, matches, 'Messi', 't1')
      const ronaldoGoals = getPlayerGoals(sampleTeams, matches, 'Ronaldo', 't2')
      const nonExistentGoals = getPlayerGoals(sampleTeams, matches, 'Neymar', 't1')

      expect(messiGoals).toBe(2)
      expect(ronaldoGoals).toBe(1)
      expect(nonExistentGoals).toBe(0)
    })
  })

  describe('getTotalGoals', () => {
    it('should sum up scores of all completed matches', () => {
      const matches = [
        {
          status: 'completed',
          result: { scoreA: 3, scoreB: 2, scorers: [] },
        },
        {
          status: 'completed',
          result: { scoreA: 1, scoreB: 1, scorers: [] },
        },
        {
          status: 'scheduled', // non-completed, should be ignored
          result: null,
        },
      ]

      const total = getTotalGoals(matches)
      expect(total).toBe(7) // (3+2) + (1+1) = 7 goals
    })
  })
})
