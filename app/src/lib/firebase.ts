import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getFunctions, connectFunctionsEmulator, type Functions } from 'firebase/functions'

// Firebase web SDK config - intentionally hardcoded.
// These values are public by design (visible in client JS bundle).
// Security is enforced via Firebase Security Rules, not by hiding config.
// Do NOT move to env vars - it breaks CI builds and provides no security benefit.
const firebaseConfig = {
  apiKey: 'AIzaSyDbdvQc9Ci_LELGcsgfZVKuntRSETDLpPI',
  authDomain: 'sensory-guide.firebaseapp.com',
  projectId: 'sensory-guide',
  storageBucket: 'sensory-guide.firebasestorage.app',
  messagingSenderId: '541697155712',
  appId: '1:541697155712:web:142cd0b5dc3c0f8223fc65',
  measurementId: 'G-FVW6R81ZNC',
}

// Check if Firebase is configured
const isConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let storage: FirebaseStorage | null = null
let functions: Functions | null = null

if (isConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  functions = getFunctions(app)

  // Connect to emulator in development
  if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectFunctionsEmulator(functions, 'localhost', 5001)
  }
} else {
  console.warn('Firebase not configured - running in demo mode')
}

export { app, auth, db, storage, functions, isConfigured }
