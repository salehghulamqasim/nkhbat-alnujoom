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
      set({ matches, loading: false, initialized: true })
    } catch (err) {
      set({
        loading: false,
        fetchError: err.message || 'فشل تحميل المباريات',
        initialized: true,
      })
    }
  },

  addMatch: async ({ group, teamA, teamB, date, time, venue }) => {
    try {
      const match = await matchesService.createMatch({ group, teamA, teamB, date, time, venue })
      set({ matches: [...get().matches, match] })
      return match.id
    } catch (err) {
      set({ error: err.message || 'فشل إضافة المباراة' })
      return null
    }
  },

  generateSchedule: async (teams) => {
    try {
      const schedule = buildFullSchedule(teams)
      if (!schedule.length) {
        set({ error: 'يجب إجراء القرعة أولاً — لا توجد فرق في المجموعات' })
        return false
      }
      const created = await matchesService.bulkCreateMatches(schedule)
      set({ matches: [...get().matches, ...created] })
      return true
    } catch (err) {
      set({ error: err.message || 'فشل إنشاء الجدول' })
      return false
    }
  },

  updateMatchSchedule: async (id, { date, time, venue }) => {
    try {
      const updates = { date, time, venue: venue.trim() }
      await matchesService.updateMatchDoc(id, updates)
      set({
        matches: get().matches.map((match) =>
          match.id === id ? { ...match, ...updates } : match
        ),
      })
      return true
    } catch (err) {
      set({ error: err.message || 'فشل تحديث موعد المباراة' })
      return false
    }
  },

  updateMatch: async (id, updates) => {
    try {
      await matchesService.updateMatchDoc(id, updates)
      set({
        matches: get().matches.map((match) =>
          match.id === id ? { ...match, ...updates } : match
        ),
      })
    } catch (err) {
      set({ error: err.message || 'فشل تحديث المباراة' })
    }
  },

  deleteMatch: async (id) => {
    try {
      await matchesService.deleteMatchDoc(id)
      await clearLiveMatch(id).catch(() => {})
      set({ matches: get().matches.filter((match) => match.id !== id) })
    } catch (err) {
      set({ error: err.message || 'فشل حذف المباراة' })
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
      set({
        matches: get().matches.map((match) =>
          match.id === id ? { ...match, ...updated } : match
        ),
      })

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
      set({ error: err.message || 'فشل حفظ النتيجة' })
    }
  },

  setMatchLive: async (id) => {
    try {
      const initialResult = { ...emptyResult }
      await matchesService.updateMatchDoc(id, { status: 'live', result: initialResult })
      await setLiveMatch(id, { scoreA: 0, scoreB: 0, status: 'live', events: [] })
      set({
        matches: get().matches.map((match) =>
          match.id === id ? { ...match, status: 'live', result: initialResult } : match
        ),
      })
    } catch (err) {
      set({ error: err.message || 'فشل بدء البث المباشر' })
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
      set({
        matches: get().matches.map((m) =>
          m.id === id ? { ...m, status: 'live', result: updatedResult } : m
        ),
      })
    } catch (err) {
      set({ error: err.message || 'فشل تحديث النتيجة المباشرة' })
    }
  },

  getMatchesByGroup: (group) =>
    get()
      .matches.filter((match) => match.group === group)
      .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
}))

export { emptyResult }
