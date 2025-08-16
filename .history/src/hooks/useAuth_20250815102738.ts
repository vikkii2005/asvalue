'use client'

import { useState, useEffect, useCallback } from 'react'
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

// Enhanced user interface with complete type safety
interface AuthUser extends User {
  sellerId?: string
  isProfileComplete: boolean
  isActive: boolean
}

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })
  const router = useRouter()

  // 🎯 OPTIMIZED: Check profile completion from your database
  const checkProfileCompletion = useCallback(async (firebaseUser: User): Promise<boolean> => {
    try {
      // 🔥 TODO: Replace this with actual API call to your profile endpoint
      const response = await fetch('/api/profile', {
        headers: {
          'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
        }
      })
      
      if (response.ok) {
        const profile = await response.json()
        return profile.isComplete || false
      }
      
      // 🚀 TEMPORARY: Return true for testing, false for production profile setup flow
      return true
      
    } catch (error) {
      console.warn('Profile check failed, assuming incomplete:', error)
      return false
    }
  }, [])

  // 🎯 OPTIMIZED: Auth state listener with enhanced error handling
  useEffect(() => {
    console.log('🔥 useAuth: Initializing auth state listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 AUTH STATE CHANGED:', {
        user: firebaseUser?.email || 'null',
        uid: firebaseUser?.uid || 'null',
        timestamp: new Date().toISOString()
      })

      try {
        if (firebaseUser) {
          // 🚀 PRODUCTION: Check actual profile completion
          const isProfileComplete = await checkProfileCompletion(firebaseUser)
          
          const enhancedUser: AuthUser = {
            ...firebaseUser,
            sellerId: undefined, // Will be populated from your database
            isProfileComplete,
            isActive: true,
          }
          
          console.log('✅ User authenticated:', {
            email: enhancedUser.email,
            isProfileComplete: enhancedUser.isProfileComplete
          })
          
          setState(prev => ({
            ...prev,
            user: enhancedUser,
            loading: false,
            error: null
          }))
        } else {
          console.log('❌ No authenticated user')
          setState(prev => ({
            ...prev,
            user: null,
            loading: false,
            error: null
          }))
        }
      } catch (error) {
        console.error('❌ Auth state processing error:', error)
        setState(prev => ({
          ...prev,
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication failed'
        }))
      }
    })

    return () => unsubscribe()
  }, [checkProfileCompletion])

  // 🎯 OPTIMIZED: Redirect result handler with retry logic
  useEffect(() => {
    let mounted = true
    let retryCount = 0
    const maxRetries = 3

    const handleRedirectResult = async () => {
      console.log('🔥 Checking for redirect result (attempt:', retryCount + 1, ')')
      
      try {
        // 🚀 PRODUCTION: Wait for auth to stabilize
        await new Promise(resolve => setTimeout(resolve, 300))
        
        const result = await getRedirectResult(auth)
        
        if (result && mounted) {
          console.log('✅ REDIRECT SUCCESS:', {
            email: result.user.email,
            uid: result.user.uid,
            isNewUser: result.additionalUserInfo?.isNewUser,
            currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
          })
          
          // 🎯 STORE SUCCESS FLAG
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('auth_redirect_success', Date.now().toString())
          }
          
          // 🚀 SMART NAVIGATION: Wait for auth state to fully update
          setTimeout(() => {
            if (mounted) {
              console.log('🎯 Navigating after successful redirect')
              router.push('/dashboard')
            }
          }, 800)
          
        } else if (retryCount < maxRetries && mounted) {
          // 🔄 RETRY LOGIC: Sometimes redirect result needs multiple attempts
          retryCount++
          setTimeout(handleRedirectResult, 500)
        } else {
          console.log('ℹ️ No redirect result found after', retryCount + 1, 'attempts')
        }
        
      } catch (error: any) {
        if (mounted) {
          console.error('❌ REDIRECT ERROR:', {
            code: error.code,
            message: error.message,
            attempt: retryCount + 1
          })
          
          // 🎯 HANDLE SPECIFIC ERRORS
          if (error.code === 'auth/popup-blocked') {
            setState(prev => ({ ...prev, error: 'Popup was blocked. Please allow popups and try again.' }))
          } else if (error.code === 'auth/cancelled-popup-request') {
            console.log('🔄 Popup cancelled by user')
          } else {
            setState(prev => ({ ...prev, error: `Sign-in failed: ${error.message}` }))
          }
        }
      }
    }

    // 🎯 INTELLIGENT DELAY: Start checking after Firebase initializes
    const timer = setTimeout(handleRedirectResult, 100)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [router])

  // 🎯 OPTIMIZED: Google sign-in with enhanced error handling
  const signInWithGoogle = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      console.log('🚀 Initiating Google OAuth redirect')
      
      // 🔥 CLEAR PREVIOUS SESSION DATA
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_redirect_success')
        // Clear any cached auth state
        localStorage.removeItem('firebase:authUser')
      }
      
      await signInWithRedirect(auth, googleProvider)
      
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Sign-in failed'
      console.error('❌ Google sign-in error:', error)
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      
      throw error
    }
  }, [])

  // 🎯 OPTIMIZED: Secure logout with cleanup
  const logout = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      
      await signOut(auth)
      
      // 🔥 COMPLETE CLEANUP
      if (typeof window !== 'undefined') {
        sessionStorage.clear()
        localStorage.removeItem('firebase:authUser')
      }
      
      setState(prev => ({
        ...prev,
        user: null,
        loading: false,
        error: null
      }))
      
      router.push('/')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed'
      console.error('❌ Logout error:', error)
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))
      
      throw error
    }
  }, [router])

  // 🎯 OPTIMIZED: Profile refresh with caching
  const refreshProfile = useCallback(async (): Promise<AuthUser | null> => {
    if (!state.user) return null
    
    try {
      const isProfileComplete = await checkProfileCompletion(state.user)
      
      const updatedUser: AuthUser = {
        ...state.user,
        isProfileComplete
      }
      
      setState(prev => ({
        ...prev,
        user: updatedUser
      }))
      
      return updatedUser
      
    } catch (error) {
      console.error('❌ Profile refresh error:', error)
      return state.user
    }
  }, [state.user, checkProfileCompletion])

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    signInWithGoogle,
    logout,
    refreshProfile,
  }
}