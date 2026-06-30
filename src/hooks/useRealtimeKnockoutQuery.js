import { useQuery } from '@tanstack/react-query'
import * as knockoutService from '../services/knockoutService'

export function useRealtimeKnockoutQuery() {
  return useQuery({
    queryKey: ['knockout-matches'],
    queryFn: knockoutService.fetchKnockoutMatches,
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 10000, // Consider data fresh for 10 seconds
  })
}
