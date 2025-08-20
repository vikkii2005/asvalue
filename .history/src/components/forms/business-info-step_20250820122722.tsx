'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { businessStepSchema, BusinessStepData, EmailStepData } from '@/lib/validations/seller-profile'
import { updateSellerProfile, checkBusinessNameUnique } from '@/lib/api/seller'

interface Category {
  id: string
  name: string
  emoji: string
  description: string
  popular: boolean
}

interface City {
  id: string
  city: string
  state: string
  popular: boolean
}

interface Props {
  user: User
  emailData: EmailStepData
  categories: Category[]
  cities: City[]
  onComplete: () => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

export default function BusinessInfoStep({ 
  user, 
  emailData, 
  categories, 
  cities, 
  onComplete, 
  isLoading, 
  setIsLoading 
}: Props) {
  const [businessNameStatus, setBusinessNameStatus] = useState<'checking' | 'available' | 'taken' | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('')
  
  const form = useForm<BusinessStepData>({
    resolver: zodResolver(businessStepSchema),
    defaultValues: {
      business_name: '',
      category_id: '',
      city: '',
      state: ''
    }
  })

  // Check business name availability with debounce
  const checkName = async (name: string) => {
    if (name.length < 2) {
      setBusinessNameStatus(null)
      return
    }
    
    setBusinessNameStatus('checking')
    try {
      const isAvailable = await checkBusinessNameUnique(name)
      setBusinessNameStatus(isAvailable ? 'available' : 'taken')
    } catch (error) {
      console.error('Error checking business name:', error)
      setBusinessNameStatus(null)
    }
  }

  // Handle city selection and auto-fill state
  const handleCityChange = (selectedCity: string) => {
    const cityData = cities.find(c => c.city === selectedCity)
    if (cityData) {
      form.setValue('city', cityData.city)
      form.setValue('state', cityData.state)
    }
  }

  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    form.setValue('category_id', categoryId)
  }

  // Submit complete seller profile
  const onSubmit = async (data: BusinessStepData) => {
    setIsLoading(true)
    try {
      const selectedCategoryName = categories.find(c => c.id === data.category_id)?.name || ''
      
      await updateSellerProfile(user.id, {
        full_name: emailData.full_name,
        email: emailData.email,
        business_name: data.business_name,
        category: selectedCategoryName,
        city: data.city,
        state: data.state
      })
      
      // Success! Complete onboarding
      onComplete()
    } catch (error) {
      console.error('Error creating seller profile:', error)
      alert('Failed to create seller profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🏢 Complete Your Business Profile
        </h2>
        <p className="text-gray-600">
          Tell us about your business to start selling
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name
          </label>
          <input
            {...form.register('business_name')}
            onChange={(e) => {
              form.setValue('business_name', e.target.value)
              // Debounce the name checking
              setTimeout(() => checkName(e.target.value), 500)
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your business name"
          />
          
          {/* Business Name Status */}
          {businessNameStatus === 'checking' && (
            <p className="text-blue-500 text-sm mt-1 flex items-center">
              <span className="animate-spin mr-2">⏳</span> Checking availability...
            </p>
          )}
          {businessNameStatus === 'available' && (
            <p className="text-green-500 text-sm mt-1">✅ Available!</p>
          )}
          {businessNameStatus === 'taken' && (
            <p className="text-red-500 text-sm mt-1">❌ Already taken, try another name</p>
          )}
          
          {form.formState.errors.business_name && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.business_name.message}
            </p>
          )}
        </div>

        {/* Category Selection - Visual Grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Business Category
          </label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{category.emoji}</span>
                  <div>
                    <div className="font-medium text-gray-900">{category.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                  </div>
                  {selectedCategory === category.id && (
                    <div className="ml-auto">
                      <span className="text-blue-500 text-lg">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
          {form.formState.errors.category_id && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.category_id.message}
            </p>
          )}
        </div>

        {/* City Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your City
          </label>
          <select
            onChange={(e) => handleCityChange(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            defaultValue=""
          >
            <option value="">Select your city</option>
            <optgroup label="Popular Cities">
              {cities.filter(c => c.popular).map((location) => (
                <option key={location.id} value={location.city}>
                  {location.city}, {location.state}
                </option>
              ))}
            </optgroup>
            <optgroup label="Other Cities">
              {cities.filter(c => !c.popular).map((location) => (
                <option key={location.id} value={location.city}>
                  {location.city}, {location.state}
                </option>
              ))}
            </optgroup>
          </select>
          {form.formState.errors.city && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.city.message}
            </p>
          )}
        </div>

        {/* Auto-filled State */}
        {form.watch('state') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              value={form.watch('state')}
              readOnly
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
              placeholder="State will be auto-filled"
            />
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full py-4 text-lg font-medium"
          disabled={isLoading || businessNameStatus === 'taken' || !selectedCategory}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⏳</span>
              Creating Your Profile...
            </span>
          ) : (
            '🚀 Start Selling!'
          )}
        </Button>

        {/* Progress Info */}
        <div className="text-center text-sm text-gray-500">
          <p>✅ Email verified • 🏢 Setting up business profile</p>
        </div>
      </form>
    </div>
  )
}