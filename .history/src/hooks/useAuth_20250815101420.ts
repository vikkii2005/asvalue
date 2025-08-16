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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Create enhanced user object
        const enhancedUser: AuthUser = {
          ...firebaseUser,
          sellerId: undefined, // Will be populated from your database
          isProfileComplete: false,
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

  // Handle redirect result on app load
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result) {
          // User successfully signed in via redirect
          console.log('✅ Redirect sign-in successful:', result.user.email)
          
          // Optional: Navigate to dashboard or desired page
          router.push('/dashboard')
        }
      } catch (error: any) {
        console.error('❌ Redirect sign-in error:', error)
        
        // Handle specific errors
        if (error.code === 'auth/popup-blocked') {
          console.log('Popup was blocked, using redirect instead')
        }
      }
    }

    handleRedirectResult()
  }, [router])

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true)
      
      // Use redirect instead of popup
      await signInWithRedirect(auth, googleProvider)
      
      // Note: After redirect, user will be redirected back to your app
      // The actual sign-in result will be handled in the useEffect above
      
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
      router.push('/') // Redirect to home page
    } catch (error) {
      console.error('❌ Logout error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async (): Promise<AuthUser | null> => {
    if (!user) return null
    
    try {
      // Here you would typically fetch updated user data from your database
      // For now, return the current user
      return user
    } catch (error) {
      console.error('❌ Profile refresh error:', error)
      return user
    }
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