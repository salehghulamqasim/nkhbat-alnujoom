import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { lsGet, lsSet, lsAddToList, lsUpdateList, lsRemoveFromList } from './storage'

const COLLECTION = 'teams'
const LS_KEY = COLLECTION

// ----- helpers -----

async function firebaseFetch() {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// ----- exported -----

export async function fetchTeams() {
  try {
    const data = await firebaseFetch()
    lsSet(LS_KEY, data)
    return data
  } catch {
    const cached = lsGet(LS_KEY)
    if (cached) return cached
    return [] // empty, not error
  }
}

export async function createTeam({ name, manager, players, logo }) {
  const id = crypto.randomUUID()
  const team = {
    id,
    name: name.trim(),
    manager: manager.trim(),
    players,
    logo: logo || null,
    group: null,
    createdAt: new Date().toISOString(),
  }
  try {
    await setDoc(doc(db, COLLECTION, id), {
      ...team,
      createdAt: serverTimestamp(),
    })
  } catch {
    // fallback only
  }
  lsAddToList(LS_KEY, team)
  return team
}

export async function updateTeamDoc(id, { name, manager, players, logo, group }) {
  const updates = {
    name: name.trim(),
    manager: manager.trim(),
    players,
  }
  if (logo !== undefined) updates.logo = logo
  if (group !== undefined) updates.group = group

  try {
    await updateDoc(doc(db, COLLECTION, id), updates)
  } catch {
    // fallback only
  }
  lsUpdateList(LS_KEY, id, (existing) => ({ ...existing, ...updates }))
}

export async function deleteTeamDoc(id) {
  try {
    await deleteDoc(doc(db, COLLECTION, id))
  } catch {
    // fallback only
  }
  lsRemoveFromList(LS_KEY, id)
}

export async function updateTeamGroups(groupMap) {
  const updates = Object.entries(groupMap).map(([teamId, group]) =>
    updateDoc(doc(db, COLLECTION, teamId), { group })
  )
  try {
    await Promise.all(updates)
  } catch {
    // fallback only
  }
  // Update localStorage for each team
  Object.entries(groupMap).forEach(([teamId, group]) => {
    lsUpdateList(LS_KEY, teamId, (existing) => ({ ...existing, group }))
  })
}

export async function clearAllTeamGroups(teamIds) {
  try {
    await Promise.all(
      teamIds.map((id) => updateDoc(doc(db, COLLECTION, id), { group: null }))
    )
  } catch {
    // fallback only
  }
  teamIds.forEach((id) => {
    lsUpdateList(LS_KEY, id, (existing) => ({ ...existing, group: null }))
  })
}
