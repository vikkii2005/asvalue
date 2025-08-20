'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithGoogle, supabase } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuthAndInitiate() {
      try {
        // Check if user is already authenticated
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          console.log('User already authenticated, redirecting')
          router.replace('/auth/success')
          return
        }

        // If not authenticated, initiate Google OAuth
        setLoading(false)
        await signInWithGoogle()
        
      } catch (error) {
        console.error('Auth initiation error:', error)
        setLoading(false)
      }
    }

    checkAuthAndInitiate()
  }, [router])

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p>Checking authentication...</p>
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