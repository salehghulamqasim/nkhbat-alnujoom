import { useEffect, useState } from 'react'
import { subscribeLiveMatch } from '../services/liveMatchService'

export function useLiveMatch(matchId) {
  const [liveData, setLiveData] = useState(null)
  const [loading, setLoading] = useState(Boolean(matchId))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!matchId) return undefined

    let active = true

    try {
      const unsubscribe = subscribeLiveMatch(matchId, (data) => {
        if (active) {
          setLiveData(data)
          setLoading(false)
        }
      })
      return () => {
        active = false
        unsubscribe()
      }
    } catch (err) {
      if (active) {
        setError(err.message || 'فشل الاتصال بالبث المباشر')
        setLoading(false)
      }
      return undefined
    }
  }, [matchId])

  return {
    liveData: matchId ? liveData : null,
    loading: matchId ? loading : false,
    error: matchId ? error : null,
  }
}
