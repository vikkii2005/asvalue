'use client'

import { useEffect, useState } from 'react'
import { User } from 'firebase/auth'
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

  // 🔥 SIMPLE: Just handle auth state changes
  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initAuth = async () => {
      try {
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth')

        const { auth } = await getFirebaseAuth()

        // Check redirect first
        try {
          const result = await getRedirectResult(auth)
          if (result?.user) {
            console.log('✅ User signed in:', result.user.email)
            setUser(result.user as AuthUser)
            setLoading(false)
            
            // ✅ DIRECT REDIRECT - NO API CALLS
            console.log('➡️ Going to profile page...')
            router.replace('/profile')
            return
          }
        } catch (error) {
          console.log('No redirect result')
        }

        // Regular auth listener
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log('Auth changed:', firebaseUser?.email || 'No user')
          setUser(firebaseUser as AuthUser)
          setLoading(false)
        })

      } catch (error) {
        console.error('Auth error:', error)
        setLoading(false)
      }
    }

    initAuth()

    return () => unsubscribe?.()
  }, [router])

  // 🔥 SIMPLE: Google sign in
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      console.log('🚀 Starting Google auth...')

      const [{ getFirebaseAuth }, { signInWithRedirect }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ])

      const { auth, provider } = await getFirebaseAuth()
      await signInWithRedirect(auth, provider)

    } catch (error) {
      console.error('Auth error:', error)
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const [{ getFirebaseAuth }, { signOut }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ])

      const { auth } = await getFirebaseAuth()
      if (auth) {
        await signOut(auth)
      }
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user,
  }
}