import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../config/firebase'

const COLLECTION = 'matches'

export async function fetchMatches() {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createMatch({ group, teamA, teamB, date, time, venue }) {
  const id = crypto.randomUUID()
  const match = {
    id,
    group,
    teamA,
    teamB,
    date,
    time,
    venue: venue.trim(),
    status: 'scheduled',
    result: null,
  }
  await setDoc(doc(db, COLLECTION, id), match)
  return match
}

export async function updateMatchDoc(id, updates) {
  await updateDoc(doc(db, COLLECTION, id), updates)
}

export async function bulkCreateMatches(matchesList) {
  if (!matchesList.length) return []

  const batch = writeBatch(db)
  const created = []

  matchesList.forEach((data) => {
    const id = crypto.randomUUID()
    const match = {
      id,
      group: data.group,
      teamA: data.teamA,
      teamB: data.teamB,
      date: data.date,
      time: data.time,
      venue: data.venue.trim(),
      status: 'scheduled',
      result: null,
    }
    batch.set(doc(db, COLLECTION, id), match)
    created.push(match)
  })

  await batch.commit()
  return created
}

export async function deleteMatchDoc(id) {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function saveMatchResult(id, result, status = 'completed') {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    result: {
      scoreA: Number(result.scoreA) || 0,
      scoreB: Number(result.scoreB) || 0,
      scorers: result.scorers || [],
      yellowCards: result.yellowCards || [],
      redCards: result.redCards || [],
    },
  })
}
