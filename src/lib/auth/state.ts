// src/lib/auth/state.ts
// OAuth state management for security

import { supabaseClient } from '@/lib/supabase/config'

// Generate a secure random state for OAuth
export function generateState(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Store the state and code verifier securely (FIXED!)
export async function storeState(
  state: string,
  codeVerifier: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

  console.log('🔄 Attempting to store OAuth state...')

  try {
    // Store in Supabase (FIXED: wrapped in array and added .select())
    const { data: _data, error } = await supabaseClient
      .from('oauth_states')
      .insert([
        {
          // ✅ FIXED: Wrapped in array
          state_value: state,
          code_verifier: codeVerifier,
          expires_at: expiresAt.toISOString(),
        },
      ])
      .select() // ✅ FIXED: Added .select() to get better error details

    if (error) {
      console.error('❌ Detailed error storing OAuth state:', error)
      throw new Error(
        `Failed to store OAuth state: ${error.message || JSON.stringify(error)}`
      )
    }

    console.log('✅ Successfully stored OAuth state')
  } catch (err: unknown) {
    console.error('❌ Exception in storeState:', err)
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Unknown error storing OAuth state')
  }
}

// Validate and retrieve the stored state
export async function validateState(state: string): Promise<string | null> {
  console.log('🔍 Validating OAuth state...')

  try {
    const { data, error } = await supabaseClient
      .from('oauth_states')
      .select('code_verifier')
      .eq('state_value', state)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error) {
      console.error('❌ Error validating state:', error)
      return null
    }

    if (!data) {
      console.log('❌ No valid state found')
      return null
    }

    // Mark as used
    await supabaseClient
      .from('oauth_states')
      .update({ used: true })
      .eq('state_value', state)

    console.log('✅ State validated successfully')
    return data.code_verifier
  } catch (err: unknown) {
    console.error('❌ Exception in validateState:', err)
    return null
  }
}

// Clean up expired states (optional maintenance function)
export async function cleanupExpiredStates(): Promise<void> {
  try {
    await supabaseClient
      .from('oauth_states')
      .delete()
      .lt('expires_at', new Date().toISOString())

    console.log('✅ Cleaned up expired OAuth states')
  } catch (err: unknown) {
    console.error('❌ Error cleaning up expired states:', err)
  }
}
