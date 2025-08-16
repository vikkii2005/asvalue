'use client'

import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import { useRouter } from 'next/navigation'

export default function AuthDebug() {
  const { user, loading, isAuthenticated } = useAuthContext()
  const router = useRouter()

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug Info:</h4>
      <div>Loading: {loading ? 'Yes' : 'No'}</div>
      <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
      <div>User Email: {user?.email || 'None'}</div>
      <div>Profile Complete: {user?.isProfileComplete ? 'Yes' : 'No'}</div>
      <div>Current Path: {window.location.pathname}</div>
      
      <div className="mt-2 space-x-2">
        <button 
          onClick={() => router.push('/profile')} 
          className="bg-blue-500 px-2 py-1 rounded text-xs"
        >
          → Profile
        </button>
        <button 
          onClick={() => router.push('/dashboard')} 
          className="bg-green-500 px-2 py-1 rounded text-xs"
        >
          → Dashboard
        </button>
      </div>
    </div>
  )
}