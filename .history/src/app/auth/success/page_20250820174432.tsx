'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

interface UserData {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

export default function AuthSuccessPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [redirectMessage, setRedirectMessage] = useState('Checking your account...')

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      try {
        // Get user from Supabase session
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          console.error('❌ No authenticated user:', error)
          setRedirectMessage('No active session. Redirecting to sign in...')
          setTimeout(() => router.push('/auth/signin'), 2000)
          return
        }

        console.log('✅ User authenticated:', user.email)
        setUserData({
          id: user.id,
          email: user.email,
          user_metadata: {
            full_name: user.user_metadata?.full_name || user.email || 'User',
            avatar_url: user.user_metadata?.avatar_url
          }
        })

        // FIXED: Better profile checking and creation
        const { data: existingProfile, error: selectError } = await supabase
          .from('profiles')
          .select('id, setup_completed, business_name, email')
          .eq('id', user.id) // Use user.id instead of email for primary key
          .maybeSingle() // Use maybeSingle to avoid errors when no rows found

        console.log('🔍 Profile check result:', { existingProfile, selectError })

        // Handle profile creation if doesn't exist
        if (!existingProfile && !selectError) {
          console.log('🆕 Creating new profile for user:', user.id)
          
          // FIXED: Proper profile creation with required fields
          const profileData = {
            id: user.id, // Use user.id as primary key
            email: user.email!,
            full_name: user.user_metadata?.full_name || user.email!.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            email_verified: user.email_confirmed_at ? true : false,
            last_sign_in: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Set defaults for other fields
            setup_completed: false,
            onboarding_completed: false,
            phone_verified: false,
          }

          console.log('📝 Inserting profile data:', profileData)

          // FIXED: Add .select() and better error handling
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert([profileData])
            .select('*')
            .single()

          if (insertError) {
            console.error('❌ Profile creation failed:', JSON.stringify(insertError, null, 2))
            console.error('❌ Insert error details:', {
              message: insertError.message,
              details: insertError.details,
              hint: insertError.hint,
              code: insertError.code
            })
            // Continue anyway - don't block the flow
          } else {
            console.log('✅ Profile created successfully:', newProfile)
          }
        }

        // Redirect based on setup status
        const isSetupCompleted = existingProfile?.setup_completed || false
        
        if (isSetupCompleted) {
          setRedirectMessage('Welcome back! Taking you to your dashboard...')
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          setRedirectMessage('Let\'s complete your seller profile...')
          setTimeout(() => router.push('/onboarding/seller-setup'), 2000)
        }

      } catch (error) {
        console.error('❌ Session validation error:', error)
        setRedirectMessage('Authentication error. Please try signing in again.')
        setTimeout(() => router.push('/auth/signin'), 3000)
      } finally {
        setIsLoading(false)
      }
    }

    checkUserAndRedirect()
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
              {userData.user_metadata?.avatar_url && (
                <img
                  src={userData.user_metadata.avatar_url}
                  alt="Profile"
                  className='w-12 h-12 rounded-full mr-3'
                />
              )}
              <div>
                <p className='font-semibold text-green-900'>{userData.user_metadata?.full_name}</p>
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

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className='mt-6 p-3 bg-gray-100 rounded text-xs text-left'>
            <strong>Debug Info:</strong>
            <br />• Check console for detailed logs
            <br />• Profile creation status visible above
          </div>
        )}
      </div>
    </div>
  )
}