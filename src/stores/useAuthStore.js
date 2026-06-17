import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: (pin) => {
        const correctPin = import.meta.env.VITE_ADMIN_PIN || '1234'
        if (pin === correctPin) {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },
      logout: () => set({ isAuthenticated: false }),
    }),
    {
      name: 'admin-auth-storage',
    }
  )
)
