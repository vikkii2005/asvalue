'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthSuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Checking authentication...')

  useEffect(() => {
    async function processAuth() {
      try {
        // Wait for session to be fully established
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setStatus('Validating session...')
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          setStatus('Authentication failed. Redirecting to sign in...')
          setTimeout(() => {
            router.replace('/auth/signin')
          }, 2000)
          return
        }

        setStatus(`Welcome ${user.email}! Setting up your account...`)

        // Create/check profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('setup_completed')
          .eq('id', user.id)
          .maybeSingle()

        if (!profile && !profileError) {
          setStatus('Creating your profile...')
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

        // Final redirect - ONLY ONE
        const setupCompleted = profile?.setup_completed || false
        
        if (setupCompleted) {
          setStatus('Taking you to your dashboard...')
          setTimeout(() => {
            window.location.href = '/dashboard' // Force full page navigation
          }, 2000)
        } else {
          setStatus('Taking you to seller setup...')
          setTimeout(() => {
            window.location.href = '/onboarding/seller-setup' // Force full page navigation
          }, 2000)
        }

      } catch (error) {
        console.error('Auth processing error:', error)
        setStatus('Something went wrong. Redirecting to sign in...')
        setTimeout(() => {
          router.replace('/auth/signin')
        }, 3000)
      }
    }

    processAuth()
  }, [router])

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='mb-6 text-6xl'>✅</div>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          Authentication Successful!
        </h1>
        <div className='mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600 mb-4'></div>
        <p className='text-gray-600 text-center'>{status}</p>
        
        <div className='mt-6 text-sm text-gray-500'>
          Please wait while we complete the setup...
        </div>
      </div>
    </div>
  )
}