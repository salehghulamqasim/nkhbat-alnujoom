/**
 * useHaptics — tactile feedback hook wrapping navigator.vibrate()
 *
 * Four intensity levels matched to interaction importance:
 *   light   (10ms)          → navigation taps, menu toggles, card clicks
 *   medium  (20ms)          → add items, select changes, form interactions
 *   heavy   (40ms)          → delete, confirm destructive, cancel
 *   intense ([30,15,15,15,30]) → save/submit, finish match, major confirmations
 *
 * Cross-browser: falls back to a brief visual pulse CSS class on browsers
 * without navigator.vibrate() (Firefox, Safari desktop).
 */

const VIBRATE_SUPPORTED =
  typeof navigator !== 'undefined' && 'vibrate' in navigator

function canVibrate() {
  return VIBRATE_SUPPORTED
}

const fallbackClasses = {
  light: 'haptic-pulse-light',
  medium: 'haptic-pulse-medium',
  heavy: 'haptic-pulse-heavy',
  intense: 'haptic-pulse-intense',
}

const patterns = {
  light: 20,
  medium: 37,
  heavy: 50,
  intense: [40, 20, 20, 20, 40],
}

function triggerPulse(level) {
  if (VIBRATE_SUPPORTED) return
  const cls = fallbackClasses[level]
  if (!cls) return
  document.body.classList.add(cls)
  setTimeout(() => document.body.classList.remove(cls), 180)
}

function vibrate(level) {
  if (canVibrate()) {
    navigator.vibrate(patterns[level])
  } else {
    triggerPulse(level)
  }
}

export function useHaptics() {
  return {
    light: () => vibrate('light'),
    medium: () => vibrate('medium'),
    heavy: () => vibrate('heavy'),
    intense: () => vibrate('intense'),
  }
}

export const haptic = {
  light: () => vibrate('light'),
  medium: () => vibrate('medium'),
  heavy: () => vibrate('heavy'),
  intense: () => vibrate('intense'),
}
