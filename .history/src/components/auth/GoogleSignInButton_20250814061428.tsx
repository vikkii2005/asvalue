'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setLoading(true)
      // Automatically redirect to profile setup after sign-in
      await signIn('google', { 
        callbackUrl: '/profile',
        redirect: true 
      })
    } catch (error) {
      console.error('Sign-in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors disabled:opacity-50"
    >
      {loading ? 'Signing in...' : 'Beta Sign Up'}
    </button>
  )
}