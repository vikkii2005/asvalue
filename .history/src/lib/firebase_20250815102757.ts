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

// 🔥 DEVELOPMENT: Connect to emulator if needed
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(authInstance, 'http://localhost:9099', { disableWarnings: true })
    console.log('🔧 Connected to Firebase Auth Emulator')
  } catch (error) {
    console.log('🔧 Auth Emulator connection failed or already connected')
  }
}

// 🎯 PRODUCTION-OPTIMIZED: Provider configuration
const providerInstance = new GoogleAuthProvider()

// 🚀 ENHANCED: Provider settings for better UX
providerInstance.setCustomParameters({
  prompt: 'select_account',        // Always show account selection
  access_type: 'online',           // We don't need refresh tokens
  include_granted_scopes: 'true',  // Include previously granted scopes
})

// 🎯 MINIMAL SCOPES: Only request what we need
providerInstance.addScope('email')
providerInstance.addScope('profile')

console.timeEnd('🚀 Firebase Global Init')

// 🔥 PRODUCTION: Preconnect optimization
if (typeof window !== 'undefined') {
  const preconnectDomains = [
    'accounts.google.com',
    'apis.google.com',
    'www.googleapis.com',
    'securetoken.googleapis.com'
  ]
  
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

// 🚀 DEVELOPMENT: Debug helpers
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.__FIREBASE_AUTH__ = authInstance
  console.log('🔧 Firebase Auth available at window.__FIREBASE_AUTH__')
}