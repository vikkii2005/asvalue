'use client';

import { useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/neon';

interface AuthUser extends User {
  sellerId?: string;
  isProfileComplete?: boolean;
  isActive?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get seller data from Neon (same as your session callback)
          const seller = await db.sellers.getByFirebaseUid(firebaseUser.uid);
          
          const enhancedUser: AuthUser = {
            ...firebaseUser,
            sellerId: seller?.id,
            isProfileComplete: Boolean(
              seller?.business_name?.trim() &&
              seller?.category?.trim() &&
              seller?.phone?.trim()
            ),
            isActive: seller?.is_active
          };
          
          setUser(enhancedUser);
        } catch (error) {
          console.error('Error fetching seller data:', error);
          setUser(firebaseUser as AuthUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create/update seller in Neon (same logic as your NextAuth signIn callback)
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
      
      // Same redirect logic as your current system
      if (data.isNewUser || !data.user.business_name) {
        router.push('/profile');
      } else {
        router.push('/dashboard');
      }
      
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user
  };
};