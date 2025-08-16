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

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let isInitialized = false

    const initAuth = async () => {
      try {
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth')

        const { auth } = await getFirebaseAuth()

        // ✅ STEP 1: Check redirect result FIRST (most important)
        console.log('🔍 Checking redirect result...')
        try {
          const redirectResult = await getRedirectResult(auth)
          if (redirectResult?.user) {
            console.log('✅ REDIRECT SUCCESS! User:', redirectResult.user.email)
            
            // Set user immediately
            setUser(redirectResult.user as AuthUser)
            setLoading(false)
            isInitialized = true
            
            // ✅ FORCE NAVIGATION - Use window.location for guaranteed redirect
            console.log('🚀 FORCING redirect to profile...')
            
            // Try multiple methods to ensure redirect works
            setTimeout(() => {
              window.location.replace('/profile')
            }, 100)
            
            // Backup method
            setTimeout(() => {
              if (window.location.pathname === '/') {
                console.log('🔄 Backup redirect attempt...')
                router.push('/profile')
              }
            }, 1000)
            
            return // Exit here - don't set up auth listener
          } else {
            console.log('ℹ️ No redirect result found')
          }
        } catch (redirectError) {
          console.log('ℹ️ Redirect check error (normal):', redirectError.message)
        }

        // ✅ STEP 2: Set up auth state listener (only if no redirect result)
        console.log('🔍 Setting up auth listener...')
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          const logMessage = firebaseUser ? firebaseUser.email : 'No user'
          console.log('🔐 Auth changed:', logMessage)
          
          if (firebaseUser && !isInitialized) {
            setUser(firebaseUser as AuthUser)
            console.log('✅ Existing user detected, going to dashboard')
            router.push('/dashboard')
          } else if (!firebaseUser && !isInitialized) {
            setUser(null)
          }
          
          setLoading(false)
        })

      } catch (error) {
        console.error('❌ Auth init error:', error)
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [router])

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      console.log('🚀 Starting Google redirect...')

      const [{ getFirebaseAuth }, { signInWithRedirect }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ])

      const { auth, provider } = await getFirebaseAuth()
      
      console.log('🔄 Redirecting to Google...')
      await signInWithRedirect(auth, provider)

    } catch (error) {
      console.error('❌ Sign in error:', error)
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