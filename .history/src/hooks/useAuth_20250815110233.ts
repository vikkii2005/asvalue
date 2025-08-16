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

  // ✅ CRITICAL: Check for redirect result on every page load
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleRedirectResult = async () => {
      console.log('🔍 Checking for redirect result...')
      
      try {
        // ✅ This is the magic - detects if we returned from Google redirect
        const result = await getRedirectResult(auth)
        
        if (result) {
          // ✅ SUCCESS: We have a user from the redirect!
          console.log('🎉 REDIRECT SIGN-IN SUCCESS:', {
            email: result.user.email,
            uid: result.user.uid,
            name: result.user.displayName
          })
          
          // Create/update user in database
          const signupResponse = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUid: result.user.uid,
              email: result.user.email,
              name: result.user.displayName
            })
          })

          if (signupResponse.ok) {
            console.log('✅ User created/updated in database')
          }
          
          // ✅ REDIRECT TO DASHBOARD: This is what you want!
          console.log('🚀 Navigating to dashboard after redirect sign-in')
          router.push('/dashboard')
          
        } else {
          // ℹ️ Normal page load, not from redirect
          console.log('ℹ️ Normal page load - no redirect result')
        }
      } catch (error: any) {
        console.error('❌ Redirect result error:', error)
      }
    }

    // ✅ Run immediately on page load
    handleRedirectResult()
  }, [router])

  // Regular auth state listener
  useEffect(() => {
    console.log('🔥 Setting up auth state listener')
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check profile completion
        const isProfileComplete = await checkProfileCompletion(firebaseUser)
        
        const enhancedUser: AuthUser = {
          ...firebaseUser,
          sellerId: undefined,
          isProfileComplete,
          isActive: true,
        }
        
        setUser(enhancedUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

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
      return false
    }
  }

  // ✅ REDIRECT sign-in function
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true)
      console.log('🚀 Starting Google redirect sign-in')
      console.log('📍 Current URL:', window.location.href)
      
      // ✅ This will redirect the ENTIRE browser to Google
      await signInWithRedirect(auth, googleProvider)
      
      // ✅ NOTE: Code after this won't execute - browser redirects away!
      
    } catch (error: any) {
      console.error('❌ Sign-in error:', error)
      setLoading(false)
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
    loading,
    isAuthenticated: !!user,
    signInWithGoogle,
    logout,
    refreshProfile: async () => user
  }
}