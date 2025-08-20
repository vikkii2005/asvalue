'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthSuccessPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function handleAuth() {
      try {
        // Small delay to ensure session is fully established
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.log('No authenticated user, redirecting to signin')
          router.replace('/auth/signin')
          return
        }

        console.log('User authenticated:', user.email)

        // Check/create profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('setup_completed')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile && !profileError) {
          // Create profile
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
        }

        // Redirect based on setup status
        const isSetupCompleted = profile?.setup_completed || false
        
        if (isSetupCompleted) {
          console.log('Setup completed, redirecting to dashboard')
          router.replace('/dashboard')
        } else {
          console.log('Setup not completed, redirecting to seller setup')
          router.replace('/onboarding/seller-setup')
        }

      } catch (error) {
        console.error('Auth error:', error)
        router.replace('/auth/signin')
      } finally {
        setLoading(false)
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='text-6xl mb-4'>🔄</div>
        <h1 className='text-2xl font-bold mb-4'>Setting up your account...</h1>
        <div className='mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
        <p className='text-gray-600 mt-4'>Please wait while we complete your authentication</p>
      </div>
    </div>
  )
}