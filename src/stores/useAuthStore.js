import { create } from 'zustand'

// Auth is intentionally NOT persisted — admin must re-enter their password
// every time they navigate to the admin panel.
export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  login: (pin) => {
    const correctPin = import.meta.env.VITE_ADMIN_PIN || '7391'
    if (pin === correctPin) {
      set({ isAuthenticated: true })
      return true
    }
    return false
  },
  logout: () => set({ isAuthenticated: false }),
}))
