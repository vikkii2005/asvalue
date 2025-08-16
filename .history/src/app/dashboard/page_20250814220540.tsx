'use client'

import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import StatsCards from '@/components/dashboard/StatsCards'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)

  // Check profile completion via API route
  const checkProfile = useCallback(async () => {
    if (!user) return

    try {
      const response = await fetch('/api/auth/user-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firebaseUid: user.uid }),
      })

      if (response.ok) {
        const { seller } = await response.json()
        
        // ✅ FIXED: Removed all backslashes from field names
        const isComplete = Boolean(
          seller?.business_name && seller?.category && seller?.phone  // Fixed: no backslashes
        )
        
        // ✅ ADD DEBUG TO SEE WHAT'S HAPPENING
        console.log('🔍 Profile check:', {
          business_name: seller?.business_name,
          category: seller?.category, 
          phone: seller?.phone,
          isComplete
        });
        
        setProfileComplete(isComplete)

        // Redirect to profile page if incomplete
        if (!isComplete) {
          console.log('❌ Profile incomplete, redirecting to /profile');
          router.push('/profile')
          return
        } else {
          console.log('✅ Profile complete, staying on dashboard');
        }
      } else {
        console.error('Failed to check profile')
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      router.push('/profile') // Redirect on error too
    } finally {
      setLoading(false)
    }
  }, [router, user])

  useEffect(() => {
    if (authLoading) return // Still checking Firebase auth

    if (!user) {
      router.push('/signin')
      return
    }

    // User is authenticated, check profile completion
    checkProfile()
  }, [authLoading, user, checkProfile, router])

  if (authLoading || loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    )
  }

  if (!user || !profileComplete) {
    return null // Will redirect in useEffect
  }

  return (
    <div className='flex min-h-screen bg-gray-50'>
      <Sidebar />

      <main className='flex-1 p-8'>
        <div className='mx-auto max-w-7xl'>
          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-gray-900'>
              Welcome back, {user.displayName}!
            </h1>
            <p className='mt-1 text-gray-600'>
              Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>

          <StatsCards />

          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Recent Orders
              </h3>
              <p className='text-gray-500'>
                No orders yet. Start sharing your magic links!
              </p>
            </div>

            <div className='rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
              <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                Quick Actions
              </h3>
              <div className='space-y-3'>
                <button className='w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50'>
                  📦 Add New Product
                </button>
                <button className='w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50'>
                  📊 View Analytics
                </button>
                <button
                  onClick={() => router.push('/profile')}
                  className='w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50'
                >
                  ⚙️ Manage Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}