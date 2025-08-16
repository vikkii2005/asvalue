'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
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

  // ⚡ OPTIMIZED: Memoized refresh function
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

  // ⚡ OPTIMIZED: Reduced auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {      
      if (firebaseUser) {
        await refreshUserProfile(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [refreshUserProfile]);

  // 🚀 SUPER OPTIMIZED: Parallel processing + immediate feedback
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // ⚡ STEP 1: Show immediate feedback
      const result = await signInWithPopup(auth, googleProvider);
      
      // ⚡ STEP 2: Set basic user immediately (no API call delay)
      const basicUser: AuthUser = {
        ...result.user,
        isProfileComplete: false // Assume incomplete until we check
      };
      setUser(basicUser);
      
      // ⚡ STEP 3: Redirect immediately to profile (fast)
      router.push('/profile');
      
      // ⚡ STEP 4: Background processing (non-blocking)
      // This happens after redirect, so user doesn't wait
      Promise.resolve().then(async () => {
        try {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUid: result.user.uid,
              email: result.user.email,
              name: result.user.displayName,
            }),
          });

          const data = await response.json();
          
          // Only redirect to dashboard if they have complete profile
          if (!data.isNewUser && data.user.business_name) {
            router.replace('/dashboard');
          }
        } catch (error) {
          console.error('Background signup error:', error);
        }
      });
      
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  // ⚡ OPTIMIZED: Fast logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ⚡ OPTIMIZED: Faster refresh
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