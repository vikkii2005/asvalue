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

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    let redirectHandled = false

    const initAuth = async () => {
      try {
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth')

        const { auth } = await getFirebaseAuth()

        // ✅ FIX 1: Enhanced redirect result checking with retry logic
        const checkRedirectResult = async (maxRetries = 3) => {
          for (let i = 0; i < maxRetries; i++) {
            try {
              console.log(`🔍 Checking redirect result (attempt ${i + 1})...`)
              
              const redirectResult = await getRedirectResult(auth)
              
              if (redirectResult?.user) {
                redirectHandled = true
                console.log('✅ REDIRECT SUCCESS! User:', redirectResult.user.email)
                
                // Set user immediately
                setUser(redirectResult.user as AuthUser)
                setLoading(false)
                
                // Process signup and profile
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
                    
                    const updatedUser = await refreshUserProfile(redirectResult.user)
                    
                    // ✅ FIX 2: Use window.location for guaranteed redirect
                    setTimeout(() => {
                      if (updatedUser?.isProfileComplete) {
                        console.log('➡️ Redirecting to dashboard')
                        window.location.href = '/dashboard'
                      } else {
                        console.log('➡️ Redirecting to profile')
                        window.location.href = '/profile'
                      }
                    }, 1000)
                  } else {
                    console.log('❌ Signup failed, going to profile')
                    setTimeout(() => {
                      window.location.href = '/profile'
                    }, 1000)
                  }
                } catch (error) {
                  console.error('❌ Signup processing error:', error)
                  setTimeout(() => {
                    window.location.href = '/profile'
                  }, 1000)
                }
                
                return true // Success
              } else if (i === 0) {
                // Only log on first attempt to avoid spam
                console.log('ℹ️ No redirect result found, retrying...')
              }
            } catch (error) {
              if (i === 0) {
                console.log('ℹ️ Redirect check error (will retry):', error)
              }
            }
            
            // Wait before retry (except on last attempt)
            if (i < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, 1000))
            }
          }
          
          console.log('ℹ️ No redirect result after all retries')
          return false
        }

        // ✅ FIX 3: Check redirect result with retries
        const redirectSuccess = await checkRedirectResult()
        
        if (redirectSuccess) {
          return // Exit early if redirect was handled
        }

        // ✅ FIX 4: Regular auth state listener (for existing users)
        console.log('🔍 Setting up auth listener...')
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          console.log('🔐 Auth changed:', firebaseUser?.email || 'No user')
          
          if (firebaseUser && !redirectHandled) {
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

  // 🚀 REDIRECT FLOW: Keep using redirect for speed
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      console.log('🚀 Starting REDIRECT auth...')

      const [{ getFirebaseAuth }, { signInWithRedirect }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ])

      const { auth, provider } = await getFirebaseAuth()

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