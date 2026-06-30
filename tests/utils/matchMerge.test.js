import { describe, it, expect } from 'vitest'
import { mergeKnockoutMatches } from '../../src/utils/matchMerge'

describe('mergeKnockoutMatches', () => {
  it('returns group matches when no knockout matches', () => {
    const group = [{ id: 'g1', group: 'A' }]
    expect(mergeKnockoutMatches(group, [])).toEqual(group)
  })

  it('appends knockout matches without duplicating ids', () => {
    const group = [{ id: 'g1', group: 'A' }]
    const ko = [
      { id: 'ko1', round: 'QF' },
      { id: 'g1', round: 'QF' },
    ]
    const merged = mergeKnockoutMatches(group, ko)
    expect(merged).toHaveLength(2)
    expect(merged.map((m) => m.id)).toEqual(['g1', 'ko1'])
  })
})
