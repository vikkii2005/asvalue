'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { supabase } from '@/lib/supabase'

interface ProfileData {
  business_name: string
  category: string
  phone: string
}

export default function ProfileSetup() {
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

  // Check if profile needs completion
  useEffect(() => {
    async function checkProfile() {
      if (!session?.user?.email) return

      try {
        const { data: seller } = await supabase
          .from('sellers')
          .select('business_name, category, phone')
          .eq('email', session.user.email)
          .single()

        // Show modal if any required fields are missing
        const needsCompletion = !seller?.business_name || !seller?.category || !seller?.phone
        setIsOpen(needsCompletion)
      } catch (error) {
        console.error('Error checking profile:', error)
        setIsOpen(true) // Show modal on error to be safe
      } finally {
        setIsLoading(false)
      }
    }

    checkProfile()
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
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

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
          updated_at: new Date().toISOString()
        })
        .eq('email', session.user.email)

      if (error) throw error

      setIsOpen(false)
      // Force page refresh to update dashboard with new profile data
      window.location.reload()
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to save profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render anything while checking profile or if modal shouldn't be open
  if (isLoading || !isOpen) return null

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
            {/* Business Name */}
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
                onChange={(e) => setFormData({...formData, business_name: e.target.value})}
              />
              {errors.business_name && (
                <p className="mt-1 text-sm text-red-600">{errors.business_name}</p>
              )}
            </div>

            {/* Category */}
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
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="">Select your main category</option>
                <option value="clothing">Clothing & Fashion</option>
                <option value="electronics">Electronics & Gadgets</option>
                <option value="handmade">Handmade & Crafts</option>
                <option value="home">Home & Garden</option>
                <option value="beauty">Beauty & Personal Care</option>
                <option value="sports">Sports & Fitness</option>
                <option value="books">Books & Media</option>
                <option value="jewelry">Jewelry & Accessories</option>
                <option value="food">Food & Beverages</option>
                <option value="other">Other</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Phone */}
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
                placeholder="e.g., +1 234 567 8900"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                We'll use this for order notifications and customer support
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  'Complete Profile & Enter Dashboard'
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              🔒 Your information is secure and will never be shared
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}