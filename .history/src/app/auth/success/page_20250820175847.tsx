'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthSuccessPage() {
  const router = useRouter()
  const [status, setStatus] = useState('Checking authentication...')
  const [user, setUser] = useState(null)

  useEffect(() => {
    async function processAuth() {
      try {
        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        setStatus('Validating session...')
        
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          setStatus('Authentication failed. Redirecting to sign in...')
          setTimeout(() => {
            router.replace('/auth/signin')
          }, 2000)
          return
        }

        setUser(user)
        setStatus(`Welcome ${user.email}! Checking your profile...`)

        // FIXED: Check if profile exists FIRST
        const { data: existingProfile, error: selectError } = await supabase
          .from('profiles')
          .select('setup_completed, business_name, email')
          .eq('id', user.id)
          .maybeSingle()

        console.log('Profile check result:', { existingProfile, selectError })

        // FIXED: Only insert if profile doesn't exist
        if (!existingProfile && !selectError) {
          setStatus('Creating your profile...')
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([{
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              avatar_url: user.user_metadata?.avatar_url || null,
              email_verified: true,
              setup_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }])
            .select()

          if (insertError) {
            console.error('Profile creation failed:', insertError)
            // Don't block the flow - continue anyway
          } else {
            console.log('Profile created successfully')
          }
        } else if (existingProfile) {
          console.log('Profile already exists')
        }

        // Determine redirect destination
        const setupCompleted = existingProfile?.setup_completed || false
        
        if (setupCompleted) {
          setStatus('Profile complete! Taking you to your dashboard...')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        } else {
          setStatus('Setting up your seller profile...')
          setTimeout(() => {
            window.location.href = '/onboarding/seller-setup'
          }, 2000)
        }

      } catch (error) {
        console.error('Auth processing error:', error)
        setStatus('Something went wrong. Please try signing in again.')
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
        
        {user && (
          <div className='mb-6 p-4 bg-green-50 rounded-lg border border-green-200'>
            <div className='flex items-center justify-center mb-2'>
              {user.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Profile"
                  className='w-12 h-12 rounded-full mr-3'
                />
              )}
              <div>
                <p className='font-semibold text-green-900'>
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </p>
                <p className='text-sm text-green-700'>{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className='mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600 mb-4'></div>
        <p className='text-gray-600 text-center'>{status}</p>
        
        <div className='mt-6 text-sm text-gray-500'>
          Please wait while we complete the setup...
        </div>
      </div>
    </div>
  )
}