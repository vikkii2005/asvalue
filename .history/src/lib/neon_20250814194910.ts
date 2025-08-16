import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

export const sql = neon(process.env.DATABASE_URL);

// Preserve your exact database interface structure
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
      // ... your other tables (products, orders, etc.) stay exactly the same
    }
  }
}

// Database operations (same as your Supabase helper)
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

// Keep your utility functions
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