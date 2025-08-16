'use client'

import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuthContext()
  const router = useRouter()
  const [isRedirectProcessing, setIsRedirectProcessing] = useState(true)

  useEffect(() => {
    console.log('🏠 DASHBOARD LAYOUT: Initial state', {
      user: user?.email || 'null',
      loading,
      currentPath: window.location.pathname
    })

    const timer = setTimeout(() => {
      console.log('⏰ DASHBOARD LAYOUT: Redirect processing timeout complete')
      setIsRedirectProcessing(false)
    }, 3000) // Increased to 3 seconds

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    console.log('🏠 DASHBOARD LAYOUT: Auth state check', {
      user: user?.email || 'null',
      loading,
      isRedirectProcessing,
      isProfileComplete: user?.isProfileComplete,
      currentPath: window.location.pathname
    })

    if (loading || isRedirectProcessing) {
      console.log('⏳ DASHBOARD LAYOUT: Still loading or processing redirect')
      return
    }

    if (!user) {
      console.log('🚨 DASHBOARD LAYOUT: No user - redirecting to home')
      router.push('/')
      return
    }

    if (!user.isProfileComplete) {
      console.log('🚨 DASHBOARD LAYOUT: Profile incomplete - redirecting to profile')
      router.push('/profile')
      return
    }

    console.log('✅ DASHBOARD LAYOUT: User authenticated and profile complete')
  }, [user, loading, isRedirectProcessing, router])

  if (loading || isRedirectProcessing) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-gray-600'>
            {isRedirectProcessing ? 'Processing sign-in...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user || !user.isProfileComplete) {
    return null
  }

  return (
    <div className='min-h-screen bg-gray-100'>
      <nav className='border-b bg-white shadow-sm'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 justify-between'>
            <div className='flex items-center'>
              <h1 className='text-xl font-semibold'>ASVALUE Dashboard</h1>
            </div>
            <div className='flex items-center'>
              <span className='text-gray-700'>{user.displayName}</span>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}