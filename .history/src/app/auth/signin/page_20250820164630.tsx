'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleGoogleLogin = async () => {
      try {
        console.log('🔄 Starting Google OAuth with Supabase')
        
        const redirectTo = 'http://localhost:3000/auth/callback'
        
        // 🔥 FIX: Remove prompt=select_account to avoid repeated selection
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectTo,
            queryParams: {
              access_type: 'offline',
              // ❌ REMOVED: prompt: 'select_account' - this was causing the loop
            }
          }
        })

        if (error) {
          console.error('❌ OAuth initiation failed:', error)
          setError(error.message)
          setIsLoading(false)
        } else {
          console.log('✅ OAuth initiated successfully')
        }
        
      } catch (err) {
        console.error('❌ Unexpected error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setIsLoading(false)
      }
    }

    handleGoogleLogin()
  }, [supabase])

  if (error) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='max-w-md rounded-lg bg-white p-8 text-center shadow-lg'>
          <div className='mb-4 text-6xl text-red-500'>⚠️</div>
          <h2 className='mb-4 text-xl font-bold text-red-600'>Sign-in Error</h2>
          <p className='mb-6 text-gray-600'>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className='rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='rounded-lg bg-white p-8 text-center shadow-lg'>
        <div className='mb-4 text-6xl'>🚀</div>
        <h1 className='mb-4 text-2xl font-bold text-gray-900'>
          Connecting to Google
        </h1>
        <p className='mb-6 text-gray-600'>
          You'll be redirected automatically...
        </p>
        <div className='flex justify-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      </div>
    </div>
  )
}