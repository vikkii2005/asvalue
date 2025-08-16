'use client'

import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import StatsCards from '@/components/dashboard/StatsCards'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push('/')
      return
    }

    // ✅ FIXED: Use the profile completion from auth hook
    if (!user.isProfileComplete) {
      console.log('❌ Profile incomplete, redirecting to /profile')
      router.push('/profile')
      return
    }

    console.log('✅ Profile complete, staying on dashboard')
    setLoading(false)
  }, [authLoading, user, router])

  if (authLoading || loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600'></div>
      </div>
    )
  }

  if (!user || !user.isProfileComplete) {
    return null
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