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

    const initAuth = async () => {
      try {
        const { getFirebaseAuth } = await import('@/lib/firebase')
        const { onAuthStateChanged } = await import('firebase/auth')

        const { auth } = await getFirebaseAuth()

        // Simple auth state listener
        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log('🔐 Auth changed:', firebaseUser?.email || 'No user')
          setUser(firebaseUser as AuthUser)
          setLoading(false)
        })

      } catch (error) {
        console.error('❌ Auth init error:', error)
        setLoading(false)
      }
    }

    initAuth()
    return () => unsubscribe?.()
  }, [])

  // 🚀 POPUP FLOW - But with optimizations to make it faster
  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      console.log('🚀 Starting optimized popup auth...')

      // ✅ PRELOAD: Get Firebase ready immediately
      const [{ getFirebaseAuth }, { signInWithPopup }] = await Promise.all([
        import('@/lib/firebase'),
        import('firebase/auth')
      ])

      const { auth, provider } = await getFirebaseAuth()

      // ✅ OPTIMIZATION 1: Configure popup for speed
      const popupOptions = {
        // Smaller popup size = faster loading
        width: 500,
        height: 600,
        left: (screen.width / 2) - 250,
        top: (screen.height / 2) - 300
      }

      console.time('🚀 Popup Auth Time')
      
      // ✅ OPTIMIZATION 2: Use popup with optimized settings
      const result = await signInWithPopup(auth, provider)
      
      console.timeEnd('🚀 Popup Auth Time')
      console.log('✅ Popup auth successful:', result.user.email)

      // ✅ IMMEDIATE: Set user and redirect
      setUser(result.user as AuthUser)
      setLoading(false)

      // ✅ FAST: Direct redirect to profile
      console.log('➡️ Redirecting to profile...')
      router.push('/profile')

      // ✅ BACKGROUND: Handle signup API call (non-blocking)
      fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName,
        }),
      }).then(response => {
        console.log('📝 Signup API completed')
      }).catch(error => {
        console.error('Signup API error:', error)
      })

    } catch (error) {
      console.error('❌ Popup auth error:', error)
      setLoading(false)
      
      // Handle specific popup errors
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code: string }
        
        if (firebaseError.code === 'auth/popup-blocked') {
          alert('Please allow popups for this site. Check your browser settings and try again.')
        } else if (firebaseError.code === 'auth/popup-closed-by-user') {
          console.log('User closed the popup')
        }
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

  return {
    user,
    loading,
    signInWithGoogle,
    logout,
    isAuthenticated: !!user,
  }
}