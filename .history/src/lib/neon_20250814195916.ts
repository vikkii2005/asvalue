import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// ✅ Export sql for direct queries
export const sql = neon(process.env.DATABASE_URL);

// Database interface
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

// Database operations
export const db = {
  sellers: {
    async getByEmail(email: string) {
      const result = await sql`
        SELECT * FROM sellers WHERE email = ${email} LIMIT 1
      `;
      return result[0] || null;
    },

    async getByFirebaseUid(firebaseUid: string) {
      const result = await sql`
        SELECT * FROM sellers WHERE auth_user_id = ${firebaseUid} LIMIT 1
      `;
      return result[0] || null;
    },

    async create(seller: Database['public']['Tables']['sellers']['Insert']) {
      const result = await sql`
        INSERT INTO sellers (
          email, name, auth_user_id, is_active, email_verified, 
          created_at, updated_at
        ) VALUES (
          ${seller.email}, 
          ${seller.name}, 
          ${seller.auth_user_id}, 
          ${seller.is_active ?? true}, 
          ${seller.email_verified ?? true},
          ${new Date().toISOString()},
          ${new Date().toISOString()}
        )
        RETURNING *
      `;
      return result[0];
    },

    async updateProfile(email: string, updates: {
      business_name?: string;
      category?: string; 
      phone?: string;
    }) {
      const result = await sql`
        UPDATE sellers 
        SET 
          business_name = COALESCE(${updates.business_name}, business_name),
          category = COALESCE(${updates.category}, category),
          phone = COALESCE(${updates.phone}, phone),
          updated_at = ${new Date().toISOString()}
        WHERE email = ${email}
        RETURNING *
      `;
      return result[0];
    }
  }
};

// Utility functions
export const generateMagicCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};