'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithGoogle, supabase } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function handleSignIn() {
      try {
        // Check if already authenticated
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // Already authenticated - redirect to success WITHOUT calling signIn
          router.replace('/auth/success')
          return
        }

        // Not authenticated - start OAuth flow
        setLoading(false)
        console.log('Starting Google OAuth...')
        await signInWithGoogle()
        
      } catch (err) {
        console.error('Auth error:', err)
        setError('Authentication failed. Please try again.')
        setLoading(false)
      }
    }

    // Add small delay to prevent race conditions
    const timer = setTimeout(handleSignIn, 500)
    return () => clearTimeout(timer)
  }, [router])

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600'>Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center max-w-md mx-auto px-4'>
          <div className='mb-4 text-6xl'>❌</div>
          <h1 className='text-2xl font-bold text-red-600 mb-4'>Authentication Error</h1>
          <p className='text-gray-700 mb-6'>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='mb-4 text-6xl'>🔄</div>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          Connecting to Google...
        </h1>
        <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
        <p className='text-gray-600 mt-4'>
          You&apos;ll be redirected to Google to sign in securely
        </p>
      </div>
    </div>
  )
}