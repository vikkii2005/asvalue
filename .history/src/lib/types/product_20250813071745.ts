export interface Product {
  id: string
  seller_id: string
  name: string
  price: number
  description: string | null
  image_url: string
  magic_code: string

  // AI Q&A System
  question1: string
  answer1: string
  question2: string
  answer2: string
  question3: string
  answer3: string

  // Analytics & Performance
  views_count: number
  clicks_count: number
  conversion_rate: number

  // Status Management
  is_active: boolean
  created_at: string
  updated_at: string

  // Optional seller information (when populated)
  seller?: {
    name: string
    business_name: string | null
    email: string
  }
}

export interface CreateProductData {
  name: string
  price: number
  description?: string
  image_url: string
  question1?: string
  answer1?: string
  question2?: string
  answer2?: string
  question3?: string
  answer3?: string
}

export interface UpdateProductData {
  name?: string
  price?: number
  description?: string
  image_url?: string
  question1?: string
  answer1?: string
  question2?: string
  answer2?: string
  question3?: string
  answer3?: string
  is_active?: boolean
}

export interface ProductFormData {
  name: string
  price: string // Form input as string, converted to number
  description: string
  image: File | null
  category: string
  question1: string
  answer1: string
  question2: string
  answer2: string
  question3: string
  answer3: string
}

export interface ProductAnalytics {
  views_count: number
  clicks_count: number
  conversion_rate: number
  total_orders: number
  revenue: number
  last_30_days: {
    views: number
    orders: number
    revenue: number
  }
}

export interface MagicLinkData {
  magic_code: string
  product_name: string
  qr_code_url: string
  share_urls: {
    whatsapp: string
    telegram: string
    instagram: string
    facebook: string
    twitter: string
    email: string
    sms: string
  }
}

export interface ProductFilter {
  category?: string
  is_active?: boolean
  price_min?: number
  price_max?: number
  search?: string
  sort_by?: 'name' | 'price' | 'created_at' | 'views_count'
  sort_order?: 'asc' | 'desc'
}

export interface ProductValidationError {
  field: keyof ProductFormData
  message: string
}

export interface AIQuestion {
  id: 1 | 2 | 3
  question: string
  answer: string
  is_default: boolean
}

export const DEFAULT_AI_QUESTIONS: AIQuestion[] = [
  {
    id: 1,
    question: 'What size should I order?',
    answer: 'Check size chart - runs true to size',
    is_default: true,
  },
  {
    id: 2,
    question: 'How much is shipping?',
    answer: 'Free over $50, otherwise $8',
    is_default: true,
  },
  {
    id: 3,
    question: 'What is your return policy?',
    answer: '30-day returns accepted',
    is_default: true,
  },
]

export const PRODUCT_CATEGORIES = [
  'Fashion & Clothing',
  'Electronics',
  'Home & Garden',
  'Health & Beauty',
  'Sports & Fitness',
  'Books & Media',
  'Toys & Games',
  'Food & Beverage',
  'Automotive',
  'Arts & Crafts',
  'Other',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]
