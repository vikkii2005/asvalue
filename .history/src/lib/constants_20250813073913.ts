// Application Meta
export const APP_CONFIG = {
  name: 'ASVALUE',
  description: 'Turn your products into AI-powered sales machines with magic links',
  version: '1.0.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://asvalue.com',
  support_email: 'support@asvalue.com',
  contact_email: 'hello@asvalue.com',
} as const

// API Configuration
export const API_CONFIG = {
  base_url: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000, // 10 seconds
  retry_attempts: 3,
  rate_limit: {
    requests_per_minute: 60,
    burst_limit: 10,
  },
} as const

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anon_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  storage_bucket: 'product-images',
  max_file_size: 5 * 1024 * 1024, // 5MB
  allowed_file_types: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const

// Authentication
export const AUTH_CONFIG = {
  session_timeout: 30 * 24 * 60 * 60, // 30 days in seconds
  refresh_threshold: 5 * 60, // 5 minutes before expiry
  max_login_attempts: 5,
  lockout_duration: 15 * 60 * 1000, // 15 minutes in milliseconds
  google_oauth: {
    scopes: ['openid', 'email', 'profile'],
  },
} as const

// Product Configuration
export const PRODUCT_CONFIG = {
  max_products_per_seller: 100,
  magic_code_length: 10,
  magic_code_characters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  min_price: 0.01,
  max_price: 999999.99,
  max_name_length: 100,
  max_description_length: 500,
  required_ai_questions: 3,
  max_question_length: 200,
  max_answer_length: 300,
} as const

// Order Configuration
export const ORDER_CONFIG = {
  max_quantity_per_order: 100,
  order_timeout: 30 * 60 * 1000, // 30 minutes
  payment_timeout: 15 * 60 * 1000, // 15 minutes
  auto_complete_after_days: 7,
  refund_window_days: 30,
  currencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  default_currency: 'USD',
} as const

// Chat Configuration
export const CHAT_CONFIG = {
  max_message_length: 1000,
  session_timeout: 30 * 60 * 1000, // 30 minutes
  max_messages_per_session: 100,
  ai_confidence_threshold: 60, // Minimum confidence for AI response
  escalation_threshold: 30, // Auto-escalate below this confidence
  typing_indicator_timeout: 3000, // 3 seconds
  message_retry_attempts: 3,
  rate_limit: {
    messages_per_minute: 20,
    messages_per_hour: 200,
  },
} as const

// AI Configuration
export const AI_CONFIG = {
  model: 'gpt-3.5-turbo',
  max_tokens: 150,
  temperature: 0.7,
  response_timeout: 10000, // 10 seconds
  fallback_responses: [
    "I'm sorry, I couldn't understand your question. Could you please rephrase it?",
    "Let me connect you with our seller for a more detailed answer.",
    "For specific product details, please contact the seller directly.",
  ],
  default_questions: [
    'What size should I order?',
    'How much is shipping?',
    'What is your return policy?',
  ],
} as const

// UI Configuration
export const UI_CONFIG = {
  toast_duration: 5000, // 5 seconds
  loading_timeout: 30000, // 30 seconds
  debounce_delay: 300, // 300ms for search inputs
  throttle_delay: 1000, // 1 second for API calls
  animation_duration: 200, // 200ms for transitions
  mobile_breakpoint: 768,
  tablet_breakpoint: 1024,
  desktop_breakpoint: 1280,
} as const

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  track_page_views: true,
  track_user_interactions: true,
  track_conversion_events: true,
  session_tracking: true,
  retention_days: 90,
  batch_size: 50,
  flush_interval: 10000, // 10 seconds
} as const

// Feature Flags
export const FEATURES = {
  ai_chat: true,
  magic_links: true,
  qr_codes: true,
  social_sharing: true,
  analytics_dashboard: true,
  bulk_product_upload: false,
  advanced_customization: false,
  white_label: false,
  api_access: false,
  webhooks: false,
} as const

