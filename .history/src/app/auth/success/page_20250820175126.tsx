'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export default function AuthSuccessPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.replace('/auth/signin')
          return
        }

        setUser(user as User)

        const { data: profile } = await supabase
          .from('profiles')
          .select('setup_completed')
          .eq('id', user.id)
          .single()

        if (!profile) {
          await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0],
              avatar_url: user.user_metadata?.avatar_url,
              email_verified: true,
              setup_completed: false,
            }])
            .select()
        }

        const setupCompleted = profile?.setup_completed || false
        
        setTimeout(() => {
          router.replace(setupCompleted ? '/dashboard' : '/onboarding/seller-setup')
        }, 2000)

      } catch (error) {
        console.error('Auth check failed:', error)
        router.replace('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>🔄</div>
          <h1 className='text-2xl font-bold mb-4'>Setting up your account...</h1>
          <div className='mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
        </div>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='text-6xl mb-4'>✅</div>
        <h1 className='text-2xl font-bold mb-4'>Authentication Successful!</h1>
        {user && (
          <div className='mb-4'>
            <p className='font-semibold'>{user.user_metadata?.full_name}</p>
            <p className='text-sm text-gray-600'>{user.email}</p>
          </div>
        )}
        <p className='text-gray-600'>Redirecting...</p>
      </div>
    </div>
  )
}