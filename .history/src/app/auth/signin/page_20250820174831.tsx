'use client'

import { useEffect } from 'react'
import { signInWithGoogle } from '@/lib/supabase/client'

export default function SignInPage() {
  useEffect(() => {
    signInWithGoogle().catch(console.error)
  }, [])

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='mb-4 text-6xl'>🔄</div>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          Connecting to Google...
        </h1>
        <div className='mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    </div>
  )
}