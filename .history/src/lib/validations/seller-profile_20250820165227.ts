import { z } from 'zod'

export const sellerProfileSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(15),
  city: z.string().min(2, 'Please select a city'),
  state: z.string().min(2, 'Please select a state'),
  category: z.string().min(2, 'Please select a business category'),
})

export type SellerProfileSchema = z.infer<typeof sellerProfileSchema>