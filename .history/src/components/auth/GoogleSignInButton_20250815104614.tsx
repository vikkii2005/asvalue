'use client'

import { useAuthContext } from './FirebaseAuthProvider'
import { useState } from 'react'

export default function GoogleSignInButton() {
  const { signInWithGoogle, loading: authLoading } = useAuthContext()
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Sign-in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading || authLoading}
      className='rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl disabled:opacity-50'
    >
      {loading || authLoading ? 'Signing in...' : 'Join Free Beta'}
    </button>
  )
}