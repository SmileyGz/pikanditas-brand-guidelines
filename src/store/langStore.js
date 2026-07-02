import { create } from 'zustand'

export const useLangStore = create((set) => ({
  lang: 'es',
  setLang: (lang) => set({ lang }),
}))
