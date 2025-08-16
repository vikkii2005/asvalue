'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, AuthProvider } from 'firebase/auth';
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

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const initAuth = async () => {
      try {
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

  // ✅ FIXED: Proper type checking and error handling
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      console.time('🔥 Total Auth Time');
      
      const [{ getFirebaseAuth }, { signInWithPopup }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ]);
      
      const { auth, provider } = await getFirebaseAuth();
      
      // ✅ FIXED: Type check for provider
      if (!provider || !auth) {
        throw new Error('Firebase not properly initialized');
      }

      console.time('🔥 Google Popup');
      // ✅ FIXED: Proper typing for provider
      const result = await signInWithPopup(auth, provider as AuthProvider);
      console.timeEnd('🔥 Google Popup');
      
      console.timeEnd('🔥 Total Auth Time');
      
      const basicUser: AuthUser = {
        ...result.user,
        isProfileComplete: false
      };
      setUser(basicUser);
      
      router.push('/profile');
      
      // Background processing
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
      
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      
      // ✅ FIXED: Proper error typing
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        
        if (firebaseError.code === 'auth/popup-blocked') {
          alert('Please allow popups for this site and try again.');
        } else if (firebaseError.code === 'auth/popup-closed-by-user') {
          console.log('Popup closed by user');
        } else if (firebaseError.code === 'auth/cancelled-popup-request') {
          console.log('Popup cancelled');
        } else {
          console.error('Unexpected auth error:', firebaseError);
        }
      } else {
        console.error('Unknown error:', error);
      }
      
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const [{ getFirebaseAuth }, { signOut }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ]);
      
      const { auth } = await getFirebaseAuth();
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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