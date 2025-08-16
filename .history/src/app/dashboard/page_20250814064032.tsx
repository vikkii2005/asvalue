'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
// Remove this line: import ProfileSetup from '@/components/dashboard/ProfileSetup'
import Sidebar from '@/components/dashboard/Sidebar'
import StatsCards from '@/components/dashboard/StatsCards'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profileComplete, setProfileComplete] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
      return
    }

    if (status === 'authenticated' && session?.user?.email) {
      checkProfile()
    }
  }, [status, session, router])

  const checkProfile = async () => {
    try {
      const { data: seller } = await supabase
        .from('sellers')
        .select('business_name, category, phone')
        .eq('email', session?.user?.email)
        .single()

      const isComplete = Boolean(seller?.business_name && seller?.category && seller?.phone)
      setProfileComplete(isComplete)

      // Redirect to profile page if incomplete
      if (!isComplete) {
        router.push('/profile')
        return
      }
    } catch (error) {
      console.error('Error checking profile:', error)
      router.push('/profile') // Redirect on error too
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || !profileComplete) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {session.user?.name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your store today.
            </p>
          </div>

          <StatsCards />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
              <p className="text-gray-500">No orders yet. Start sharing your magic links!</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  📦 Add New Product
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  📊 View Analytics
                </button>
                <button 
                  onClick={() => router.push('/profile')}
                  className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
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