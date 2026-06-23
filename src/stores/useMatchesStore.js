import { create } from 'zustand'
import * as matchesService from '../services/matchesService'
import { buildFullSchedule } from '../utils/scheduleGenerator'
import {
  setLiveMatch,
  clearLiveMatch,
  updateLiveScore as updateLiveScoreRtdb,
} from '../services/liveMatchService'

const emptyResult = {
  scoreA: 0,
  scoreB: 0,
  scorers: [],
  yellowCards: [],
  redCards: [],
}

export const useMatchesStore = create((set, get) => ({
  matches: [],
  loading: false,
  error: null,
  fetchError: null,
  initialized: false,

  setMatches: (matches) => set({ matches }),
  clearError: () => set({ error: null }),

  fetchAll: async () => {
    set({ loading: true, fetchError: null, error: null })
    try {
      const matches = await matchesService.fetchMatches()
      set({
        matches: matches.map((m) => ({
          ...m,
          result: m.result || null,
          status: m.status || 'scheduled',
        })),
        loading: false,
        initialized: true,
      })
    } catch (err) {
      console.error('[MatchesStore] fetchAll error:', err)
      set({
        loading: false,
        fetchError: err.message || 'Failed to load matches',
        initialized: true,
      })
    }
  },

  addMatch: async ({ group, teamA, teamB, date, time, venue }) => {
    try {
      if (!group || !teamA || !teamB || !date || !time || !venue) {
        throw new Error('All fields are required')
      }
      const match = await matchesService.createMatch({ group, teamA, teamB, date, time, venue })
      set((state) => ({ matches: [...state.matches, match], error: null }))
      return match.id
    } catch (err) {
      console.error('[MatchesStore] addMatch error:', err)
      set({ error: err.message || 'Failed to add match' })
      return null
    }
  },

  generateSchedule: async (teams) => {
    try {
      const schedule = buildFullSchedule(teams)
      if (!schedule.length) {
        set({ error: 'Draw required first — no teams in groups' })
        return false
      }
      const created = await matchesService.bulkCreateMatches(schedule)
      set((state) => ({ matches: [...state.matches, ...created], error: null }))
      return true
    } catch (err) {
      console.error('[MatchesStore] generateSchedule error:', err)
      set({ error: err.message || 'Failed to generate schedule' })
      return false
    }
  },

  updateMatchSchedule: async (id, { date, time, venue }) => {
    try {
      const updates = { date, time, venue: (venue || '').trim() }
      await matchesService.updateMatchDoc(id, updates)
      set((state) => ({
        matches: state.matches.map((match) =>
          match.id === id ? { ...match, ...updates } : match
        ),
        error: null,
      }))
      return true
    } catch (err) {
      console.error('[MatchesStore] updateMatchSchedule error:', err)
      set({ error: err.message || 'Failed to update match schedule' })
      return false
    }
  },

  updateMatch: async (id, updates) => {
    try {
      await matchesService.updateMatchDoc(id, updates)
      set((state) => ({
        matches: state.matches.map((match) =>
          match.id === id ? { ...match, ...updates } : match
        ),
        error: null,
      }))
    } catch (err) {
      console.error('[MatchesStore] updateMatch error:', err)
      set({ error: err.message || 'Failed to update match' })
    }
  },

  deleteMatch: async (id) => {
    try {
      await matchesService.deleteMatchDoc(id)
      await clearLiveMatch(id).catch(() => {})
      set((state) => ({
        matches: state.matches.filter((match) => match.id !== id),
        error: null,
      }))
    } catch (err) {
      console.error('[MatchesStore] deleteMatch error:', err)
      set({ error: err.message || 'Failed to delete match' })
    }
  },

  saveResult: async (id, result, isLive = false) => {
    try {
      const status = isLive ? 'live' : 'completed'
      await matchesService.saveMatchResult(id, result, status)
      const updated = {
        status,
        result: {
          scoreA: Number(result.scoreA) || 0,
          scoreB: Number(result.scoreB) || 0,
          scorers: result.scorers || [],
          yellowCards: result.yellowCards || [],
          redCards: result.redCards || [],
        },
      }
      set((state) => ({
        matches: state.matches.map((match) =>
          match.id === id ? { ...match, ...updated } : match
        ),
        error: null,
      }))

      if (isLive) {
        const events = (result.scorers || []).map((s) => ({
          type: 'goal',
          player: s.player,
          minute: s.minute,
          teamId: s.teamId,
        }))
        await setLiveMatch(id, {
          scoreA: updated.result.scoreA,
          scoreB: updated.result.scoreB,
          status: 'live',
          events,
        })
      } else {
        await clearLiveMatch(id).catch(() => {})
      }
    } catch (err) {
      console.error('[MatchesStore] saveResult error:', err)
      set({ error: err.message || 'Failed to save result' })
    }
  },

  setMatchLive: async (id) => {
    try {
      const initialResult = { ...emptyResult }
      await matchesService.updateMatchDoc(id, { status: 'live', result: initialResult })
      await setLiveMatch(id, { scoreA: 0, scoreB: 0, status: 'live', events: [] })
      set((state) => ({
        matches: state.matches.map((match) =>
          match.id === id ? { ...match, status: 'live', result: initialResult } : match
        ),
        error: null,
      }))
    } catch (err) {
      console.error('[MatchesStore] setMatchLive error:', err)
      set({ error: err.message || 'Failed to start live broadcast' })
    }
  },

  postponeMatch: async (id) => {
    try {
      await matchesService.setMatchPostponed(id)
      set((state) => ({
        matches: state.matches.map((match) =>
          match.id === id ? { ...match, status: 'postponed', result: null } : match
        ),
        error: null,
      }))
    } catch (err) {
      console.error('[MatchesStore] postponeMatch error:', err)
      set({ error: err.message || 'Failed to postpone match' })
    }
  },

  restoreMatch: async (id) => {
    try {
      await matchesService.restoreMatchScheduled(id)
      set((state) => ({
        matches: state.matches.map((match) =>
          match.id === id ? { ...match, status: 'scheduled', result: null } : match
        ),
        error: null,
      }))
    } catch (err) {
      console.error('[MatchesStore] restoreMatch error:', err)
      set({ error: err.message || 'Failed to restore match' })
    }
  },

  updateLiveScore: async (id, { scoreA, scoreB, events = [] }) => {
    try {
      const match = get().matches.find((m) => m.id === id)
      const updatedResult = {
        ...(match?.result || emptyResult),
        scoreA: Number(scoreA) || 0,
        scoreB: Number(scoreB) || 0,
      }
      await updateLiveScoreRtdb(id, updatedResult.scoreA, updatedResult.scoreB, events)
      await matchesService.updateMatchDoc(id, { status: 'live', result: updatedResult })
      set((state) => ({
        matches: state.matches.map((m) =>
          m.id === id ? { ...m, status: 'live', result: updatedResult } : m
        ),
        error: null,
      }))
    } catch (err) {
      console.error('[MatchesStore] updateLiveScore error:', err)
      set({ error: err.message || 'Failed to update live score' })
    }
  },

  getMatchesByGroup: (group) =>
    get()
      .matches.filter((match) => match.group === group)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
}))

export { emptyResult }
