/**
 * Merge Firestore group matches with knockout matches from settings/knockout.
 * Deduplicates by match id.
 */
export function mergeKnockoutMatches(firebaseMatches = [], koMatches = []) {
  if (!koMatches?.length) return firebaseMatches
  const existingIds = new Set(firebaseMatches.map((m) => m.id))
  const extra = koMatches.filter((m) => m.id && !existingIds.has(m.id))
  return extra.length ? [...firebaseMatches, ...extra] : firebaseMatches
}