// Business Rules
export const BUSINESS_RULES = {
  free_trial_days: 14,
  max_free_products: 3,
  max_free_orders_per_month: 10,
  commission_rate: 0.029, // 2.9%
  payout_threshold: 25.00, // Minimum payout amount
  payout_schedule_days: 7, // Weekly payouts
  refund_processing_days: 5,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  // General
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  
  // Authentication
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_LOCKED: 'Account temporarily locked due to too many failed attempts.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  
  // Products
  PRODUCT_NOT_FOUND: 'Product not found.',
  INVALID_MAGIC_CODE: 'Invalid magic code format.',
  PRODUCT_LIMIT_REACHED: 'You have reached the maximum number of products.',
  IMAGE_UPLOAD_FAILED: 'Failed to upload image. Please try again.',
  
  // Orders
  ORDER_NOT_FOUND: 'Order not found.',
  PAYMENT_FAILED: 'Payment processing failed. Please try again.',
  INVALID_QUANTITY: 'Invalid quantity specified.',
  ORDER_TIMEOUT: 'Order has expired. Please create a new order.',
  
  // Chat
  MESSAGE_TOO_LONG: 'Message is too long. Please keep it under 1000 characters.',
  CHAT_SESSION_EXPIRED: 'Chat session has expired. Please start a new conversation.',
  AI_UNAVAILABLE: 'AI assistant is temporarily unavailable.',
  
  // Validation
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  INVALID_PRICE: 'Please enter a valid price.',
  INVALID_URL: 'Please enter a valid URL.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  // Authentication
  SIGN_IN_SUCCESS: 'Successfully signed in!',
  SIGN_OUT_SUCCESS: 'Successfully signed out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  
  // Products
  PRODUCT_CREATED: 'Product created successfully!',
  PRODUCT_UPDATED: 'Product updated successfully!',
  PRODUCT_DELETED: 'Product deleted successfully!',
  IMAGE_UPLOADED: 'Image uploaded successfully!',
  
  // Orders
  ORDER_CREATED: 'Order created successfully!',
  PAYMENT_SUCCESS: 'Payment processed successfully!',
  ORDER_UPDATED: 'Order status updated!',
  
  // General
  COPIED_TO_CLIPBOARD: 'Copied to clipboard!',
  LINK_SHARED: 'Link shared successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
} as const

// Social Media URLs
export const SOCIAL_URLS = {
  website: 'https://asvalue.com',
  twitter: 'https://twitter.com/asvalue',
  instagram: 'https://instagram.com/asvalue',
  facebook: 'https://facebook.com/asvalue',
  linkedin: 'https://linkedin.com/company/asvalue',
  youtube: 'https://youtube.com/@asvalue',
} as const

// Support URLs
export const SUPPORT_URLS = {
  help_center: 'https://help.asvalue.com',
  contact: 'https://asvalue.com/contact',
  privacy_policy: 'https://asvalue.com/privacy',
  terms_of_service: 'https://asvalue.com/terms',
  status_page: 'https://status.asvalue.com',
  documentation: 'https://docs.asvalue.com',
} as const

// PayPal Configuration
export const PAYPAL_CONFIG = {
  client_id: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  currency: 'USD',
  intent: 'capture',
  brand_name: 'ASVALUE',
  landing_page: 'login',
  user_action: 'pay_now',
} as const

// Email Configuration
export const EMAIL_CONFIG = {
  from_address: 'noreply@asvalue.com',
  support_address: 'support@asvalue.com',
  templates: {
    welcome: 'welcome',
    order_confirmation: 'order-confirmation',
    payment_received: 'payment-received',
    shipping_notification: 'shipping-notification',
    password_reset: 'password-reset',
  },
} as const

// Performance Configuration
export const PERFORMANCE_CONFIG = {
  image_optimization: {
    quality: 80,
    max_width: 1200,
    max_height: 800,
    formats: ['webp', 'jpeg'],
  },
  caching: {
    static_assets: 31536000, // 1 year
    api_responses: 300, // 5 minutes
    user_data: 60, // 1 minute
  },
  lazy_loading: {
    images: true,
    components: true,
    threshold: 0.1, // Load when 10% visible
  },
} as const

// Development Configuration
export const DEV_CONFIG = {
  show_debug_info: process.env.NODE_ENV === 'development',
  enable_hot_reload: process.env.NODE_ENV === 'development',
  mock_payments: process.env.NODE_ENV === 'development',
  log_level: process.env.NODE_ENV === 'development' ? 'debug' : 'error',
  enable_source_maps: process.env.NODE_ENV === 'development',
} as const

// Regular Expressions
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\+]?[1-9][\d]{0,15}$/,
  magic_code: /^[A-Z0-9]{10}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  user_preferences: 'asvalue_user_preferences',
  cart_items: 'asvalue_cart',
  recent_products: 'asvalue_recent_products',
  chat_sessions: 'asvalue_chat_sessions',
  theme: 'asvalue_theme',
  language: 'asvalue_language',
  onboarding_completed: 'asvalue_onboarding',
} as const

// Route Paths
export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  products: '/dashboard/products',
  orders: '/dashboard/orders',
  analytics: '/dashboard/analytics',
  settings: '/dashboard/settings',
  profile: '/dashboard/profile',
  auth: {
    signin: '/auth/signin',
    signup: '/auth/signup',
    signout: '/auth/signout',
    reset: '/auth/reset-password',
  },
  product: (code: string) => `/product/${code}`,
  api: {
    products: '/api/products',
    orders: '/api/orders',
    chat: '/api/chat',
    upload: '/api/upload',
    auth: '/api/auth',
  },
} as const

// Default Values
export const DEFAULTS = {
  pagination: {
    page_size: 20,
    max_page_size: 100,
  },
  product: {
    image_url: '/images/product-placeholder.jpg',
    questions: AI_CONFIG.default_questions,
  },
  user: {
    avatar_url: '/images/avatar-placeholder.jpg',
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
  },
} as const