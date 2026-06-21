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

const COLLECTION = 'teams'

export async function fetchTeams() {
  const snapshot = await getDocs(collection(db, COLLECTION))
  return snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      ...data,
      // Ensure players is always an array
      players: Array.isArray(data.players) ? data.players : [],
      // Ensure logo is string or null
      logo: data.logo || null,
      // Ensure group is string or null
      group: data.group || null,
      // Ensure name and manager are strings
      name: data.name || '',
      manager: data.manager || '',
    }
  })
}

export async function createTeam({ name, manager, players, logo, group }) {
  const id = crypto.randomUUID()
  const team = {
    id,
    name: (name || '').trim(),
    manager: (manager || '').trim(),
    players: players || [],
    logo: logo || null,
    group: group || null,
    createdAt: serverTimestamp(),
  }
  await setDoc(doc(db, COLLECTION, id), team)
  return {
    ...team,
    createdAt: new Date().toISOString(),
    players: players || [],
  }
}

export async function updateTeamDoc(id, { name, manager, players, logo, group }) {
  const updates = {
    name: (name || '').trim(),
    manager: (manager || '').trim(),
    players: players || [],
  }
  if (logo !== undefined) updates.logo = logo || null
  if (group !== undefined) updates.group = group || null
  await updateDoc(doc(db, COLLECTION, id), updates)
}

export async function deleteTeamDoc(id) {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function updateTeamGroups(groupMap) {
  const updates = Object.entries(groupMap).map(([teamId, group]) =>
    updateDoc(doc(db, COLLECTION, teamId), { group })
  )
  await Promise.all(updates)
}

export async function clearAllTeamGroups(teamIds) {
  await Promise.all(
    teamIds.map((id) => updateDoc(doc(db, COLLECTION, id), { group: null }))
  )
}
