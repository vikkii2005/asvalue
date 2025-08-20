import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Get current user's seller profile
export async function getSellerProfile(userId: string) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch seller profile: ${error.message}`)
  }
  
  return data
}

// Get all categories for selection
export async function getCategories() {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('popular', { ascending: false })
    .order('display_order')
    
  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }
  
  return data || []
}

// Get popular cities
export async function getPopularCities() {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('popular', true)
    .order('city')
    
  if (error) {
    throw new Error(`Failed to fetch cities: ${error.message}`)
  }
  
  return data || []
}

// Check business name availability
export async function checkBusinessNameUnique(businessName: string) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .ilike('business_name', businessName.trim())
  
  if (error) {
    throw new Error(`Failed to check business name: ${error.message}`)
  }
  
  return data.length === 0 // true if available
}

// Update seller profile
export async function updateSellerProfile(userId: string, profileData: {
  full_name: string
  email: string
  business_name: string
  category: string
  city: string
  state: string
}) {
  const supabase = createClientComponentClient()
  
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...profileData,
      email_verified: true,
      setup_completed: true,
      onboarding_completed: true,
      role: 'seller',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single()
    
  if (error) {
    throw new Error(`Failed to update seller profile: ${error.message}`)
  }
  
  return data
}