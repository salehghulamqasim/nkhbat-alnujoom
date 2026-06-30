import { create } from 'zustand'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { updateSettings } from '../services/settingsService'

const DOC_ID = 'config'

export const useAppStore = create((set, get) => {
  return {
    theme: 'dark', // 'dark' | 'light'
    language: 'ar', // 'ar' | 'en'
    unsub: null,
    
    // ─── Realtime Firebase Sync ───────────────────────────────────────
    listenToFirestore: () => {
      if (get().unsub) return

      const unsub = onSnapshot(
        doc(db, 'settings', DOC_ID),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data()
            set({
              theme: data.theme || 'dark',
              language: data.language || 'ar',
            })
          }
        },
        (err) => {
          console.error('[AppStore] listen error:', err)
        }
      )
      set({ unsub })
    },

    cleanup: () => {
      const { unsub } = get()
      if (unsub) {
        unsub()
        set({ unsub: null })
      }
    },

    setTheme: async (theme) => {
      set({ theme })
      await updateSettings({ theme })
    },
    
    setLanguage: async (language) => {
      set({ language })
      await updateSettings({ language })
    },
    
    toggleTheme: async () => {
      const newTheme = get().theme === 'dark' ? 'light' : 'dark'
      set({ theme: newTheme })
      await updateSettings({ theme: newTheme })
    },
    
    toggleLanguage: async () => {
      const newLanguage = get().language === 'ar' ? 'en' : 'ar'
      set({ language: newLanguage })
      await updateSettings({ language: newLanguage })
    },
  }
})
