import { describe, it, expect } from 'vitest'
import {
  roundRobinPairings,
  buildGroupSchedule,
  buildFullSchedule,
  getExpectedMatchCount,
  GROUPS,
  MATCHES_PER_GROUP,
} from '../../src/utils/scheduleGenerator'

describe('Match Scheduler Engine', () => {
  describe('roundRobinPairings', () => {
    it('should generate mathematically correct round-robin matches for 4 teams', () => {
      const teamIds = ['t1', 't2', 't3', 't4']
      const pairings = roundRobinPairings(teamIds)

      // 4 teams should produce 4 * (4 - 1) / 2 = 6 unique pairings
      expect(pairings).toHaveLength(6)

      // Ensure every team plays every other team exactly once
      const uniquePairings = new Set(
        pairings.map(([a, b]) => [a, b].sort().join('-'))
      )
      expect(uniquePairings.size).toBe(6)

      // Verify explicit pairings
      expect(pairings).toContainEqual(['t1', 't2'])
      expect(pairings).toContainEqual(['t1', 't3'])
      expect(pairings).toContainEqual(['t1', 't4'])
      expect(pairings).toContainEqual(['t2', 't3'])
      expect(pairings).toContainEqual(['t2', 't4'])
      expect(pairings).toContainEqual(['t3', 't4'])
    })

    it('should return empty pairings if less than 2 teams', () => {
      expect(roundRobinPairings([])).toEqual([])
      expect(roundRobinPairings(['t1'])).toEqual([])
    })
  })

  describe('buildGroupSchedule', () => {
    it('should build a complete scheduled group match array with proper offsets and defaults', () => {
      const teamIds = ['t1', 't2', 't3', 't4']
      const startDate = '2026-06-20'
      const groupSchedule = buildGroupSchedule({
        group: 'A',
        teamIds,
        startDate,
        dayOffset: 0,
        defaultTime: '19:30',
        defaultVenue: 'Stadium One',
      })

      expect(groupSchedule).toHaveLength(6)

      // First scheduled match details
      const firstMatch = groupSchedule[0]
      expect(firstMatch.group).toBe('A')
      expect(firstMatch.time).toBe('19:30')
      expect(firstMatch.venue).toBe('Stadium One')
      expect(firstMatch.date).toBe('2026-06-20')

      // Since index 0 and 1 have Math.floor(index/2) = 0, first two matches should share the same date
      expect(groupSchedule[0].date).toBe('2026-06-20')
      expect(groupSchedule[1].date).toBe('2026-06-20')

      // Index 2 and 3 should have date + 1 day
      expect(groupSchedule[2].date).toBe('2026-06-21')
      expect(groupSchedule[3].date).toBe('2026-06-21')

      // Index 4 and 5 should have date + 2 days
      expect(groupSchedule[4].date).toBe('2026-06-22')
      expect(groupSchedule[5].date).toBe('2026-06-22')
    })
  })

  describe('buildFullSchedule', () => {
    const sampleTeams = [
      { id: 't1', name: 'Team 1', group: 'A' },
      { id: 't2', name: 'Team 2', group: 'A' },
      { id: 't3', name: 'Team 3', group: 'A' },
      { id: 't4', name: 'Team 4', group: 'A' },

      { id: 't5', name: 'Team 5', group: 'B' },
      { id: 't6', name: 'Team 6', group: 'B' },
      { id: 't7', name: 'Team 7', group: 'B' },
      { id: 't8', name: 'Team 8', group: 'B' },

      { id: 't9', name: 'Team 9', group: 'C' },
      { id: 't10', name: 'Team 10', group: 'C' },
      { id: 't11', name: 'Team 11', group: 'C' },
      { id: 't12', name: 'Team 12', group: 'C' },
    ]

    it('should generate a combined staggered schedule for all groups', () => {
      const schedule = buildFullSchedule(sampleTeams, {
        startDate: '2026-06-20',
        defaultTime: '20:00',
        defaultVenue: 'Arena X',
      })

      // 3 groups of 4 teams should have 3 * 6 = 18 matches in total
      expect(schedule).toHaveLength(18)

      // Verify group staggering (Group A offset 0, Group B offset 3, Group C offset 6)
      // Group A starts on 2026-06-20
      const groupAMatches = schedule.filter(m => m.group === 'A')
      expect(groupAMatches[0].date).toBe('2026-06-20')

      // Group B starts on 2026-06-23 (staggered by 3 days)
      const groupBMatches = schedule.filter(m => m.group === 'B')
      expect(groupBMatches[0].date).toBe('2026-06-23')

      // Group C starts on 2026-06-26 (staggered by 6 days)
      const groupCMatches = schedule.filter(m => m.group === 'C')
      expect(groupCMatches[0].date).toBe('2026-06-26')
    })
  })

  describe('getExpectedMatchCount', () => {
    it('should compute the correct match count for 4 teams per group', () => {
      // 3 groups * (4 * 3 / 2) = 18 matches
      expect(getExpectedMatchCount(4)).toBe(18)
    })
  })

  describe('Constants', () => {
    it('should expose the list of standard groups and matches per group', () => {
      expect(GROUPS).toEqual(['A', 'B', 'C'])
      expect(MATCHES_PER_GROUP).toBe(6)
    })
  })
})
