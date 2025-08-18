// src/lib/supabase/config.ts
// Fixed - Separate browser and server clients

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// ✅ BROWSER CLIENT ONLY (safe for client-side)
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// ✅ ADMIN CLIENT - Only create server-side when needed
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client should not be used in browser');
  }
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin client');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}