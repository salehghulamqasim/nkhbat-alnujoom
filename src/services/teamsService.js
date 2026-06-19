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
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function createTeam({ name, manager, players, logo, group }) {
  const id = crypto.randomUUID()
  const team = {
    id,
    name: name.trim(),
    manager: manager.trim(),
    players,
    logo: logo || null,
    group: group || null,
    createdAt: serverTimestamp(),
  }
  await setDoc(doc(db, COLLECTION, id), team)
  return { ...team, createdAt: new Date().toISOString() }
}

export async function updateTeamDoc(id, { name, manager, players, logo, group }) {
  const updates = {
    name: name.trim(),
    manager: manager.trim(),
    players,
  }
  if (logo !== undefined) updates.logo = logo
  if (group !== undefined) updates.group = group
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
