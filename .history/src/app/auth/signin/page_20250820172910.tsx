'use client'

import { useEffect, useState } from 'react'
import { signInWithGoogle } from '@/lib/supabase/client'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function initializeAuth() {
      try {
        // THAT'S IT! Supabase handles everything
        await signInWithGoogle()
      } catch (err) {
        console.error('❌ Authentication failed:', err)
        setError(err instanceof Error ? err.message : 'Authentication failed')
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

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
        <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 mb-4'></div>
        <p className='text-gray-600'>
          You&apos;ll be redirected to Google to sign in securely
        </p>
      </div>
    </div>
  )
}