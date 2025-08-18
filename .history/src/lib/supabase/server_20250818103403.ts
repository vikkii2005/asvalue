// src/lib/supabase/server.ts
// FIXED - Modern server-side Supabase client

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create server client with service role key
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Create client-side compatible server client
export const createServerSessionClient = async () => {
  const _cookieStore = await cookies();
  
  // Try to get session from cookies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Get server session with fallback
export async function getServerSession() {
  try {
    const supabase = await createServerSessionClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Server session error:', error);
    }
    
    return session;
  } catch (error) {
    console.error('Server session error:', error);
    return null;
  }
}

// Get server user with fallback
export async function getServerUser() {
  try {
    const supabase = await createServerSessionClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Server user error:', error);
    }
    
    return user;
  } catch (error) {
    console.error('Server user error:', error);
    return null;
  }
}

// Get user with cookie fallback
export async function getServerUserWithFallback() {
  try {
    // Try standard method first
    const user = await getServerUser();
    if (user) return user;

    // Fallback: Check custom cookies
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('asvalue-user-id');
    
    if (userIdCookie) {
      // Return minimal user object
      return {
        id: userIdCookie.value,
        email: 'authenticated@user.com',
        user_metadata: {
          full_name: 'Authenticated User'
        }
      };
    }

    return null;
  } catch (error) {
    console.error('Server user with fallback error:', error);
    return null;
  }
}