'use client'

import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    console.log('🏠 DASHBOARD LAYOUT:', {
      user: user?.email || 'null',
      loading,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'server'
    })

    // ✅ WAIT: Give more time for redirect authentication to complete
    if (loading) {
      console.log('⏳ Still loading auth state...')
      return
    }

    // ✅ ONLY redirect if definitely no user after loading is complete
    if (!user) {
      console.log('🚨 No authenticated user - redirecting to home')
      setTimeout(() => router.push('/'), 1000) // ✅ Delayed redirect
      return
    }

    console.log('✅ User authenticated in dashboard')
  }, [user, loading, router])

  // ✅ Show loading for longer during redirect flow
  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-gray-600'>Completing sign-in...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <p className='text-gray-600'>Redirecting...</p>
      </div>
    )
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