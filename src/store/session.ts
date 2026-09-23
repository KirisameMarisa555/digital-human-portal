import { create } from 'zustand'

type SessionState = { user: string; loggedIn: boolean; setSession: (user: string) => void; clear: () => void }
export const useSession = create<SessionState>((set) => ({
  user: localStorage.getItem('dh-user') || '',
  loggedIn: Boolean(localStorage.getItem('dh-user')),
  setSession: (user) => { localStorage.setItem('dh-user', user); set({ user, loggedIn: true }) },
  clear: () => { localStorage.removeItem('dh-user'); set({ user: '', loggedIn: false }) },
}))
