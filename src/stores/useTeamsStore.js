import { create } from 'zustand'
import * as teamsService from '../services/teamsService'
import * as matchesService from '../services/matchesService'
import * as groupsService from '../services/groupsService'
import * as settingsService from '../services/settingsService'

export const MAX_TEAMS = 12
export const MAX_PLAYERS = 20

const normalizePlayers = (players) => {
  if (!Array.isArray(players)) return []
  return players
    .map((p) => {
      if (typeof p === 'string') {
        const name = p.trim()
        return name ? { name, photo: null } : null
      }
      if (p && typeof p === 'object') {
        const name = (p.name || '').trim()
        if (!name) return null
        return { name, photo: p.photo || null }
      }
      return null
    })
    .filter(Boolean)
    .slice(0, MAX_PLAYERS)
    .map((p, index) => ({ id: `player-${index}-${p.name}`, name: p.name, photo: p.photo || null }))
}

export const useTeamsStore = create((set, get) => ({
  teams: [],
  drawLocked: false,
  loading: false,
  error: null,
  fetchError: null,
  initialized: false,

  setTeams: (teams) => set({ teams }),
  setDrawLocked: (drawLocked) => set({ drawLocked }),
  clearError: () => set({ error: null }),

  fetchAll: async () => {
    set({ loading: true, fetchError: null, error: null })
    try {
      const [teams, groups, settings] = await Promise.all([
        teamsService.fetchTeams(),
        groupsService.fetchGroups(),
        settingsService.fetchSettings(),
      ])
      set({
        teams,
        drawLocked: groups.locked || settings.drawLocked,
        loading: false,
        initialized: true,
      })
    } catch (err) {
      console.error('[TeamsStore] fetchAll error:', err)
      set({
        loading: false,
        fetchError: err.message || 'Failed to load teams',
        initialized: true,
      })
    }
  },

  addTeam: async ({ name, manager, players, logo, group }) => {
    if (get().teams.length >= MAX_TEAMS) return false
    try {
      const cleanName = (name || '').trim()
      const cleanManager = (manager || '').trim()
      const normalizedPlayers = normalizePlayers(players)
      
      if (!cleanName) throw new Error('Team name is required')
      if (!cleanManager) throw new Error('Manager name is required')
      if (normalizedPlayers.length === 0) throw new Error('At least one player is required')

      const newTeam = await teamsService.createTeam({
        name: cleanName,
        manager: cleanManager,
        players: normalizedPlayers,
        logo: logo || null,
      })
      
      set((state) => ({
        teams: [...state.teams, newTeam],
        drawLocked: false,
        error: null,
      }))
      
      // Update settings in background — don't let it fail the team creation
      try {
        await settingsService.updateSettings({ drawLocked: false })
      } catch (settingsErr) {
        console.warn('[TeamsStore] updateSettings failed (non-critical):', settingsErr)
      }
      
      return true
    } catch (err) {
      console.error('[TeamsStore] addTeam error:', err)
      set({ error: err.message || 'Failed to add team' })
      return false
    }
  },

  updateTeam: async (id, { name, manager, players, logo, group }) => {
    try {
      const cleanName = (name || '').trim()
      const cleanManager = (manager || '').trim()
      const normalizedPlayers = normalizePlayers(players)
      
      if (!cleanName) throw new Error('Team name is required')
      if (!cleanManager) throw new Error('Manager name is required')

      await teamsService.updateTeamDoc(id, {
        name: cleanName,
        manager: cleanManager,
        players: normalizedPlayers,
        logo: logo || null,
      })
      
      set((state) => ({
        teams: state.teams.map((team) =>
          team.id === id
            ? {
                ...team,
                name: cleanName,
                manager: cleanManager,
                players: normalizedPlayers,
                logo: logo ?? team.logo,
                group: group || null,
              }
            : team
        ),
        error: null,
      }))
    } catch (err) {
      console.error('[TeamsStore] updateTeam error:', err)
      set({ error: err.message || 'Failed to update team' })
    }
  },

  deleteTeam: async (id) => {
    try {
      await teamsService.deleteTeamDoc(id)
      const remaining = get().teams.filter((team) => team.id !== id)
      set({
        teams: remaining,
        drawLocked: remaining.length === MAX_TEAMS ? get().drawLocked : false,
        error: null,
      })
      
      if (remaining.length < MAX_TEAMS) {
        try {
          await settingsService.updateSettings({ drawLocked: false })
        } catch (settingsErr) {
          console.warn('[TeamsStore] updateSettings failed (non-critical):', settingsErr)
        }
      }
    } catch (err) {
      console.error('[TeamsStore] deleteTeam error:', err)
      set({ error: err.message || 'Failed to delete team' })
    }
  },

  assignGroups: async (groups) => {
    try {
      await groupsService.saveGroups(groups)
      const groupMap = {}
      Object.entries(groups).forEach(([group, teamIds]) => {
        if (group === 'locked') return
        teamIds.forEach((teamId) => {
          groupMap[teamId] = group
        })
      })
      await teamsService.updateTeamGroups(groupMap)
      set((state) => ({
        teams: state.teams.map((team) => ({
          ...team,
          group: groupMap[team.id] ?? team.group,
        })),
        drawLocked: true,
        error: null,
      }))
      await settingsService.updateSettings({ drawLocked: true })
    } catch (err) {
      console.error('[TeamsStore] assignGroups error:', err)
      set({ error: err.message || 'Failed to save draw' })
    }
  },

  clearGroups: async () => {
    try {
      const teamIds = get().teams.map((t) => t.id)
      await groupsService.clearGroupsDoc()
      await teamsService.clearAllTeamGroups(teamIds)
      set((state) => ({
        teams: state.teams.map((team) => ({ ...team, group: null })),
        drawLocked: false,
        error: null,
      }))
      await settingsService.updateSettings({ drawLocked: false })
    } catch (err) {
      console.error('[TeamsStore] clearGroups error:', err)
      set({ error: err.message || 'Failed to clear draw' })
    }
  },

  getTeamsByGroup: (group) => get().teams.filter((team) => team.group === group),
}))

export const isDrawComplete = (teams, drawLocked) =>
  drawLocked || (teams.length === MAX_TEAMS && teams.every((team) => team.group))
