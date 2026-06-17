import { ref, set, onValue, off, remove } from 'firebase/database'
import { rtdb } from '../config/firebase'
import { lsGet, lsSet, lsUpdateList } from './storage'

const LS_KEY = 'liveMatches'

function liveRef(matchId) {
  return ref(rtdb, `liveMatches/${matchId}`)
}

export function subscribeLiveMatch(matchId, callback) {
  const matchRef = liveRef(matchId)
  onValue(matchRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null)
  })
  return () => off(matchRef)
}

export async function setLiveMatch(matchId, data) {
  const payload = {
    scoreA: data.scoreA ?? 0,
    scoreB: data.scoreB ?? 0,
    status: data.status ?? 'live',
    events: data.events ?? [],
  }
  try {
    await set(liveRef(matchId), payload)
  } catch {
    // fallback only
  }
  // Keep in-memory via localStorage
  const existing = lsGet(LS_KEY) || {}
  existing[matchId] = payload
  lsSet(LS_KEY, existing)
}

export async function updateLiveScore(matchId, scoreA, scoreB, events = []) {
  try {
    await set(liveRef(matchId), { scoreA, scoreB, status: 'live', events })
  } catch {
    // fallback only
  }
  const existing = lsGet(LS_KEY) || {}
  existing[matchId] = { scoreA, scoreB, status: 'live', events }
  lsSet(LS_KEY, existing)

  // Also update the Firestore mirror in matches cache
  lsUpdateList('matches', matchId, (m) => ({
    ...m,
    status: 'live',
    result: {
      ...(m?.result || {}),
      scoreA: Number(scoreA) || 0,
      scoreB: Number(scoreB) || 0,
    },
  }))
}

export async function clearLiveMatch(matchId) {
  try {
    await remove(liveRef(matchId))
  } catch {
    // fallback only
  }
  const existing = lsGet(LS_KEY) || {}
  delete existing[matchId]
  lsSet(LS_KEY, existing)
}
