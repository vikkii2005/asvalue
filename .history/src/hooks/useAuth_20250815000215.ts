'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { User, AuthProvider } from 'firebase/auth'
import { useRouter } from 'next/navigation'

// ✅ Types
interface AuthUser extends User {
  sellerId?: string
  isProfileComplete?: boolean
  isActive?: boolean
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ✅ Simple in-memory cache to avoid repeated API calls
  const profileCache = useRef<Record<string, AuthUser>>({})

  // 🚀 Super fast profile fetch with caching
  const refreshUserProfile = useCallback(async (firebaseUser: User) => {
    if (profileCache.current[firebaseUser.uid]) {
      setUser(profileCache.current[firebaseUser.uid])
      return profileCache.current[firebaseUser.uid]
    }

    try {
      const response = await fetch('/api/auth/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: firebaseUser.uid }),
      })

      let enhancedUser: AuthUser
      if (response.ok) {
        const { seller } = await response.json()
        const isComplete = Boolean(
          seller?.business_name?.trim() &&
            seller?.category?.trim() &&
            seller?.phone?.trim()
        )
        enhancedUser = {
          ...firebaseUser,
          sellerId: seller?.id,
          isProfileComplete: isComplete,
          isActive: seller?.is_active,
        }
      } else {
        enhancedUser = { ...firebaseUser, isProfileComplete: false }
      }

      profileCache.current[firebaseUser.uid] = enhancedUser
      setUser(enhancedUser)
      return enhancedUser
    } catch (error) {
      console.error('Profile fetch error:', error)
      const basicUser = { ...firebaseUser, isProfileComplete: false }
      setUser(basicUser)
      return basicUser
    }
  }, [])

  // 🚀 Fast auth listener
  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    const initAuth = async () => {
      try {
        const [{ getFirebaseAuth }, { onAuthStateChanged }] = await Promise.all([
          import('@/lib/firebase'),
          import('firebase/auth'),
        ])

        const { auth } = await getFirebaseAuth()
        unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
          if (firebaseUser) {
            refreshUserProfile(firebaseUser) // No `await` → runs instantly
          } else {
            setUser(null)
          }
          setLoading(false)
        })
      } catch (error) {
        console.error('Auth init error:', error)
        setLoading(false)
      }
    }
    initAuth()
    return () => unsubscribe?.()
  }, [refreshUserProfile])

  // 🚀 Super fast Google Sign-in
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const [{ getFirebaseAuth }, { signInWithPopup }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth'),
      ])

      const { auth, provider } = await getFirebaseAuth()
      if (!provider || !auth) throw new Error('Firebase not initialized')

      const result = await signInWithPopup(auth, provider as AuthProvider)
      const basicUser: AuthUser = { ...result.user, isProfileComplete: false }
      setUser(basicUser) // Update immediately for snappy feel
      setLoading(false)
      router.push('/profile')

      // 🔥 Background calls
      Promise.all([
        fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebaseUid: result.user.uid,
            email: result.user.email,
            name: result.user.displayName,
          }),
        }).then(res => res.ok && res.json()),
        refreshUserProfile(result.user),
      ]).then(([signupData]) => {
        if (signupData && !signupData.isNewUser && signupData.user?.business_name) {
          router.replace('/dashboard')
        }
      }).catch(err => console.error('Background error:', err))

    } catch (error: any) {
      console.error('Sign in error:', error)
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this site.')
      }
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
      if (auth) await signOut(auth)
      setUser(null)
      profileCache.current = {}
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
    refreshProfile: () => user && refreshUserProfile(user),
    isAuthenticated: !!user,
  }
}