/**
 * LocalStorage fallback for Firebase operations.
 * Primary: Firebase Firestore/RTDB
 * Fallback: localStorage (mirror of all data)
 *
 * Every write goes to both Firebase (best-effort) and localStorage (always).
 * Every read tries Firebase first, falls back to localStorage.
 */

const PREFIX = 'nkhbat__'

function lsKey(collection) {
  return `${PREFIX}${collection}`
}

export function lsGet(collection) {
  try {
    const raw = localStorage.getItem(lsKey(collection))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    // Silently repair single corrupt values
    return parsed
  } catch {
    return null
  }
}

export function lsSet(collection, data) {
  try {
    localStorage.setItem(lsKey(collection), JSON.stringify(data))
  } catch (e) {
    // localStorage full or disabled — silently degrade
    console.warn('[storage] localStorage write failed:', e.message)
  }
}

export function lsRemove(collection) {
  try {
    localStorage.removeItem(lsKey(collection))
  } catch {
    // ignore
  }
}

export function lsUpdateList(collection, id, updater) {
  const list = lsGet(collection) || []
  const idx = list.findIndex((item) => item.id === id)
  if (idx !== -1) {
    list[idx] = updater(list[idx])
  } else {
    list.push(updater({}))
  }
  lsSet(collection, list)
  return list
}

export function lsRemoveFromList(collection, id) {
  const list = lsGet(collection) || []
  const filtered = list.filter((item) => item.id !== id)
  lsSet(collection, filtered)
  return filtered
}

export function lsAddToList(collection, item) {
  const list = lsGet(collection) || []
  list.push(item)
  lsSet(collection, list)
  return list
}
