import { initializeApp, FirebaseApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider, Auth, connectAuthEmulator } from 'firebase/auth'

// 🎯 PRODUCTION-READY: Environment-based configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'asvalue-255f8.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// 🚀 PRODUCTION: Validate configuration
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'appId']
  const missing = required.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig])
  
  if (missing.length > 0) {
    throw new Error(`Missing Firebase configuration: ${missing.join(', ')}`)
  }
}

validateConfig()

console.time('🚀 Firebase Global Init')

// 🎯 PRODUCTION: Prevent multiple initialization
const firebaseApp: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig)
  : getApps()[0]

const authInstance: Auth = getAuth(firebaseApp)

// 🔥 DEVELOPMENT: Connect to emulator if needed (server-safe)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(authInstance, 'http://localhost:9099', { disableWarnings: true })
    console.log('🔧 Connected to Firebase Auth Emulator')
  } catch {
    // ✅ FIXED: Removed unused 'error' parameter
    console.log('🔧 Auth Emulator connection failed or already connected')
  }
}

// 🎯 PRODUCTION-OPTIMIZED: Provider configuration
const providerInstance = new GoogleAuthProvider()

// 🚀 ENHANCED: Provider settings for better UX
providerInstance.setCustomParameters({
  prompt: 'select_account',
  access_type: 'online',
  include_granted_scopes: 'true',
})

providerInstance.addScope('email')
providerInstance.addScope('profile')

console.timeEnd('🚀 Firebase Global Init')

// 🔥 PRODUCTION: Client-only initialization
if (typeof window !== 'undefined') {
  // Preconnect optimization
  const preconnectDomains = [
    'accounts.google.com',
    'apis.google.com',
    'www.googleapis.com',
    'securetoken.googleapis.com'
  ]
  
  // Use setTimeout to ensure DOM is ready
  setTimeout(() => {
    preconnectDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = `https://${domain}`
      link.crossOrigin = 'anonymous'
      
      // Avoid duplicates
      if (!document.head.querySelector(`link[href="https://${domain}"]`)) {
        document.head.appendChild(link)
      }
    })
  }, 0)

  // Development debug helpers
  if (process.env.NODE_ENV === 'development') {
    // ✅ FIXED: Changed @ts-ignore to @ts-expect-error
    // @ts-expect-error - Adding debug property to window for development
    window.__FIREBASE_AUTH__ = authInstance
    console.log('🔧 Firebase Auth available at window.__FIREBASE_AUTH__')
  }
}

// 🎯 PRODUCTION: Export with type safety
export const getFirebaseAuth = () => {
  return Promise.resolve({ 
    auth: authInstance, 
    provider: providerInstance 
  })
}

export { firebaseApp as app }
export const auth = authInstance
export const googleProvider = providerInstance