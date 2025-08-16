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
  const [detailedError, setDetailedError] = useState<string>('')

  // Enhanced profile checking
  useEffect(() => {
    async function checkProfile() {
      if (!session?.user?.email) {
        setDebugInfo('❌ No session email found')
        setIsLoading(false)
        return
      }

      setDebugInfo(`🔍 Checking profile for: ${session.user.email}`)

      try {
        const { data: seller, error: queryError } = await supabase
          .from('sellers')
          .select('id, email, business_name, category, phone')
          .eq('email', session.user.email)
          .maybeSingle()

        if (queryError) {
          setDebugInfo(`❌ Query error: ${queryError.message}`)
          setDetailedError(`Database query failed: ${queryError.message}`)
          setIsOpen(true)
          return
        }

        if (!seller) {
          setDebugInfo('❌ No seller record found')
          setDetailedError('No seller record found in database')
          setIsOpen(true)
          return
        }

        const hasBusinessName = Boolean(seller.business_name?.trim())
        const hasCategory = Boolean(seller.category?.trim()) 
        const hasPhone = Boolean(seller.phone?.trim())

        const needsCompletion = !hasBusinessName || !hasCategory || !hasPhone
        setIsOpen(needsCompletion)
        
        setDebugInfo(`✅ Profile check complete. Needs completion: ${needsCompletion}`)

      } catch (err) {
        const error = err as Error
        setDebugInfo(`💥 Unexpected error: ${error.message}`)
        setDetailedError(`System error: ${error.message}`)
        setIsOpen(true)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user?.email) {
      checkProfile()
    }
  }, [session?.user?.email])

  const validateForm = (): boolean => {
    const newErrors: Partial<ProfileData> = {}

    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required'
    } else if (formData.business_name.trim().length < 2) {
      newErrors.business_name = 'Business name must be at least 2 characters'
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else {
      // More flexible phone validation
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)\.]{7,20}$/
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Please enter a valid phone number (e.g., +1 234-567-8900)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ENHANCED: Multiple fallback strategies for saving profile
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !session?.user?.email) {
      return
    }

    setIsSubmitting(true)
    setDebugInfo('🔄 Starting profile save...')
    setDetailedError('')

    try {
      // Strategy 1: Find existing user by email
      const { data: existingUser, error: findError } = await supabase
        .from('sellers')
        .select('id, email, business_name, category, phone')
        .eq('email', session.user.email)
        .maybeSingle()

      if (findError) {
        throw new Error(`User lookup failed: ${findError.message}`)
      }

      const updateData = {
        business_name: formData.business_name.trim(),
        category: formData.category,
        phone: formData.phone.trim(),
        updated_at: new Date().toISOString()
      }

      let updateResult

      if (!existingUser) {
        // Strategy 2: Create new seller record if missing
        setDebugInfo('⚠️ Creating missing seller record...')
        
        const { data: newUser, error: createError } = await supabase
          .from('sellers')
          .insert({
            email: session.user.email,
            name: session.user.name || '',
            avatar_url: session.user.image || null,
            ...updateData,
            is_active: true
          })
          .select('id, business_name, category, phone')
          .single()

        if (createError) {
          throw new Error(`Failed to create seller record: ${createError.message}`)
        }

        updateResult = { data: newUser, error: null }
        setDebugInfo('✅ New seller record created successfully')
      } else {
        // Strategy 3: Update existing record using ID (more reliable than email)
        setDebugInfo(`📝 Updating existing seller: ${existingUser.id}`)
        
        updateResult = await supabase
          .from('sellers')
          .update(updateData)
          .eq('id', existingUser.id)
          .select('business_name, category, phone')
          .single()

        if (updateResult.error) {
          // Strategy 4: Fallback - try updating by email
          setDebugInfo('⚠️ ID update failed, trying email update...')
          
          updateResult = await supabase
            .from('sellers')
            .update(updateData)
            .eq('email', session.user.email)
            .select('business_name, category, phone')
            .single()
        }
      }

      // Check final result
      if (updateResult.error) {
        throw new Error(`Profile update failed: ${updateResult.error.message}`)
      }

      if (!updateResult.data) {
        throw new Error('Update completed but no data returned. This may indicate RLS policy issues.')
      }

      setDebugInfo(`✅ Profile saved successfully: ${JSON.stringify(updateResult.data)}`)
      
      // Success - close modal
      setIsOpen(false)
      
      if (onComplete) {
        onComplete()
      } else {
        setTimeout(() => window.location.reload(), 500)
      }

    } catch (err) {
      const error = err as Error
      setDebugInfo(`💥 Save failed: ${error.message}`)
      setDetailedError(error.message)
      
      // More specific user messages
      let userMessage = 'Failed to save profile. Please try again.'
      
      if (error.message.includes('RLS')) {
        userMessage = 'Permission denied. Please contact support.'
      } else if (error.message.includes('violates check constraint')) {
        userMessage = 'Invalid data format. Please check your entries.'
      } else if (error.message.includes('duplicate key')) {
        userMessage = 'This profile already exists.'
      } else if (error.message.includes('network')) {
        userMessage = 'Connection error. Please check your internet and try again.'
      }
      
      alert(`${userMessage}\n\nTechnical details: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl">
        <div className="p-6">
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

          {/* Enhanced Error Display */}
          {detailedError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                <span className="font-medium">Error:</span> {detailedError}
              </p>
            </div>
          )}

          {/* Debug Info (development only) */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mb-4 p-3 bg-gray-100 rounded-md">
              <p className="text-xs font-mono text-gray-600">{debugInfo}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                id="business_name"
                required
                maxLength={255}
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
                <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
              )}
            </div>

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
                <option value="other">📦 Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                required
                maxLength={25}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.phone ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., +1 234-567-8900"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({...formData, phone: e.target.value})
                  if (errors.phone) setErrors({...errors, phone: undefined})
                }}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                📞 We&apos;ll use this for order notifications and support
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                  '🚀 Complete Profile & Enter Dashboard'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Your information is secure and never shared
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}