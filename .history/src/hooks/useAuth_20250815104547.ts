'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  signInWithPopup
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

  // ✅ Check profile completion from database
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
      } else {
        console.log('❌ No user - setting to null')
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ✅ ADD BACK: signInWithGoogle function
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true)
      console.log('🚀 Starting Google popup sign-in')
      
      // Use popup for better reliability
      const result = await signInWithPopup(auth, googleProvider)
      
      console.log('✅ Popup sign-in success:', result.user.email)
      
      // Create user in your database
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
        // Navigate to dashboard
        router.push('/dashboard')
      } else {
        console.error('❌ Failed to create user in database')
      }
      
    } catch (error: any) {
      console.error('❌ Sign-in error:', error)
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this website and try again.')
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup')
      } else {
        alert('Sign-in failed. Please try again.')
      }
      setLoading(false)
      throw error
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      await signOut(auth)
      setUser(null)
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
    
    // Re-check profile completion
    const isProfileComplete = await checkProfileCompletion(user)
    const updatedUser = { ...user, isProfileComplete }
    setUser(updatedUser)
    return updatedUser
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle, // ✅ IMPORTANT: Export this function
    logout,
    refreshProfile,
  }
}