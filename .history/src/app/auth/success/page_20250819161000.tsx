// src/app/auth/success/page.tsx
// FIXED - Direct seller onboarding (no role selection)

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthSuccessPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [redirectMessage, setRedirectMessage] = useState('Setting up your seller account...')

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        // Get session cookie
        const sessionCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('asvalue-authenticated='));
        
        if (!sessionCookie) {
          console.log('❌ No session found')
          router.push('/auth/signin')
          return
        }

        const sessionValue = sessionCookie.split('=')[1]
        const sessionData = JSON.parse(atob(sessionValue))
        
        console.log('✅ Session email:', sessionData.email)
        
        // Check if user has completed seller setup
        const { data: userProfiles, error } = await supabase
          .from('profiles')
          .select('id, email, business_name, phone, upi_id, setup_completed')
          .eq('email', sessionData.email)

        console.log('🔍 Database result:', { userProfiles, error })

        if (error) {
          console.error('❌ Database error:', error)
          setRedirectMessage('Preparing your seller account...')
          setTimeout(() => router.push('/onboarding/seller-setup'), 2000)
          return
        }

        // Handle multiple or no results
        if (!userProfiles || userProfiles.length === 0) {
          console.log('✅ New seller - starting setup')
          setRedirectMessage('Welcome! Let\'s set up your seller account...')
          setTimeout(() => router.push('/onboarding/seller-setup'), 1500)
          return
        }

        const userProfile = userProfiles[0]
        console.log('✅ Found profile:', userProfile)

        // Check setup completion
        if (userProfile.setup_completed) {
          setRedirectMessage('Welcome back! Taking you to your dashboard...')
          setTimeout(() => router.push('/dashboard/seller'), 2000)
        } else {
          setRedirectMessage('Continuing your seller setup...')
          console.log('🎯 Redirecting seller to complete setup')
          setTimeout(() => router.push('/onboarding/seller-setup'), 2000)
        }

      } catch (error) {
        console.error('❌ Error in setup check:', error)
        setRedirectMessage('Preparing your seller account...')
        setTimeout(() => router.push('/onboarding/seller-setup'), 2000)
      } finally {
        setIsChecking(false)
      }
    }

    checkUserAndRedirect()
  }, [router])

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center max-w-md'>
        <div className='mb-4 text-6xl'>🚀</div>
        <h1 className='mb-2 text-2xl font-bold text-gray-900'>
          Welcome to AsValue!
        </h1>
        <p className='text-gray-600 mb-6'>{redirectMessage}</p>
        
        {isChecking && (
          <div className='mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
        )}
        
        <div className='mt-6 text-sm text-gray-400'>
          {isChecking ? 'Preparing your account...' : 'Redirecting...'}
        </div>
      </div>
    </div>
  )
}