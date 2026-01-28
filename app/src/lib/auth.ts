import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { auth, isConfigured } from './firebase'

const googleProvider = new GoogleAuthProvider()

export async function loginWithEmail(email: string, password: string) {
  if (!auth) throw new Error('Firebase not configured')
  return signInWithEmailAndPassword(auth, email, password)
}

export async function loginWithGoogle() {
  if (!auth) throw new Error('Firebase not configured')
  return signInWithPopup(auth, googleProvider)
}

export async function logout() {
  if (!auth) throw new Error('Firebase not configured')
  return signOut(auth)
}

export function subscribeToAuthState(callback: (user: User | null) => void) {
  if (!auth) {
    // No Firebase - immediately call with null and return noop
    callback(null)
    return () => {}
  }
  return onAuthStateChanged(auth, callback)
}

export { type User, isConfigured }
