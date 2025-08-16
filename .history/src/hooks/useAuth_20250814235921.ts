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
        const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth');
        
        const { auth } = await getFirebaseAuth();
        
        // ✅ CHECK FOR REDIRECT RESULT (from Google Auth)
        try {
          const result = await getRedirectResult(auth);
          if (result?.user) {
            console.log('✅ Redirect auth successful');
            await refreshUserProfile(result.user);
            router.push('/profile');
          }
        } catch (error) {
          console.log('No redirect result:', error);
        }
        
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
  }, [refreshUserProfile, router]);

  // ✅ SOLUTION: USE REDIRECT INSTEAD OF POPUP
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      console.time('🔥 Auth Redirect Time');
      
      const [{ getFirebaseAuth }, { signInWithRedirect }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ]);
      
      const { auth, provider } = await getFirebaseAuth();
      
      if (!provider || !auth) {
        throw new Error('Firebase not properly initialized');
      }

      console.log('🚀 Starting Google Auth Redirect...');
      
      // ✅ USE REDIRECT INSTEAD OF POPUP (NO COOP ISSUES)
      await signInWithRedirect(auth, provider as AuthProvider);
      
      console.timeEnd('🔥 Auth Redirect Time');
      
    } catch (error: unknown) {
      console.error('Sign in error:', error);
      setLoading(false);
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string; message: string };
        
        if (firebaseError.code === 'auth/popup-blocked') {
          alert('Authentication blocked. Trying alternative method...');
        } else {
          console.error('Auth error:', firebaseError);
        }
      }
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