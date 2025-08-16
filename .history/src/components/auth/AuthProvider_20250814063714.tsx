'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { User } from 'next-auth'
import { useSession } from 'next-auth/react'

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(status === 'loading')
  }, [status])

  return (
    <AuthContext.Provider 
      value={{
        user: session?.user || null,
        loading,
        isAuthenticated: !!session?.user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)