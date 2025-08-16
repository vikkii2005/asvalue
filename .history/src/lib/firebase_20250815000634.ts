import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// 🚀 GLOBAL INITIALIZATION: Faster than lazy loading
console.time('🚀 Firebase Global Init')

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
const authInstance: Auth = getAuth(firebaseApp)

// ✅ OPTIMIZED: Pre-configured provider
const providerInstance = new GoogleAuthProvider()
providerInstance.setCustomParameters({
  prompt: 'select_account',
  access_type: 'online',
})
providerInstance.addScope('email')
providerInstance.addScope('profile')

console.timeEnd('🚀 Firebase Global Init')

// 🚀 INSTANT: Return ready instances
export const getFirebaseAuth = () => {
  return Promise.resolve({ 
    auth: authInstance, 
    provider: providerInstance 
  })
}

// 🚀 PRELOAD: Critical domains immediately
if (typeof window !== 'undefined') {
  const preloadDomains = [
    'accounts.google.com',
    'apis.google.com',
    'ssl.gstatic.com'
  ]
  
  preloadDomains.forEach(domain => {
    const link = document.createElement('link')
    link.rel = 'preconnect'
    link.href = `https://${domain}`
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })
}

// Exports for compatibility
export { firebaseApp as app }
export const auth = authInstance
export const googleProvider = providerInstance