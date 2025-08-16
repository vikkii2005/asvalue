import { initializeApp, FirebaseApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth'

// ✅ FIXED: Correct authDomain for localhost
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NODE_ENV === 'development' 
    ? 'localhost' // ✅ This fixes localhost redirect issues
    : 'asvalue-255f8.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const firebaseApp: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig)
  : getApps()[0]

const authInstance: Auth = getAuth(firebaseApp)
const providerInstance = new GoogleAuthProvider()

providerInstance.setCustomParameters({
  prompt: 'select_account',
  access_type: 'online',
})

providerInstance.addScope('email')
providerInstance.addScope('profile')

export { firebaseApp as app }
export const auth = authInstance
export const googleProvider = providerInstance