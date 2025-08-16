'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { User } from 'firebase/auth'

// Enhanced user interface
interface AuthUser extends User {
  sellerId?: string
  isProfileComplete?: boolean
  isActive?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  isAuthenticated: boolean
  signInWithGoogle: () => Promise<void> // ✅ IMPORTANT: Include this in interface
  logout: () => Promise<void>
  refreshProfile: () => Promise<AuthUser | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within FirebaseAuthProvider')
  }
  return context
}

export default function FirebaseAuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const auth = useAuth() // ✅ This gets all functions including signInWithGoogle

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}