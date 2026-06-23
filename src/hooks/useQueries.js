import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as teamsService from '../services/teamsService'
import * as matchesService from '../services/matchesService'
import * as groupsService from '../services/groupsService'
import * as settingsService from '../services/settingsService'

export const queryKeys = {
  teams: ['teams'],
  matches: ['matches'],
  groups: ['groups'],
  settings: ['settings'],
}

export function useTeamsQuery() {
  return useQuery({
    queryKey: queryKeys.teams,
    queryFn: teamsService.fetchTeams,
    staleTime: 5_000,
    refetchInterval: 8_000,
    refetchOnWindowFocus: true,
  })
}

export function useMatchesQuery() {
  return useQuery({
    queryKey: queryKeys.matches,
    queryFn: matchesService.fetchMatches,
    staleTime: 5_000,
    refetchInterval: 8_000,
    refetchOnWindowFocus: true,
  })
}

export function useGroupsQuery() {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: groupsService.fetchGroups,
    staleTime: 60_000,
  })
}

export function useSettingsQuery() {
  return useQuery({
    queryKey: queryKeys.settings,
    queryFn: settingsService.fetchSettings,
    staleTime: 60_000,
  })
}

export function useInvalidateAll() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.teams })
    queryClient.invalidateQueries({ queryKey: queryKeys.matches })
    queryClient.invalidateQueries({ queryKey: queryKeys.groups })
    queryClient.invalidateQueries({ queryKey: queryKeys.settings })
  }
}

export function useTeamMutations() {
  const invalidate = useInvalidateAll()
  const createTeam = useMutation({
    mutationFn: teamsService.createTeam,
    onSuccess: invalidate,
  })
  const updateTeam = useMutation({
    mutationFn: ({ id, data }) => teamsService.updateTeamDoc(id, data),
    onSuccess: invalidate,
  })
  const deleteTeam = useMutation({
    mutationFn: teamsService.deleteTeamDoc,
    onSuccess: invalidate,
  })
  return { createTeam, updateTeam, deleteTeam }
}

export function useMatchMutations() {
  const invalidate = useInvalidateAll()
  const createMatch = useMutation({
    mutationFn: matchesService.createMatch,
    onSuccess: invalidate,
  })
  const saveResult = useMutation({
    mutationFn: ({ id, result }) => matchesService.saveMatchResult(id, result),
    onSuccess: invalidate,
  })
  const deleteMatch = useMutation({
    mutationFn: matchesService.deleteMatchDoc,
    onSuccess: invalidate,
  })
  return { createMatch, saveResult, deleteMatch }
}
