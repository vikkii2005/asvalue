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

  const checkProfileCompletion = async (firebaseUser: User): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: firebaseUser.uid }),
      })

      if (response.ok) {
        const { seller } = await response.json()
        return Boolean(
          seller?.business_name &&
          seller?.category &&
          seller?.phone
        )
      }
      return false
    } catch (error) {
      console.error('Profile check error:', error)
      return false
    }
  }

  useEffect(() => {
    console.log('🔥 useAuth: Setting up auth state listener')

    // Step 1: Handle redirect result after returning from provider
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          console.log('✅ Redirect sign-in success:', result.user.email)

          // Save user to DB
          await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firebaseUid: result.user.uid,
              email: result.user.email,
              name: result.user.displayName
            })
          })

          router.push('/dashboard')
        }
      })
      .catch((error) => {
        console.error('❌ Redirect sign-in error:', error)
      })

    // Step 2: Always listen for auth state changes
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

  // Sign in with redirect
  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true)
      console.log('🚀 Starting Google redirect sign-in')
      await signInWithRedirect(auth, googleProvider)
      // No further action here — after Google login, Firebase will redirect back and `getRedirectResult` will handle it
    } catch (error) {
      console.error('❌ Redirect sign-in failed:', error)
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
    const isProfileComplete = await checkProfileCompletion(user)
    const updatedUser = { ...user, isProfileComplete }
    setUser(updatedUser)
    return updatedUser
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signInWithGoogle, // ✅ Now uses redirect flow
    logout,
    refreshProfile,
  }
}