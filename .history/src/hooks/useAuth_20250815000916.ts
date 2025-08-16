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

  // 🔧 FIXED: Better redirect handling with detailed logging
  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let hasHandledRedirect = false // Prevent multiple redirect handling

    const initAuth = async () => {
      try {
        console.log('🔍 Initializing auth...')
        
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth')

        const { auth } = await getFirebaseAuth()

        // ✅ FIX 1: Handle redirect result with better error handling
        if (!hasHandledRedirect) {
          console.log('🔍 Checking for redirect result...')
          try {
            const result = await getRedirectResult(auth)
            if (result?.user) {
              hasHandledRedirect = true
              console.log('✅ Redirect auth successful for:', result.user.email)
              
              // Set user immediately
              const basicUser: AuthUser = {
                ...result.user,
                isProfileComplete: false
              }
              setUser(basicUser)
              setLoading(false)
              
              console.log('🔄 Processing signup/profile check...')
              
              // ✅ FIX 2: Sequential processing instead of Promise.all
              try {
                // Step 1: Create/update seller
                const signupResponse = await fetch('/api/auth/signup', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    firebaseUid: result.user.uid,
                    email: result.user.email,
                    name: result.user.displayName,
                  }),
                })

                console.log('📊 Signup API response status:', signupResponse.status)

                if (signupResponse.ok) {
                  const signupData = await signupResponse.json()
                  console.log('📊 Signup data:', signupData)

                  // Step 2: Check profile completion
                  const updatedUser = await refreshUserProfile(result.user)
                  
                  // ✅ FIX 3: Proper redirect logic with delays
                  setTimeout(() => {
                    if (updatedUser?.isProfileComplete) {
                      console.log('➡️ Redirecting to dashboard (complete profile)')
                      router.replace('/dashboard')
                    } else {
                      console.log('➡️ Redirecting to profile (incomplete profile)')
                      router.replace('/profile')
                    }
                  }, 1000) // Small delay to ensure state is set
                  
                } else {
                  console.log('❌ Signup failed, redirecting to profile')
                  setTimeout(() => {
                    router.replace('/profile')
                  }, 1000)
                }
              } catch (error) {
                console.error('❌ Background processing error:', error)
                setTimeout(() => {
                  router.replace('/profile')
                }, 1000)
              }
              
              return // Exit early after handling redirect
            } else {
              console.log('ℹ️ No redirect result found')
            }
          } catch (error) {
            console.log('ℹ️ No redirect result or error:', error)
          }
        }

        // ✅ FIX 4: Regular auth state listener (for existing users)
        console.log('🔍 Setting up auth state listener...')
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log('🔐 Auth state changed:', firebaseUser?.email || 'No user')
          
          if (firebaseUser && !hasHandledRedirect) {
            await refreshUserProfile(firebaseUser)
          } else if (!firebaseUser) {
            setUser(null)
          }
          setLoading(false)
        })
        
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
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

  // 🚀 REDIRECT AUTH: Same as before
  const signInWithGoogle = async () => {
    try {
      console.log('🚀 Starting Google redirect auth...')
      setLoading(true)

      const [{ getFirebaseAuth }, { signInWithRedirect }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ])

      const { auth, provider } = await getFirebaseAuth()

      if (!provider || !auth) {
        throw new Error('Firebase not initialized')
      }

      console.log('🔄 Redirecting to Google...')
      await signInWithRedirect(auth, provider)
      
    } catch (error) {
      console.error('❌ Redirect auth error:', error)
      setLoading(false)
    }
  }

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