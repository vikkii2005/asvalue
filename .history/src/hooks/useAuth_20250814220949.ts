'use client';

import { useEffect, useState } from 'react';
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

  // ✅ REFRESH USER PROFILE FUNCTION - Key fix for your redirect loop
  const refreshUserProfile = async (firebaseUser: User) => {
    try {
      console.log('🔄 Refreshing user profile for:', firebaseUser.email);
      
      const response = await fetch('/api/auth/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: firebaseUser.uid }),
      });
      
      if (response.ok) {
        const { seller } = await response.json();
        
        console.log('👤 Seller data fetched:', seller);
        
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
        
        console.log('🔍 Profile completion check:', {
          business_name: seller?.business_name,
          category: seller?.category,
          phone: seller?.phone,
          isComplete
        });
        
        setUser(enhancedUser);
        return enhancedUser;
      } else {
        console.log('❌ Failed to fetch seller profile, using basic user data');
        const basicUser = firebaseUser as AuthUser;
        setUser(basicUser);
        return basicUser;
      }
    } catch (error) {
      console.error('❌ Error fetching seller data:', error);
      const basicUser = firebaseUser as AuthUser;
      setUser(basicUser);
      return basicUser;
    }
  };

  // ✅ MAIN AUTH STATE LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 Auth state changed:', firebaseUser ? firebaseUser.email : 'No user');
      
      if (firebaseUser) {
        await refreshUserProfile(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ✅ GOOGLE SIGN IN FUNCTION
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('🚀 Starting Google sign in...');
      
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create/update seller in database
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
      
      console.log('📊 Signup API response:', data);
      
      // Redirect based on profile completion
      if (data.isNewUser || !data.user.business_name) {
        console.log('➡️ Redirecting to profile (new user or incomplete profile)');
        router.push('/profile');
      } else {
        console.log('➡️ Redirecting to dashboard (existing complete profile)');
        router.push('/dashboard');
      }
      
    } catch (error) {
      console.error('❌ Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT FUNCTION
  const logout = async () => {
    try {
      console.log('👋 Signing out...');
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  // ✅ MANUAL REFRESH FUNCTION (for after profile updates)
  const refreshProfile = async () => {
    if (user) {
      console.log('🔄 Manually refreshing profile...');
      return await refreshUserProfile(user);
    }
    return null;
  };

  // ✅ RETURN ALL AUTH FUNCTIONS AND STATE
  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    refreshProfile, // ← NEW: Use this after profile updates
    isAuthenticated: !!user
  };
};