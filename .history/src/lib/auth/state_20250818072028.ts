// src/lib/auth/state.ts
// OAuth state management for security

import { supabaseClient } from '@/lib/supabase/config';

// Generate a secure random state for OAuth
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Store the state and code verifier securely
export async function storeState(state: string, codeVerifier: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  // Store in Supabase
  const { error } = await supabaseClient
    .from('oauth_states')
    .insert({
      state_value: state,
      code_verifier: codeVerifier,
      expires_at: expiresAt.toISOString(),
    });
  
  if (error) {
    console.error('Error storing OAuth state:', error);
    throw new Error('Failed to store OAuth state');
  }
}

// Validate and retrieve the stored state
export async function validateState(state: string): Promise<string | null> {
  const { data, error } = await supabaseClient
    .from('oauth_states')
    .select('code_verifier')
    .eq('state_value', state)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single();
  
  if (error || !data) {
    return null;
  }
  
  // Mark as used
  await supabaseClient
    .from('oauth_states')
    .update({ used: true })
    .eq('state_value', state);
  
  return data.code_verifier;
}

// Clean up expired states (optional maintenance function)
export async function cleanupExpiredStates(): Promise<void> {
  await supabaseClient
    .from('oauth_states')
    .delete()
    .lt('expires_at', new Date().toISOString());
}