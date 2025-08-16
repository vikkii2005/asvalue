'use client'

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
      console.log('🚀 Starting Google popup sign-in')
      
      // ✅ POPUP WORKS PERFECTLY - No redirect issues
      const result = await signInWithPopup(auth, googleProvider)
      
      console.log('✅ Popup sign-in success:', result.user.email)
      
      // Create user in your database
      const signupResponse = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: result.user.uid,
          email: result.user.email,
          name: result.user.displayName
        })
      })

      if (signupResponse.ok) {
        console.log('✅ User created/updated in database')
        // Navigate to dashboard
        router.push('/dashboard')
      } else {
        console.error('❌ Failed to create user in database')
      }
      
    } catch (error: any) {
      console.error('❌ Sign-in error:', error)
      if (error.code === 'auth/popup-blocked') {
        alert('Please allow popups for this website and try again.')
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.log('User closed the popup')
      } else {
        alert('Sign-in failed. Please try again.')
      }
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