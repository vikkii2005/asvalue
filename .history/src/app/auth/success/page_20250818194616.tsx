// src/app/auth/success/page.tsx
// FIXED - Smart redirect based on existing user role

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AuthSuccessPage() {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [redirectMessage, setRedirectMessage] = useState('Setting up your account...')

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
      try {
        // Get current user from session cookie
        const sessionCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('asvalue-authenticated='));
        
        if (!sessionCookie) {
          console.log('❌ No session found, redirecting to signin')
          router.push('/auth/signin')
          return
        }

        const sessionValue = sessionCookie.split('=')[1]
        const sessionData = JSON.parse(atob(sessionValue))
        
        console.log('✅ Checking role for user:', sessionData.email)
        
        // Check if user has role in database
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('role, onboarding_completed')
          .eq('email', sessionData.email)
          .single()

        if (error) {
          console.error('❌ Error checking user role:', error)
          setRedirectMessage('Preparing your experience...')
          // Fallback to role selection if error
          setTimeout(() => {
            router.push('/onboarding/role-selection')
          }, 2000)
          return
        }

        // Smart redirect based on user's role
        if (userProfile?.role) {
          console.log('✅ User has role:', userProfile.role)
          
          if (userProfile.role === 'seller') {
            if (userProfile.onboarding_completed) {
              setRedirectMessage('Welcome back! Taking you to your dashboard...')
              setTimeout(() => {
                router.push('/dashboard/seller') // Future seller dashboard
              }, 1500)
            } else {
              setRedirectMessage('Continuing your seller setup...')
              setTimeout(() => {
                router.push('/onboarding/seller-setup')
              }, 1500)
            }
          } else if (userProfile.role === 'buyer') {
            setRedirectMessage('Taking you to the marketplace...')
            setTimeout(() => {
              router.push('/marketplace')
            }, 1500)
          }
        } else {
          console.log('✅ No role found, showing role selection')
          setRedirectMessage('Choose your role to get started...')
          setTimeout(() => {
            router.push('/onboarding/role-selection')
          }, 1500)
        }

      } catch (error) {
        console.error('❌ Error in role check:', error)
        setRedirectMessage('Preparing your experience...')
        setTimeout(() => {
          router.push('/onboarding/role-selection')
        }, 2000)
      } finally {
        setIsChecking(false)
      }
    }

    checkUserRoleAndRedirect()
  }, [router])

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='mb-4 text-6xl'>✅</div>
        <h1 className='mb-2 text-2xl font-bold text-gray-900'>
          Welcome to AsValue!
        </h1>
        <p className='text-gray-600 mb-4'>{redirectMessage}</p>
        
        {isChecking && (
          <div className='mx-auto mt-4 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
        )}
        
        <div className='mt-6 text-sm text-gray-400'>
          {isChecking ? 'Checking your profile...' : 'Redirecting...'}
        </div>
      </div>
    </div>
  )
}