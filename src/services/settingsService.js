import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebase'

const DOC_ID = 'config'

const defaultSettings = {
  drawLocked: false,
  tournamentPhase: 'مرحلة المجموعات',
}

export async function fetchSettings() {
  const snap = await getDoc(doc(db, 'settings', DOC_ID))
  if (!snap.exists()) return defaultSettings
  return { ...defaultSettings, ...snap.data() }
}

export async function updateSettings(updates) {
  await setDoc(doc(db, 'settings', DOC_ID), updates, { merge: true })
}
