'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UserData {
  userId: string
  email: string
  fullName: string
  avatarUrl?: string
}

export default function AuthSuccessPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [redirectMessage, setRedirectMessage] = useState('Checking your account...')

  useEffect(() => {
    const checkUserStatusAndRedirect = async () => {
      try {
        // FIXED: Better session cookie detection with debugging
        console.log('🔍 Looking for session cookie...')
        console.log('📋 All cookies:', document.cookie)
        
        const sessionCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('asvalue-authenticated='))
        
        if (!sessionCookie) {
          console.error('❌ No session cookie found')
          console.log('📋 Available cookies:', document.cookie.split('; '))
          setRedirectMessage('Session not found. Redirecting to sign in...')
          setTimeout(() => router.push('/auth/signin'), 2000)
          return
        }

        console.log('✅ Session cookie found')
        
        try {
          const sessionValue = sessionCookie.split('=')[1]
          const sessionData = JSON.parse(atob(sessionValue)) as UserData
          setUserData(sessionData)

          console.log('✅ Session data parsed:', sessionData.email)

          // Check user's setup status in database
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('setup_completed, business_name, phone')
            .eq('email', sessionData.email)
            .single()

          if (error) {
            console.error('❌ Database error:', error)
            setRedirectMessage('Setting up your account...')
            setTimeout(() => router.push('/onboarding/seller-setup'), 2000)
            return
          }

          // Determine redirect based on setup status
          if (profile?.setup_completed) {
            setRedirectMessage('Welcome back! Taking you to your dashboard...')
            setTimeout(() => router.push('/dashboard'), 2500)
          } else {
            setRedirectMessage('Let\'s complete your seller profile...')
            setTimeout(() => router.push('/onboarding/seller-setup'), 2000)
          }

        } catch (parseError) {
          console.error('❌ Session parsing error:', parseError)
          setRedirectMessage('Invalid session. Please sign in again.')
          setTimeout(() => router.push('/auth/signin'), 2000)
        }

      } catch (error) {
        console.error('❌ Session validation error:', error)
        setRedirectMessage('Authentication error. Please try signing in again.')
        setTimeout(() => router.push('/auth/signin'), 3000)
      } finally {
        setTimeout(() => setIsLoading(false), 1000)
      }
    }

    // FIXED: Add delay to ensure cookie is set
    setTimeout(() => {
      checkUserStatusAndRedirect()
    }, 500) // 500ms delay to ensure cookie propagation
    
  }, [router])

  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50'>
      <div className='text-center max-w-md mx-auto px-4'>
        <div className='mb-6'>
          {isLoading ? (
            <div className='text-6xl mb-4'>🔄</div>
          ) : (
            <div className='text-6xl mb-4'>✅</div>
          )}
        </div>
        
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>
          {isLoading ? 'Welcome to AsValue!' : 'Authentication Successful!'}
        </h1>

        {userData && !isLoading && (
          <div className='mb-6 p-4 bg-green-50 rounded-lg border border-green-200'>
            <div className='flex items-center justify-center mb-2'>
              {userData.avatarUrl && (
                <img
                  src={userData.avatarUrl}
                  alt="Profile"
                  className='w-12 h-12 rounded-full mr-3'
                />
              )}
              <div>
                <p className='font-semibold text-green-900'>{userData.fullName}</p>
                <p className='text-sm text-green-700'>{userData.email}</p>
              </div>
            </div>
          </div>
        )}

        <p className='text-gray-600 mb-6'>{redirectMessage}</p>
        
        {isLoading && (
          <div className='mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600'></div>
        )}
        
        <div className='mt-6 text-sm text-gray-500'>
          {isLoading ? 'Validating your account...' : 'Redirecting you now...'}
        </div>

        {/* Debug Info (Remove in production) */}
        <div className='mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600'>
          Debug: Check browser console for detailed logs
        </div>
      </div>
    </div>
  )
}