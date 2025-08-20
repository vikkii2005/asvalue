import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface SellerProfileData {
  business_name: string
  phone: string
  city: string
  state: string
  category: string
}

export async function updateSellerProfile(
  userId: string,
  profileData: SellerProfileData
): Promise<ApiResponse> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        business_name: profileData.business_name,
        phone: profileData.phone,
        city: profileData.city,
        state: profileData.state,
        category: profileData.category,
        setup_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Profile update error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Profile update exception:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}