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
        
        console.log('🔍 Profile completion check:', { isComplete })
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

    // 1️⃣ Handle redirect result immediately after login
    const postLoginPath = sessionStorage.getItem('postLoginRedirect')
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          console.log('✅ Redirect sign-in success:', result.user.email)

          // Save or update user in DB
          await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUid: result.user.uid,
              email: result.user.email,
              name: result.user.displayName
            })
          })

          // Go to intended page
          if (postLoginPath) {
            sessionStorage.removeItem('postLoginRedirect')
            router.push(postLoginPath)
          } else {
            router.push('/dashboard')
          }
        }
      })
      .catch((error) => {
        console.error('❌ Redirect sign-in error:', error)
      })

    // 2️⃣ Listen to auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isProfileComplete = await checkProfileCompletion(firebaseUser)
        setUser({ ...firebaseUser, isProfileComplete, isActive: true })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // ✅ Google sign-in with redirect and memory of target page
  const signInWithGoogle = async (): Promise<void> => {
    try {
      sessionStorage.setItem('postLoginRedirect', '/dashboard')
      console.log('🚀 Starting Google redirect sign-in')
      await signInWithRedirect(auth, googleProvider)
    } catch (error) {
      console.error('❌ Sign-in error:', error)
      alert('Sign-in failed. Please try again.')
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