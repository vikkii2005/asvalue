import { z } from 'zod'
import { PRODUCT_CATEGORIES } from '@/types/product'

// Auth validation schemas
export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
})

export const profileSetupSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

  business_name: z
    .string()
    .min(1, 'Business name is required')
    .min(2, 'Business name must be at least 2 characters')
    .max(100, 'Business name must be less than 100 characters'),

  category: z
    .string()
    .min(1, 'Category is required')
    .refine(
      val => PRODUCT_CATEGORIES.includes(val as any),
      'Please select a valid category'
    ),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
    .optional(),
})

// Product validation schemas
export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must be less than 100 characters'),

  price: z
    .string()
    .min(1, 'Price is required')
    .regex(/^\d+(\.\d{1,2})?$/, 'Please enter a valid price (e.g., 29.99)')
    .refine(val => parseFloat(val) > 0, 'Price must be greater than 0')
    .refine(
      val => parseFloat(val) <= 999999.99,
      'Price must be less than $1,000,000'
    ),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),

  category: z
    .string()
    .min(1, 'Category is required')
    .refine(
      val => PRODUCT_CATEGORIES.includes(val as any),
      'Please select a valid category'
    ),

  // AI Question & Answer validation
  question1: z
    .string()
    .min(1, 'Question 1 is required')
    .min(5, 'Question must be at least 5 characters')
    .max(200, 'Question must be less than 200 characters'),

  answer1: z
    .string()
    .min(1, 'Answer 1 is required')
    .min(3, 'Answer must be at least 3 characters')
    .max(300, 'Answer must be less than 300 characters'),

  question2: z
    .string()
    .min(1, 'Question 2 is required')
    .min(5, 'Question must be at least 5 characters')
    .max(200, 'Question must be less than 200 characters'),

  answer2: z
    .string()
    .min(1, 'Answer 2 is required')
    .min(3, 'Answer must be at least 3 characters')
    .max(300, 'Answer must be less than 300 characters'),

  question3: z
    .string()
    .min(1, 'Question 3 is required')
    .min(5, 'Question must be at least 5 characters')
    .max(200, 'Question must be less than 200 characters'),

  answer3: z
    .string()
    .min(1, 'Answer 3 is required')
    .min(3, 'Answer must be at least 3 characters')
    .max(300, 'Answer must be less than 300 characters'),
})

export const productUpdateSchema = productFormSchema.partial()

// Order validation schemas
export const orderFormSchema = z.object({
  customer_name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),

  customer_email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),

  shipping_address: z
    .string()
    .min(1, 'Shipping address is required')
    .min(10, 'Please enter a complete address')
    .max(500, 'Address must be less than 500 characters'),

  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .regex(/^[1-9]\d*$/, 'Quantity must be a positive number')
    .refine(val => parseInt(val) <= 100, 'Maximum quantity is 100'),

  special_instructions: z
    .string()
    .max(300, 'Special instructions must be less than 300 characters')
    .optional(),
})

// Chat validation schemas
export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message must be less than 1000 characters')
    .trim(),

  product_id: z
    .string()
    .min(1, 'Product ID is required')
    .uuid('Invalid product ID format'),

  customer_session: z.string().min(1, 'Session ID is required'),
})

// Image upload validation
export const imageUploadSchema = z.object({
  file: z
    .instanceof(File, { message: 'Please select an image file' })
    .refine(file => file.size <= 5 * 1024 * 1024, 'Image must be less than 5MB')
    .refine(
      file =>
        ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(
          file.type
        ),
      'Only JPEG, PNG, and WebP images are supported'
    ),
})

// Magic code validation
export const magicCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Magic code is required')
    .length(10, 'Magic code must be exactly 10 characters')
    .regex(
      /^[A-Z0-9]+$/,
      'Magic code can only contain uppercase letters and numbers'
    ),
})

// Email validation schemas
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),

  subject: z
    .string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),

  message: z
    .string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
})

// Search and filter validation
export const productFilterSchema = z.object({
  category: z
    .string()
    .refine(
      val => val === '' || PRODUCT_CATEGORIES.includes(val as any),
      'Please select a valid category'
    )
    .optional(),

  price_min: z
    .string()
    .regex(/^\d*\.?\d*$/, 'Please enter a valid minimum price')
    .optional(),

  price_max: z
    .string()
    .regex(/^\d*\.?\d*$/, 'Please enter a valid maximum price')
    .optional(),

  search: z
    .string()
    .max(100, 'Search term must be less than 100 characters')
    .optional(),

  sort_by: z.enum(['name', 'price', 'created_at', 'views_count']).optional(),

  sort_order: z.enum(['asc', 'desc']).optional(),
})

// PayPal validation schemas
export const paypalOrderSchema = z.object({
  order_id: z.string().min(1, 'PayPal order ID is required'),

  payer_id: z.string().min(1, 'PayPal payer ID is required'),

  payment_id: z.string().min(1, 'PayPal payment ID is required'),
})

// Notification preferences
export const notificationPreferencesSchema = z.object({
  new_orders: z.boolean().default(true),
  customer_messages: z.boolean().default(true),
  payment_updates: z.boolean().default(true),
  product_analytics: z.boolean().default(false),
  marketing_updates: z.boolean().default(false),
  email_notifications: z.boolean().default(true),
  push_notifications: z.boolean().default(true),
})

// Utility validation functions
export const validatePrice = (price: string): number => {
  const parsed = parseFloat(price)
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error('Invalid price format')
  }
  return Math.round(parsed * 100) / 100 // Round to 2 decimal places
}

export const validateQuantity = (quantity: string): number => {
  const parsed = parseInt(quantity)
  if (isNaN(parsed) || parsed <= 0) {
    throw new Error('Invalid quantity format')
  }
  return parsed
}

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, ' ')
}

export const validateMagicCode = (code: string): boolean => {
  return /^[A-Z0-9]{10}$/.test(code)
}

export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success
}

export const validatePhone = (phone: string): boolean => {
  return /^[\+]?[1-9][\d]{0,15}$/.test(phone)
}

// Error message constants
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PHONE_INVALID: 'Please enter a valid phone number',
  PRICE_INVALID: 'Please enter a valid price',
  QUANTITY_INVALID: 'Please enter a valid quantity',
  IMAGE_TOO_LARGE: 'Image must be less than 5MB',
  IMAGE_INVALID_TYPE: 'Only JPEG, PNG, and WebP images are supported',
  TEXT_TOO_LONG: 'Text is too long',
  TEXT_TOO_SHORT: 'Text is too short',
  INVALID_CATEGORY: 'Please select a valid category',
  MAGIC_CODE_INVALID: 'Magic code must be 10 uppercase letters and numbers',
} as const

// Type exports for form validation
export type SignInFormData = z.infer<typeof signInSchema>
export type ProfileSetupFormData = z.infer<typeof profileSetupSchema>
export type ProductFormData = z.infer<typeof productFormSchema>
export type ProductUpdateData = z.infer<typeof productUpdateSchema>
export type OrderFormData = z.infer<typeof orderFormSchema>
export type ChatMessageData = z.infer<typeof chatMessageSchema>
export type ContactFormData = z.infer<typeof contactFormSchema>
export type ProductFilterData = z.infer<typeof productFilterSchema>
export type PayPalOrderData = z.infer<typeof paypalOrderSchema>
export type NotificationPreferencesData = z.infer<
  typeof notificationPreferencesSchema
>
