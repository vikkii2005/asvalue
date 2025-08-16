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
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // ✅ FIXED: Give more time for Firebase to establish auth state
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoadDone(true)
    }, 2000) // 2 second buffer

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    console.log('🏠 DASHBOARD LAYOUT:', {
      user: user?.email || 'null',
      loading,
      initialLoadDone,
      currentPath: typeof window !== 'undefined' ? window.location.pathname : 'server'
    })

    // ✅ WAIT: Don't redirect until initial load is complete
    if (loading || !initialLoadDone) {
      return
    }

    if (!user) {
      console.log('🚨 DASHBOARD LAYOUT: No user after initial load - redirecting to home')
      router.push('/')
      return
    }

    console.log('✅ DASHBOARD LAYOUT: User authenticated')
  }, [user, loading, initialLoadDone, router])

  if (loading || !initialLoadDone) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600'></div>
          <p className='text-gray-600'>
            {!initialLoadDone ? 'Processing authentication...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
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