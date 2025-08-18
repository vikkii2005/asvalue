// src/lib/types/auth.ts
// Auth-related TypeScript types and interfaces

export type UserRole = 'seller' | 'buyer'

export interface PublicProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  role?: UserRole
  onboarding_completed?: boolean
  phone_verified?: boolean
  email_verified?: boolean
  last_sign_in?: string
  created_at: string
  updated_at: string
}

export interface OAuthStateRecord {
  id: string
  state_value: string
  code_verifier: string
  expires_at: string
  used: boolean
  created_at: string
}
