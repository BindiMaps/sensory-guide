import { create } from 'zustand'
import { type User, subscribeToAuthState } from '@/lib/auth'

interface AuthState {
  user: User | null
  loading: boolean
  initialised: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  initialised: false,
  setUser: (user) => set({ user, loading: false, initialised: true }),
  setLoading: (loading) => set({ loading }),
}))

// Initialise auth listener
subscribeToAuthState((user) => {
  useAuthStore.getState().setUser(user)
})
