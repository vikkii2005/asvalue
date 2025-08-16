'use client'

import { useEffect, useState, useCallback } from 'react'
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

  // 🚀 OPTIMIZED: Fast profile refresh
  const refreshUserProfile = useCallback(async (firebaseUser: User) => {
    try {
      const response = await fetch('/api/auth/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: firebaseUser.uid }),
      })

      if (response.ok) {
        const { seller } = await response.json()

        const isComplete = Boolean(
          seller?.business_name?.trim() &&
          seller?.category?.trim() &&
          seller?.phone?.trim()
        )

        const enhancedUser: AuthUser = {
          ...firebaseUser,
          sellerId: seller?.id,
          isProfileComplete: isComplete,
          isActive: seller?.is_active,
        }

        setUser(enhancedUser)
        return enhancedUser
      } else {
        const basicUser = firebaseUser as AuthUser
        setUser(basicUser)
        return basicUser
      }
    } catch (error) {
      console.error('Profile fetch error:', error)
      const basicUser = firebaseUser as AuthUser
      setUser(basicUser)
      return basicUser
    }
  }, [])

  // 🚀 EXTREME SPEED: Auth initialization with redirect result handling
  useEffect(() => {
    let unsubscribe: (() => void) | null = null

    const initAuth = async () => {
      try {
        console.time('🚀 Auth Init')
        
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth')

        const { auth } = await getFirebaseAuth()

        // ✅ INSTANT: Check for redirect result first (from Google login)
        console.time('🚀 Redirect Check')
        try {
          const result = await getRedirectResult(auth)
          if (result?.user) {
            console.log('✅ Redirect auth successful!')
            console.timeEnd('🚀 Redirect Check')
            
            // Set user immediately
            const basicUser: AuthUser = {
              ...result.user,
              isProfileComplete: false
            }
            setUser(basicUser)
            setLoading(false)
            
            // Background: Create/update seller + redirect
            Promise.all([
              fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  firebaseUid: result.user.uid,
                  email: result.user.email,
                  name: result.user.displayName,
                }),
              }),
              refreshUserProfile(result.user)
            ]).then(([signupResponse]) => {
              if (signupResponse.ok) {
                signupResponse.json().then(data => {
                  if (!data.isNewUser && data.user.business_name) {
                    router.replace('/dashboard')
                  } else {
                    router.replace('/profile')
                  }
                })
              } else {
                router.replace('/profile')
              }
            }).catch(() => {
              router.replace('/profile')
            })
            
            return // Exit early if redirect auth worked
          }
        } catch (error) {
          console.log('No redirect result')
        }
        console.timeEnd('🚀 Redirect Check')

        // Regular auth state listener
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            await refreshUserProfile(firebaseUser)
          } else {
            setUser(null)
          }
          setLoading(false)
        })
        
        console.timeEnd('🚀 Auth Init')
      } catch (error) {
        console.error('Auth initialization error:', error)
        setLoading(false)
      }
    }

    initAuth()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [refreshUserProfile, router])

  // 🚀 EXTREME SPEED: Redirect flow (NO POPUP = NO COOP ISSUES)
  const signInWithGoogle = async () => {
    try {
      console.time('🚀 Google Redirect')
      setLoading(true)

      // ✅ INSTANT: Load Firebase and start redirect immediately
      const [{ getFirebaseAuth }, { signInWithRedirect }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ])

      const { auth, provider } = await getFirebaseAuth()

      if (!provider || !auth) {
        throw new Error('Firebase not initialized')
      }

      console.log('🚀 Starting Google redirect...')
      
      // ✅ REDIRECT FLOW: No popup = No COOP issues = Extreme speed
      await signInWithRedirect(auth, provider)
      
      console.timeEnd('🚀 Google Redirect')
      
      // Note: Page will redirect to Google, then back to your app
      // The useEffect will handle the result when user returns
      
    } catch (error) {
      console.error('Redirect auth error:', error)
      setLoading(false)
      
      // Fallback: Try popup as last resort
      try {
        console.log('🔄 Trying popup fallback...')
        const { signInWithPopup } = await import('firebase/auth')
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { auth, provider } = await getFirebaseAuth()
        
        if (auth && provider) {
          const result = await signInWithPopup(auth, provider)
          router.push('/profile')
        }
      } catch (popupError) {
        console.error('Both redirect and popup failed:', popupError)
        alert('Sign in failed. Please try again or contact support.')
      }
    }
  }

  // 🚀 FAST: Logout
  const logout = async () => {
    try {
      const [{ getFirebaseAuth }, { signOut }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth'),
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

  const refreshProfile = useCallback(async () => {
    if (user) {
      return await refreshUserProfile(user)
    }
    return null
  }, [user, refreshUserProfile])

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    refreshProfile,
    isAuthenticated: !!user,
  }
}