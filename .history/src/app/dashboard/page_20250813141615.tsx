'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import ProfileSetup from '@/components/dashboard/ProfileSetup'

interface SellerProfile {
  business_name?: string | null
  category?: string | null  
  phone?: string | null
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<SellerProfile | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  // Load seller profile data - FIXED: loadProfile now defined in scope
  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.email) return

      try {
        const { data: seller } = await supabase // FIXED: Removed unused 'error' variable
          .from('sellers')
          .select('business_name, category, phone')
          .eq('email', session.user.email)
          .single()

        setProfileData(seller)
        
        // Check if profile is incomplete
        const needsCompletion = !seller?.business_name || !seller?.category || !seller?.phone
        setShowProfileModal(needsCompletion)

      } catch (err) {
        // FIXED: Using 'err' instead of unused 'error'
        console.error('Error loading profile:', err)
        setShowProfileModal(true)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    if (session?.user?.email) {
      loadProfile() // FIXED: Now loadProfile is defined in this scope
    }
  }, [session?.user?.email])

  // Handle profile completion
  const handleProfileComplete = () => {
    setShowProfileModal(false)
    // Reload profile data after completion
    if (session?.user?.email) {
      setIsLoadingProfile(true)
      // Re-run the profile loading logic
      const reloadProfile = async () => {
        try {
          const { data: seller } = await supabase
            .from('sellers')
            .select('business_name, category, phone')
            .eq('email', session.user.email)
            .single()

          setProfileData(seller)
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Error reloading profile:', err)
        } finally {
          setIsLoadingProfile(false)
        }
      }
      reloadProfile()
    }
  }

  // Loading states
  if (status === 'loading' || isLoadingProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return null // Will redirect via useEffect
  }

  // Show profile setup modal for incomplete profiles
  if (showProfileModal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProfileSetup onComplete={handleProfileComplete} />
        
        {/* Blurred dashboard preview behind modal */}
        <div className="blur-sm pointer-events-none">
          <header className="bg-white shadow">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome, {session.user?.name}! 🎉
                  </h1>
                  <p className="text-gray-600">
                    Complete your profile to access your ASVALUE dashboard
                  </p>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>
    )
  }

  // Full dashboard for users with complete profiles
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profileData?.business_name || session.user?.name}! 🚀
              </h1>
              <p className="text-gray-600">
                Your AI-powered sales dashboard is ready to generate revenue
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
                <p className="text-xs text-gray-500">{profileData?.category}</p>
              </div>
              <img
                src={session.user?.image || ''}
                alt="Profile"
                className="h-10 w-10 rounded-full"
              />
              <button
                onClick={() => router.push('/api/auth/signout')}
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-300"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Profile Complete Success Message */}
        <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                ✅ Profile Complete & Ready to Sell!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  <strong>{profileData?.business_name}</strong> is now set up in the <strong>{profileData?.category}</strong> category. 
                  You&apos;re ready to create AI-powered sales machines!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                    <span className="text-sm text-white">📦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Products
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                    <span className="text-sm text-white">💰</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Revenue
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">$0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-yellow-500">
                    <span className="text-sm text-white">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      Orders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500">
                    <span className="text-sm text-white">💬</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      AI Conversations
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">
              Quick Actions for {profileData?.business_name}
            </h3>
            <p className="text-sm text-gray-500">
              Start building your AI sales empire
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <button className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  📦 Create Your First Product
                </span>
                <span className="text-xs text-gray-500">
                  Transform your {profileData?.category?.toLowerCase()} into an AI sales machine
                </span>
              </button>

              <button className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  🔗 Generate Magic Links
                </span>
                <span className="text-xs text-gray-500">
                  Create viral shareable product links
                </span>
              </button>

              <button className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  🤖 Configure AI Responses
                </span>
                <span className="text-xs text-gray-500">
                  Customize AI customer service
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Day 1 Complete Celebration */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">🎉</span>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-blue-900">
                Day 1 Foundation Complete!
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">
                  <strong>Congratulations!</strong> Your ASVALUE platform foundation is ready:
                </p>
                <ul className="list-inside list-disc space-y-1">
                  <li>✅ Complete seller authentication & profile</li>
                  <li>✅ 5-table database architecture deployed</li>
                  <li>✅ Professional dashboard interface</li>
                  <li>✅ AI-powered chat system foundation</li>
                  <li>✅ Zero-commission business model activated</li>
                </ul>
                <p className="mt-3 font-medium">
                  🚀 Ready for Day 2: Product Creation & AI Sales Machines
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}