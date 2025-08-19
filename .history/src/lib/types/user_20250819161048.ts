// src/lib/types/user.ts
// ENHANCED - Complete type definitions for seller system

export type UserRole = 'seller' | 'buyer'

export interface User {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  business_name?: string
  phone?: string
  country?: string
  upi_id?: string
  bank_account_number?: string
  ifsc_code?: string
  account_holder_name?: string
  setup_completed?: boolean
  role?: UserRole
  onboarding_completed?: boolean
  role_selected_at?: string
}

export interface SellerProfile {
  id: string
  business_name: string
  phone: string
  country: string
  setup_completed: boolean
  created_at: string
  updated_at: string
}

export interface ProductData {
  id?: string
  name: string
  price: number
  category: string
  description?: string
  photos?: string[]
  ai_questions?: AIQuestion[]
  seller_id?: string
}

export interface AIQuestion {
  question: string
  answer: string
  type: 'compatibility' | 'features' | 'availability'
}

export interface PaymentSetup {
  upi_id?: string
  bank_account_number?: string
  ifsc_code?: string
  account_holder_name?: string
}

export interface OnboardingState {
  currentStep: number
  profileData: Partial<SellerProfile>
  productData: Partial<ProductData>
  paymentData: Partial<PaymentSetup>
  isLoading: boolean
  error: string | null
}

export interface MagicLinkData {
  url: string
  qrCode: string
  productId: string
  sellerId: string
}

// Keep existing types for backward compatibility
export interface SocialProofData {
  seller_count: number
  buyer_count: number
  this_month_sellers: number
  days_live: number
  updated_at: string
}

export interface RoleSelectionState {
  selectedRole: UserRole | null
  isLoading: boolean
  error: string | null
  showHelp: boolean
  socialProofStats: SocialProofData | null
  selectionStartTime: Date
  hesitationDetected: boolean
}

export interface SocialProofAnalytics {
  messageType: 'first_seller' | 'early_adopter' | 'growing_community'
  sellerCount: number
  daysLive: number
  influencedSelection: boolean
}