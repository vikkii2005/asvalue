// src/lib/api/user.ts
// FIXED - ESLint compliant

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean
  data?: T
  error?: string
}

export const getAuthenticSocialProof = async (): Promise<SocialProofData> => {
  try {
    const { data, error } = await supabase.rpc('get_authentic_role_stats')

    if (error) {
      console.error('Social proof fetch error:', error)
      // Fallback for launch day
      return {
        seller_count: 0,
        buyer_count: 0,
        this_month_sellers: 0,
        days_live: 1,
        updated_at: new Date().toISOString(),
      }
    }

    return data
  } catch (error) {
    console.error('Social proof error:', error)
    return {
      seller_count: 0,
      buyer_count: 0,
      this_month_sellers: 0,
      days_live: 1,
      updated_at: new Date().toISOString(),
    }
  }
}

export const updateUserRole = async (
  userId: string,
  role: UserRole,
  selectionTime?: number
): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase.rpc('update_user_role', {
      p_user_id: userId,
      p_role: role,
      p_selection_time: selectionTime,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Import types
import type { SocialProofData, UserRole } from '@/lib/types/user'
