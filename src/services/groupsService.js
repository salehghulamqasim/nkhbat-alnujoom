import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const DOC_ID = 'tournament'

const defaultGroups = {
  A: [],
  B: [],
  C: [],
  locked: false,
}

export async function fetchGroups() {
  const snap = await getDoc(doc(db, 'groups', DOC_ID))
  if (!snap.exists()) return defaultGroups
  return { ...defaultGroups, ...snap.data() }
}

export async function saveGroups(groups) {
  await setDoc(doc(db, 'groups', DOC_ID), {
    A: groups.A || [],
    B: groups.B || [],
    C: groups.C || [],
    locked: true,
  })
}

export async function clearGroupsDoc() {
  await setDoc(doc(db, 'groups', DOC_ID), defaultGroups)
}
