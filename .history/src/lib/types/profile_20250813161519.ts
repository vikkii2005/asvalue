// Profile data types that match your database schema

export interface Profile {
  id: string
  email: string
  name: string
  business_name: string | null
  category: string | null
  phone: string | null
  is_active: boolean
  created_at: string
  updated_at?: string
  is_complete: boolean // Computed field
}

// Form data interface for ProfileSetup component
export interface ProfileFormData {
  business_name: string
  category: string
  phone: string
}

// API request types
export interface ProfileUpdateRequest {
  business_name: string
  category: string
  phone?: string
}

export interface ProfilePatchRequest {
  business_name?: string
  category?: string
  phone?: string
}

// API response types
export interface ProfileResponse {
  success: boolean
  data: {
    exists: boolean
    profile: Profile | null
  }
  error?: string
}

export interface ProfileErrorResponse {
  success: false
  error: string
  details?: any
}

// Profile status types
export type ProfileStatus = 'loading' | 'incomplete' | 'complete' | 'error'

export interface ProfileState {
  status: ProfileStatus
  profile: Profile | null
  error: string | null
  isLoading: boolean
}

// Validation types
export interface ProfileValidationError {
  business_name?: string[]
  category?: string[]
  phone?: string[]
  _errors?: string[]
}

// Profile completion check
export interface ProfileCompletionCheck {
  isComplete: boolean
  missingFields: Array<keyof ProfileFormData>
  completionPercentage: number
}

// Category options that match your validation schema
export type ProfileCategory = 
  | 'clothing'
  | 'electronics'
  | 'handmade'
  | 'home'
  | 'beauty'
  | 'sports'
  | 'books'
  | 'jewelry'
  | 'food'
  | 'other'

export interface CategoryOption {
  value: ProfileCategory
  label: string
  icon: string
}

// Constants for profile categories
export const PROFILE_CATEGORIES: CategoryOption[] = [
  { value: 'clothing', label: 'Clothing & Fashion', icon: '👕' },
  { value: 'electronics', label: 'Electronics & Gadgets', icon: '📱' },
  { value: 'handmade', label: 'Handmade & Crafts', icon: '🎨' },
  { value: 'home', label: 'Home & Garden', icon: '🏠' },
  { value: 'beauty', label: 'Beauty & Personal Care', icon: '💄' },
  { value: 'sports', label: 'Sports & Fitness', icon: '⚽' },
  { value: 'books', label: 'Books & Media', icon: '📚' },
  { value: 'jewelry', label: 'Jewelry & Accessories', icon: '💎' },
  { value: 'food', label: 'Food & Beverages', icon: '🍕' },
  { value: 'other', label: 'Other', icon: '📦' },
] as const

// Utility functions for profile operations
export const isProfileComplete = (profile: Profile | null): boolean => {
  if (!profile) return false
  return Boolean(
    profile.business_name?.trim() &&
    profile.category?.trim() &&
    profile.phone?.trim()
  )
}

export const getProfileCompletionStatus = (profile: Profile | null): ProfileCompletionCheck => {
  if (!profile) {
    return {
      isComplete: false,
      missingFields: ['business_name', 'category', 'phone'],
      completionPercentage: 0
    }
  }

  const missingFields: Array<keyof ProfileFormData> = []
  
  if (!profile.business_name?.trim()) missingFields.push('business_name')
  if (!profile.category?.trim()) missingFields.push('category')
  if (!profile.phone?.trim()) missingFields.push('phone')

  const totalFields = 3
  const completedFields = totalFields - missingFields.length
  const completionPercentage = Math.round((completedFields / totalFields) * 100)

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completionPercentage
  }
}

export const getCategoryIcon = (category: string | null): string => {
  const categoryOption = PROFILE_CATEGORIES.find(cat => cat.value === category)
  return categoryOption?.icon || '📦'
}

export const getCategoryLabel = (category: string | null): string => {
  const categoryOption = PROFILE_CATEGORIES.find(cat => cat.value === category)
  return categoryOption?.label || 'Other'
}

// Profile update utility types
export interface UseProfileReturn {
  profile: Profile | null
  isLoading: boolean
  error: string | null
  updateProfile: (data: ProfileUpdateRequest) => Promise<void>
  patchProfile: (data: ProfilePatchRequest) => Promise<void>
  refetch: () => Promise<void>
}

// Hook types for profile management
export interface ProfileHookOptions {
  onSuccess?: (profile: Profile) => void
  onError?: (error: string) => void
  initialFetch?: boolean
}