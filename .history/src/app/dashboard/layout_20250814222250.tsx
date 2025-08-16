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
    if (loading) return // Still checking auth status

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
  }, [user, loading, router])

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gray-100">
      <nav className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">ASVALUE Dashboard</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700">{user.displayName}</span>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
