import { useEffect } from 'react'
import { useTeamsStore } from '../../stores/useTeamsStore'
import { useMatchesStore } from '../../stores/useMatchesStore'
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '../../hooks/useQueries'

export default function AdminDataSync({ children }) {
  const fetchTeams = useTeamsStore((s) => s.fetchAll)
  const fetchMatches = useMatchesStore((s) => s.fetchAll)
  const queryClient = useQueryClient()

  useEffect(() => {
    fetchTeams()
    fetchMatches()
  }, [fetchTeams, fetchMatches])

  useEffect(() => {
    const unsubTeams = useTeamsStore.subscribe((state) => {
      if (state.initialized) {
        queryClient.setQueryData(queryKeys.teams, state.teams)
      }
    })
    const unsubMatches = useMatchesStore.subscribe((state) => {
      if (state.initialized) {
        queryClient.setQueryData(queryKeys.matches, state.matches)
      }
    })
    return () => {
      unsubTeams()
      unsubMatches()
    }
  }, [queryClient])

  return children
}
