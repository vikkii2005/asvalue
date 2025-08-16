'use client'

import { useAuthContext } from './FirebaseAuthProvider'
import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { useRouter } from 'next/navigation'

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async () => {
    setLoading(true)
    try {
      // ✅ POPUP WORKS PERFECTLY - No redirect issues
      const result = await signInWithPopup(auth, googleProvider)
      
      console.log('✅ Popup sign-in success:', result.user.email)
      
      // Create user in your database
      await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName
        })
      })
      
      // Navigate to dashboard
      router.push('/dashboard')
      
    } catch (error) {
      console.error('❌ Sign-in error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className='rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-blue-700 hover:shadow-xl disabled:opacity-50'
    >
      {loading ? 'Signing in...' : 'Join Free Beta'}
    </button>
  )
}