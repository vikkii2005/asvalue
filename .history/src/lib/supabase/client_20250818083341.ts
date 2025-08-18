// src/lib/supabase/client.ts
// Browser-side Supabase client with OAuth config

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/lib/types/database';

// Create browser client
export const supabase = createClientComponentClient<Database>();

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