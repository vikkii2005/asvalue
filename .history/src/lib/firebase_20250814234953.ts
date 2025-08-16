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

// Initialize Firebase
let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let providerInstance: GoogleAuthProvider | null = null;

export const getFirebaseAuth = async () => {
  if (!authInstance) {
    console.time('🔥 Firebase Init');
    
    firebaseApp = initializeApp(firebaseConfig);
    authInstance = getAuth(firebaseApp);
    
    // ✅ FIX: Enhanced Google provider configuration
    providerInstance = new GoogleAuthProvider();
    providerInstance.setCustomParameters({
      prompt: 'select_account',
      // ✅ FIX: Better popup handling
      display: 'popup',
      access_type: 'online',
      include_granted_scopes: 'true'
    });
    
    // ✅ FIX: Add required scopes
    providerInstance.addScope('email');
    providerInstance.addScope('profile');
    
    console.timeEnd('🔥 Firebase Init');
  }
  
  return { 
    auth: authInstance, 
    provider: providerInstance 
  };
};

// ✅ FIX: Better domain preloading
if (typeof window !== 'undefined') {
  const preloadDomains = [
    'accounts.google.com',
    'apis.google.com',
    'ssl.gstatic.com',
    'www.gstatic.com',
    'fonts.googleapis.com'
  ];
  
  // Add domains with proper CORS handling
  preloadDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
    
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = `https://${domain}`;
    preconnect.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect);
  });
}

// Backward compatibility exports
export { firebaseApp as app };
export const auth = authInstance;
export const googleProvider = providerInstance;