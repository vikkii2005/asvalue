'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  signInWithRedirect,
  getRedirectResult
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
        const enhancedUser: AuthUser = {
          ...firebaseUser,
          sellerId: undefined,
          isProfileComplete: true, // ✅ TEMPORARY FIX - set to true to test dashboard access
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

  // ✅ IMPROVED: Handle redirect result with better timing
  useEffect(() => {
    let mounted = true
    
    const handleRedirectResult = async () => {
      console.log('🔥 useAuth: Checking for redirect result')
      
      try {
        // ✅ WAIT A BIT: Sometimes redirect result needs time to be available
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const result = await getRedirectResult(auth)
        
        if (result && mounted) {
          console.log('✅ REDIRECT RESULT SUCCESS:', {
            email: result.user.email,
            uid: result.user.uid,
            currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
          })
          
          // ✅ STORE FLAG: Mark that we came from redirect
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('firebase_redirect_success', 'true')
          }
          
          // Navigate after auth state updates
          setTimeout(() => {
            if (mounted) {
              console.log('🚀 Navigating to dashboard after redirect')
              router.push('/dashboard')
            }
          }, 500)
          
        } else {
          console.log('ℹ️ No redirect result found')
          
          // ✅ CHECK IF WE SHOULD HAVE A REDIRECT RESULT
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search)
            const hasAuthParams = urlParams.has('code') || urlParams.has('state') || window.location.hash.includes('access_token')
            
            if (hasAuthParams) {
              console.log('⚠️ WARNING: Auth parameters found but no redirect result!', {
                search: window.location.search,
                hash: window.location.hash
              })
            }
          }
        }
      } catch (error: any) {
        if (mounted) {
          console.error('❌ REDIRECT ERROR:', {
            code: error.code,
            message: error.message,
            currentPath: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
          })
        }
      }
    }

    // ✅ DELAY EXECUTION: Give Firebase time to initialize
    const timer = setTimeout(handleRedirectResult, 200)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [router])

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true)
      console.log('🚀 Starting Google sign-in redirect')
      
      // ✅ CLEAR ANY PREVIOUS REDIRECT FLAGS
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('firebase_redirect_success')
      }
      
      await signInWithRedirect(auth, googleProvider)
      
    } catch (error: any) {
      console.error('❌ Sign-in error:', error)
      setLoading(false)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      await signOut(auth)
      setUser(null)
      
      // Clear any stored flags
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('firebase_redirect_success')
      }
      
      router.push('/')
    } catch (error) {
      console.error('❌ Logout error:', error)
      throw error
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