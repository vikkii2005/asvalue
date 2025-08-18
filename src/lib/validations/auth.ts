// src/lib/validations/auth.ts
// Zod validation schemas for OAuth/authentication

import { z } from 'zod'

export const emailSchema = z.string().email()
export const nameSchema = z.string().min(1).max(100)

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
