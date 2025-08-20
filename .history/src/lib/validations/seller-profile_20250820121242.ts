import { z } from 'zod'

// Step 1: Email and name validation
export const emailStepSchema = z.object({
  full_name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required')
})

// Step 2: Business info validation  
export const businessStepSchema = z.object({
  business_name: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters'),
  
  category_id: z.string()
    .min(1, 'Please select a category'),
  
  city: z.string()
    .min(2, 'Please enter your city'),
    
  state: z.string()
    .min(2, 'State is required')
})

// Combined schema
export const completeSellerSchema = emailStepSchema.merge(businessStepSchema)

// TypeScript types
export type EmailStepData = z.infer<typeof emailStepSchema>
export type BusinessStepData = z.infer<typeof businessStepSchema>
export type CompleteSellerData = z.infer<typeof completeSellerSchema>