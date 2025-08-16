import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  // ✅ CRITICAL FIX: Use the correct authDomain for your environment
  authDomain: process.env.NODE_ENV === 'development' 
    ? 'localhost' 
    : 'asvalue-255f8.firebaseapp.com', // Your actual Firebase domain
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

console.time('🚀 Firebase Global Init')

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
const authInstance: Auth = getAuth(firebaseApp)

// ✅ REDIRECT OPTIMIZED: Provider configuration
const providerInstance = new GoogleAuthProvider()
providerInstance.setCustomParameters({
  prompt: 'select_account',
  access_type: 'online',
})

providerInstance.addScope('email')
providerInstance.addScope('profile')

console.timeEnd('🚀 Firebase Global Init')

export const getFirebaseAuth = () => {
  return Promise.resolve({ 
    auth: authInstance, 
    provider: providerInstance 
  })
}

export { firebaseApp as app }
export const auth = authInstance
export const googleProvider = providerInstance