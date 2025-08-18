// src/lib/supabase/server.ts
// Server-side Supabase client (FIXED)

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/types/database';

// Create server client - FIXED: Pass cookies function directly
export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};

// Get server session
export async function getServerSession() {
  const supabase = createServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Server session error:', error);
    return null;
  }
  
  return session;
}

// Get server user
export async function getServerUser() {
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Server user error:', error);
    return null;
  }
  
  return user;
}