// src/lib/supabase/client.ts
// FIXED - Modern Supabase client (no deprecated auth-helpers)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create browser client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// OAuth configuration for browser
export const oauthConfig = {
  redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
  scopes: 'openid email profile',
  queryParams: {
    access_type: 'offline',
    prompt: 'select_account',
  },
};

// Sign in with Google
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: oauthConfig,
  });

  if (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }

  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Get session error:', error);
    throw error;
  }
  return session;
}

// Get current user
export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Get user error:', error);
    throw error;
  }
  return user;
}

// Enhanced getUser with fallback for our custom session
export async function getUserWithFallback() {
  try {
    // Try standard Supabase session first
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (user && !error) {
      return user;
    }

    // Fallback: Check for our custom session cookie
    if (typeof window !== 'undefined') {
      const customCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('asvalue-user-id='));
      
      if (customCookie) {
        const userId = customCookie.split('=')[1];
        
        // Return a minimal user object for UI purposes
        return {
          id: userId,
          email: 'authenticated@user.com',
          user_metadata: {
            full_name: 'Authenticated User'
          }
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Get user with fallback error:', error);
    return null;
  }
}

// Export the client as default for compatibility
export default supabase;