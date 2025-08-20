'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { businessStepSchema, BusinessStepData, EmailStepData } from '@/lib/validations/seller-profile'
import { updateSellerProfile, checkBusinessNameUnique } from '@/lib/api/seller'

interface Props {
  user: User
  emailData: EmailStepData
  categories: Array<{
    id: string
    name: string
    emoji: string
    description: string
    popular: boolean
  }>
  cities: Array<{
    id: string
    city: string
    state: string
    popular: boolean
  }>
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
  
  const form = useForm<BusinessStepData>({
    resolver: zodResolver(businessStepSchema),
    defaultValues: {
      business_name: '',
      category_id: '',
      city: '',
      state: ''
    }
  })

  // Check business name availability
  const checkName = async (name: string) => {
    if (name.length < 2) return
    
    setBusinessNameStatus('checking')
    try {
      const isAvailable = await checkBusinessNameUnique(name)
      setBusinessNameStatus(isAvailable ? 'available' : 'taken')
    } catch (error) {
      console.error('Error checking business name:', error)
      setBusinessNameStatus(null)
    }
  }

  // Handle city selection
  const handleCityChange = (selectedCity: string) => {
    const cityData = cities.find(c => c.city === selectedCity)
    if (cityData) {
      form.setValue('city', cityData.city)
      form.setValue('state', cityData.state)
    }
  }

  // Submit form
  const onSubmit = async (data: BusinessStepData) => {
    setIsLoading(true)
    try {
      await updateSellerProfile(user.id, {
        full_name: emailData.full_name,
        email: emailData.email,
        business_name: data.business_name,
        category: categories.find(c => c.id === data.category_id)?.name || '',
        city: data.city,
        state: data.state
      })
      
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
              checkName(e.target.value)
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your business name"
          />
          {businessNameStatus === 'checking' && (
            <p className="text-blue-500 text-sm mt-1">Checking availability...</p>
          )}
          {businessNameStatus === 'available' && (
            <p className="text-green-500 text-sm mt-1">✅ Available!</p>
          )}
          {businessNameStatus === 'taken' && (
            <p className="text-red-500 text-sm mt-1">❌ Already taken</p>
          )}
          {form.formState.errors.business_name && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.business_name.message}
            </p>
          )}
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Business Category
          </label>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => form.setValue('category_id', category.id)}
                className={`p-3 border-2 rounded-lg text-left transition-colors ${
                  form.watch('category_id') === category.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.emoji}</span>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    <div className="text-xs text-gray-500">{category.description}</div>
                  </div>
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
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select your city</option>
            {cities.map((location) => (
              <option key={location.id} value={location.city}>
                {location.city}, {location.state}
              </option>
            ))}
          </select>
          {form.formState.errors.city && (
            <p className="text-red-500 text-sm mt-1">
              {form.formState.errors.city.message}
            </p>
          )}
        </div>

        {/* State (Auto-filled) */}
        {form.watch('state') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State
            </label>
            <input
              value={form.watch('state')}
              readOnly
              className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50"
            />
          </div>
        )}

        <Button
          type="submit"
          className="w-full py-3 text-lg"
          disabled={isLoading || businessNameStatus === 'taken'}
        >
          {isLoading ? 'Creating Profile...' : '🚀 Start Selling!'}
        </Button>
      </form>
    </div>
  )
}