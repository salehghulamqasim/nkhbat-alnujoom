import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { lsGet, lsSet } from './storage'

const DOC_ID = 'tournament'
const LS_KEY = 'groups'

const defaultGroups = {
  A: [],
  B: [],
  C: [],
  locked: false,
}

export async function fetchGroups() {
  try {
    const snap = await getDoc(doc(db, 'groups', DOC_ID))
    const data = snap.exists()
      ? { ...defaultGroups, ...snap.data() }
      : defaultGroups
    lsSet(LS_KEY, data)
    return data
  } catch {
    const cached = lsGet(LS_KEY)
    if (cached) return { ...defaultGroups, ...cached }
    return { ...defaultGroups }
  }
}

export async function saveGroups(groups) {
  const payload = {
    A: groups.A || [],
    B: groups.B || [],
    C: groups.C || [],
    locked: true,
  }
  try {
    await setDoc(doc(db, 'groups', DOC_ID), payload)
  } catch {
    // fallback only
  }
  lsSet(LS_KEY, payload)
}

export async function clearGroupsDoc() {
  try {
    await setDoc(doc(db, 'groups', DOC_ID), defaultGroups)
  } catch {
    // fallback only
  }
  lsSet(LS_KEY, defaultGroups)
}
