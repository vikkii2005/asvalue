// src/lib/types/user.ts
// Complete type definitions

export type UserRole = 'seller' | 'buyer'

export interface User {
  id: string
  email?: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
  role?: UserRole
  onboarding_completed?: boolean
  role_selected_at?: string
}

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

export interface RoleCardProps {
  role: UserRole
  title: string
  benefits: string[]
  isSelected: boolean
  isLoading: boolean
  onSelect: (role: UserRole) => void
  socialProofStats: SocialProofData
}
