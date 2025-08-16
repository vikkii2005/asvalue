import { createClient } from '@supabase/supabase-js'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

// Client-side Supabase client (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Server-side Supabase client (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// Database table type definitions
export interface Database {
  public: {
    Tables: {
      sellers: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          category: string | null
          avatar_url: string | null
          business_name: string | null
          is_active: boolean
          stripe_customer_id: string | null
          email_verified: boolean
          auth_user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          category?: string | null
          avatar_url?: string | null
          business_name?: string | null
          is_active?: boolean
          stripe_customer_id?: string | null
          email_verified?: boolean
          auth_user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          category?: string | null
          avatar_url?: string | null
          business_name?: string | null
          is_active?: boolean
          stripe_customer_id?: string | null
          email_verified?: boolean
          auth_user_id?: string | null
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          seller_id: string
          name: string
          price: number
          description: string | null
          image_url: string
          magic_code: string
          question1: string
          answer1: string
          question2: string
          answer2: string
          question3: string
          answer3: string
          views_count: number
          clicks_count: number
          conversion_rate: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          name: string
          price: number
          description?: string | null
          image_url: string
          magic_code: string
          question1?: string
          answer1?: string
          question2?: string
          answer2?: string
          question3?: string
          answer3?: string
          views_count?: number
          clicks_count?: number
          conversion_rate?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          price?: number
          description?: string | null
          image_url?: string
          question1?: string
          answer1?: string
          question2?: string
          answer2?: string
          question3?: string
          answer3?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          product_id: string
          seller_id: string
          customer_email: string
          customer_name: string | null
          shipping_address: string
          quantity: number
          unit_price: number
          total_amount: number
          currency: string
          status: string
          paypal_order_id: string | null
          paypal_payment_id: string | null
          payment_status: string
          created_at: string
          paid_at: string | null
          shipped_at: string | null
          delivered_at: string | null
        }
        Insert: {
          id?: string
          product_id: string
          seller_id: string
          customer_email: string
          customer_name?: string | null
          shipping_address: string
          quantity?: number
          unit_price: number
          total_amount: number
          currency?: string
          status?: string
          paypal_order_id?: string | null
          paypal_payment_id?: string | null
          payment_status?: string
          created_at?: string
        }
        Update: {
          status?: string
          paypal_order_id?: string | null
          paypal_payment_id?: string | null
          payment_status?: string
          paid_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
        }
      }
      chat_messages: {
        Row: {
          id: string
          product_id: string
          customer_session: string
          sender_type: string
          message: string
          metadata: Record<string, unknown> | null
          is_read: boolean
          is_escalated: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          customer_session: string
          sender_type: string
          message: string
          metadata?: Record<string, unknown> | null
          is_read?: boolean
          is_escalated?: boolean
          created_at?: string
        }
        Update: {
          is_read?: boolean
          is_escalated?: boolean
        }
      }
      notifications: {
        Row: {
          id: string
          seller_id: string
          product_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          product_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          metadata?: Record<string, unknown> | null
          created_at?: string
        }
        Update: {
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          metadata?: Record<string, unknown> | null
        }
      }
    }
  }
}

// Message and notification types for proper typing
interface ChatMessage {
  id: string
  product_id: string
  customer_session: string
  sender_type: string
  message: string
  metadata: Record<string, unknown> | null
  is_read: boolean
  is_escalated: boolean
  created_at: string
}

interface NotificationData {
  id: string
  seller_id: string
  product_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  metadata: Record<string, unknown> | null
  created_at: string
}

interface OrderData {
  id: string
  product_id: string
  seller_id: string
  customer_email: string
  customer_name: string | null
  shipping_address: string
  quantity: number
  unit_price: number
  total_amount: number
  currency: string
  status: string
  paypal_order_id: string | null
  paypal_payment_id: string | null
  payment_status: string
  created_at: string
  paid_at: string | null
  shipped_at: string | null
  delivered_at: string | null
}

