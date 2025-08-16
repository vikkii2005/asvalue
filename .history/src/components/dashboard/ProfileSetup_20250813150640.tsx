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

  // Enhanced profile checking
  useEffect(() => {
    async function checkProfile() {
      if (!session?.user?.email) {
        setIsLoading(false)
        return
      }

      try {
        const { data: seller, error: queryError } = await supabase
          .from('sellers')
          .select('id, email, business_name, category, phone')
          .eq('email', session.user.email)
          .maybeSingle()

        if (queryError) {
          setIsOpen(true)
          return
        }

        if (!seller) {
          setIsOpen(true)
          return
        }

        const hasBusinessName = Boolean(seller.business_name?.trim())
        const hasCategory = Boolean(seller.category?.trim()) 
        const hasPhone = Boolean(seller.phone?.trim())

        const needsCompletion = !hasBusinessName || !hasCategory || !hasPhone
        setIsOpen(needsCompletion)

      } catch {
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
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Simple direct update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !session?.user?.email) return

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('sellers')
        .update({
          business_name: formData.business_name.trim(),
          category: formData.category,
          phone: formData.phone.trim(),
        })
        .eq('email', session.user.email)

      if (error) {
        alert(`Error: ${error.message}`)
        return
      }

      // Success
      setIsOpen(false)
      if (onComplete) onComplete()
      
    } catch {
      alert('Save failed. Please try again.')
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="business_name" className="block text-sm font-medium text-gray-700 mb-1">
                Business Name *
              </label>
              <input
                type="text"
                id="business_name"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.business_name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="e.g., John's Handmade Crafts"
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.category ? 'border-red-300' : 'border-gray-300'
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
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
        </div>
      </div>
    </div>
  )
}