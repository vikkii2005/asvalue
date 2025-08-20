import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCategories, getPopularCities, getSellerProfile } from '@/lib/api/seller'
import SellerProfileForm from '@/components/forms/seller-profile-form'

export default async function SellerSetupPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get authenticated user - proper way
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    redirect('/auth/signin?redirect=/onboarding/seller-setup')
  }
  
  // Check if seller profile already completed
  let existingProfile = null
  try {
    existingProfile = await getSellerProfile(user.id)
  } catch (error) {
    // Profile doesn't exist yet - that's fine, continue with onboarding
    console.log('No existing profile found, proceeding with setup')
  }
  
  // Redirect if already completed
  if (existingProfile && existingProfile.setup_completed) {
    redirect('/onboarding/success')
  }
  
  // Load data for the form
  let categories = []
  let cities = []
  
  try {
    [categories, cities] = await Promise.all([
      getCategories(),
      getPopularCities()
    ])
  } catch (error) {
    console.error('Error loading form data:', error)
    // Fallback to empty arrays if data loading fails
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🚀 Start Your Selling Journey
          </h1>
          <p className="text-lg text-gray-600">
            Join thousands of successful sellers in just 60 seconds
          </p>
          
          {/* User Welcome */}
          <div className="mt-4 p-4 bg-white rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">
              Welcome back, <span className="font-medium">{user.email}</span>
            </p>
          </div>
        </div>
        
        {/* Main Form */}
        <SellerProfileForm 
          user={user}
          categories={categories}
          cities={cities}
        />
        
        {/* Debug Info (Remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Debug Info:</h3>
            <p className="text-xs text-gray-600">User ID: {user.id}</p>
            <p className="text-xs text-gray-600">Categories loaded: {categories.length}</p>
            <p className="text-xs text-gray-600">Cities loaded: {cities.length}</p>
            <p className="text-xs text-gray-600">Existing profile: {existingProfile ? 'Found' : 'Not found'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Add metadata for better SEO
export const metadata = {
  title: 'Complete Your Seller Profile - AsValue',
  description: 'Set up your seller account in just 60 seconds and start selling on AsValue.',
}