// Typed Supabase client
export type TypedSupabaseClient = typeof supabase

// Helper functions for common database operations
export const db = {
  // Sellers operations
  sellers: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async getByEmail(email: string) {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    async getByAuthUserId(auth_user_id: string) {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('auth_user_id', auth_user_id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },

    async create(seller: Database['public']['Tables']['sellers']['Insert']) {
      const { data, error } = await supabase
        .from('sellers')
        .insert({
          ...seller,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async update(
      id: string,
      updates: Database['public']['Tables']['sellers']['Update']
    ) {
      const { data, error } = await supabase
        .from('sellers')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async updateByEmail(
      email: string,
      updates: Database['public']['Tables']['sellers']['Update']
    ) {
      const { data, error } = await supabase
        .from('sellers')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('email', email)
        .select()
        .single()

      if (error) throw error
      return data
    },
  },

  // Products operations
  products: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:sellers(name, business_name, email)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async getByMagicCode(magic_code: string) {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:sellers(name, business_name, email)
        `)
        .eq('magic_code', magic_code)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    },

    async getBySeller(seller_id: string) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', seller_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async create(product: Database['public']['Tables']['products']['Insert']) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...product,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async update(
      id: string,
      updates: Database['public']['Tables']['products']['Update']
    ) {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },

    async incrementViews(id: string) {
      const { error } = await supabase.rpc('increment_product_views', {
        product_id: id,
      })

      if (error) throw error
    },

    async incrementClicks(id: string) {
      const { error } = await supabase.rpc('increment_product_clicks', {
        product_id: id,
      })

      if (error) throw error
    },
  },

  // Orders operations
  orders: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(name, image_url, magic_code),
          seller:sellers(name, business_name, email)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },

    async getBySeller(seller_id: string) {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(name, image_url, magic_code)
        `)
        .eq('seller_id', seller_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async create(order: Database['public']['Tables']['orders']['Insert']) {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          ...order,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async updateStatus(id: string, status: string) {
      const updates: Record<string, unknown> = { status }

      // Set timestamp based on status
      if (status === 'paid') updates.paid_at = new Date().toISOString()
      if (status === 'shipped') updates.shipped_at = new Date().toISOString()
      if (status === 'delivered') updates.delivered_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
  },

  // Chat operations
  chat: {
    async getBySession(session_id: string) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          product:products(name, seller_id, seller:sellers(name))
        `)
        .eq('customer_session', session_id)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data
    },

    async create(
      message: Database['public']['Tables']['chat_messages']['Insert']
    ) {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          ...message,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    },

    async markAsRead(session_id: string) {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('customer_session', session_id)
        .in('sender_type', ['customer', 'ai'])

      if (error) throw error
    },
  },

  // Real-time subscriptions
  realtime: {
    subscribeToChat(
      session_id: string,
      callback: (message: ChatMessage) => void
    ) {
      return supabase
        .channel(`chat:${session_id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: `customer_session=eq.${session_id}`,
          },
          payload => callback(payload.new as ChatMessage)
        )
        .subscribe()
    },

    subscribeToSellerNotifications(
      seller_id: string,
      callback: (notification: NotificationData) => void
    ) {
      return supabase
        .channel(`notifications:${seller_id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `seller_id=eq.${seller_id}`,
          },
          payload => callback(payload.new as NotificationData)
        )
        .subscribe()
    },

    subscribeToOrders(seller_id: string, callback: (order: OrderData) => void) {
      return supabase
        .channel(`orders:${seller_id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `seller_id=eq.${seller_id}`,
          },
          payload => callback(payload.new as OrderData)
        )
        .subscribe()
    },
  },
}

// Utility functions
export const generateMagicCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Error handling
export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

export const handleSupabaseError = (error: {
  message?: string
  code?: string
  details?: unknown
}): never => {
  throw new SupabaseError(
    error.message || 'Database operation failed',
    error.code,
    error.details
  )
}