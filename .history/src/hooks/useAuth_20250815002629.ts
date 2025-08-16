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

  // ✅ ADD: Profile refresh function (was missing)
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

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let hasHandledRedirect = false

    const initAuth = async () => {
      try {
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth')

        const { auth } = await getFirebaseAuth()

        // ✅ FIX: Check for redirect result FIRST (this was missing!)
        console.log('🔍 Checking for redirect result...')
        try {
          const redirectResult = await getRedirectResult(auth)
          if (redirectResult?.user) {
            hasHandledRedirect = true
            console.log('✅ REDIRECT SUCCESS! User:', redirectResult.user.email)
            
            // Set user immediately
            setUser(redirectResult.user as AuthUser)
            setLoading(false)
            
            // ✅ PROCESS: Handle signup and redirect
            try {
              console.log('📝 Processing signup...')
              const signupResponse = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  firebaseUid: redirectResult.user.uid,
                  email: redirectResult.user.email,
                  name: redirectResult.user.displayName,
                }),
              })

              if (signupResponse.ok) {
                const signupData = await signupResponse.json()
                console.log('✅ Signup successful:', signupData)
                
                // Check profile completion
                const updatedUser = await refreshUserProfile(redirectResult.user)
                
                // Redirect based on profile status
                setTimeout(() => {
                  if (updatedUser?.isProfileComplete) {
                    console.log('➡️ Redirecting to dashboard')
                    router.replace('/dashboard')
                  } else {
                    console.log('➡️ Redirecting to profile')
                    router.replace('/profile')
                  }
                }, 500)
                
              } else {
                console.log('❌ Signup failed, going to profile')
                setTimeout(() => router.replace('/profile'), 500)
              }
            } catch (error) {
              console.error('❌ Signup processing error:', error)
              setTimeout(() => router.replace('/profile'), 500)
            }
            
            return // Exit early after handling redirect
          } else {
            console.log('ℹ️ No redirect result found')
          }
        } catch (error) {
          console.log('ℹ️ No redirect result or error:', error)
        }

        // ✅ Regular auth state listener (for existing users)
        console.log('🔍 Setting up auth listener...')
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log('🔐 Auth changed:', firebaseUser?.email || 'No user')
          
          if (firebaseUser && !hasHandledRedirect) {
            await refreshUserProfile(firebaseUser)
          } else if (!firebaseUser) {
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
    return () => unsubscribe?.()
  }, [refreshUserProfile, router])

  // 🚀 REDIRECT FLOW: Use signInWithRedirect for fast auth
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      console.log('🚀 Starting REDIRECT auth (fast method)...')

      const [{ getFirebaseAuth }, { signInWithRedirect }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ])

      const { auth, provider } = await getFirebaseAuth()

      console.log('🔄 Redirecting to Google...')
      // ✅ USE REDIRECT: This is the fast method you want
      await signInWithRedirect(auth, provider)

    } catch (error) {
      console.error('❌ Redirect auth error:', error)
      setLoading(false)
      
      // ✅ FALLBACK: Try popup if redirect fails
      console.log('🔄 Trying popup fallback...')
      try {
        const { signInWithPopup } = await import('firebase/auth')
        const [{ getFirebaseAuth }] = await Promise.all([import('@/lib/firebase')])
        const { auth, provider } = await getFirebaseAuth()
        
        const result = await signInWithPopup(auth, provider)
        setUser(result.user as AuthUser)
        router.push('/profile')
      } catch (popupError) {
        console.error('Both redirect and popup failed:', popupError)
      }
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

  // ✅ ADD: refreshProfile function for FirebaseAuthProvider
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
    refreshProfile, // ✅ ADD: This was missing
    isAuthenticated: !!user,
  }
}