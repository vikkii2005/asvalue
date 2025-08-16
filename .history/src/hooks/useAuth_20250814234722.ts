'use client';

import { useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface AuthUser extends User {
  sellerId?: string;
  isProfileComplete?: boolean;
  isActive?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🚀 OPTIMIZED: Memoized profile refresh
  const refreshUserProfile = useCallback(async (firebaseUser: User) => {
    try {
      const response = await fetch('/api/auth/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: firebaseUser.uid }),
      });
      
      if (response.ok) {
        const { seller } = await response.json();
        
        const isComplete = Boolean(
          seller?.business_name?.trim() &&
          seller?.category?.trim() &&
          seller?.phone?.trim()
        );
        
        const enhancedUser: AuthUser = {
          ...firebaseUser,
          sellerId: seller?.id,
          isProfileComplete: isComplete,
          isActive: seller?.is_active
        };
        
        setUser(enhancedUser);
        return enhancedUser;
      } else {
        const basicUser = firebaseUser as AuthUser;
        setUser(basicUser);
        return basicUser;
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      const basicUser = firebaseUser as AuthUser;
      setUser(basicUser);
      return basicUser;
    }
  }, []);

  // 🚀 LAZY LOADED: Auth state listener
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initAuth = async () => {
      try {
        // Lazy load Firebase modules
        const { getFirebaseAuth } = await import('@/lib/firebase');
        const { onAuthStateChanged } = await import('firebase/auth');
        
        const { auth } = await getFirebaseAuth();
        
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            await refreshUserProfile(firebaseUser);
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [refreshUserProfile]);

  // 🚀 SUPER FAST: Google Sign In with lazy loading
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      console.time('🔥 Total Auth Time');
      
      // Step 1: Lazy load Firebase (only when user clicks)
      console.time('🔥 Firebase Load');
      const [{ getFirebaseAuth }, { signInWithPopup }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ]);
      
      const { auth, provider } = await getFirebaseAuth();
      console.timeEnd('🔥 Firebase Load');
      
      // Step 2: Show Google popup immediately
      console.time('🔥 Google Popup');
      const result = await signInWithPopup(auth, provider);
      console.timeEnd('🔥 Google Popup');
      
      console.timeEnd('🔥 Total Auth Time');
      
      // Step 3: Set user immediately for fast UI update
      const basicUser: AuthUser = {
        ...result.user,
        isProfileComplete: false
      };
      setUser(basicUser);
      
      // Step 4: Fast redirect to profile
      router.push('/profile');
      
      // Step 5: Background API call (non-blocking)
      Promise.all([
        fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebaseUid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
          }),
        }),
        refreshUserProfile(result.user)
      ]).then(([signupResponse]) => {
        if (signupResponse.ok) {
          signupResponse.json().then(data => {
            if (!data.isNewUser && data.user.business_name) {
              router.replace('/dashboard');
            }
          });
        }
      }).catch(error => {
        console.error('Background processing error:', error);
      });
      
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
    }
  };

  // 🚀 FAST: Logout with lazy loading
  const logout = async () => {
    try {
      const [{ getFirebaseAuth }, { signOut }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ]);
      
      const { auth } = await getFirebaseAuth();
      await signOut(auth);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // 🚀 OPTIMIZED: Profile refresh
  const refreshProfile = useCallback(async () => {
    if (user) {
      return await refreshUserProfile(user);
    }
    return null;
  }, [user, refreshUserProfile]);

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    refreshProfile,
    isAuthenticated: !!user
  };
};