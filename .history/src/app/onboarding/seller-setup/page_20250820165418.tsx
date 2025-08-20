'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateSellerProfile } from '@/lib/api/user'
import { sellerProfileSchema } from '@/lib/validations/seller-profile'
import { z } from 'zod'

interface FormData {
  business_name: string
  phone: string
  city: string
  state: string
  category: string
}

interface UserSession {
  userId: string
  email: string
  fullName: string
  avatarUrl?: string
}

export default function SellerSetupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [userSession, setUserSession] = useState<UserSession | null>(null)
  const [formData, setFormData] = useState<FormData>({
    business_name: '',
    phone: '',
    city: '',
    state: '',
    category: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Get user session from cookie
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('asvalue-authenticated='))
    
    if (!sessionCookie) {
      router.push('/auth/signin')
      return
    }

    try {
      const sessionValue = sessionCookie.split('=')[1]
      const sessionData = JSON.parse(atob(sessionValue))
      setUserSession(sessionData)
      
      // Pre-fill business name with user's name as default
      setFormData(prev => ({
        ...prev,
        business_name: sessionData.fullName || ''
      }))
    } catch (error) {
      console.error('❌ Session parsing error:', error)
      router.push('/auth/signin')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!userSession) {
      alert('Session expired. Please sign in again.')
      router.push('/auth/signin')
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = sellerProfileSchema.parse(formData)
      
      // Update seller profile
      const result = await updateSellerProfile(userSession.userId, validatedData)
      
      if (result.success) {
        console.log('✅ Seller profile updated successfully')
        router.push('/onboarding/success')
      } else {
        throw new Error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('❌ Profile update error:', error)
      
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {}
        error.issues.forEach((err: z.ZodIssue) => {
          if (err.path[0]) {
            fieldErrors[err.path as string] = err.message
          }
        })
        setErrors(fieldErrors)
      } else {
        alert(error instanceof Error ? error.message : 'Profile update failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!userSession) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-md mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            {userSession.avatarUrl && (
              <img
                src={userSession.avatarUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full mx-auto mb-2"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {userSession.fullName}!
            </h1>
            <p className="text-gray-600 mt-2">
              Let&apos;s set up your seller profile
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business/Shop Name *
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => updateFormData('business_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.business_name ? 'border-red-300' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="e.g., Rajesh Electronics"
                required
              />
              {errors.business_name && (
                <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number *
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-sm">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-r-md ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="98765-43210"
                  required
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Select City</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Kolkata">Kolkata</option>
                  <option value="Pune">Pune</option>
                  <option value="Ahmedabad">Ahmedabad</option>
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => updateFormData('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.state ? 'border-red-300' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Select State</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Rajasthan">Rajasthan</option>
                </select>
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                )}
              </div>
            </div>

            {/* Business Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="">Select Category</option>
                <option value="Electronics">📱 Electronics</option>
                <option value="Fashion">👕 Fashion</option>
                <option value="Home & Kitchen">🏠 Home & Kitchen</option>
                <option value="Books & Media">📚 Books & Media</option>
                <option value="Sports & Fitness">⚽ Sports & Fitness</option>
                <option value="Beauty & Health">💄 Beauty & Health</option>
                <option value="Jewelry">💍 Jewelry</option>
                <option value="Food & Beverages">🍕 Food & Beverages</option>
                <option value="Art & Crafts">🎨 Art & Crafts</option>
                <option value="Toys & Games">🧸 Toys & Games</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up...
                </div>
              ) : (
                '🚀 Complete Setup'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              💡 Don&apos;t worry, you can update this information anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}