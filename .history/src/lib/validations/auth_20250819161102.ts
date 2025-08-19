// src/lib/validations/auth.ts
// ENHANCED - Complete validation schemas for seller onboarding

import { z } from 'zod'

export const emailSchema = z.string().email()
export const nameSchema = z.string().min(1).max(100)

// Seller Profile Validation
export const sellerProfileSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(50),
  phone: z.string().min(10).max(15).regex(/^[0-9+\-\s()]+$/, 'Invalid phone format'),
  country: z.string().min(2).max(50),
})

// Product Creation Validation
export const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters').max(100),
  price: z.number().min(1, 'Price must be greater than 0').max(1000000),
  category: z.string().min(1, 'Category is required'),
  description: z.string().max(500).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
  ai_questions: z.array(z.object({
    question: z.string().min(5).max(100),
    answer: z.string().min(1).max(200),
    type: z.enum(['compatibility', 'features', 'availability'])
  })).max(3).optional(),
})

// Payment Setup Validation
export const paymentSetupSchema = z.object({
  upi_id: z.string().min(3).optional(),
  bank_account_number: z.string().min(8).max(20).optional(),
  ifsc_code: z.string().length(11).optional(),
  account_holder_name: z.string().min(2).max(50).optional(),
}).refine(
  (data) => data.upi_id || (data.bank_account_number && data.ifsc_code && data.account_holder_name),
  {
    message: "Either UPI ID or complete bank details are required",
  }
)

// Combined Onboarding Validation
export const onboardingSchema = z.object({
  profile: sellerProfileSchema,
  product: productSchema,
  payment: paymentSetupSchema,
})

// Existing schemas (keep for backward compatibility)
export const profileSchema = z.object({
  id: z.string().uuid(),
  full_name: nameSchema,
  email: emailSchema,
  avatar_url: z.string().url().optional(),
  role: z.enum(['seller', 'buyer']).optional(),
  onboarding_completed: z.boolean().optional(),
  phone_verified: z.boolean().optional(),
  email_verified: z.boolean().optional(),
  last_sign_in: z.string().datetime().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
})

export const oauthStateSchema = z.object({
  state_value: z.string().min(30),
  code_verifier: z.string().min(32),
  expires_at: z.string().datetime(),
  used: z.boolean().optional(),
  created_at: z.string().datetime().optional(),
})

export const auditLogSchema = z.object({
  user_id: z.string().uuid().optional(),
  event_type: z.string(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
  session_id: z.string().optional(),
  success: z.boolean(),
  error_message: z.string().optional(),
  created_at: z.string().datetime().optional(),
})