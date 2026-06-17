import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { lsGet, lsSet } from './storage'

const DOC_ID = 'config'
const LS_KEY = 'settings'

const defaultSettings = {
  drawLocked: false,
  tournamentPhase: 'مرحلة المجموعات',
}

export async function fetchSettings() {
  try {
    const snap = await getDoc(doc(db, 'settings', DOC_ID))
    const data = snap.exists()
      ? { ...defaultSettings, ...snap.data() }
      : defaultSettings
    lsSet(LS_KEY, data)
    return data
  } catch {
    const cached = lsGet(LS_KEY)
    if (cached) return { ...defaultSettings, ...cached }
    return { ...defaultSettings }
  }
}

export async function updateSettings(updates) {
  try {
    await setDoc(doc(db, 'settings', DOC_ID), updates, { merge: true })
  } catch {
    // fallback only
  }
  const existing = lsGet(LS_KEY) || defaultSettings
  lsSet(LS_KEY, { ...existing, ...updates })
}
