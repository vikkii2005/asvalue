import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getCategories, getPopularCities, getSellerProfile } from '@/lib/api/seller'
import SellerProfileForm from '@/components/forms/seller-profile-form'

export default async function SellerSetupPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/signin?redirect=/onboarding/seller-setup')
  }
  
  // Check if already completed
  try {
    const existingProfile = await getSellerProfile(user.id)
    if (existingProfile?.setup_completed) {
      redirect('/onboarding/success')
    }
  } catch {
    // Profile doesn't exist yet - that's fine
  }
  
  // Load form data
  const [categories, cities] = await Promise.all([
    getCategories(),
    getPopularCities()
  ])
  
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
        </div>
        
        {/* Main Form */}
        <SellerProfileForm 
          user={user}
          categories={categories}
          cities={cities}
        />
      </div>
    </div>
  )
}