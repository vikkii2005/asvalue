import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 🚀 LAZY LOADING: Initialize only when needed
let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let providerInstance: GoogleAuthProvider | null = null;

// 🚀 OPTIMIZED: Get Firebase instances with lazy loading
export const getFirebaseAuth = async () => {
  if (!authInstance) {
    console.time('🔥 Firebase Init');
    
    // Initialize Firebase app
    firebaseApp = initializeApp(firebaseConfig);
    authInstance = getAuth(firebaseApp);
    
    // Setup Google provider with optimizations
    providerInstance = new GoogleAuthProvider();
    providerInstance.setCustomParameters({
      prompt: 'select_account',
      display: 'popup'
    });
    
    console.timeEnd('🔥 Firebase Init');
  }
  
  return { 
    auth: authInstance, 
    provider: providerInstance 
  };
};

// 🚀 PRELOAD: DNS prefetch for faster loading
if (typeof window !== 'undefined') {
  // Preload Google domains immediately
  const preloadDomains = [
    'accounts.google.com',
    'apis.google.com',
    'ssl.gstatic.com',
    'www.gstatic.com'
  ];
  
  preloadDomains.forEach(domain => {
    // DNS prefetch
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
    
    // Preconnect for even faster loading
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = `https://${domain}`;
    document.head.appendChild(preconnect);
  });
}

// For backward compatibility (keep these exports)
export { firebaseApp as app };
export const auth = authInstance;
export const googleProvider = providerInstance;
