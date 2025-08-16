'use client'

import { useState, useEffect } from 'react'
import { useAuthContext } from '@/components/auth/FirebaseAuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  User,
  Building2,
  Tag,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
} from 'lucide-react'

const CATEGORIES = [
  'electronics',
  'clothing',
  'home-garden',
  'sports',
  'books',
  'toys',
  'beauty',
  'automotive',
  'jewelry',
  'art-crafts',
  'other',
]

export default function ProfilePage() {
  // Use Firebase auth instead of NextAuth session
  const { user, loading: authLoading } = useAuthContext()
  const router = useRouter()

  // Form state - exactly same as before
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState('')
  const [phone, setPhone] = useState('')

  // UI state - exactly same as before
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Updated redirect logic for Firebase
  useEffect(() => {
    if (authLoading) return // Still loading Firebase auth

    if (!user) {
      router.push('/signin')
      return
    }

    // If user already has complete profile, redirect to dashboard
    if (user.isProfileComplete) {
      router.push('/dashboard')
    }
  }, [authLoading, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      // ✅ FIXED: Removed all backslashes from field names
      const profileData = {
        email: user?.email,
        business_name: businessName.trim(), // Fixed: no backslashes
        category: category.trim(),
        phone: phone?.trim() || null,
      }

      console.log('📤 Sending profile data:', profileData)

      // ✅ FIXED: Updated validation with correct field names
      if (!profileData.email) {
        throw new Error('No user email found. Please sign in again.')
      }
      if (!profileData.business_name) {
        // Fixed: no backslashes
        throw new Error('Business name is required')
      }
      if (!profileData.category) {
        throw new Error('Category is required')
      }

      // Same API call as before
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      })

      const responseText = await response.text()
      console.log('📥 Response:', response.status, responseText)

      if (!response.ok) {
        const errorData = responseText ? JSON.parse(responseText) : {}
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const result = JSON.parse(responseText)
      console.log('✅ Success:', result)

      setSuccess('Profile updated successfully!')

      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch (err) {
      console.error('❌ Profile error:', err)
      setError(err instanceof Error ? err.message : 'Profile creation failed')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading spinner while checking Firebase auth
  if (authLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <Loader2 className='mx-auto mb-4 h-8 w-8 animate-spin text-blue-600' />
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className='flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='text-center'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600'>
            <User className='h-6 w-6 text-white' />
          </div>
          <h2 className='mt-6 text-3xl font-bold text-gray-900'>
            Complete Your Profile
          </h2>
          <p className='mt-2 text-sm text-gray-600'>
            Tell us about your business to get started
          </p>
        </div>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10'>
          {/* User Info Display - Updated for Firebase */}
          <div className='mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4'>
            <div className='flex items-center space-x-3'>
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt='Profile'
                  className='h-10 w-10 rounded-full'
                />
              )}
              <div>
                <p className='text-sm font-medium text-blue-900'>
                  {user?.displayName}
                </p>
                <p className='text-sm text-blue-700'>{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className='mb-6 flex items-center space-x-3 rounded-lg border border-green-200 bg-green-50 p-4'>
              <CheckCircle className='h-5 w-5 flex-shrink-0 text-green-500' />
              <p className='text-sm text-green-700'>{success}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='mb-6 flex items-center space-x-3 rounded-lg border border-red-200 bg-red-50 p-4'>
              <AlertCircle className='h-5 w-5 flex-shrink-0 text-red-500' />
              <p className='text-sm text-red-700'>{error}</p>
            </div>
          )}

          {/* Profile Form - Exactly same as before */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Business Name */}
            <div>
              <label
                htmlFor='businessName'
                className='block text-sm font-medium text-gray-700'
              >
                Business Name *
              </label>
              <div className='relative mt-1'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                  <Building2 className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='businessName'
                  name='businessName'
                  type='text'
                  required
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className='block w-full appearance-none rounded-md border border-gray-300 py-2 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
                  placeholder='Your Amazing Business'
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor='category'
                className='block text-sm font-medium text-gray-700'
              >
                Business Category *
              </label>
              <div className='relative mt-1'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                  <Tag className='h-5 w-5 text-gray-400' />
                </div>
                <select
                  id='category'
                  name='category'
                  required
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className='block w-full appearance-none rounded-md border border-gray-300 py-2 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
                >
                  <option value=''>Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat
                        .split('-')
                        .map(
                          word => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor='phone'
                className='block text-sm font-medium text-gray-700'
              >
                Phone Number
              </label>
              <div className='relative mt-1'>
                <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
                  <Phone className='h-5 w-5 text-gray-400' />
                </div>
                <input
                  id='phone'
                  name='phone'
                  type='tel'
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className='block w-full appearance-none rounded-md border border-gray-300 py-2 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm'
                  placeholder='+1 (555) 123-4567'
                />
              </div>
              <p className='mt-1 text-xs text-gray-500'>
                Optional - helps customers reach you
              </p>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type='submit'
                disabled={isLoading || !businessName.trim() || !category.trim()}
                className='group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Creating Profile...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className='ml-2 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className='mt-6 text-center'>
            <p className='text-xs text-gray-500'>
              This information helps us personalize your experience
            </p>
          </div>

          {/* Back to Home Link */}
          <div className='mt-6 text-center'>
            <Link
              href='/'
              className='text-sm text-blue-600 transition-colors hover:text-blue-800'
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className='mt-8 text-center'>
        <div className='inline-flex items-center space-x-2 text-sm text-gray-500'>
          <div className='h-2 w-2 rounded-full bg-green-500'></div>
          <span>Account Created</span>
          <div className='h-0.5 w-8 bg-blue-500'></div>
          <div className='h-2 w-2 rounded-full bg-blue-500'></div>
          <span className='font-medium text-blue-600'>Profile Setup</span>
          <div className='h-0.5 w-8 bg-gray-300'></div>
          <div className='h-2 w-2 rounded-full bg-gray-300'></div>
          <span>Dashboard</span>
        </div>
      </div>
    </div>
  )
}
