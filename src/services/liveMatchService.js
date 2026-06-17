import { ref, set, onValue, off, remove } from 'firebase/database'
import { rtdb } from '../config/firebase'

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
  await set(liveRef(matchId), {
    scoreA: data.scoreA ?? 0,
    scoreB: data.scoreB ?? 0,
    status: data.status ?? 'live',
    events: data.events ?? [],
  })
}

export async function updateLiveScore(matchId, scoreA, scoreB, events = []) {
  await set(liveRef(matchId), { scoreA, scoreB, status: 'live', events })
}

export async function clearLiveMatch(matchId) {
  await remove(liveRef(matchId))
}
