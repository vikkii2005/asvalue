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

  // ✅ FIXED: Check actual profile completion from database
  const checkProfileCompletion = async (firebaseUser: User): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: firebaseUser.uid }),
      })

      if (response.ok) {
        const { seller } = await response.json()
        
        // ✅ FIXED: Correct field names (no backslashes)
        const isComplete = Boolean(
          seller?.business_name && 
          seller?.category && 
          seller?.phone
        )
        
        console.log('🔍 Profile completion check:', {
          business_name: seller?.business_name,
          category: seller?.category,
          phone: seller?.phone,
          isComplete
        })
        
        return isComplete
      }
      
      return false
    } catch (error) {
      console.error('Profile check error:', error)
      return false
    }
  }

  useEffect(() => {
    console.log('🔥 useAuth: Setting up auth state listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 AUTH STATE CHANGED:', {
        user: firebaseUser?.email || 'null',
        uid: firebaseUser?.uid || 'null',
        timestamp: new Date().toISOString()
      })

      if (firebaseUser) {
        // ✅ FIXED: Actually check profile completion
        const isProfileComplete = await checkProfileCompletion(firebaseUser)
        
        const enhancedUser: AuthUser = {
          ...firebaseUser,
          sellerId: undefined,
          isProfileComplete, // ✅ REAL profile completion status
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
          
          // ✅ FIXED: Wait for auth state to fully update before redirecting
          setTimeout(() => {
            console.log('🚀 Navigating to dashboard after redirect')
            router.push('/dashboard')
          }, 2000) // Increased wait time
          
        } else {
          console.log('ℹ️ No redirect result found')
        }
      } catch (error: unknown) {
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
    if (typeof window === 'undefined') {
      console.warn('❌ signInWithGoogle called on server-side')
      return
    }

    try {
      setLoading(true)
      console.log('🚀 Starting Google sign-in redirect')
      
      await signInWithRedirect(auth, googleProvider)
      
    } catch (error: unknown) {
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
    
    // ✅ REFRESH: Re-check profile completion
    const isProfileComplete = await checkProfileCompletion(user)
    const updatedUser = { ...user, isProfileComplete }
    setUser(updatedUser)
    return updatedUser
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