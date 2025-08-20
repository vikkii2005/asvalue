import { createClient } from '@/lib/supabase/client'

// Get current user's seller profile
export async function getSellerProfile(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('seller_profiles')
    .select(`
      *,
      categories (name, emoji)
    `)
    .eq('user_id', userId)
    .single()
    
  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch seller profile: ${error.message}`)
  }
  
  return data
}

// Get all categories for selection
export async function getCategories() {
  const supabase = createClient()
  
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
  const supabase = createClient()
  
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
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('seller_profiles')
    .select('id')
    .ilike('business_name', businessName.trim())
  
  if (error) {
    throw new Error(`Failed to check business name: ${error.message}`)
  }
  
  return data.length === 0 // true if available
}

// Create seller profile
export async function createSellerProfile(profileData: {
  user_id: string
  full_name: string
  email: string
  business_name: string
  category_id: string
  city: string
  state: string
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('seller_profiles')
    .upsert({
      ...profileData,
      email_verified: true,
      profile_completed: true,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()
    
  if (error) {
    throw new Error(`Failed to create seller profile: ${error.message}`)
  }
  
  return data
}