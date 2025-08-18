// src/app/auth/success/page.tsx
// FIXED - Better role detection with email matching

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
  const [redirectMessage, setRedirectMessage] = useState('Checking your account...')

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
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
        
        // ✅ IMPROVED: Better database query with error handling
        const { data: userProfiles, error } = await supabase
          .from('profiles')
          .select('id, email, role, onboarding_completed, full_name')
          .eq('email', sessionData.email)

        console.log('🔍 Database result:', { userProfiles, error })

        if (error) {
          console.error('❌ Database error:', error)
          setRedirectMessage('Database error - redirecting to role selection...')
          setTimeout(() => router.push('/onboarding/role-selection'), 2000)
          return
        }

        // Handle multiple or no results
        if (!userProfiles || userProfiles.length === 0) {
          console.log('❌ No profile found for email:', sessionData.email)
          setRedirectMessage('Setting up your profile...')
          setTimeout(() => router.push('/onboarding/role-selection'), 1500)
          return
        }

        const userProfile = userProfiles[0] // Use first match
        console.log('✅ Found profile:', userProfile)

        // ✅ FIXED: Better role checking logic
        if (userProfile.role && userProfile.role.trim() !== '') {
          const role = userProfile.role.toLowerCase().trim()
          
          if (role === 'seller') {
            if (userProfile.onboarding_completed) {
              setRedirectMessage('Welcome back to your seller dashboard!')
              setTimeout(() => router.push('/dashboard/seller'), 2000)
            } else {
              setRedirectMessage('Continuing your seller setup...')
              console.log('🎯 Redirecting seller to setup page')
              setTimeout(() => router.push('/onboarding/seller-setup'), 2000)
            }
          } else if (role === 'buyer') {
            setRedirectMessage('Taking you to the marketplace...')
            setTimeout(() => router.push('/marketplace'), 2000)
          } else {
            console.log('❌ Unknown role:', role)
            setRedirectMessage('Unknown role - redirecting to role selection...')
            setTimeout(() => router.push('/onboarding/role-selection'), 2000)
          }
        } else {
          console.log('❌ No role found - role field is empty or null')
          setRedirectMessage('Choose your role to continue...')
          setTimeout(() => router.push('/onboarding/role-selection'), 1500)
        }

      } catch (error) {
        console.error('❌ Error in role check:', error)
        setRedirectMessage('Error occurred - redirecting to role selection...')
        setTimeout(() => router.push('/onboarding/role-selection'), 2000)
      } finally {
        setIsChecking(false)
      }
    }

    checkUserRoleAndRedirect()
  }, [router])

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center max-w-md'>
        <div className='mb-4 text-6xl'>✅</div>
        <h1 className='mb-2 text-2xl font-bold text-gray-900'>
          Welcome to AsValue!
        </h1>
        <p className='text-gray-600 mb-6'>{redirectMessage}</p>
        
        {isChecking && (
          <div className='mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
        )}
        
        <div className='mt-6 text-sm text-gray-400'>
          {isChecking ? 'Checking your profile...' : 'Redirecting...'}
        </div>
      </div>
    </div>
  )
}