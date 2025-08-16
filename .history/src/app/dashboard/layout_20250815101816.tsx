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
    // Give Firebase time to process redirect result
    const timer = setTimeout(() => {
      setIsRedirectProcessing(false)
    }, 2000) // Wait 2 seconds for Firebase to process redirect

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    // Don't do anything while loading or processing redirect
    if (loading || isRedirectProcessing) return

    if (!user) {
      // Not authenticated - redirect to sign in
      router.push('/')
      return
    }

    if (!user.isProfileComplete) {
      // User exists but profile incomplete - redirect to profile
      router.push('/profile')
      return
    }

    // User is authenticated and profile is complete - allow access to dashboard
  }, [user, loading, isRedirectProcessing, router])

  // Show loading while checking authentication OR processing redirect
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

  // Don't render anything while redirecting
  if (!user || !user.isProfileComplete) {
    return null
  }

  // User is authenticated and profile complete - render dashboard
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