import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set) => ({
      theme: 'dark', // 'dark' | 'light'
      language: 'ar', // 'ar' | 'en'
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      toggleLanguage: () => set((state) => ({ language: state.language === 'ar' ? 'en' : 'ar' })),
    }),
    {
      name: 'nkhbat-app-settings',
    }
  )
)
