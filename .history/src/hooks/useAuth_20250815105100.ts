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
  const [isHandlingRedirect, setIsHandlingRedirect] = useState(true) // ✅ NEW STATE
  const router = useRouter()

  // ✅ CRITICAL: Handle redirect result FIRST, before anything else
  useEffect(() => {
    if (typeof window === 'undefined') return

    let mounted = true

    const handleRedirectResult = async () => {
      console.log('🔥 Checking for redirect result...')
      
      try {
        // ✅ WAIT: Give Firebase time to be ready
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const result = await getRedirectResult(auth)
        
        if (result && mounted) {
          console.log('✅ REDIRECT SUCCESS:', {
            email: result.user.email,
            uid: result.user.uid
          })
          
          // Create/update user in database
          await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUid: result.user.uid,
              email: result.user.email,
              name: result.user.displayName
            })
          })
          
          console.log('✅ User created in database')
          
          // ✅ IMPORTANT: Don't navigate here, let onAuthStateChanged handle it
          
        } else {
          console.log('ℹ️ No redirect result found')
        }
      } catch (error: any) {
        console.error('❌ Redirect error:', error)
      } finally {
        if (mounted) {
          setIsHandlingRedirect(false) // ✅ Allow normal auth flow to proceed
        }
      }
    }

    handleRedirectResult()

    return () => {
      mounted = false
    }
  }, [])

  // ✅ Auth state listener - WAIT for redirect handling to complete
  useEffect(() => {
    if (isHandlingRedirect) {
      console.log('⏳ Still handling redirect, waiting...')
      return
    }

    console.log('🔥 Setting up auth state listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 AUTH STATE CHANGED:', {
        user: firebaseUser?.email || 'null',
        uid: firebaseUser?.uid || 'null'
      })

      if (firebaseUser) {
        // Check profile completion
        const isProfileComplete = await checkProfileCompletion(firebaseUser)
        
        const enhancedUser: AuthUser = {
          ...firebaseUser,
          sellerId: undefined,
          isProfileComplete,
          isActive: true,
        }
        
        console.log('✅ Setting authenticated user:', enhancedUser.email)
        setUser(enhancedUser)
        
        // ✅ NAVIGATE: After auth state is established
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname
          if (currentPath === '/' || currentPath === '/login') {
            console.log('🚀 Navigating to dashboard')
            setTimeout(() => router.push('/dashboard'), 100)
          }
        }
        
      } else {
        console.log('❌ No user')
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [isHandlingRedirect, router])

  // Profile completion check
  const checkProfileCompletion = async (firebaseUser: User): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: firebaseUser.uid }),
      })

      if (response.ok) {
        const { seller } = await response.json()
        return Boolean(seller?.business_name && seller?.category && seller?.phone)
      }
      return false
    } catch (error) {
      console.error('Profile check error:', error)
      return false
    }
  }

  // ✅ REDIRECT sign-in function
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true)
      console.log('🚀 Starting Google redirect sign-in')
      
      // ✅ This will redirect the ENTIRE browser window
      await signInWithRedirect(auth, googleProvider)
      
      // ✅ NOTE: Code after this line won't execute because browser redirects
      
    } catch (error: any) {
      console.error('❌ Sign-in error:', error)
      setLoading(false)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
  }

  return {
    user,
    loading: loading || isHandlingRedirect, // ✅ Include redirect handling in loading
    isAuthenticated: !!user,
    signInWithGoogle,
    logout,
    refreshProfile: async () => user
  }
}