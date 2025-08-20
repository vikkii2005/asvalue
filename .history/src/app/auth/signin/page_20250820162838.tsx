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
        
        // 🔥 LOCALHOST ONLY - Simple redirect
        const redirectTo = 'http://localhost:3000/auth/callback'
        
        console.log('🔍 Using redirect URL:', redirectTo)

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectTo,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            }
          }
        })

        if (error) {
          console.error('❌ OAuth initiation failed:', error)
          setError(error.message)
          setIsLoading(false)
        } else {
          console.log('✅ OAuth initiated successfully')
          // User will be redirected to Google
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
        <div className='text-center p-8 bg-white rounded-lg shadow-lg max-w-md'>
          <div className='text-red-500 text-6xl mb-4'>⚠️</div>
          <h2 className='text-xl font-bold text-red-600 mb-4'>
            Sign-in Error
          </h2>
          <p className='text-gray-600 mb-6'>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center p-8 bg-white rounded-lg shadow-lg'>
          <div className='text-6xl mb-4'>🚀</div>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Connecting to Google
          </h1>
          <p className='text-gray-600 mb-6'>
            Redirecting you to Google sign-in...
          </p>
          <div className='flex justify-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
          </div>
        </div>
      </div>
    )
  }

  return null
}