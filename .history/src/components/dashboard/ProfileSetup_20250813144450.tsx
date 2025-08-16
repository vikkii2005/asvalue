'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'

interface ProfileData {
  business_name: string
  category: string
  phone: string
}

interface ProfileSetupProps {
  onComplete?: () => void
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<ProfileData>({
    business_name: '',
    category: '',
    phone: ''
  })
  const [errors, setErrors] = useState<Partial<ProfileData>>({})
  const [debugInfo, setDebugInfo] = useState<string>('')

  // Enhanced profile checking with comprehensive debugging
  useEffect(() => {
    async function checkProfile() {
      if (!session?.user?.email) {
        setDebugInfo('❌ No session email found')
        setIsLoading(false)
        return
      }

      setDebugInfo(`🔍 Checking profile for: ${session.user.email}`)

      try {
        // Enhanced query with better error handling
        const { data: seller, error: queryError } = await supabase
          .from('sellers')
          .select('id, email, business_name, category, phone, created_at')
          .eq('email', session.user.email)
          .maybeSingle() // Use maybeSingle() instead of single() to avoid errors

        if (queryError) {
          setDebugInfo(`❌ Query error: ${queryError.message}`)
          setIsOpen(true)
          return
        }

        if (!seller) {
          setDebugInfo(`❌ No seller record found for: ${session.user.email}`)
          setIsOpen(true)
          return
        }

        setDebugInfo(`✅ Seller found: ${seller.email}`)

        // Robust completion checking
        const hasBusinessName = Boolean(seller.business_name?.trim())
        const hasCategory = Boolean(seller.category?.trim()) 
        const hasPhone = Boolean(seller.phone?.trim())

        const completionStatus = {
          business_name: seller.business_name || 'NULL',
          hasBusinessName,
          category: seller.category || 'NULL',
          hasCategory,
          phone: seller.phone || 'NULL', 
          hasPhone
        }

        setDebugInfo(`🔍 Profile status: ${JSON.stringify(completionStatus, null, 2)}`)

        const needsCompletion = !hasBusinessName || !hasCategory || !hasPhone
        setDebugInfo(`🎯 Needs completion: ${needsCompletion}`)
        
        setIsOpen(needsCompletion)

      } catch (err) {
        const error = err as Error
        setDebugInfo(`💥 Unexpected error: ${error.message}`)
        setIsOpen(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.email) {
      checkProfile()
    }
  }, [session?.user?.email])

  // Enhanced form validation
  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileData> = {}

    // Business name validation
    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required'
    } else if (formData.business_name.trim().length < 2) {
      newErrors.business_name = 'Business name must be at least 2 characters'
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else {
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,20}$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enhanced form submission with comprehensive error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !session?.user?.email) {
      return
    }

    setIsSubmitting(true)
    setDebugInfo('🔄 Starting profile update...')

    try {
      // First verify user exists and get their ID
      const { data: existingUser, error: userError } = await supabase
        .from('sellers')
        .select('id, email')
        .eq('email', session.user.email)
        .single()

      if (userError || !existingUser) {
        const errorMessage = userError?.message || 'User not found'
        throw new Error(`User verification failed: ${errorMessage}`)
      }

      setDebugInfo(`👤 User verified: ${existingUser.id}`)

      // Update profile using user ID for better reliability
      const updateData = {
        business_name: formData.business_name.trim(),
        category: formData.category,
        phone: formData.phone.trim(),
        updated_at: new Date().toISOString()
      }

      setDebugInfo(`📝 Updating with data: ${JSON.stringify(updateData)}`)

      const { data: updatedData, error: updateError } = await supabase
        .from('sellers')
        .update(updateData)
        .eq('id', existingUser.id)
        .select('business_name, category, phone')
        .single()

      if (updateError) {
        throw new Error(`Update failed: ${updateError.message}`)
      }

      if (!updatedData) {
        throw new Error('Update succeeded but no data returned - check RLS policies')
      }

      setDebugInfo(`✅ Profile updated successfully: ${JSON.stringify(updatedData)}`)

      // Success - close modal and trigger callback
      setIsOpen(false)
      
      if (onComplete) {
        onComplete()
      } else {
        // Fallback: force page refresh
        setTimeout(() => {
          window.location.reload()
        }, 500)
      }

    } catch (err) {
      const error = err as Error
      setDebugInfo(`💥 Update failed: ${error.message}`)
      
      // User-friendly error message
      const errorMessage = error.message.includes('RLS') 
        ? 'Permission error. Please contact support.'
        : error.message.includes('network')
        ? 'Connection error. Please check your internet and try again.'
        : `Failed to save profile: ${error.message}`
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render while loading
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your profile...</p>
        </div>
      </div>
    )
  }

  // Don't render if modal shouldn't be open
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-2xl">🚀</span>
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-gray-900">Complete Your Business Profile</h2>
              <p className="text-sm text-gray-600">Just 3 quick details to get started!</p>
            </div>
          </div>

          {/* Debug Info (only in development) */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mb-4 p-3 bg-gray-100 rounded-md">
              <p className="text-xs font-mono text-gray-600">{debugInfo}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business Name Field */}
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                id="business_name"
                required
                maxLength={100}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.business_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., John&apos;s Handmade Crafts"
                value={formData.business_name}
                onChange={(e) => {
                  setFormData({...formData, business_name: e.target.value})
                  if (errors.business_name) setErrors({...errors, business_name: undefined})
                }}
              />
              {errors.business_name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.business_name}
                </p>
              )}
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Product Category *
              </label>
              <select
                id="category"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                value={formData.category}
                onChange={(e) => {
                  setFormData({...formData, category: e.target.value})
                  if (errors.category) setErrors({...errors, category: undefined})
                }}
              >
                <option value="">Select your main category</option>
                <option value="clothing">👕 Clothing & Fashion</option>
                <option value="electronics">📱 Electronics & Gadgets</option>
                <option value="handmade">🎨 Handmade & Crafts</option>
                <option value="home">🏠 Home & Garden</option>
                <option value="beauty">💄 Beauty & Personal Care</option>
                <option value="sports">⚽ Sports & Fitness</option>
                <option value="books">📚 Books & Media</option>
                <option value="jewelry">💎 Jewelry & Accessories</option>
                <option value="food">🍕 Food & Beverages</option>
                <option value="automotive">🚗 Automotive</option>
                <option value="toys">🧸 Toys & Games</option>
                <option value="other">📦 Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.category}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                required
                maxLength={20}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., +1 234 567 8900"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({...formData, phone: e.target.value})
                  if (errors.phone) setErrors({...errors, phone: undefined})
                }}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.phone}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                📞 We&apos;ll use this for order notifications and customer support
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving Profile...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Complete Profile & Enter Dashboard
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Your information is secure and will never be shared
            </p>
            <p className="text-xs text-gray-400 mt-1">
              ⚡ Zero commission forever • AI-powered sales
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}