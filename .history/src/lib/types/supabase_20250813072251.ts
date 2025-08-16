import { createClient } from '@supabase/supabase-js'
import type { User } from '@/types/auth'
import type { Product } from '@/types/product'
import type { Order } from '@/types/order'
import type { ChatMessage } from '@/types/chat'

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
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
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      products: {
        Row: Product
        Insert: Omit<
          Product,
          | 'id'
          | 'created_at'
          | 'updated_at'
          | 'views_count'
          | 'clicks_count'
          | 'conversion_rate'
        >
        Update: Partial<Omit<Product, 'id' | 'created_at' | 'seller_id'>>
      }
      orders: {
        Row: Order
        Insert: Omit<
          Order,
          'id' | 'created_at' | 'paid_at' | 'shipped_at' | 'delivered_at'
        >
        Update: Partial<
          Omit<Order, 'id' | 'created_at' | 'product_id' | 'seller_id'>
        >
      }
      chat_messages: {
        Row: ChatMessage
        Insert: Omit<
          ChatMessage,
          'id' | 'created_at' | 'is_read' | 'is_escalated'
        >
        Update: Partial<
          Omit<
            ChatMessage,
            'id' | 'created_at' | 'product_id' | 'customer_session'
          >
        >
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
          seller_id: string
          product_id: string
          type: string
          title: string
          message: string
          metadata?: Record<string, unknown> | null
        }
        Update: Partial<{
          type: string
          title: string
          message: string
          is_read: boolean
          metadata: Record<string, unknown> | null
        }>
      }
    }
  }
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
      return data as User
    },

    async getByEmail(email: string) {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('email', email)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data as User | null
    },

    async create(seller: Database['public']['Tables']['sellers']['Insert']) {
      const { data, error } = await supabase
        .from('sellers')
        .insert(seller)
        .select()
        .single()

      if (error) throw error
      return data as User
    },

    async update(
      id: string,
      updates: Database['public']['Tables']['sellers']['Update']
    ) {
      const { data, error } = await supabase
        .from('sellers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as User
    },
  },

  // Products operations
  products: {
    async getById(id: string) {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          seller:sellers(name, business_name, email)
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Product
    },

    async getByMagicCode(magic_code: string) {
      const { data, error } = await supabase
        .from('products')
        .select(
          `
          *,
          seller:sellers(name, business_name, email)
        `
        )
        .eq('magic_code', magic_code)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data as Product
    },

    async getBySeller(seller_id: string) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', seller_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Product[]
    },

    async create(product: Database['public']['Tables']['products']['Insert']) {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single()

      if (error) throw error
      return data as Product
    },

    async update(
      id: string,
      updates: Database['public']['Tables']['products']['Update']
    ) {
      const { data, error } = await supabase
        .from('products')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Product
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
        .select(
          `
          *,
          product:products(name, image_url, magic_code),
          seller:sellers(name, business_name, email)
        `
        )
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Order
    },

    async getBySeller(seller_id: string) {
      const { data, error } = await supabase
        .from('orders')
        .select(
          `
          *,
          product:products(name, image_url, magic_code)
        `
        )
        .eq('seller_id', seller_id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Order[]
    },

    async create(order: Database['public']['Tables']['orders']['Insert']) {
      const { data, error } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single()

      if (error) throw error
      return data as Order
    },

    async updateStatus(id: string, status: Order['status']) {
      const updates: Record<string, unknown> = { status }

      // Set timestamp based on status
      if (status === 'paid') updates.paid_at = new Date().toISOString()
      if (status === 'shipped') updates.shipped_at = new Date().toISOString()
      if (status === 'delivered')
        updates.delivered_at = new Date().toISOString()

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Order
    },
  },

  // Chat operations
  chat: {
    async getBySession(session_id: string) {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(
          `
          *,
          product:products(name, seller_id, seller:sellers(name))
        `
        )
        .eq('customer_session', session_id)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as ChatMessage[]
    },

    async create(
      message: Database['public']['Tables']['chat_messages']['Insert']
    ) {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(message)
        .select()
        .single()

      if (error) throw error
      return data as ChatMessage
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
      callback: (
        notification: Database['public']['Tables']['notifications']['Row']
      ) => void
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
          payload =>
            callback(
              payload.new as Database['public']['Tables']['notifications']['Row']
            )
        )
        .subscribe()
    },

    subscribeToOrders(seller_id: string, callback: (order: Order) => void) {
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
          payload => callback(payload.new as Order)
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
