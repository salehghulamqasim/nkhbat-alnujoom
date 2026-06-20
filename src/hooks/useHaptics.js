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
 * without navigator.vibrate() (Firefox, Safari). The class is added to
 * <body> for ~120ms and triggers a subtle opacity/transform animation.
 *
 * Returns { light, medium, heavy, intense } functions.
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

function triggerPulse(level) {
  if (VIBRATE_SUPPORTED) return
  const cls = fallbackClasses[level]
  if (!cls) return
  document.body.classList.add(cls)
  setTimeout(() => document.body.classList.remove(cls), 120)
}

export function useHaptics() {
  if (!canVibrate()) {
    return {
      light: () => triggerPulse('light'),
      medium: () => triggerPulse('medium'),
      heavy: () => triggerPulse('heavy'),
      intense: () => triggerPulse('intense'),
    }
  }

  return {
    light: () => navigator.vibrate(10),
    medium: () => navigator.vibrate(20),
    heavy: () => navigator.vibrate(40),
    intense: () => navigator.vibrate([30, 15, 15, 15, 30]),
  }
}

/**
 * haptic utility for use outside React components
 * Same interface, no hook dependency.
 * Falls back to visual pulse on non-vibrate browsers.
 */
export const haptic = {
  light: () => (canVibrate() ? navigator.vibrate(10) : triggerPulse('light')),
  medium: () => (canVibrate() ? navigator.vibrate(20) : triggerPulse('medium')),
  heavy: () => (canVibrate() ? navigator.vibrate(40) : triggerPulse('heavy')),
  intense: () => (canVibrate() ? navigator.vibrate([30, 15, 15, 15, 30]) : triggerPulse('intense')),
}
