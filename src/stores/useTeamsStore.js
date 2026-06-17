import { create } from 'zustand'
import * as teamsService from '../services/teamsService'
import * as groupsService from '../services/groupsService'
import * as settingsService from '../services/settingsService'

export const MAX_TEAMS = 12
export const MAX_PLAYERS = 20

const normalizePlayers = (players) =>
  players
    .map((p) => (typeof p === 'string' ? p.trim() : p.name?.trim()))
    .filter(Boolean)
    .slice(0, MAX_PLAYERS)
    .map((name, index) => ({ id: `player-${index}-${name}`, name }))

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
      set({
        loading: false,
        fetchError: err.message || 'فشل تحميل الفرق',
        initialized: true,
      })
    }
  },

  addTeam: async ({ name, manager, players, logo }) => {
    if (get().teams.length >= MAX_TEAMS) return false
    try {
      const newTeam = await teamsService.createTeam({
        name,
        manager,
        players: normalizePlayers(players),
        logo,
      })
      set({ teams: [...get().teams, newTeam], drawLocked: false })
      await settingsService.updateSettings({ drawLocked: false })
      return true
    } catch (err) {
      set({ error: err.message || 'فشل إضافة الفريق' })
      return false
    }
  },

  updateTeam: async (id, { name, manager, players, logo }) => {
    try {
      await teamsService.updateTeamDoc(id, {
        name,
        manager,
        players: normalizePlayers(players),
        logo,
      })
      set({
        teams: get().teams.map((team) =>
          team.id === id
            ? {
                ...team,
                name: name.trim(),
                manager: manager.trim(),
                players: normalizePlayers(players),
                logo: logo ?? team.logo,
              }
            : team
        ),
      })
    } catch (err) {
      set({ error: err.message || 'فشل تحديث الفريق' })
    }
  },

  deleteTeam: async (id) => {
    try {
      await teamsService.deleteTeamDoc(id)
      const teams = get().teams.filter((team) => team.id !== id)
      set({
        teams,
        drawLocked: teams.length === MAX_TEAMS ? get().drawLocked : false,
      })
      if (teams.length < MAX_TEAMS) {
        await settingsService.updateSettings({ drawLocked: false })
      }
    } catch (err) {
      set({ error: err.message || 'فشل حذف الفريق' })
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
      set({
        teams: get().teams.map((team) => ({
          ...team,
          group: groupMap[team.id] ?? team.group,
        })),
        drawLocked: true,
      })
      await settingsService.updateSettings({ drawLocked: true })
    } catch (err) {
      set({ error: err.message || 'فشل حفظ القرعة' })
    }
  },

  clearGroups: async () => {
    try {
      const teamIds = get().teams.map((t) => t.id)
      await groupsService.clearGroupsDoc()
      await teamsService.clearAllTeamGroups(teamIds)
      set({
        teams: get().teams.map((team) => ({ ...team, group: null })),
        drawLocked: false,
      })
      await settingsService.updateSettings({ drawLocked: false })
    } catch (err) {
      set({ error: err.message || 'فشل مسح القرعة' })
    }
  },

  getTeamsByGroup: (group) => get().teams.filter((team) => team.group === group),
}))

export const isDrawComplete = (teams, drawLocked) =>
  drawLocked || (teams.length === MAX_TEAMS && teams.every((team) => team.group))
