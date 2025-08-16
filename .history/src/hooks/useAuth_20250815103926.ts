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

interface AuthUser extends User {
  sellerId?: string
  isProfileComplete?: boolean
  isActive?: boolean
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isProcessingRedirect, setIsProcessingRedirect] = useState(false) // ✅ NEW STATE
  const router = useRouter()

  // ✅ FIXED: Better redirect result handling with proper timing
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    let mounted = true
    
    const handleRedirectResult = async () => {
      console.log('🔥 useAuth: Checking for redirect result')
      setIsProcessingRedirect(true) // ✅ Mark as processing
      
      try {
        // ✅ CRITICAL: Wait longer for Firebase to be ready
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const result = await getRedirectResult(auth)
        
        if (result && mounted) {
          console.log('✅ REDIRECT RESULT SUCCESS:', {
            email: result.user.email,
            uid: result.user.uid,
            currentPath: window.location.pathname
          })
          
          // ✅ Don't navigate here - let onAuthStateChanged handle it
          
        } else {
          console.log('ℹ️ No redirect result found')
        }
      } catch (error: unknown) {
        const authError = error as AuthError
        console.error('❌ REDIRECT ERROR:', {
          code: authError.code || 'unknown',
          message: authError.message || 'Unknown error occurred'
        })
      } finally {
        if (mounted) {
          setIsProcessingRedirect(false) // ✅ Mark as done
        }
      }
    }

    // ✅ Start checking after a delay
    const timer = setTimeout(handleRedirectResult, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  // ✅ FIXED: Auth state listener that waits for redirect processing
  useEffect(() => {
    console.log('🔥 useAuth: Setting up auth state listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 AUTH STATE CHANGED:', {
        user: firebaseUser?.email || 'null',
        uid: firebaseUser?.uid || 'null',
        isProcessingRedirect,
        timestamp: new Date().toISOString()
      })

      // ✅ WAIT: Don't process auth state while handling redirect
      if (isProcessingRedirect) {
        console.log('⏳ Still processing redirect, waiting...')
        return
      }

      if (firebaseUser) {
        // Check profile completion
        const isProfileComplete = await checkProfileCompletion(firebaseUser)
        
        const enhancedUser: AuthUser = {
          ...firebaseUser,
          sellerId: undefined,
          isProfileComplete,
          isActive: true,
        }
        
        console.log('✅ Setting user:', {
          email: enhancedUser.email,
          isProfileComplete: enhancedUser.isProfileComplete
        })
        
        setUser(enhancedUser)
        
        // ✅ NAVIGATE: Only after auth state is established
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
          console.log('🚀 Navigating to dashboard from landing page')
          setTimeout(() => router.push('/dashboard'), 500)
        }
        
      } else {
        console.log('❌ No user - setting to null')
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isProcessingRedirect, router])

  // ✅ Profile completion check
  const checkProfileCompletion = async (firebaseUser: User): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: firebaseUser.uid }),
      })

      if (response.ok) {
        const { seller } = await response.json()
        const isComplete = Boolean(
          seller?.business_name && 
          seller?.category && 
          seller?.phone
        )
        return isComplete
      }
      return false
    } catch (error) {
      console.error('Profile check error:', error)
      return false
    }
  }

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
    const isProfileComplete = await checkProfileCompletion(user)
    const updatedUser = { ...user, isProfileComplete }
    setUser(updatedUser)
    return updatedUser
  }

  return {
    user,
    loading: loading || isProcessingRedirect, // ✅ Include redirect processing in loading
    isAuthenticated: !!user,
    signInWithGoogle,
    logout,
    refreshProfile,
  }
}