'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  signInWithRedirect,
  getRedirectResult,
  AuthError
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

// Enhanced user interface
interface AuthUser extends User {
  sellerId?: string
  isProfileComplete?: boolean
  isActive?: boolean
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log('🔥 useAuth: Setting up auth state listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 AUTH STATE CHANGED:', {
        user: firebaseUser?.email || 'null',
        uid: firebaseUser?.uid || 'null',
        timestamp: new Date().toISOString()
      })

      if (firebaseUser) {
        // Create enhanced user object
        const enhancedUser: AuthUser = {
          ...firebaseUser,
          sellerId: undefined,
          isProfileComplete: true, // ✅ Set to true temporarily for testing
          isActive: true,
        }
        
        console.log('✅ Setting user:', {
          email: enhancedUser.email,
          isProfileComplete: enhancedUser.isProfileComplete
        })
        
        setUser(enhancedUser)
      } else {
        console.log('❌ No user - setting to null')
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ✅ SSR-SAFE: Handle redirect result on app load
  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return
    
    console.log('🔥 useAuth: Checking for redirect result')
    
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        
        if (result) {
          console.log('✅ REDIRECT RESULT SUCCESS:', {
            email: result.user.email,
            uid: result.user.uid,
            currentPath: window.location.pathname
          })
          
          // Wait a bit for auth state to update
          setTimeout(() => {
            console.log('🚀 Navigating to dashboard after redirect')
            router.push('/dashboard')
          }, 1000)
          
        } else {
          console.log('ℹ️ No redirect result found')
        }
      } catch (error: unknown) {
        // ✅ FIXED: Changed from 'any' to 'unknown' with proper type checking
        const authError = error as AuthError
        console.error('❌ REDIRECT ERROR:', {
          code: authError.code || 'unknown',
          message: authError.message || 'Unknown error occurred',
          currentPath: typeof window !== 'undefined' ? window.location.pathname : 'server'
        })
      }
    }

    handleRedirectResult()
  }, [router])

  const signInWithGoogle = async (): Promise<void> => {
    // ✅ SSR-SAFE: Only run on client-side
    if (typeof window === 'undefined') {
      console.warn('❌ signInWithGoogle called on server-side')
      return
    }

    try {
      setLoading(true)
      console.log('🚀 Starting Google sign-in redirect')
      
      await signInWithRedirect(auth, googleProvider)
      
    } catch (error: unknown) {
      // ✅ FIXED: Changed from 'any' to 'unknown' with proper type checking
      const authError = error as AuthError
      console.error('❌ Sign-in error:', authError)
      setLoading(false)
      throw authError
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      await signOut(auth)
      setUser(null)
      router.push('/')
    } catch (error: unknown) {
      const authError = error as AuthError
      console.error('❌ Logout error:', authError)
      throw authError
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async (): Promise<AuthUser | null> => {
    if (!user) return null
    return user
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    logout,
    refreshProfile,
  }
}