'use client'

import { useState, useEffect } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

interface AuthUser extends User {
  isProfileComplete?: boolean
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Check profile from database
        try {
          const response = await fetch('/api/auth/user-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firebaseUid: firebaseUser.uid }),
          })

          if (response.ok) {
            const { seller } = await response.json()
            const isComplete = Boolean(seller?.business_name && seller?.category && seller?.phone)
            
            setUser({
              ...firebaseUser,
              isProfileComplete: isComplete
            })
          } else {
            setUser({ ...firebaseUser, isProfileComplete: false })
          }
        } catch {
          setUser({ ...firebaseUser, isProfileComplete: false })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const logout = async () => {
    await signOut(auth)
    router.push('/')
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout
  }
}