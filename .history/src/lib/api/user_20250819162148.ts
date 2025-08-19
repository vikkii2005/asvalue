// src/lib/api/user.ts
// PRODUCTION READY - All TypeScript and ESLint errors fixed

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface ApiResponse<T = Record<string, unknown> | null> {
  success: boolean
  data?: T
  error?: string
}

export interface SellerProfileData {
  business_name: string
  phone: string
  country: string
}

export interface ProductData {
  name: string
  price: number
  category: string
  description?: string
  photos?: string[]
  ai_questions?: AIQuestion[]
}

export interface AIQuestion {
  question: string
  answer: string
  type: 'compatibility' | 'features' | 'availability'
}

export interface PaymentSetupData {
  upi_id?: string
  bank_account_number?: string
  ifsc_code?: string
  account_holder_name?: string
}

// Update seller profile
export const updateSellerProfile = async (
  userId: string,
  profileData: SellerProfileData
): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        business_name: profileData.business_name,
        phone: profileData.phone,
        country: profileData.country,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data ?? null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Create first product
export const createFirstProduct = async (
  userId: string,
  productData: ProductData
): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert({
        seller_id: userId,
        name: productData.name,
        price: productData.price,
        category: productData.category,
        description: productData.description || '',
        photos: productData.photos || [],
        ai_questions: productData.ai_questions || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data ?? null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Setup payment method
export const setupPaymentMethod = async (
  userId: string,
  paymentData: PaymentSetupData
): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        upi_id: paymentData.upi_id,
        bank_account_number: paymentData.bank_account_number,
        ifsc_code: paymentData.ifsc_code,
        account_holder_name: paymentData.account_holder_name,
        setup_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data ?? null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Generate magic link
export const generateMagicLink = async (
  userId: string,
  productId: string
): Promise<ApiResponse<{ magicLink: string; qrCode: string }>> => {
  try {
    // Get user business name
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name')
      .eq('id', userId)
      .single()

    // Get product details
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('id', productId)
      .single()

    if (!profile || !product) {
      return { success: false, error: 'Profile or product not found' }
    }

    // Generate clean URL slug
    const businessSlug = profile.business_name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    
    const magicLink = `https://asvalue.com/${businessSlug}/${productSlug}`
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(magicLink)}`

    return { 
      success: true, 
      data: { magicLink, qrCode }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Get user profile with setup status
export const getUserProfile = async (userId: string): Promise<ApiResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data: data ?? null }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}