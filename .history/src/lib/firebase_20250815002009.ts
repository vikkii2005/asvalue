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

// 🚀 INSTANT: Global initialization for speed
console.time('🚀 Firebase Global Init')

const firebaseApp: FirebaseApp = initializeApp(firebaseConfig)
const authInstance: Auth = getAuth(firebaseApp)

// ✅ POPUP OPTIMIZED: Provider configuration for faster popups
const providerInstance = new GoogleAuthProvider()
providerInstance.setCustomParameters({
  prompt: 'select_account',
  // ✅ SPEED: Optimize for popup
  display: 'popup',
  access_type: 'online',
  include_granted_scopes: 'true'
})

// ✅ REQUIRED: Add scopes
providerInstance.addScope('email')
providerInstance.addScope('profile')

console.timeEnd('🚀 Firebase Global Init')

// ✅ INSTANT: Return ready instances
export const getFirebaseAuth = () => {
  return Promise.resolve({ 
    auth: authInstance, 
    provider: providerInstance 
  })
}

// ✅ PRECONNECT: Speed up Google domains
if (typeof window !== 'undefined') {
  const domains = ['accounts.google.com', 'apis.google.com', 'ssl.gstatic.com']
  
  domains.forEach(domain => {
    // DNS prefetch for faster popup loading
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = `https://${domain}`
    document.head.appendChild(link)
    
    // Preconnect for even faster loading  
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = `https://${domain}`
    preconnect.crossOrigin = 'anonymous'
    document.head.appendChild(preconnect)
  })
  
  // ✅ PRELOAD: Google Auth JavaScript
  const scriptLink = document.createElement('link')
  scriptLink.rel = 'prefetch'
  scriptLink.href = 'https://accounts.google.com/gsi/client'
  document.head.appendChild(scriptLink)
}

// Exports
export { firebaseApp as app }
export const auth = authInstance
export const googleProvider = providerInstance