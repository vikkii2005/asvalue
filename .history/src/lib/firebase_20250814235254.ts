import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let providerInstance: GoogleAuthProvider | null = null;

export const getFirebaseAuth = async () => {
  if (!authInstance || !providerInstance) {
    console.time('🔥 Firebase Init');
    
    // Initialize Firebase
    firebaseApp = initializeApp(firebaseConfig);
    authInstance = getAuth(firebaseApp);
    
    // ✅ ENHANCED: Better provider configuration
    providerInstance = new GoogleAuthProvider();
    providerInstance.setCustomParameters({
      prompt: 'select_account',
      display: 'popup',
      access_type: 'online',
    });
    
    // Add required scopes
    providerInstance.addScope('email');
    providerInstance.addScope('profile');
    
    console.timeEnd('🔥 Firebase Init');
  }
  
  return { 
    auth: authInstance, 
    provider: providerInstance 
  };
};

// ✅ ENHANCED: Better domain preloading with error handling
if (typeof window !== 'undefined') {
  const preloadDomains = [
    'accounts.google.com',
    'apis.google.com',
    'ssl.gstatic.com',
    'www.gstatic.com'
  ];
  
  preloadDomains.forEach(domain => {
    try {
      // DNS prefetch
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
      
      // Preconnect
      const preconnect = document.createElement('link');
      preconnect.rel = 'preconnect';
      preconnect.href = `https://${domain}`;
      preconnect.crossOrigin = 'anonymous';
      document.head.appendChild(preconnect);
    } catch (error) {
      console.warn('Failed to preload domain:', domain, error);
    }
  });
}

// Backward compatibility
export { firebaseApp as app };
export const auth = authInstance;
export const googleProvider = providerInstance;