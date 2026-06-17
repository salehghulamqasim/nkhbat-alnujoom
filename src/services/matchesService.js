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
import {
  lsGet,
  lsSet,
  lsAddToList,
  lsUpdateList,
  lsRemoveFromList,
} from './storage'

const COLLECTION = 'matches'
const LS_KEY = COLLECTION

// ----- helpers -----

function docRef(id) {
  return doc(db, COLLECTION, id)
}

async function firebaseFetch() {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

async function firebaseSet(id, data) {
  await setDoc(docRef(id), data)
}

async function firebaseUpdate(id, updates) {
  await updateDoc(docRef(id), updates)
}

async function firebaseDelete(id) {
  await deleteDoc(docRef(id))
}

// ----- exported -----

export async function fetchMatches() {
  try {
    const data = await firebaseFetch()
    lsSet(LS_KEY, data) // cache
    return data
  } catch {
    const cached = lsGet(LS_KEY)
    if (cached) return cached
    return [] // empty, not error — allows the app to work fresh
  }
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
  try {
    await firebaseSet(id, match)
  } catch {
    // Firebase write failed — silently fall through
  }
  lsAddToList(LS_KEY, match)
  return match
}

export async function updateMatchDoc(id, updates) {
  try {
    await firebaseUpdate(id, updates)
  } catch {
    // fallback only
  }
  lsUpdateList(LS_KEY, id, (existing) => ({ ...existing, ...updates }))
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

  try {
    await batch.commit()
  } catch {
    // fallback only
  }

  // Always persist to localStorage
  const existing = lsGet(LS_KEY) || []
  lsSet(LS_KEY, [...existing, ...created])
  return created
}

export async function deleteMatchDoc(id) {
  try {
    await firebaseDelete(id)
  } catch {
    // fallback only
  }
  lsRemoveFromList(LS_KEY, id)
}

export async function saveMatchResult(id, result, status = 'completed') {
  const update = {
    status,
    result: {
      scoreA: Number(result.scoreA) || 0,
      scoreB: Number(result.scoreB) || 0,
      scorers: result.scorers || [],
      yellowCards: result.yellowCards || [],
      redCards: result.redCards || [],
    },
  }
  try {
    await firebaseUpdate(id, update)
  } catch {
    // fallback only
  }
  lsUpdateList(LS_KEY, id, (existing) => ({ ...existing, ...update }))
}
