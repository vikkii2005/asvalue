import { initializeApp, FirebaseApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth'

// ✅ PRODUCTION-READY: Environment-based configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: 'asvalue-255f8.firebaseapp.com', // ✅ Keep your actual domain
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// 🚀 Validate configuration
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId']
  const missing = required.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig])
  
  if (missing.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`)
  }
}

validateConfig()

console.time('🚀 Firebase Init')

// ✅ Prevent multiple initialization
const firebaseApp: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig)
  : getApps()[0]

const authInstance: Auth = getAuth(firebaseApp)

// ✅ Provider configuration for popup
const providerInstance = new GoogleAuthProvider()

// ✅ Show account selection every time
providerInstance.setCustomParameters({
  prompt: 'select_account',
  access_type: 'online',
})

providerInstance.addScope('email')
providerInstance.addScope('profile')

console.timeEnd('🚀 Firebase Init')

// ✅ Client-only optimizations
if (typeof window !== 'undefined') {
  // Preconnect to Google domains
  const preconnectDomains = [
    'accounts.google.com',
    'apis.google.com',
    'www.googleapis.com'
  ]
  
  setTimeout(() => {
    preconnectDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = `https://${domain}`
      link.crossOrigin = 'anonymous'
      
      if (!document.head.querySelector(`link[href="https://${domain}"]`)) {
        document.head.appendChild(link)
      }
    })
  }, 0)

  // Development helper
  if (process.env.NODE_ENV === 'development') {
    // @ts-expect-error - Adding debug property to window for development
    window.__FIREBASE_AUTH__ = authInstance
  }
}

export { firebaseApp as app }
export const auth = authInstance
export const googleProvider = providerInstance